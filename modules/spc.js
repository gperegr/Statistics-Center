/**
 * Statistical Process Control (SPC) Module
 */

const SPC = {
    analyze: function () {
        const data = dataset[selectedColumnName];
        if (typeof Plotly !== 'undefined') {
            Plotly.purge('spcChart');
            Plotly.purge('spcChartSecondary');
        }
        document.getElementById('spcViolationsTable').querySelector('tbody').innerHTML = '';
        document.getElementById('spc-violations-wrapper').classList.add('hidden');

        const chartType = document.getElementById('spcChartType').value;

        try {
            document.getElementById('spc-chart-container-1').classList.remove('hidden');
            document.getElementById('spc-chart-container-2').classList.remove('hidden');
            if (chartType === 'imr') this.analyzeIMR(data);
            else if (chartType === 'xbarr') this.analyzeXbarR(data);
        } catch (e) {
            showError(e.message);
        }
    },

    analyzeIMR: function (data) {
        if (data.length < 2) throw new Error("I-MR chart requires at least 2 data points.");
        const tr = translations[currentLang];
        const meanI = getMean(data);

        const mr = [];
        for (let i = 1; i < data.length; i++) {
            mr.push(Math.abs(data[i] - data[i - 1]));
        }
        const meanMR = getMean(mr);
        const d2 = getSpcConstant('d2', 2);
        const D4 = getSpcConstant('D4', 2);
        const D3 = getSpcConstant('D3', 2);

        // Individual Chart
        const sigma = meanMR / d2;
        const ucl_I = meanI + 3 * sigma;
        const lcl_I = meanI - 3 * sigma;

        // MR Chart
        const ucl_MR = meanMR * D4;
        const lcl_MR = meanMR * D3;

        // Check Rules
        const violations = this.checkRules(data, meanI, sigma);

        // Plot
        this.plotChart('spcChart', tr.lblChartI || 'Individual (I) Chart', data, meanI, ucl_I, lcl_I, violations.map(v => v.index));
        this.plotChart('spcChartSecondary', tr.lblChartMR || 'Moving Range (MR) Chart', mr, meanMR, ucl_MR, lcl_MR, [], 1);
        this.displayViolations(violations);
    },

    analyzeXbarR: function (data) {
        const subgroupColName = document.getElementById('spcSubgroupColumn').value;
        if (!subgroupColName) throw new Error("Subgroup column is required for Xbar-R chart.");
        const tr = translations[currentLang];

        const subgroups = {};
        const subgroupData = rawDataset[subgroupColName];

        for (let i = 0; i < data.length; i++) {
            const key = subgroupData[i];
            if (!subgroups[key]) subgroups[key] = [];
            subgroups[key].push(data[i]);
        }

        const subgroupStats = Object.keys(subgroups).map(key => {
            const values = subgroups[key];
            const n = values.length;
            const mean = getMean(values);
            const range = getMax(values) - getMin(values);
            return { key, n, mean, range, values };
        });

        if (subgroupStats.length < 2) throw new Error("Xbar-R requires at least 2 subgroups.");

        // Check for unequal subgroup sizes
        const n_values = subgroupStats.map(s => s.n);
        const constantN = n_values.every(n => n === n_values[0]);
        if (!constantN) throw new Error("Xbar-R chart requires equal subgroup sizes. Unequal sizes not yet supported.");
        const n = n_values[0];

        // Get constants
        const A2 = getSpcConstant('A2', n);
        const D4 = getSpcConstant('D4', n);
        const D3 = getSpcConstant('D3', n);
        if (A2 === null) throw new Error(`Subgroup size ${n} is too large for constants table (max 25).`);

        const xbars = subgroupStats.map(s => s.mean);
        const ranges = subgroupStats.map(s => s.range);

        const xbarDouble = getMean(xbars);
        const rbar = getMean(ranges);

        // Xbar limits
        const ucl_xbar = xbarDouble + A2 * rbar;
        const lcl_xbar = xbarDouble - A2 * rbar;

        // R limits
        const ucl_r = D4 * rbar;
        const lcl_r = D3 * rbar;

        const sigma = rbar / getSpcConstant('d2', n);

        // Check Rules (on xbars)
        const violations = this.checkRules(xbars, xbarDouble, sigma, subgroupStats.map(s => s.key));

        // Plot
        this.plotChart('spcChart', tr.lblChartXbar || 'X-bar Chart', xbars, xbarDouble, ucl_xbar, lcl_xbar, violations.map(v => v.index), 0, subgroupStats.map(s => s.key));
        this.plotChart('spcChartSecondary', tr.lblChartR || 'Range (R) Chart', ranges, rbar, ucl_r, lcl_r, [], 0, subgroupStats.map(s => s.key));
        this.displayViolations(violations);
    },

    checkRules: function (data, cl, sigma, labels = null) {
        const rules = {
            r1: document.getElementById('spcRule1').checked,
            r2: document.getElementById('spcRule2').checked,
            r3: document.getElementById('spcRule3').checked,
            r4: document.getElementById('spcRule4').checked,
        };
        const violations = [];
        const ucl = cl + 3 * sigma;
        const lcl = cl - 3 * sigma;
        const tr = translations[currentLang];

        for (let i = 0; i < data.length; i++) {
            // Rule 1: Point outside 3-sigma limits
            if (rules.r1 && (data[i] > ucl || data[i] < lcl)) {
                violations.push({ index: i, value: data[i], label: labels ? labels[i] : i + 1, rule: tr.rule1 });
            }

            // Rule 2: 9+ points on one side of centerline
            if (rules.r2 && i >= 8) {
                const recent9 = data.slice(i - 8, i + 1);
                if (recent9.every(p => p > cl) || recent9.every(p => p < cl)) {
                    violations.push({ index: i, value: data[i], label: labels ? labels[i] : i + 1, rule: tr.rule2 });
                }
            }

            // Rule 3: 6+ points trending
            if (rules.r3 && i >= 5) {
                const recent6 = data.slice(i - 5, i + 1);
                let increasing = true;
                let decreasing = true;
                for (let j = 1; j < recent6.length; j++) {
                    if (recent6[j] <= recent6[j - 1]) increasing = false;
                    if (recent6[j] >= recent6[j - 1]) decreasing = false;
                }
                if (increasing || decreasing) {
                    violations.push({ index: i, value: data[i], label: labels ? labels[i] : i + 1, rule: tr.rule3 });
                }
            }

            // Rule 4: 14+ points alternating
            if (rules.r4 && i >= 13) {
                const recent14 = data.slice(i - 13, i + 1);
                let alternating = true;
                for (let j = 1; j < recent14.length; j++) {
                    const up1 = recent14[j] > recent14[j - 1];
                    const down1 = recent14[j] < recent14[j - 1];
                    if (j > 0) {
                        const up_prev = recent14[j - 1] > recent14[j - 2];
                        const down_prev = recent14[j - 1] < recent14[j - 2];
                        if ((up1 && up_prev) || (down1 && down_prev)) {
                            alternating = false; break;
                        }
                    }
                }
                if (alternating) {
                    violations.push({ index: i, value: data[i], label: labels ? labels[i] : i + 1, rule: tr.rule4 });
                }
            }
        }
        // Remove duplicate points, keeping first rule violated
        const uniqueViolations = [];
        const seenIndices = new Set();
        for (const v of violations) {
            if (!seenIndices.has(v.index)) {
                uniqueViolations.push(v);
                seenIndices.add(v.index);
            }
        }
        return uniqueViolations;
    },

    plotChart: function (divId, title, data, cl, ucl, lcl, violationIndices = [], startIndex = 0, labels = null) {
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const tr = translations[currentLang];
        const x_axis = labels ? labels : Array.from({ length: data.length }, (_, i) => i + 1 + startIndex);

        const traces = [
            // UCL line
            { x: x_axis, y: Array(data.length).fill(ucl), mode: 'lines', name: tr.lblUCL || 'UCL', line: { color: theme.dangercolor, dash: 'dash' } },
            // CL line
            { x: x_axis, y: Array(data.length).fill(cl), mode: 'lines', name: tr.lblCL || 'CL', line: { color: theme.font.color, width: 1 } },
            // LCL line
            { x: x_axis, y: Array(data.length).fill(lcl), mode: 'lines', name: tr.lblLCL || 'LCL', line: { color: theme.dangercolor, dash: 'dash' } },
            // Data points (in control)
            { x: x_axis, y: data, mode: 'lines+markers', name: tr.lblProcData || 'Data', line: { color: theme.theme_primary || '#0078d4' }, marker: { size: 6 } },
        ];

        if (violationIndices.length > 0) {
            const violation_x = violationIndices.map(i => x_axis[i]);
            const violation_y = violationIndices.map(i => data[i]);
            traces.push({
                x: violation_x, y: violation_y, mode: 'markers', name: tr.lblViolation || 'Violation',
                marker: { color: theme.dangercolor, size: 10, symbol: 'x' }
            });
        }

        const layout = {
            title,
            xaxis: { title: tr.lblSampleIndex || 'Sample Index', gridcolor: theme.gridcolor, type: labels ? 'category' : 'linear' },
            yaxis: { title: tr.lblValue || 'Value', gridcolor: theme.gridcolor, zeroline: false },
            showlegend: true, legend: { orientation: 'h', y: -0.2 },
            font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
            margin: { t: 50, r: 20, l: 60, b: 50 }
        };
        Plotly.newPlot(divId, traces, layout, { responsive: true });
        setTimeout(() => Plotly.Plots.resize(divId), 50);
    },

    displayViolations: function (violations) {
        const tableBody = document.getElementById('spcViolationsTable').querySelector('tbody');
        tableBody.innerHTML = '';

        if (violations.length === 0) {
            document.getElementById('spc-violations-wrapper').classList.add('hidden');
            return;
        }

        violations.forEach(v => {
            const row = tableBody.insertRow();
            row.className = 'violation-row';
            row.innerHTML = `<td>${v.label}</td><td>${v.value.toFixed(4)}</td><td>${v.rule}</td>`;
        });
        document.getElementById('spc-violations-wrapper').classList.remove('hidden');
    },

    updateControls: function () {
        const chartType = document.getElementById('spcChartType').value;
        const subgroupGrp = document.getElementById('grp-spc-subgroup');
        if (chartType === 'xbarr') {
            subgroupGrp.classList.remove('hidden');
        } else {
            subgroupGrp.classList.add('hidden');
        }
    }
};

// Global Exposure
window.analyzeSpc = () => SPC.analyze();
window.updateSpcControls = () => SPC.updateControls();
