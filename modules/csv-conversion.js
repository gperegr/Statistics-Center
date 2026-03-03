/**
 * CSV Conversion Module
 * Handles Excel (.xlsx, .xls) import and conversion to CSV format.
 */

let currentWorkbook = null;

function initExcelModal() {
    // Inject Modal HTML if not present
    if (!document.getElementById('excelModal')) {
        const modalHTML = `
        <div id="excelModal" class="excel-modal-overlay">
            <div class="excel-modal-content" style="width: 900px; max-width: 95%;">
                <div class="panel-title" data-i18n="lblExcelImport">Import Excel Data</div>
                
                <div class="excel-import-body" style="display: flex; flex-direction: column; gap: 16px;">
                    
                    <!-- File Info -->
                    <div class="control-group" style="margin-bottom: 12px;">
                        <label class="control-label" data-i18n="lblFile">File:</label>
                        <input type="text" id="excelFileName" readonly style="background: var(--ControlFillColorDefault); border: 1px solid var(--DividerStrokeColorDefault); color: var(--TextFillColorPrimary);">
                    </div>

                    <!-- Preview -->
                    <div class="control-group" style="margin-bottom: 12px;">
                        <label class="control-label" data-i18n="lblDataPreview">Data Preview</label>
                        <div id="excelPreviewContainer" style="height: 300px; overflow: auto; border: 1px solid var(--DividerStrokeColorDefault); background: var(--LayerFillColorDefault);">
                            <p style="padding: 20px; text-align: center; color: var(--TextFillColorSecondary);" data-i18n="msgLoadingPreview">Loading preview...</p>
                        </div>
                    </div>

                    <!-- Options -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; padding: 16px; background: var(--LayerFillColorDefault); border: 1px solid var(--DividerStrokeColorDefault);">
                        
                        <div>
                            <label class="control-label" data-i18n="lblSelectSheet">Sheet</label>
                            <select id="excelSheetSelect" style="width:100%"></select>
                        </div>

                        <div>
                            <label class="control-label" data-i18n="lblMaxRows">Max Rows</label>
                            <input type="number" id="excelMaxRows" placeholder="All">
                        </div>

                        <div>
                            <label class="control-label" data-i18n="lblSkipRows">Skip Rows</label>
                            <input type="number" id="excelSkipRows" value="0" min="0">
                        </div>

                        <div>
                            <label class="control-label" data-i18n="lblRange">Range (e.g. A1:E10)</label>
                            <input type="text" id="excelRange" placeholder="Auto">
                        </div>

                        <div style="display: flex; align-items: center; padding-top: 24px;">
                            <label class="ms-checkbox">
                                <input type="checkbox" id="excelHasHeader" checked>
                                <span class="checkmark"></span>
                                <span data-i18n="lblHeaderRow">First Row Header</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="excel-modal-actions" style="margin-top: 16px;">
                    <button id="btnExcelCancel" class="bosch-btn-secondary" data-i18n="btnCancel">Cancel</button>
                    <button id="btnExcelImport" class="bosch-btn-primary" data-i18n="btnImport">Import Data</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Bind Events
        document.getElementById('btnExcelCancel').addEventListener('click', closeExcelModal);
        document.getElementById('btnExcelImport').addEventListener('click', importExcelData);

        // Bind Option Change Events
        const ids = ['excelSheetSelect', 'excelMaxRows', 'excelSkipRows', 'excelRange', 'excelHasHeader'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', updateExcelPreview);
        });
        // Keyup for text inputs
        ['excelMaxRows', 'excelSkipRows', 'excelRange'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('keyup', updateExcelPreview);
        });

        // Force translation update for the newly injected modal
        if (typeof window.changeLanguage === 'function' && typeof window.currentLang !== 'undefined') {
            window.changeLanguage(window.currentLang);
        }
    }
}

function handleExcelUpload(file) {
    if (typeof XLSX === 'undefined') {
        const msg = (translations[currentLang] && translations[currentLang].msgLibraryMissing)
            ? translations[currentLang].msgLibraryMissing
            : "Excel library (SheetJS) not found.";
        alert(msg);
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            currentWorkbook = XLSX.read(data, { type: 'array' });

            // Populate Sheet Select
            const sheetSelect = document.getElementById('excelSheetSelect');
            sheetSelect.innerHTML = '';
            currentWorkbook.SheetNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                sheetSelect.appendChild(option);
            });

            // Set File Name & Reset Options
            document.getElementById('excelFileName').value = file.name;
            document.getElementById('excelMaxRows').value = '';
            document.getElementById('excelSkipRows').value = '0';
            document.getElementById('excelRange').value = '';
            document.getElementById('excelHasHeader').checked = true;

            openExcelModal();
            updateExcelPreview(); // Initial render
        } catch (err) {
            console.error(err);
            const msg = (translations[currentLang] && translations[currentLang].msgExcelError)
                ? translations[currentLang].msgExcelError
                : "Error reading Excel file.";
            alert(msg);
        }
    };
    reader.readAsArrayBuffer(file);
}

function openExcelModal() {
    const modal = document.getElementById('excelModal');
    if (modal) {
        modal.classList.add('open');
        // Update translations in modal
        const lang = window.currentLang || 'en';
        if (window.translations && window.translations[lang]) {
            modal.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (window.translations[lang][key]) el.textContent = window.translations[lang][key];
            });
        }
    }
}

function closeExcelModal() {
    const modal = document.getElementById('excelModal');
    if (modal) modal.classList.remove('open');
    // Clear file input so same file can be selected again if cancelled
    document.getElementById('fileInput').value = '';
}

function updateExcelPreview() {
    if (!currentWorkbook) return;

    const sheetName = document.getElementById('excelSheetSelect').value;
    const worksheet = currentWorkbook.Sheets[sheetName];
    if (!worksheet) return;

    const rangeVal = document.getElementById('excelRange').value.trim();
    const skipRows = parseInt(document.getElementById('excelSkipRows').value) || 0;
    const maxRows = parseInt(document.getElementById('excelMaxRows').value) || 0;
    const hasHeader = document.getElementById('excelHasHeader').checked;

    // Parse options
    const opts = { header: 1, defval: "" };
    if (rangeVal && rangeVal.indexOf(':') > -1) opts.range = rangeVal;

    let rawData = XLSX.utils.sheet_to_json(worksheet, opts);

    // Apply Skip
    if (skipRows > 0 && rawData.length > skipRows) {
        rawData = rawData.slice(skipRows);
    }

    // Apply Max Rows (Preview limited to 50, but logic reflects import)
    let previewData = rawData;
    if (maxRows > 0 && previewData.length > maxRows) {
        previewData = previewData.slice(0, maxRows);
    }

    renderExcelPreviewTable(previewData, hasHeader);
}

function renderExcelPreviewTable(data, hasHeader) {
    const container = document.getElementById('excelPreviewContainer');
    if (!data || data.length === 0) {
        const lang = window.currentLang || 'en';
        const msg = (window.translations && window.translations[lang] && window.translations[lang].msgNoDataFound) ? window.translations[lang].msgNoDataFound : "No data found.";
        container.innerHTML = `<p style="padding:20px; text-align:center;">${msg}</p>`;
        return;
    }

    let html = '<table class="preview-table" style="width:100%; border-collapse:collapse; font-size:12px;">';

    // Header Row (Column Letters)
    html += '<thead><tr>';
    html += '<th style="background:var(--ControlFillColorDefault); border:1px solid var(--DividerStrokeColorDefault); padding:4px; width:40px; text-align:center; color:var(--TextFillColorSecondary);">#</th>';

    const colCount = data.reduce((max, row) => Math.max(max, row.length), 0);

    for (let i = 0; i < colCount; i++) {
        html += `<th style="background:var(--ControlFillColorDefault); border:1px solid var(--DividerStrokeColorDefault); padding:4px; text-align:center; color:var(--TextFillColorSecondary);">${columnIndexToLetter(i)}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Body
    const renderLimit = Math.min(data.length, 50);

    for (let i = 0; i < renderLimit; i++) {
        const row = data[i];
        const isHeaderRow = (i === 0 && hasHeader);
        const style = isHeaderRow ? 'font-weight:bold; background:var(--ControlFillColorDefault);' : '';

        html += `<tr style="${style}">`;
        html += `<td style="background:var(--ControlFillColorDefault); border:1px solid var(--DividerStrokeColorDefault); text-align:center; color:var(--TextFillColorSecondary);">${i + 1}</td>`;

        for (let j = 0; j < colCount; j++) {
            const val = (row[j] !== undefined) ? row[j] : "";
            html += `<td style="border:1px solid var(--DividerStrokeColorDefault); padding:4px; color:var(--TextFillColorPrimary);">${val}</td>`;
        }
        html += '</tr>';
    }

    if (data.length > renderLimit) {
        html += `<tr><td colspan="${colCount + 1}" style="text-align:center; padding:8px; color:var(--TextFillColorSecondary);">... ${data.length - renderLimit} more rows ...</td></tr>`;
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function columnIndexToLetter(index) {
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode(index % 26 + 65) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
}

function importExcelData() {
    if (!currentWorkbook) return;

    const sheetName = document.getElementById('excelSheetSelect').value;
    const worksheet = currentWorkbook.Sheets[sheetName];

    const rangeVal = document.getElementById('excelRange').value.trim();
    const skipRows = parseInt(document.getElementById('excelSkipRows').value) || 0;
    const maxRows = parseInt(document.getElementById('excelMaxRows').value) || 0;

    const opts = { header: 1, defval: "" };
    if (rangeVal && rangeVal.indexOf(':') > -1) opts.range = rangeVal;

    let rawData = XLSX.utils.sheet_to_json(worksheet, opts);

    if (skipRows > 0 && rawData.length > skipRows) rawData = rawData.slice(skipRows);
    if (maxRows > 0 && rawData.length > maxRows) rawData = rawData.slice(0, maxRows);

    // Convert Array of Arrays to CSV
    const csvContent = rawData.map(row =>
        row.map(cell => {
            let s = String(cell === undefined || cell === null ? "" : cell);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        }).join(',')
    ).join('\n');

    document.getElementById('textInput').value = csvContent;
    parseAndLoadData();
    closeExcelModal();
}

// Expose functions globally so core.js and HTML can access them
window.initExcelModal = initExcelModal;
window.handleExcelUpload = handleExcelUpload;