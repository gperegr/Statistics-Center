/**
 * Pareto Analysis Module
 */

const Pareto = {
    updateControls: function () {
        if (currentMode !== 'pareto') return;
        const catSelect = document.getElementById('paretoCategoryCol');
        const valSelect = document.getElementById('paretoValueCol');

        catSelect.innerHTML = '';
        valSelect.innerHTML = '<option value="">None (Count Frequencies)</option>';

        const allCols = Object.keys(rawDataset);
        const numericCols = Object.keys(dataset);

        allCols.forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.text = col;
            catSelect.add(opt);
        });

        numericCols.forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.text = col;
            valSelect.add(opt);
        });

        // Translate the "None" option
        const noneOpt = valSelect.querySelector('option[value=""]');
        if (noneOpt && translations[currentLang].optNoneFreq) noneOpt.textContent = translations[currentLang].optNoneFreq;
    },

    analyze: function () {
        const catCol = document.getElementById('paretoCategoryCol').value;
        const valCol = document.getElementById('paretoValueCol').value;

        if (!catCol) return;

        const decimalSep = document.getElementById('decimalSep').value;
        const cleanVal = (val) => {
            if (!val) return NaN;
            let v = String(val).trim().replace(/"/g, '');
            if (decimalSep === ',') v = v.replace(/\./g, '').replace(',', '.');
            return parseFloat(v);
        };

        // 1. Group Data
        const counts = {};
        if (rawDataset[catCol]) {
            rawDataset[catCol].forEach((cat, i) => {
                const key = String(cat);
                let val = 1;
                if (valCol && rawDataset[valCol]) {
                    val = cleanVal(rawDataset[valCol][i]);
                }
                if (!isNaN(val)) {
                    counts[key] = (counts[key] || 0) + val;
                }
            });
        }

        // 2. Sort and Calculate
        const sorted = Object.entries(counts)
            .map(([cat, val]) => ({ cat, val }))
            .sort((a, b) => b.val - a.val);

        const total = sorted.reduce((sum, item) => sum + item.val, 0);
        let cumulative = 0;

        const data = sorted.map(item => {
            cumulative += item.val;
            return {
                ...item,
                percent: (item.val / total) * 100,
                cumPercent: (cumulative / total) * 100
            };
        });

        // 3. Render Table
        const tbody = document.querySelector('#paretoTable tbody');
        tbody.innerHTML = '';
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                        <td>${item.cat}</td>
                        <td>${item.val.toFixed(2)}</td>
                        <td>${item.percent.toFixed(2)}%</td>
                        <td>${item.cumPercent.toFixed(2)}%</td>
                    `;
            tbody.appendChild(tr);
        });

        // 4. Render Chart
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const trText = translations[currentLang];

        const traceBars = {
            x: data.map(d => d.cat),
            y: data.map(d => d.val),
            type: 'bar',
            name: trText.lblParetoImpact || 'Impact',
            marker: { color: theme.theme_primary || '#0078d4' }
        };

        const traceLine = {
            x: data.map(d => d.cat),
            y: data.map(d => d.cumPercent),
            type: 'scatter',
            mode: 'lines+markers',
            name: trText.lblParetoCum || 'Cumulative %',
            yaxis: 'y2',
            visible: document.getElementById('paretoShowCurve').checked,
            line: { color: theme.dangercolor || '#d83b01', width: 2 }
        };

        const refVal = parseFloat(document.getElementById('paretoRefLine').value);
        const shapes = [];
        if (!isNaN(refVal)) {
            shapes.push({
                type: 'line',
                xref: 'paper', yref: 'y2',
                x0: 0, x1: 1, y0: refVal, y1: refVal,
                line: { color: theme.dangercolor, width: 2, dash: 'dash' }
            });
        }

        const layout = {
            title: "",
            xaxis: { gridcolor: theme.gridcolor, type: 'category', automargin: true },
            yaxis: { title: trText.lblParetoImpact || 'Impact', gridcolor: theme.gridcolor, automargin: true },
            yaxis2: {
                title: trText.lblParetoCum || 'Cumulative %',
                overlaying: 'y',
                side: 'right',
                range: [0, 105],
                showgrid: false,
                automargin: true
            },
            font: theme.font,
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            margin: { t: 40, r: 50, l: 50, b: 60 },
            showlegend: true,
            legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
            shapes: shapes,
            bargap: 0.02,
            autosize: true
        };

        document.getElementById('pareto-chart-container').classList.remove('hidden');
        document.getElementById('pareto-table-container').classList.remove('hidden');

        Plotly.newPlot('paretoChart', [traceBars, traceLine], layout, { responsive: true });
        setTimeout(() => Plotly.Plots.resize('paretoChart'), 50);
    }
};

// Global exposures
window.updateParetoControls = () => Pareto.updateControls();
window.analyzePareto = () => Pareto.analyze();
