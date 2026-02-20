/**
 * Process Capability Analysis Module
 */

const Capability = {
    analyze: function () {
        const data = dataset[selectedColumnName];

        if (!data || data.length === 0) {
            showError("No data available for analysis. Please load data first.");
            return;
        }

        const lsl = parseFloat(document.getElementById('lslValue').value);
        const usl = parseFloat(document.getElementById('uslValue').value);
        const target = parseFloat(document.getElementById('targetValue').value);
        const method = document.getElementById('capDistributionMethod').value;

        if (isNaN(lsl) && isNaN(usl)) {
            showError("Please enter at least one limit (LSL or USL).");
            if (typeof Plotly !== 'undefined') Plotly.purge('capChart');
            return;
        }

        const mean = getMean(data);
        const sigmaOverall = getStd(data, mean);
        let sumMR = 0;
        for (let i = 1; i < data.length; i++) sumMR += Math.abs(data[i] - data[i - 1]);
        const sigmaWithin = (data.length > 1) ? ((sumMR / (data.length - 1)) / getSpcConstant('d2', 2)) : sigmaOverall;

        let fit = null;
        let cdf, pdf;

        if (method === 'normal') {
            document.getElementById('cap-dist-label').textContent = `(${translations[currentLang].distNormal})`;
            cdf = (x, s) => normalCDF(x, mean, s);
            pdf = (x, s) => normalPDF(x, mean, s);
            document.getElementById('cap-indices-within').classList.remove('hidden');
            document.getElementById('cap-indices-overall').classList.remove('hidden');
        } else {
            // Updated to use global findBestFit from distribution.js
            fit = findBestFit(data);
            document.getElementById('cap-dist-label').textContent = `(${translations[currentLang].cardBest}: ${fit.name})`;
            cdf = (x, s) => fit.cdf(x);
            pdf = (x, s) => fit.pdf(x);

            document.getElementById('cap-indices-within').classList.add('hidden');
            document.getElementById('cap-indices-overall').classList.remove('hidden');
        }

        const calcPerf = (sigma) => {
            const pLower = !isNaN(lsl) ? cdf(lsl, sigma) : 0;
            const pUpper = !isNaN(usl) ? 1 - cdf(usl, sigma) : 0;
            return {
                pctLower: pLower * 100,
                pctUpper: pUpper * 100,
                pctTotal: (pLower + pUpper) * 100,
                ppmLower: pLower * 1e6,
                ppmUpper: pUpper * 1e6,
                ppmTotal: (pLower + pUpper) * 1e6,
            }
        };

        const overallPerf = calcPerf(sigmaOverall);
        const withinPerf = (method === 'normal') ? calcPerf(sigmaWithin) : overallPerf;

        const calcIndices = (sigma) => {
            let cp = null, cpl = null, cpu = null, cpk = null;
            if (method === 'normal' && sigma > 0) {
                if (!isNaN(lsl) && !isNaN(usl)) cp = (usl - lsl) / (6 * sigma);
                if (!isNaN(lsl)) cpl = (mean - lsl) / (3 * sigma);
                if (!isNaN(usl)) cpu = (usl - mean) / (3 * sigma);
                cpk = Math.min(cpl !== null ? cpl : Infinity, cpu !== null ? cpu : Infinity);
            }
            return { cp, cpl, cpu, cpk };
        };

        const withinIndices = calcIndices(sigmaWithin);
        let overallIndices = calcIndices(sigmaOverall);

        if (method !== 'normal' && fit) {
            const probit = (p) => {
                if (p <= 0 || p >= 1) return 0;
                if (typeof jStat !== 'undefined') return jStat.normal.inv(p, 0, 1);
                return 0;
            };

            const pLower = overallPerf.pctLower / 100;
            const pUpper = overallPerf.pctUpper / 100;

            let pp = null, ppl = null, ppu = null, ppk = null;

            if (!isNaN(lsl)) ppl = pLower > 0 ? (probit(1 - pLower) / 3) : 99;
            if (!isNaN(usl)) ppu = pUpper > 0 ? (probit(1 - pUpper) / 3) : 99;

            if (ppl !== null && ppu !== null) ppk = Math.min(ppl, ppu);
            else if (ppl !== null) ppk = ppl;
            else if (ppu !== null) ppk = ppu;

            overallIndices = { cp: null, cpl: ppl, cpu: ppu, cpk: ppk };
        }

        let cpm = null;
        if (!isNaN(target) && !isNaN(lsl) && !isNaN(usl) && sigmaOverall > 0) {
            cpm = (usl - lsl) / (6 * Math.sqrt(sigmaOverall ** 2 + (mean - target) ** 2));
        }

        const fmt = (v) => v !== null && v !== undefined && isFinite(v) ? v.toFixed(3) : '-';
        const fmtPPM = (v) => v !== null && v !== undefined && isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-';
        const fmtPCT = (v) => v !== null && v !== undefined && isFinite(v) ? v.toFixed(4) + '%' : '-';

        document.getElementById('val-lsl').textContent = isNaN(lsl) ? '-' : lsl;
        document.getElementById('val-usl').textContent = isNaN(usl) ? '-' : usl;
        document.getElementById('val-target').textContent = isNaN(target) ? '-' : target;
        document.getElementById('val-mean').textContent = fmt(mean);
        document.getElementById('val-n').textContent = data.length;

        document.getElementById('val-cp').textContent = fmt(withinIndices.cp);
        document.getElementById('val-cpl').textContent = fmt(withinIndices.cpl);
        document.getElementById('val-cpu').textContent = fmt(withinIndices.cpu);
        document.getElementById('val-cpk').textContent = fmt(withinIndices.cpk);
        document.getElementById('val-sig-within').textContent = fmt(sigmaWithin);
        document.getElementById('val-pp').textContent = fmt(overallIndices.cp);
        document.getElementById('val-ppl').textContent = fmt(overallIndices.cpl);
        document.getElementById('val-ppu').textContent = fmt(overallIndices.cpu);
        document.getElementById('val-ppk').textContent = fmt(overallIndices.cpk);
        document.getElementById('val-cpm').textContent = fmt(cpm);
        document.getElementById('val-sig-overall').textContent = fmt(sigmaOverall);

        document.getElementById('pct-ppl').textContent = fmtPCT(overallPerf.pctLower);
        document.getElementById('ppm-ppl').textContent = fmtPPM(overallPerf.ppmLower);
        document.getElementById('pct-ppu').textContent = fmtPCT(overallPerf.pctUpper);
        document.getElementById('ppm-ppu').textContent = fmtPPM(overallPerf.ppmUpper);
        document.getElementById('pct-ppt').textContent = fmtPCT(overallPerf.pctTotal);
        document.getElementById('ppm-ppt').textContent = fmtPPM(overallPerf.ppmTotal);

        document.getElementById('pct-cpl').textContent = fmtPCT(withinPerf.pctLower);
        document.getElementById('ppm-cpl').textContent = fmtPPM(withinPerf.ppmLower);
        document.getElementById('pct-cpu').textContent = fmtPCT(withinPerf.pctUpper);
        document.getElementById('ppm-cpu').textContent = fmtPPM(withinPerf.ppmUpper);
        document.getElementById('pct-cpt').textContent = fmtPCT(withinPerf.pctTotal);
        document.getElementById('ppm-cpt').textContent = fmtPPM(withinPerf.ppmTotal);

        try {
            this.plotChart(data, mean, pdf, sigmaOverall, sigmaWithin, lsl, usl, target, method);
        } catch (error) {
            console.error("Error in plotCapabilityChart:", error);
            showError("Error generating capability chart: " + error.message);
        }
    },

    plotChart: function (data, mean, pdf, sigmaOverall, sigmaWithin, lsl, usl, target, method) {
        document.getElementById('capability-chart-container').classList.remove('hidden');
        document.getElementById('capability-results-wrapper').classList.remove('hidden');

        const minVal = getMin(data), maxVal = getMax(data);
        const plotRange = Math.max(maxVal, usl || -Infinity) - Math.min(minVal, lsl || Infinity);
        const buffer = plotRange * 0.2;
        const plotMin = Math.min(minVal, lsl || Infinity) - buffer;
        const plotMax = Math.max(maxVal, usl || Infinity) + buffer;

        const xVals = Array.from({ length: 201 }, (_, i) => plotMin + (i / 200) * (plotMax - plotMin));
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const tr = translations[currentLang];

        const traces = [
            { x: data, type: 'histogram', name: tr.lblProcData || 'Data', histnorm: 'probability density', marker: { color: theme.theme_primary, opacity: 0.4 } }
        ];

        if (method === 'normal') {
            traces.push({ x: xVals, y: xVals.map(x => pdf(x, sigmaOverall)), type: 'scatter', mode: 'lines', name: tr.lblOverall || 'Overall', line: { color: theme.dangercolor, width: 2 } });
            traces.push({ x: xVals, y: xVals.map(x => pdf(x, sigmaWithin)), type: 'scatter', mode: 'lines', name: tr.lblWithin || 'Within', line: { color: theme.font.color, width: 2, dash: 'dash' } });
        } else {
            traces.push({ x: xVals, y: xVals.map(x => pdf(x)), type: 'scatter', mode: 'lines', name: tr.lblBestFit || 'Best Fit', line: { color: theme.dangercolor, width: 2 } });
        }

        const shapes = [];
        const annotations = [];
        if (lsl !== null && !isNaN(lsl)) {
            shapes.push({ type: 'line', x0: lsl, x1: lsl, y0: 0, y1: 1, yref: 'paper', line: { color: theme.warningcolor, width: 2 } });
            annotations.push({ x: lsl, y: 1, yref: 'paper', text: 'LSL', showarrow: false, yshift: 10, font: { color: theme.warningcolor } });
        }
        if (usl !== null && !isNaN(usl)) {
            shapes.push({ type: 'line', x0: usl, x1: usl, y0: 0, y1: 1, yref: 'paper', line: { color: theme.warningcolor, width: 2 } });
            annotations.push({ x: usl, y: 1, yref: 'paper', text: 'USL', showarrow: false, yshift: 10, font: { color: theme.warningcolor } });
        }
        if (target !== null && !isNaN(target)) {
            shapes.push({ type: 'line', x0: target, x1: target, y0: 0, y1: 0.5, yref: 'paper', line: { color: theme.font.color, width: 2, dash: 'dot' } });
            annotations.push({ x: target, y: 0.5, yref: 'paper', text: tr.optTarget || 'Target', showarrow: false, yshift: 10, xshift: -30 });
        }

        const capTitleEl = document.getElementById('capChartTitle');
        if (capTitleEl) capTitleEl.textContent = `${tr.lblCapAnalysis || 'Capability Analysis'}: ${selectedColumnName}`;

        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('capChart', traces, {
                title: "", xaxis: { title: tr.lblValue || 'Value', gridcolor: theme.gridcolor, range: [plotMin, plotMax] }, yaxis: { title: tr.lblDensity || 'Density', gridcolor: theme.gridcolor },
                showlegend: true, shapes: shapes, annotations: annotations, font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 50, r: 20, l: 50, b: 50 }, legend: { orientation: 'h', y: -0.2 }
            }, { responsive: true });

            setTimeout(() => Plotly.Plots.resize('capChart'), 50);
        }
    }
};

// Global Exposure
window.analyzeCapability = () => Capability.analyze();
