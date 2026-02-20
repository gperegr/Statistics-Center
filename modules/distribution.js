/**
 * Distribution and Tolerance Analysis Module
 */

const Distribution = {
    analyzeNormal: function (data, limit, limitType) {
        const mean = getMean(data);
        const std = getStd(data, mean);

        // Handle optional limit: if NaN, set zScore and prob to null
        let zScore = null;
        let prob = null;

        if (!isNaN(limit)) {
            zScore = (std !== 0) ? Math.abs((limit - mean) / std) : 0;
            prob = (limitType === 'upper') ? (1 - normalCDF(limit, mean, std)) : normalCDF(limit, mean, std);
        }

        const tr = translations[currentLang];

        const zScoreVal = zScore !== null ? zScore.toFixed(4) : "N/A";
        const zScoreSub = zScore !== null ? `${tr.valLimit}: ${limit}` : "";

        const probVal = prob !== null ? (prob * 100).toFixed(4) + "%" : "N/A";
        const probSub = prob !== null ? `${(prob * 1000000).toFixed(0)} PPM` : "";
        const probTitle = !isNaN(limit)
            ? (limitType === 'upper' ? `${tr.cardEst} > ${limit}` : `${tr.cardEst} < ${limit}`)
            : tr.cardEst;

        const cards = [
            { title: tr.cardDist, value: tr.valNormal, sub: tr.valAssumed },
            { title: tr.cardMean, value: mean.toFixed(4), sub: "" },
            { title: tr.cardStd, value: std.toFixed(4), sub: "" },
            { title: tr.cardZ, value: zScoreVal, sub: zScoreSub }
        ];

        if (prob !== null) {
            cards.push({ title: probTitle, value: probVal, sub: probSub });
        }

        renderCards(cards);

        document.getElementById('stats-container').classList.remove('hidden');
        document.getElementById('analysis-chart-container').classList.remove('hidden');

        const fit = { name: tr.valNormal, pdf: (x) => normalPDF(x, mean, std), color: getChartTheme(document.body.getAttribute('data-theme')).dangercolor };
        this.plotMultiDistribution(data, limit, [fit]);
    },

    analyzeTolerance: function (data) {
        const tr = translations[currentLang] || translations.en;
        const n = data.length;

        if (n < 2) {
            showError(tr.errTolMinData || "Need at least 2 data points for tolerance intervals.");
            return;
        }

        const confInput = parseFloat(document.getElementById('tol-confidence').value);
        const propInput = parseFloat(document.getElementById('tol-coverage').value);
        const confLevel = Math.min(Math.max((isNaN(confInput) ? 95 : confInput) / 100, 0.5), 0.999);
        const propLevel = Math.min(Math.max((isNaN(propInput) ? 95 : propInput) / 100, 0.5), 0.999);

        const mean = getMean(data);
        const std = getStd(data, mean);
        const minVal = getMin(data);
        const maxVal = getMax(data);
        const skew = calcSkewness(data, mean, std);

        document.getElementById('tol-n').textContent = n;
        document.getElementById('tol-mean').textContent = mean.toFixed(4);
        document.getElementById('tol-std').textContent = std.toFixed(4);
        document.getElementById('tol-min').textContent = minVal.toFixed(4);
        document.getElementById('tol-max').textContent = maxVal.toFixed(4);
        document.getElementById('tol-skew').textContent = skew.toFixed(3);

        const adStat = this.calculateAD(data, (x) => normalCDF(x, mean, std));
        const adP = this.calculateADPValue(adStat, n, 'Normal');
        const isNormal = adP !== null && adP >= 0.05;

        document.getElementById('tol-ad-stat').textContent = adStat.toFixed(4);
        document.getElementById('tol-ad-p').textContent = adP !== null ? adP.toFixed(4) : "N/A";
        document.getElementById('tol-ad-conclusion').innerHTML = isNormal
            ? `<span class="conclusion-retain">${tr.lblTolStatusOk || 'Valid'}</span>`
            : `<span class="conclusion-reject">${tr.lblTolStatusRisk || 'Risk'}</span>`;

        const kFactor = calcToleranceKFactor(n, confLevel, propLevel);
        const k = isFinite(kFactor) ? kFactor : 0;
        const normLower = mean - (k * std);
        const normUpper = mean + (k * std);

        const npConf = calcNonParametricConfidence(n, propLevel);
        const npAchievedTarget = npConf >= confLevel;

        const tbody = document.querySelector('#toleranceTable tbody');
        tbody.innerHTML = '';

        const targetConfStr = (confLevel * 100).toFixed(1) + '%';
        const npConfStr = (npConf * 100).toFixed(2) + '%';

        const normalMethod = tr.lblTolMethodNormal || 'Normal';
        const nonParamMethod = tr.lblTolMethodNonParam || 'Non-Parametric (Range)';

        const normalRow = document.createElement('tr');
        normalRow.innerHTML = `
                <td><strong>${normalMethod}</strong> (k=${k.toFixed(3)})</td>
                <td>${normLower.toFixed(4)}</td>
                <td>${normUpper.toFixed(4)}</td>
                <td>${targetConfStr}</td>
                <td>${isNormal ? `<span class="conclusion-retain">${tr.lblTolStatusOk || 'Valid'}</span>` : `<span class="conclusion-reject">${tr.lblTolStatusRisk || 'Risk'}</span>`}</td>
            `;
        tbody.appendChild(normalRow);

        const nonParamRow = document.createElement('tr');
        nonParamRow.innerHTML = `
                <td><strong>${nonParamMethod}</strong></td>
                <td>${minVal.toFixed(4)}</td>
                <td>${maxVal.toFixed(4)}</td>
                <td>${npConfStr}</td>
                <td>${npAchievedTarget ? `<span class="conclusion-retain">${tr.lblTolStatusTarget || 'Target Met'}</span>` : `<span class="conclusion-reject">${tr.lblTolStatusInsufficient || 'Insufficient N'}</span>`}</td>
            `;
        tbody.appendChild(nonParamRow);

        const msgEl = document.getElementById('tolerance-message');
        if (isNormal) {
            msgEl.className = 'success-msg';
            msgEl.textContent = `${tr.msgTolNormal || 'Data appears normal (P >= 0.05). Use Normal limits.'} P=${adP.toFixed(3)}.`;
        } else if (npAchievedTarget) {
            msgEl.className = 'success-msg';
            msgEl.textContent = `${tr.msgTolNonParam || 'Data is non-normal. Non-parametric limits meet the target confidence.'} ${targetConfStr}.`;
        } else {
            const nRequired = (propLevel > 0 && propLevel < 1)
                ? Math.ceil(Math.log(1 - confLevel) / Math.log(propLevel))
                : null;
            msgEl.className = 'error-msg';
            msgEl.textContent = `${tr.msgTolInsufficient || 'Data is non-normal and sample size is insufficient for the non-parametric method.'} ${tr.msgTolNeedN || 'Estimated minimum N:'} ${nRequired !== null && isFinite(nRequired) ? nRequired : '-'}.`;
        }

        document.getElementById('tolerance-stats-wrapper').classList.remove('hidden');
        document.getElementById('tolerance-normality-wrapper').classList.remove('hidden');
        document.getElementById('tolerance-table-wrapper').classList.remove('hidden');
        document.getElementById('tolerance-chart-container').classList.remove('hidden');
        document.getElementById('tolerance-view').classList.remove('hidden');

        this.plotToleranceChart(data, mean, std, normLower, normUpper, minVal, maxVal, !isNormal);
    },

    plotToleranceChart: function (data, mean, std, normLower, normUpper, minVal, maxVal, showNonParam) {
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const tr = translations[currentLang] || translations.en;
        const minData = getMin(data);
        const maxData = getMax(data);
        const range = maxData - minData;
        const pad = range === 0 ? 1 : range * 0.2;
        const xMin = minData - pad;
        const xMax = maxData + pad;
        const xVals = Array.from({ length: 201 }, (_, i) => xMin + (i / 200) * (xMax - xMin));

        const traces = [{
            x: data,
            type: 'histogram',
            histnorm: 'probability density',
            name: tr.lblTolData || 'Data',
            marker: { color: theme.theme_primary, opacity: 0.5 }
        }];

        if (std > 0) {
            traces.push({
                x: xVals,
                y: xVals.map(x => normalPDF(x, mean, std)),
                type: 'scatter',
                mode: 'lines',
                name: tr.lblTolCurve || 'Normal Curve',
                line: { color: theme.dangercolor, width: 2 }
            });
        }

        const shapes = [];
        if (isFinite(normLower) && isFinite(normUpper)) {
            shapes.push({
                type: 'line',
                x0: normLower, x1: normLower, y0: 0, y1: 1, yref: 'paper',
                line: { color: theme.successcolor, width: 2, dash: 'dash' }
            });
            shapes.push({
                type: 'line',
                x0: normUpper, x1: normUpper, y0: 0, y1: 1, yref: 'paper',
                line: { color: theme.successcolor, width: 2, dash: 'dash' }
            });
        }

        if (showNonParam) {
            shapes.push({
                type: 'line',
                x0: minVal, x1: minVal, y0: 0, y1: 1, yref: 'paper',
                line: { color: theme.warningcolor, width: 2, dash: 'dot' }
            });
            shapes.push({
                type: 'line',
                x0: maxVal, x1: maxVal, y0: 0, y1: 1, yref: 'paper',
                line: { color: theme.warningcolor, width: 2, dash: 'dot' }
            });
        }

        // Legend entries for limit lines (use legend-only traces)
        traces.push({
            x: [xMin, xMax],
            y: [0, 0],
            type: 'scatter',
            mode: 'lines',
            name: tr.lblTolLimits || 'Normal Limits',
            line: { color: theme.successcolor, width: 2, dash: 'dash' },
            visible: 'legendonly',
            hoverinfo: 'skip'
        });
        if (showNonParam) {
            traces.push({
                x: [xMin, xMax],
                y: [0, 0],
                type: 'scatter',
                mode: 'lines',
                name: tr.lblTolMethodNonParam || 'Range Limits',
                line: { color: theme.warningcolor, width: 2, dash: 'dot' },
                visible: 'legendonly',
                hoverinfo: 'skip'
            });
        }

        const layout = {
            title: "",
            xaxis: { gridcolor: theme.gridcolor, zeroline: false, range: [xMin, xMax] },
            yaxis: { gridcolor: theme.gridcolor, zeroline: false },
            font: theme.font,
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            margin: { t: 40, r: 30, l: 50, b: 60 },
            legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
            shapes: shapes,
            bargap: 0.02,
            autosize: true
        };

        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('toleranceChart', traces, layout, { responsive: true });
            setTimeout(() => Plotly.Plots.resize('toleranceChart'), 50);

            const cdf = getCdfSeries(data);
            const cdfTrace = {
                x: cdf.x,
                y: cdf.y,
                type: 'scatter',
                mode: 'lines',
                line: { color: theme.theme_primary, width: 2 },
                name: tr.lblCdfChart || 'Cumulative Histogram (CDF)'
            };
            Plotly.newPlot('toleranceCdfChart', [cdfTrace], {
                title: "",
                xaxis: { gridcolor: theme.gridcolor, zeroline: false, range: [xMin, xMax] },
                yaxis: { title: (tr.lblCdfAxis || 'Cumulative Probability'), gridcolor: theme.gridcolor, zeroline: false, rangemode: 'tozero' },
                font: theme.font,
                paper_bgcolor: theme.paper_bgcolor,
                plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 40, r: 30, l: 50, b: 60 },
                bargap: 0.02,
                autosize: true
            }, { responsive: true });
            setTimeout(() => Plotly.Plots.resize('toleranceCdfChart'), 50);
        }
    },

    analyzeMulti: function (data, limit, limitType) {
        const fits = [];
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const colors = { 'Normal': theme.dangercolor, 'Lognormal': theme.successcolor, 'Weibull': theme.warningcolor, 'Exponential': theme.theme_primary };

        const bestFit = this.findBestFit(data);
        Object.assign(bestFit, { color: colors[bestFit.name] || theme.dangercolor });

        // Handle optional limit
        bestFit.percentage = !isNaN(limit)
            ? ((limitType === 'upper') ? (1 - bestFit.cdf(limit)) : bestFit.cdf(limit))
            : null;

        const tr = translations[currentLang];

        const multiCards = [
            { title: tr.cardBest, value: bestFit.name, sub: `Error (SSE): ${!isNaN(bestFit.error) ? bestFit.error.toFixed(5) : "N/A"}` },
            { title: tr.cardFitParams, value: "See Details", sub: bestFit.pStr }
        ];

        if (bestFit.percentage !== null) {
            const multiProbTitle = (limitType === 'upper' ? `${tr.cardEst} > ${limit}` : `${tr.cardEst} < ${limit}`);
            multiCards.push({ title: multiProbTitle, value: (bestFit.percentage * 100).toFixed(4) + "%", sub: `Using ${bestFit.name} CDF` });
        }

        renderCards(multiCards);

        const tbody = document.querySelector('#multiDistTable tbody');
        const thead = document.querySelector('#multiDistTable thead tr');
        // Update table header to include AD and P-Value
        thead.innerHTML = `
                <th>${tr.thDist || 'Distribution'}</th>
                <th>${tr.thParams || 'Parameters'}</th>
                <th>${tr.thError || 'Error (SSE)'}</th>
                <th>${tr.thAdStat || 'AD Stat'}</th>
                <th>${tr.thPValue || 'P-Value'}</th>
                <th>${!isNaN(limit) ? (limitType === 'upper' ? `${tr.thEstPercent} > ${limit}` : `${tr.thEstPercent} < ${limit}`) : `${tr.thEstPercent} (N/A)`}</th>
                <th>${tr.thConclusion || 'Conclusion'}</th>
            `;

        tbody.innerHTML = '';

        // Calculate all fits manually
        const mean = getMean(data);
        const std = getStd(data, mean);
        const sortedData = [...data].sort((a, b) => a - b);
        const n = sortedData.length;

        const allFits = [];

        // Normal distribution
        const normalFit = {
            name: 'Normal',
            pdf: (x) => normalPDF(x, mean, std),
            cdf: (x) => normalCDF(x, mean, std),
            pStr: `\u03BC=${mean.toFixed(2)}, \u03C3=${std.toFixed(2)}`,
            color: colors['Normal'] || theme.dangercolor
        };
        allFits.push(normalFit);

        // Only add other distributions if all data is positive
        if (data.every(x => x > 0)) {
            // Lognormal
            const logData = data.map(x => Math.log(x));
            const meanLog = getMean(logData), stdLog = getStd(logData, meanLog);
            if (stdLog > 0) {
                allFits.push({
                    name: 'Lognormal',
                    pdf: (x) => lognormPDF(x, meanLog, stdLog),
                    cdf: (x) => lognormCDF(x, meanLog, stdLog),
                    pStr: `Log-\u03BC=${meanLog.toFixed(2)}, Log-\u03C3=${stdLog.toFixed(2)}`,
                    color: colors['Lognormal'] || theme.successcolor
                });
            }

            // Exponential
            if (mean > 0) {
                allFits.push({
                    name: 'Exponential',
                    pdf: (x) => exponPDF(x, 1 / mean),
                    cdf: (x) => exponCDF(x, 1 / mean),
                    pStr: `\u03BB=${(1 / mean).toFixed(4)}`,
                    color: colors['Exponential'] || theme.theme_primary
                });
            }

            // Weibull
            const k_weibull = (std / mean) ** (-1.086);
            const lambda_weibull = mean / Math.exp(logGamma(1 + 1 / k_weibull));
            if (k_weibull > 0 && lambda_weibull > 0) {
                allFits.push({
                    name: 'Weibull',
                    pdf: (x) => weibullPDF(x, k_weibull, lambda_weibull),
                    cdf: (x) => weibullCDF(x, k_weibull, lambda_weibull),
                    pStr: `k=${k_weibull.toFixed(2)}, \u03BB=${lambda_weibull.toFixed(2)}`,
                    color: colors['Weibull'] || theme.warningcolor
                });
            }
        }

        // Calculate error for each fit
        allFits.forEach(f => {
            let error = 0;
            const step = Math.max(1, Math.floor(n / 20));
            for (let i = 0; i < n; i += step) {
                error += ((i + 0.5) / n - f.cdf(sortedData[i])) ** 2;
            }
            f.error = error;
            f.percentage = !isNaN(limit)
                ? ((limitType === 'upper') ? (1 - f.cdf(limit)) : f.cdf(limit))
                : null;

            // Calculate Anderson-Darling Statistic and P-Value
            const adStat = this.calculateAD(data, f.cdf);
            f.ad = adStat;
            f.pValue = this.calculateADPValue(adStat, n, f.name);
        });

        // Sort by error (best fit first)
        allFits.sort((a, b) => a.error - b.error);

        // Populate table
        allFits.forEach((fit, index) => {
            const row = tbody.insertRow();
            if (fit.name === bestFit.name) row.classList.add('best-fit-row');

            const pValStr = fit.pValue !== null ? fit.pValue.toFixed(4) : "N/A";
            const pMsg = fit.pValue !== null
                ? (fit.pValue < 0.05 ? `<span class="conclusion-reject">${tr.lblReject || 'Reject (<0.05)'}</span>` : `<span class="conclusion-retain">${tr.lblGoodFit || 'Good Fit'}</span>`)
                : "N/A";

            const percStr = fit.percentage !== null ? (fit.percentage * 100).toFixed(4) + "%" : "N/A";

            row.innerHTML = `
                    <td>${fit.name}</td>
                    <td>${fit.pStr}</td>
                    <td>${fit.error.toFixed(5)}</td>
                    <td>${fit.ad.toFixed(4)}</td>
                    <td>${pValStr}</td>
                    <td>${percStr}</td>
                    <td>${pMsg}</td>
                `;
        });

        document.getElementById('stats-container').classList.remove('hidden');
        document.getElementById('analysis-chart-container').classList.remove('hidden');
        document.getElementById('multi-table-container').classList.remove('hidden');

        this.plotMultiDistribution(data, limit, allFits.slice(0, 4));
    },

    findBestFit: function (data) {
        const mean = getMean(data);
        const std = getStd(data, mean);
        const sortedData = [...data].sort((a, b) => a - b);
        const n = sortedData.length;

        const fits = [];
        fits.push({ name: 'Normal', pdf: (x) => normalPDF(x, mean, std), cdf: (x) => normalCDF(x, mean, std), params: { mean, std }, pStr: `\u03BC=${mean.toFixed(2)}, \u03C3=${std.toFixed(2)}` });

        if (data.every(x => x > 0)) {
            const logData = data.map(x => Math.log(x));
            const meanLog = getMean(logData), stdLog = getStd(logData, meanLog);
            if (stdLog > 0) fits.push({ name: 'Lognormal', pdf: (x) => lognormPDF(x, meanLog, stdLog), cdf: (x) => lognormCDF(x, meanLog, stdLog), params: { mu: meanLog, sigma: stdLog }, pStr: `Log-\u03BC=${meanLog.toFixed(2)}, Log-\u03C3=${stdLog.toFixed(2)}` });

            if (mean > 0) fits.push({ name: 'Exponential', pdf: (x) => exponPDF(x, 1 / mean), cdf: (x) => exponCDF(x, 1 / mean), params: { lambda: 1 / mean }, pStr: `\u03BB=${(1 / mean).toFixed(4)}` });

            const k_weibull = (std / mean) ** (-1.086);
            const lambda_weibull = mean / Math.exp(logGamma(1 + 1 / k_weibull));
            if (k_weibull > 0 && lambda_weibull > 0) fits.push({ name: 'Weibull', pdf: (x) => weibullPDF(x, k_weibull, lambda_weibull), cdf: (x) => weibullCDF(x, k_weibull, lambda_weibull), params: { k: k_weibull, lambda: lambda_weibull }, pStr: `k=${k_weibull.toFixed(2)}, \u03BB=${lambda_weibull.toFixed(2)}` });
        }

        fits.forEach(f => {
            let error = 0;
            const step = Math.max(1, Math.floor(n / 20));
            for (let i = 0; i < n; i += step) {
                error += ((i + 0.5) / n - f.cdf(sortedData[i])) ** 2;
            }
            f.error = error;
        });

        const validFits = fits.filter(f => !isNaN(f.error)).sort((a, b) => a.error - b.error);
        return validFits.length > 0 ? validFits[0] : fits[0];
    },

    calculateAD: function (data, cdfFunc) {
        const n = data.length;
        const sorted = [...data].sort((a, b) => a - b);
        let s = 0;
        for (let i = 0; i < n; i++) {
            const val = sorted[i];
            const F = Math.max(1e-9, Math.min(1 - 1e-9, cdfFunc(val)));
            const F_inv = Math.max(1e-9, Math.min(1 - 1e-9, cdfFunc(sorted[n - 1 - i])));

            s += (2 * (i + 1) - 1) * (Math.log(F) + Math.log(1 - F_inv));
        }
        return -n - (1 / n) * s;
    },

    calculateADPValue: function (A2, n, distName) {
        let A = A2;
        let p = null;

        if (distName === 'Normal' || distName === 'Lognormal') {
            A = A2 * (1 + 0.75 / n + 2.25 / (n * n));
            if (A < 0.2) p = 1 - Math.exp(-13.436 + 101.14 * A - 223.73 * A * A);
            else if (A < 0.34) p = 1 - Math.exp(-8.318 + 42.796 * A - 59.938 * A * A);
            else if (A < 0.6) p = Math.exp(0.9177 - 4.279 * A - 1.38 * A * A);
            else p = Math.exp(1.2937 - 5.709 * A + 0.0186 * A * A);
        } else if (distName === 'Weibull') {
            A = A2 * (1 + 0.2 / Math.sqrt(n));
            if (A > 1.03) p = 0.01;
            else if (A >= 0.757) p = 0.05 + (0.01 - 0.05) / (1.03 - 0.757) * (A - 0.757);
            else if (A >= 0.637) p = 0.10 + (0.05 - 0.10) / (0.757 - 0.637) * (A - 0.637);
            else if (A >= 0.474) p = 0.25 + (0.10 - 0.25) / (0.637 - 0.474) * (A - 0.474);
            else p = 0.5;
        } else if (distName === 'Exponential') {
            A = A2 * (1 + 0.6 / n);
            if (A > 1.321) p = 0.01;
            else if (A >= 1.078) p = 0.05 + (0.01 - 0.05) / (1.321 - 1.078) * (A - 1.078);
            else if (A >= 0.961) p = 0.10 + (0.05 - 0.10) / (1.078 - 0.961) * (A - 0.961);
            else if (A >= 0.786) p = 0.25 + (0.10 - 0.25) / (0.961 - 0.786) * (A - 0.786);
            else p = 0.5;
        }
        return p !== null ? Math.max(0, Math.min(1, p)) : null;
    },

    plotMultiDistribution: function (data, limit, fits) {
        const tr = translations[currentLang] || translations.en;
        const minVal = getMin(data), maxVal = getMax(data);
        const range = maxVal - minVal, buffer = (range === 0) ? 1 : range * 0.2;

        const xVals = Array.from({ length: 201 }, (_, i) => (minVal - buffer) + (i / 200) * (range + 2 * buffer));
        const theme = getChartTheme(document.body.getAttribute('data-theme'));

        const xRange = getRangeWithPadding(data);
        const traces = [{
            x: data, type: 'histogram', name: 'Data', histnorm: 'probability density',
            marker: { color: theme.theme_primary, opacity: 0.4 }
        }];

        fits.forEach(fit => {
            traces.push({
                x: xVals, y: xVals.map(x => fit.pdf(x)), type: 'scatter', mode: 'lines', name: `${fit.name} Fit`,
                line: { color: fit.color, width: 3 },
            });
        });

        const shapes = !isNaN(limit) ? [{ type: 'line', x0: limit, x1: limit, y0: 0, y1: 1, yref: 'paper', line: { color: theme.font.color, width: 2, dash: 'dash' } }] : [];

        const title = (typeof currentMode !== 'undefined' && currentMode === 'normal')
            ? `${tr.distNormal} Probability Plot: ${typeof selectedColumnName !== 'undefined' ? selectedColumnName : ''}`
            : `${tr.lblDistComp}: ${typeof selectedColumnName !== 'undefined' ? selectedColumnName : ''}`;

        const titleEl = document.getElementById('mainChartTitle');
        if (titleEl) titleEl.textContent = title;

        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('mainChart', traces, {
                title: "", xaxis: { title: tr.lblValue || 'Value', gridcolor: theme.gridcolor, range: xRange || undefined }, yaxis: { title: tr.lblDensity || 'Density', gridcolor: theme.gridcolor },
                showlegend: true, shapes: shapes, font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 50, r: 20, l: 50, b: 50 }, legend: { orientation: 'h', y: -0.2 }
            }, { responsive: true });
            setTimeout(() => Plotly.Plots.resize('mainChart'), 50);

            const cdf = getCdfSeries(data);
            const cdfTrace = {
                x: cdf.x,
                y: cdf.y,
                type: 'scatter',
                mode: 'lines',
                line: { color: theme.theme_primary, width: 2 },
                name: tr.lblCdfChart || 'Cumulative Histogram (CDF)'
            };
            Plotly.newPlot('mainCdfChart', [cdfTrace], {
                title: "",
                xaxis: { title: 'Value', gridcolor: theme.gridcolor, range: xRange || undefined },
                yaxis: { title: (tr.lblCdfAxis || 'Cumulative Probability'), gridcolor: theme.gridcolor, rangemode: 'tozero' },
                font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 40, r: 20, l: 50, b: 50 }
            }, { responsive: true });
            setTimeout(() => Plotly.Plots.resize('mainCdfChart'), 50);
        }
    }
};

// Global Exposure
window.analyzeNormal = (data, limit, limitType) => Distribution.analyzeNormal(data, limit, limitType);
window.analyzeTolerance = (data) => Distribution.analyzeTolerance(data);
window.analyzeMulti = (data, limit, limitType) => Distribution.analyzeMulti(data, limit, limitType);
window.findBestFit = (data) => Distribution.findBestFit(data);
window.calculateAD = (data, cdfFunc) => Distribution.calculateAD(data, cdfFunc);
window.calculateADPValue = (A2, n, distName) => Distribution.calculateADPValue(A2, n, distName);
