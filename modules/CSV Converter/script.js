document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const fileInput = document.getElementById('file-input');
    const filePathInput = document.getElementById('file-path');
    const sheetSelect = document.getElementById('sheet-select');
    const tableWrapper = document.getElementById('table-preview-wrapper');
    const importBtn = document.getElementById('import-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Referências aos inputs de opções
    const optionInputs = {
        name: document.getElementById('output-name'),
        sheet: document.getElementById('sheet-select'),
        range: document.getElementById('range-input'),
        maxRows: document.getElementById('max-rows'),
        skip: document.getElementById('skip-rows'),
        na: document.getElementById('na-values'),
        firstRowHeader: document.getElementById('first-row-header'),
        delimiter: document.getElementById('delimiter-select'),
    };

    let workbook;
    let currentFileName = '';

    // Adiciona listeners para todos os inputs de opção
    Object.values(optionInputs).forEach(input => {
        input.addEventListener('change', processDataAndUpdateUI);
        if (input.type === 'text' || input.type === 'number') {
            input.addEventListener('keyup', processDataAndUpdateUI);
        }
    });

    // Listeners principais
    fileInput.addEventListener('change', handleFileLoad);
    importBtn.addEventListener('click', handleImport);
    cancelBtn.addEventListener('click', handleCancel);

    function columnIndexToLetter(index) {
        let letter = '';
        while (index >= 0) {
            letter = String.fromCharCode(index % 26 + 65) + letter;
            index = Math.floor(index / 26) - 1;
        }
        return letter;
    }

    function handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        currentFileName = file.name;
        filePathInput.value = currentFileName;
        optionInputs.name.value = currentFileName.split('.').slice(0, -1).join('.');

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });
            
            sheetSelect.innerHTML = '';
            workbook.SheetNames.forEach(name => {
                const option = document.createElement('option');
                option.value = option.textContent = name;
                sheetSelect.appendChild(option);
            });
            
            processDataAndUpdateUI();
        };
        reader.readAsArrayBuffer(file);
    }
    
    function processDataAndUpdateUI() {
        if (!workbook) return;

        const sheetName = optionInputs.sheet.value;
        const worksheet = workbook.Sheets[sheetName];
        
        let data;
        let effectiveStartRow = 1;
        let effectiveStartCol = 0;

        const rangeStr = optionInputs.range.value.trim().toUpperCase();
        try {
            const decodedRange = XLSX.utils.decode_range(rangeStr); 
            const reEncodedRange = XLSX.utils.encode_range(decodedRange);
            data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", range: reEncodedRange });
            effectiveStartRow = decodedRange.s.r + 1;
            effectiveStartCol = decodedRange.s.c;
        } catch (e) {
            data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            const skipRows = parseInt(optionInputs.skip.value) || 0;
            if (skipRows > 0 && skipRows < data.length) {
                data = data.slice(skipRows);
                effectiveStartRow = skipRows + 1;
            }
        }
        
        const naValues = optionInputs.na.value.split(',').map(v => v.trim()).filter(Boolean);
        if (naValues.length > 0) {
            data = data.map(row => row.map(cell => naValues.includes(String(cell)) ? "" : cell));
        }

        let headers = [];
        let bodyData = data;
        let dataStartRow = effectiveStartRow;

        if (optionInputs.firstRowHeader.checked && data.length > 0) {
            headers = data[0];
            bodyData = data.slice(1);
            dataStartRow++;
        } else if (data.length > 0) {
            headers = Array(data[0].length).fill('');
        }
        
        const maxRows = parseInt(optionInputs.maxRows.value);
        if (!isNaN(maxRows) && maxRows > 0) {
            bodyData = bodyData.slice(0, maxRows);
        }

        updateTablePreview(headers, bodyData, dataStartRow, effectiveStartCol);
    }

    function updateTablePreview(headers, bodyData, dataStartRow, startCol) {
        if ((!headers || headers.length === 0) && (!bodyData || bodyData.length === 0)) {
            tableWrapper.innerHTML = `<p class="placeholder-text">Nenhum dado para exibir com as opções atuais.</p>`;
            return;
        }

        const numCols = Math.max(headers.length, bodyData.length > 0 ? Math.max(...bodyData.map(r => r.length)) : 0);
        let table = '<table><thead><tr>';
        
        table += '<th class="table-corner"></th>';
        for (let i = 0; i < numCols; i++) {
            table += `<th class="table-index-header">${columnIndexToLetter(startCol + i)}</th>`;
        }
        table += '</tr></thead><tbody>';
        
        const allRows = optionInputs.firstRowHeader.checked ? [headers, ...bodyData] : bodyData;
        const firstRenderedRowNumber = optionInputs.firstRowHeader.checked ? dataStartRow - 1 : dataStartRow;

        allRows.forEach((row, rowIndex) => {
            table += '<tr>';
            table += `<th class="table-row-num">${firstRenderedRowNumber + rowIndex}</th>`;
            
            const isHeaderRow = optionInputs.firstRowHeader.checked && rowIndex === 0;
            const cellTag = isHeaderRow ? 'th' : 'td';
            for (let i = 0; i < numCols; i++) {
                table += `<${cellTag} class="${isHeaderRow ? 'data-header-cell' : ''}">${row[i] || ""}</${cellTag}>`;
            }
            table += '</tr>';
        });

        table += '</tbody></table>';
        tableWrapper.innerHTML = table;
    }
    
    function handleImport() {
        if (!workbook) {
            alert("Por favor, carregue um arquivo Excel primeiro.");
            return;
        }
        const table = tableWrapper.querySelector('table');
        if (!table) {
            alert("Não há dados para importar com as configurações atuais.");
            return;
        }

        const delimiter = optionInputs.delimiter.value;
        const rows = table.querySelectorAll('tbody tr');
        let data = [];

        rows.forEach((row, rowIndex) => {
            const isHeaderRow = optionInputs.firstRowHeader.checked && rowIndex === 0;
            const cellSelector = isHeaderRow ? 'th.data-header-cell' : 'td';
            
            const cells = Array.from(row.querySelectorAll(cellSelector)).map(cell => {
                let text = cell.textContent || '';
                if (text.includes(delimiter) || text.includes('"')) {
                    text = `"${text.replace(/"/g, '""')}"`;
                }
                return text;
            });
            data.push(cells.join(delimiter));
        });

        const csvContent = data.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${optionInputs.name.value}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handleCancel() {
        workbook = null;
        currentFileName = '';
        fileInput.value = '';
        filePathInput.value = 'Nenhum arquivo selecionado';
        tableWrapper.innerHTML = `<p class="placeholder-text">Carregue um arquivo para ver a pré-visualização dos dados</p>`;
        sheetSelect.innerHTML = '';
        
        optionInputs.name.value = 'dataset';
        optionInputs.range.value = '';
        optionInputs.maxRows.value = '';
        optionInputs.skip.value = '0';
        optionInputs.na.value = '';
        optionInputs.firstRowHeader.checked = true;
        optionInputs.delimiter.value = ';';
    }
});
