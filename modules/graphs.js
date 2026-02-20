/**
 * Descriptive Statistics (Graphs) Module
 */

const Graphs = {
    updateControls: function () {
        if (currentMode !== 'graphs') return;
        const container = document.getElementById('graphs-num-cols');
        const groupSelect = document.getElementById('graphs-group-col');
        container.innerHTML = '';
        groupSelect.innerHTML = '<option value="" data-i18n="optNone">None</option>';

        Object.keys(dataset).forEach(col => {
            // Determine if numeric
            const isNumeric = dataset[col].some(v => typeof v === 'number' && !isNaN(v));

            if (isNumeric) {
                const label = document.createElement('label');
                label.className = 'ms-checkbox';
                label.innerHTML = `<input type="checkbox" value="${col}" checked> <span class="checkmark"></span> ${col}`;
                container.appendChild(label);
            }

            const opt = document.createElement('option');
            opt.value = col;
            opt.text = col;
            groupSelect.add(opt);
        });

        // Translate the "None" option and headers
        const noneOpt = groupSelect.querySelector('option[value=""]');
        if (noneOpt && translations[currentLang].optNone) noneOpt.textContent = translations[currentLang].optNone;
    },

    analyze: function () {
        // 1. Get Params
        const selectedCols = Array.from(document.querySelectorAll('#graphs-num-cols input:checked')).map(cb => cb.value);
        const groupCol = document.getElementById('graphs-group-col').value;
        const normalize = document.getElementById('graphNormalize').checked;

        const stats = {
            mean: document.getElementById('statMean').checked,
            median: document.getElementById('statMedian').checked,
            stdev: document.getElementById('statStdDev').checked,
            var: document.getElementById('statVar').checked,
            min: document.getElementById('statMin').checked,
            max: document.getElementById('statMax').checked,
            quartiles: document.getElementById('statQuartiles').checked
        };

        const charts = {
            hist: document.getElementById('showHist').checked,
            box: document.getElementById('showBox').checked,
            interval: document.getElementById('showInterval').checked,
            timeSeries: document.getElementById('showTimeSeries').checked
        };

        if (selectedCols.length === 0) {
            alert("Please select at least one numeric column.");
            return;
        }

        // 2. Prepare Data Structure
        let groupedData = {};
        let groups = {}; // map index -> groupName
        if (groupCol) {
            dataset[groupCol].forEach((val, i) => {
                const key = String(val);
                if (!groups[key]) groups[key] = [];
                groups[key].push(i);
            });
        } else {
            const firstCol = Object.keys(dataset)[0];
            if (firstCol) {
                groups["All"] = dataset[firstCol].map((_, i) => i);
            } else {
                return; // No data
            }
        }

        Object.keys(groups).forEach(gKey => {
            groupedData[gKey] = {};
            selectedCols.forEach(col => {
                let vals = groups[gKey].map(idx => dataset[col][idx]).filter(v => v !== null && v !== undefined && !isNaN(v));
                if (normalize) {
                    const mean = jStat.mean(vals);
                    const std = jStat.stdev(vals, true);
                    if (std !== 0) vals = vals.map(v => (v - mean) / std);
                }
                groupedData[gKey][col] = vals;
            });
        });

        // 3. Render Stats Table
        const tableContainer = document.getElementById('graphs-stats-table-container');
        const tbody = document.querySelector('#graphsStatsTable tbody');
        const thead = document.querySelector('#graphsStatsTable thead');
        tableContainer.classList.remove('hidden');
        tbody.innerHTML = '';
        thead.innerHTML = '';

        let headers = ['Variable', 'Group'];
        if (stats.mean) headers.push('Mean');
        if (stats.stdev) headers.push('StDev');
        if (stats.var) headers.push('Var');
        if (stats.min) headers.push('Min');
        if (stats.max) headers.push('Max');
        if (stats.median) headers.push('Median');
        if (stats.quartiles) headers.push('Q1', 'Q3');

        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        selectedCols.forEach(col => {
            Object.keys(groupedData).forEach(grp => {
                const vals = groupedData[grp][col];
                if (vals.length === 0) return;

                const row = document.createElement('tr');
                row.innerHTML += `<td><b>${col}</b></td><td>${grp}</td>`;

                if (stats.mean) row.innerHTML += `<td>${jStat.mean(vals).toFixed(4)}</td>`;
                if (stats.stdev) row.innerHTML += `<td>${jStat.stdev(vals, true).toFixed(4)}</td>`;
                if (stats.var) row.innerHTML += `<td>${jStat.variance(vals, true).toFixed(4)}</td>`;
                if (stats.min) row.innerHTML += `<td>${jStat.min(vals).toFixed(4)}</td>`;
                if (stats.max) row.innerHTML += `<td>${jStat.max(vals).toFixed(4)}</td>`;
                if (stats.median) row.innerHTML += `<td>${jStat.median(vals).toFixed(4)}</td>`;
                if (stats.quartiles) {
                    row.innerHTML += `<td>${jStat.percentile(vals, 0.25).toFixed(4)}</td>`;
                    row.innerHTML += `<td>${jStat.percentile(vals, 0.75).toFixed(4)}</td>`;
                }
                tbody.appendChild(row);
            });
        });

        // 4. Render Charts
        const chartContainer = document.getElementById('graphs-charts-container');
        chartContainer.innerHTML = '';

        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const baseLayout = {
            font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
            xaxis: { gridcolor: theme.gridcolor }, yaxis: { gridcolor: theme.gridcolor },
            margin: { t: 40, r: 20, l: 50, b: 40 }
        };

        const addChartDiv = (id, title) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-container';
            if (title) {
                const titleDiv = document.createElement('div');
                titleDiv.className = 'panel-title';
                titleDiv.textContent = title;
                wrapper.appendChild(titleDiv);
            }
            const div = document.createElement('div');
            div.id = id;
            div.style.width = '100%';
            div.style.height = '400px';
            wrapper.appendChild(div);
            chartContainer.appendChild(wrapper);
            return id;
        };

        let allBoxTraces = [];
        let allHistTraces = [];
        let allIntervalX = [];
        let allIntervalY = [];
        let allIntervalErr = [];
        let allTimeSeriesTraces = [];

        selectedCols.forEach((col, idx) => {
            Object.keys(groupedData).forEach(grp => {
                const vals = groupedData[grp][col];
                if (!vals || vals.length === 0) return;

                const traceName = grp === "All" ? col : `${col} (${grp})`;

                if (charts.box) {
                    allBoxTraces.push({
                        y: vals,
                        type: 'box',
                        name: traceName,
                        boxpoints: 'outliers'
                    });
                }

                if (charts.hist) {
                    allHistTraces.push({
                        x: vals,
                        type: 'histogram',
                        name: traceName,
                        opacity: 0.6
                    });
                }

                if (charts.timeSeries) {
                    allTimeSeriesTraces.push({
                        y: vals,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: traceName
                    });
                }
            });
        });

        if (charts.interval) {
            selectedCols.forEach((col) => {
                Object.keys(groupedData).forEach(grp => {
                    const vals = groupedData[grp][col];
                    if (!vals || vals.length === 0) return;

                    const traceName = grp === "All" ? col : `${col} (${grp})`;
                    const mean = jStat.mean(vals);
                    const stdev = jStat.stdev(vals, true);

                    allIntervalX.push(traceName);
                    allIntervalY.push(mean);
                    allIntervalErr.push(stdev);
                });
            });
        }

        if (charts.box && allBoxTraces.length > 0) {
            const divId = addChartDiv('chart-box-combined', 'Combined Boxplot');
            Plotly.newPlot(divId, allBoxTraces, { ...baseLayout, title: "" }, { responsive: true });
        }

        if (charts.hist && allHistTraces.length > 0) {
            const divId = addChartDiv('chart-hist-combined', 'Combined Histogram');
            const allHistValues = allHistTraces.flatMap(t => t.x || []);
            const histRange = getRangeWithPadding(allHistValues);
            Plotly.newPlot(divId, allHistTraces, {
                ...baseLayout, title: "", barmode: 'overlay',
                xaxis: { ...baseLayout.xaxis, type: 'linear', range: histRange || undefined },
                yaxis: { ...baseLayout.yaxis, type: 'linear' }
            }, { responsive: true });

            const cdfTitle = (translations[currentLang] && translations[currentLang].lblCdfChart) || 'Cumulative Histogram (CDF)';
            const cdfId = addChartDiv('chart-hist-cdf-combined', cdfTitle);
            const cdfTraces = allHistTraces.map(trace => {
                const series = getCdfSeries(trace.x);
                return { x: series.x, y: series.y, type: 'scatter', mode: 'lines', name: trace.name, line: { width: 2 } };
            });
            Plotly.newPlot(cdfId, cdfTraces, {
                ...baseLayout, title: "", barmode: 'overlay',
                xaxis: { ...baseLayout.xaxis, type: 'linear', range: histRange || undefined },
                yaxis: { ...baseLayout.yaxis, title: (translations[currentLang].lblCdfAxis || 'Cumulative Probability'), rangemode: 'tozero' }
            }, { responsive: true });
        }

        if (charts.interval && allIntervalX.length > 0) {
            const divId = addChartDiv('chart-int-combined', 'Combined Interval Plot');
            const trace = {
                x: allIntervalX, y: allIntervalY,
                error_y: { type: 'data', array: allIntervalErr, visible: true },
                type: 'scatter', mode: 'markers', marker: { size: 12, color: theme.primary }
            };
            Plotly.newPlot(divId, [trace], { ...baseLayout, title: "" }, { responsive: true });
        }

        if (charts.timeSeries && allTimeSeriesTraces.length > 0) {
            const divId = addChartDiv('chart-timeseries-combined', (translations[currentLang].lblTimeSeriesPlot || 'Time Series Plot'));
            Plotly.newPlot(divId, allTimeSeriesTraces, { ...baseLayout, title: "" }, { responsive: true });
        }
    }
};

// Global exposures
window.updateGraphsControls = () => Graphs.updateControls();
window.analyzeGraphs = () => Graphs.analyze();
