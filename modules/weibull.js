/**
 * Weibull Analysis Module (2-Param)
 */

const Weibull = {
    currentModel: null,

    analyze: function () {
        try {
            const failureCol = document.getElementById('weibull-failure-col').value;
            if (!failureCol) { showError("Please select a failure data column."); return; }

            const censorCol = document.getElementById('weibull-censor-col').value;
            const censorVal = document.getElementById('weibull-censor-val').value;
            const decimals = document.getElementById('decimalSep').value;

            const failureRaw = rawDataset[failureCol] || [];
            const censorRaw = censorCol ? (rawDataset[censorCol] || []) : [];

            const data = failureRaw.map((raw, i) => {
                let valStr = String(raw ?? "").trim();
                if (decimals === ',') valStr = valStr.replace(',', '.');
                const time = parseFloat(valStr);

                const isCensored = (() => {
                    if (!censorCol || !censorVal) return false;
                    return String(censorRaw[i] ?? "").trim().toLowerCase() === censorVal.trim().toLowerCase();
                })();

                return { time, isCensored };
            }).filter(d => typeof d.time === 'number' && d.time > 0 && !isNaN(d.time));

            if (data.filter(d => !d.isCensored).length < 2) { showError("Need at least 2 failure points for analysis."); return; }

            const method = document.getElementById('weibull-method').value;
            const confLevel = parseFloat(document.getElementById('weibull-conf-level').value) || 95;
            const results = (method === 'mle') ? this.runMle(data, confLevel) : this.runWlsxy(data, confLevel);
            if (!results) { showError("Could not compute Weibull parameters."); return; }

            this.currentModel = { type: 'weibull', method, ...results };
            this.updateUI(this.currentModel);
        } catch (e) {
            console.error("Weibull analysis failed:", e);
            showError(`An error occurred during analysis: ${e.message}`);
        }
    },

    resetUI: function () {
        this.currentModel = null;

        const method = document.getElementById('weibull-method');
        if (method) method.value = 'lsxy';

        const failureSel = document.getElementById('weibull-failure-col');
        if (failureSel && failureSel.options.length > 0) failureSel.selectedIndex = 0;

        const censorSel = document.getElementById('weibull-censor-col');
        if (censorSel && censorSel.options.length > 0) censorSel.selectedIndex = 0;

        const censorVal = document.getElementById('weibull-censor-val');
        if (censorVal) censorVal.value = '';

        const cards = document.getElementById('weibull-summary-cards');
        if (cards) cards.innerHTML = '';

        const gofBody = document.querySelector('#weibull-gof-table tbody');
        if (gofBody) gofBody.innerHTML = '';

        const pctBody = document.querySelector('#weibull-percentiles-table tbody');
        if (pctBody) pctBody.innerHTML = '';

        const chart = document.getElementById('weibullChart');
        if (chart && typeof Plotly !== 'undefined') Plotly.purge('weibullChart');
    },

    updateUI: function (model) {
        document.getElementById('welcome-msg').classList.add('hidden');
        document.getElementById('weibull-view').classList.remove('hidden');

        const tr = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : (typeof translations !== 'undefined' ? translations.en : {});
        const betaLabel = tr.lblBeta || "Beta (β)";
        const etaLabel = tr.lblEta || "Characteristic Life (Eta)";

        document.getElementById('weibull-summary-cards').innerHTML = `
            <div class="card"><div class="card-title">${betaLabel}</div><div class="card-value">${model.beta.toFixed(3)}</div></div>
            <div class="card"><div class="card-title">${etaLabel}</div><div class="card-value">${model.eta.toFixed(3)}</div></div>`;

        const gofBody = document.querySelector('#weibull-gof-table tbody');
        const pValueStr = model.gof.pValue < 0.01 ? "< 0.010" : (model.gof.pValue > 0.25 ? "> 0.250" : model.gof.pValue.toFixed(3));
        gofBody.innerHTML = `
            <tr><td>Correlation (R²)</td><td>${model.gof.corr.toFixed(4)}</td></tr>
            <tr><td>Anderson-Darling (adj)</td><td>${model.gof.ad.toFixed(3)}</td></tr>
            <tr><td>p-value</td><td>${pValueStr}</td></tr>`;

        document.querySelector('#weibull-percentiles-table tbody').innerHTML = model.percentiles.map(p => `
            <tr>
                <td>${p.percent}%</td>
                <td>${p.time.toPrecision(4)}</td>
                <td>${p.lower ? p.lower.toPrecision(4) : '-'}</td>
                <td>${p.upper ? p.upper.toPrecision(4) : '-'}</td>
            </tr>`).join('');

        this.plotChart(model);
    },

    calculateCorrelation: function (x_array, y_array, weights = null) {
        if (x_array.length !== y_array.length || x_array.length === 0) return 0;
        const n = x_array.length;
        if (!weights) weights = Array(n).fill(1);
        const sum_w = weights.reduce((s, w) => s + w, 0);
        if (sum_w === 0) return 0;
        const mean_x = weights.reduce((s, w, i) => s + w * x_array[i], 0) / sum_w;
        const mean_y = weights.reduce((s, w, i) => s + w * y_array[i], 0) / sum_w;
        let cov = 0, var_x = 0, var_y = 0;
        for (let i = 0; i < n; i++) {
            cov += weights[i] * (x_array[i] - mean_x) * (y_array[i] - mean_y);
            var_x += weights[i] * Math.pow(x_array[i] - mean_x, 2);
            var_y += weights[i] * Math.pow(y_array[i] - mean_y, 2);
        }
        if (var_x === 0 || var_y === 0) return 1;
        return cov / Math.sqrt(var_x * var_y);
    },

    calculateMedianRankPlotPoints: function (data) {
        const sorted = [...data].sort((a, b) => {
            if (a.time !== b.time) return a.time - b.time;
            if (a.isCensored === b.isCensored) return 0;
            return a.isCensored ? 1 : -1;
        });

        const n = sorted.length;
        const plotPoints = [];
        let adjustedRank = 0;
        let countBefore = 0;

        let idx = 0;
        while (idx < sorted.length) {
            const t = sorted[idx].time;
            let groupCount = 0;
            let failureCount = 0;
            while (idx + groupCount < sorted.length && sorted[idx + groupCount].time === t) {
                if (!sorted[idx + groupCount].isCensored) failureCount++;
                groupCount++;
            }

            if (failureCount > 0) {
                const remaining = n - countBefore;
                const increment = ((n + 1) - adjustedRank) / (1 + remaining);
                for (let j = 0; j < failureCount; j++) {
                    adjustedRank += increment;
                    let p = (adjustedRank - 0.3) / (n + 0.4);
                    p = Math.min(Math.max(p, 1e-6), 1 - 1e-6);
                    plotPoints.push({
                        time: t,
                        x: Math.log(t),
                        y: Math.log(-Math.log(1 - p)),
                        prob: p
                    });
                }
            }

            countBefore += groupCount;
            idx += groupCount;
        }

        return plotPoints;
    },

    calculateKaplanMeierPlotPoints: function (data) {
        const uniqueFailureTimes = [...new Set(data.filter(d => !d.isCensored).map(d => d.time))].sort((a, b) => a - b);
        let survival = 1.0;
        const plotPoints = [];

        for (const t of uniqueFailureTimes) {
            const atRisk = data.filter(d => d.time >= t).length;
            const failures = data.filter(d => d.time === t && !d.isCensored).length;
            if (atRisk > 0 && failures > 0) {
                const survivalTerm = (atRisk - failures) / atRisk;
                survival *= survivalTerm;
                let p = 1 - survival;
                p = Math.min(Math.max(p, 1e-6), 1 - 1e-6);
                plotPoints.push({
                    time: t,
                    x: Math.log(t),
                    y: Math.log(-Math.log(1 - p)),
                    prob: p
                });
            }
        }

        return plotPoints;
    },

    runWlsxy: function (data, confLevel = 95) {
        const plotData = this.calculateMedianRankPlotPoints(data);
        if (plotData.length < 2) return null;
        const x = plotData.map(p => p.x);
        const y = plotData.map(p => p.y);

        let sum_x = 0, sum_y = 0, sum_xy = 0, sum_yy = 0;
        for (let i = 0; i < plotData.length; i++) {
            sum_x += x[i];
            sum_y += y[i];
            sum_xy += x[i] * y[i];
            sum_yy += y[i] * y[i];
        }
        const n = plotData.length;
        const b_denominator = n * sum_yy - Math.pow(sum_y, 2);
        if (b_denominator === 0) return null;
        const b_xy = (n * sum_xy - sum_x * sum_y) / b_denominator;
        const a_xy = (sum_x / n) - b_xy * (sum_y / n);

        if (b_xy <= 0 || !isFinite(b_xy)) return null;
        const beta = 1 / b_xy;
        const eta = Math.exp(a_xy);

        // --- Confidence Bounds Calculation (LSXY) ---
        let bounds = null;
        let lsxyParams = null;
        if (n > 2) {
            const mean_y = sum_y / n;
            const S_yy = sum_yy - (sum_y * sum_y) / n;
            let sse = 0;
            for(let i=0; i<n; i++) {
                const x_pred = a_xy + b_xy * y[i];
                sse += Math.pow(x[i] - x_pred, 2);
            }
            const syx = Math.sqrt(sse / (n - 2));
            bounds = this.calculateLsxyBounds(a_xy, b_xy, syx, mean_y, S_yy, n, confLevel);
            lsxyParams = { a_xy, b_xy, syx, mean_y, S_yy, n };
        }
        // --------------------------------------------

        const gof = {
            ...this.calculateGoodnessOfFit(data, beta, eta, 'lsxy', plotData),
            corr: Math.pow(this.calculateCorrelation(x, y), 2)
        };
        const percentiles = this.calculatePercentiles(beta, eta, 'lsxy', lsxyParams);
        return { beta, eta, plotData, gof, percentiles, bounds, confLevel };
    },

    runMle: function (data, confLevel = 95) {
        const failures = data.filter(d => !d.isCensored);
        const initialGuess = this.runWlsxy(data);
        let beta = initialGuess ? initialGuess.beta : 1;
        for (let iter = 0; iter < 50; iter++) {
            let sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0;
            data.forEach(d => {
                const tb = Math.pow(d.time, beta), logt = Math.log(d.time);
                sum1 += tb; sum2 += tb * logt; sum3 += tb * logt * logt;
            });
            failures.forEach(f => sum4 += Math.log(f.time));
            const g = failures.length / beta + sum4 - failures.length * sum2 / sum1;
            const g_prime = -failures.length / (beta * beta) - failures.length * (sum1 * sum3 - sum2 * sum2) / (sum1 * sum1);
            const beta_new = beta - g / g_prime;
            if (Math.abs(beta_new - beta) < 1e-7 || !isFinite(beta_new)) {
                beta = isFinite(beta_new) ? beta_new : beta; break;
            }
            beta = beta_new;
        }
        const eta = Math.pow(data.reduce((s, d) => s + Math.pow(d.time, beta), 0) / failures.length, 1 / beta);
        
        // Calculate Confidence Bounds (Fisher Matrix)
        const bounds = this.calculateMleBounds(data, beta, eta, confLevel);

        const plotData = this.calculateKaplanMeierPlotPoints(data);
        const corr = this.calculatePlotCorrelation(plotData);
        const gof = {
            ...this.calculateGoodnessOfFit(data, beta, eta, 'mle', plotData),
            corr: corr
        };
        const percentiles = this.calculatePercentiles(beta, eta, 'mle', { data });
        return { beta, eta, plotData, gof, percentiles, bounds, confLevel };
    },

    calculateMleBounds: function(data, beta, eta, confLevel) {
        // Fisher Information Matrix & Delta Method for 95% Confidence Bounds
        const r = data.filter(d => !d.isCensored).length;
        
        // Hessian Elements (Observed Information)
        let sum_z_lnz_sq = 0;
        let sum_z_lnz = 0;
        
        data.forEach(d => {
            const z = Math.pow(d.time / eta, beta);
            const ln_t_eta = Math.log(d.time / eta);
            sum_z_lnz_sq += z * (ln_t_eta * ln_t_eta);
            sum_z_lnz += z * ln_t_eta;
        });

        // Elements of Observed Fisher Information Matrix (I = -Hessian)
        const i11 = (r / (beta * beta)) + sum_z_lnz_sq; // d2L/dbeta2
        const i22 = (r * beta * beta) / (eta * eta);    // d2L/deta2
        const i12 = (beta / eta) * sum_z_lnz;           // d2L/dbetadeta

        // Inverse Matrix (Covariance)
        const det = i11 * i22 - i12 * i12;
        const var_beta = i22 / det;
        const var_eta = i11 / det;
        const cov_beta_eta = -i12 / det;

        // Generate bounds lines
        const bounds = { lower: [], upper: [] };
        // Range of probabilities for the plot lines
        const probs = [0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99];

        let z_crit = 1.96;
        if (typeof jStat !== 'undefined') {
            const alpha = 1 - (confLevel / 100);
            z_crit = jStat.normal.inv(1 - alpha / 2, 0, 1);
        }
        
        probs.forEach(p => {
            const w = Math.log(-Math.log(1 - p));
            const xb = Math.log(eta) + (w / beta); // ln(time)
            // Variance of ln(time) via Delta Method
            const var_xb = (1/(eta**2))*var_eta + (w**2 / beta**4)*var_beta - (2*w / (eta * beta**2))*cov_beta_eta;
            const se = Math.sqrt(var_xb);
            bounds.lower.push({ p, time: Math.exp(xb - z_crit * se) });
            bounds.upper.push({ p, time: Math.exp(xb + z_crit * se) });
        });
        return bounds;
    },

    calculateLsxyBounds: function(a_xy, b_xy, syx, mean_y, S_yy, n, confLevel) {
        const bounds = { lower: [], upper: [] };
        // Range of probabilities for the plot lines
        const probs = [0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98, 0.99];
        
        let t_crit = 1.96;
        if (typeof jStat !== 'undefined') {
            const alpha = 1 - (confLevel / 100);
            t_crit = jStat.studentt.inv(1 - alpha / 2, n - 2);
        }

        probs.forEach(p => {
            const y0 = Math.log(-Math.log(1 - p));
            const x_hat = a_xy + b_xy * y0;
            
            // Confidence Interval for the Mean Response (Regression Line)
            // SE = syx * sqrt(1/n + (y0 - mean_y)^2 / S_yy)
            const term = (1/n) + (Math.pow(y0 - mean_y, 2) / S_yy);
            const se = syx * Math.sqrt(term);
            
            const x_lower = x_hat - t_crit * se;
            const x_upper = x_hat + t_crit * se;
            
            bounds.lower.push({ p, time: Math.exp(x_lower) });
            bounds.upper.push({ p, time: Math.exp(x_upper) });
        });
        
        return bounds;
    },

    calculateGoodnessOfFit: function (data, beta, eta, method, plotData) {
        const failures = data.filter(d => !d.isCensored).sort((a, b) => a.time - b.time);
        const n = failures.length;
        if (n < 2) return { ad: 0, pValue: 1 };

        let probs;
        if (method === 'lsxy') {
            probs = failures.map(f => 1 - Math.exp(-Math.pow(f.time / eta, beta)));
        } else {
            probs = (plotData && plotData.length >= 2)
                ? plotData.map(p => p.prob)
                : failures.map(f => 1 - Math.exp(-Math.pow(f.time / eta, beta)));
        }

        const sortedProbs = probs.map(p => Math.min(Math.max(p, 1e-9), 1 - 1e-9)).sort((a, b) => a - b);
        let sum = 0;
        for (let i = 0; i < sortedProbs.length; i++) {
            const Fi = sortedProbs[i];
            const F_rev = sortedProbs[sortedProbs.length - 1 - i];
            sum += (2 * (i + 1) - 1) * (Math.log(Fi) + Math.log(1 - F_rev));
        }
        const A2 = -sortedProbs.length - sum / sortedProbs.length;
        const nAdj = sortedProbs.length;

        // Use global calculateADPValue from distribution.js if available
        const pValue = (typeof calculateADPValue === 'function')
            ? calculateADPValue(A2, nAdj, 'Weibull')
            : null;

        return { ad: A2 * (1 + 0.2 / Math.sqrt(nAdj)), pValue };
    },

    calculatePlotCorrelation: function (plotData) {
        if (!plotData || plotData.length < 2) return 0;
        const r = this.calculateCorrelation(plotData.map(p => p.x), plotData.map(p => p.y));
        return r * r;
    },

    calculatePercentiles: function (beta, eta, method = null, params = null) {
        const percents = [1, 5, 10, 50, 90, 95, 99];
        
        let mleCov = null;
        if (method === 'mle' && params && params.data) {
            mleCov = this.getMleCovariance(params.data, beta, eta);
        }

        let t_crit = 1.96;
        if (method === 'lsxy' && params && params.n > 2 && typeof jStat !== 'undefined') {
            t_crit = jStat.studentt.inv(0.975, params.n - 2);
        }

        return percents.map(p => {
            const prob = p / 100;
            const time = eta * Math.pow(-Math.log(1 - prob), 1 / beta);
            let lower = null, upper = null;

            if (method === 'lsxy' && params && params.n > 2) {
                const y0 = Math.log(-Math.log(1 - prob));
                const x_hat = params.a_xy + params.b_xy * y0;
                const term = (1/params.n) + (Math.pow(y0 - params.mean_y, 2) / params.S_yy);
                const se = params.syx * Math.sqrt(term);
                lower = Math.exp(x_hat - t_crit * se);
                upper = Math.exp(x_hat + t_crit * se);
            } else if (method === 'mle' && mleCov) {
                const w = Math.log(-Math.log(1 - prob));
                const xb = Math.log(eta) + (w / beta);
                const var_xb = (1/(eta**2))*mleCov.var_eta + (w**2 / beta**4)*mleCov.var_beta - (2*w / (eta * beta**2))*mleCov.cov_beta_eta;
                if (var_xb >= 0) {
                    const se = Math.sqrt(var_xb);
                    lower = Math.exp(xb - 1.96 * se);
                    upper = Math.exp(xb + 1.96 * se);
                }
            }

            return { percent: p, time, lower, upper };
        });
    },

    getMleCovariance: function(data, beta, eta) {
        const r = data.filter(d => !d.isCensored).length;
        let sum_z_lnz_sq = 0;
        let sum_z_lnz = 0;
        
        data.forEach(d => {
            const z = Math.pow(d.time / eta, beta);
            const ln_t_eta = Math.log(d.time / eta);
            sum_z_lnz_sq += z * (ln_t_eta * ln_t_eta);
            sum_z_lnz += z * ln_t_eta;
        });

        const i11 = (r / (beta * beta)) + sum_z_lnz_sq;
        const i22 = (r * beta * beta) / (eta * eta);
        const i12 = (beta / eta) * sum_z_lnz;

        const det = i11 * i22 - i12 * i12;
        if (det === 0) return null;
        return {
            var_beta: i22 / det,
            var_eta: i11 / det,
            cov_beta_eta: -i12 / det
        };
    },

    plotChart: function (model) {
        const { plotData, beta, eta } = model;
        const showConf = document.getElementById('weibull-show-conf').checked;

        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const probToY = p => Math.log(-Math.log(1 - p));
        const fitLine = (() => {
            if (plotData.length < 2) return [];
            const intercept = Math.log(eta);
            const x_min = Math.min(...plotData.map(p => p.x)), x_max = Math.max(...plotData.map(p => p.x));
            const y_min = (x_min - intercept) * beta;
            const y_max = (x_max - intercept) * beta;
            return [{ x: x_min, y: y_min }, { x: x_max, y: y_max }];
        })();
        const tr = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : (typeof translations !== 'undefined' ? translations.en : {});
        const timeLabel = tr.lblTime || 'Time';
        const probLabel = tr.lblWeibullProbAxis || 'Probability of Failure';
        const dataTrace = {
            x: plotData.map(p => p.time), y: plotData.map(p => p.y),
            mode: 'markers', type: 'scatter', marker: { color: theme.theme_primary },
            customdata: plotData.map(p => p.prob),
            hovertemplate: `<b>${timeLabel}</b>: %{x}<br><b>${probLabel}</b>: %{customdata:.2%}<extra></extra>`
        };
        const lineTrace = {
            x: fitLine.map(p => Math.exp(p.x)), y: fitLine.map(p => p.y),
            mode: 'lines', type: 'scatter', line: { color: theme.dangercolor, width: 2 },
            hoverinfo: 'skip'
        };

        const traces = [dataTrace, lineTrace];

        if (showConf && model.bounds) {
            const cl = model.confLevel || 95;
            const lowerTrace = {
                x: model.bounds.lower.map(b => b.time),
                y: model.bounds.lower.map(b => probToY(b.p)),
                mode: 'lines', type: 'scatter', line: { color: theme.theme_primary, width: 1, dash: 'dash' },
                hoverinfo: 'skip', name: `Lower ${cl}%`
            };
            const upperTrace = {
                x: model.bounds.upper.map(b => b.time),
                y: model.bounds.upper.map(b => probToY(b.p)),
                mode: 'lines', type: 'scatter', line: { color: theme.theme_primary, width: 1, dash: 'dash' },
                hoverinfo: 'skip', name: `Upper ${cl}%`
            };
            traces.push(lowerTrace, upperTrace);
        }

        const layout = {
            title: '', font: theme.font,
            paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
            xaxis: { title: timeLabel, type: 'log', gridcolor: theme.gridcolor },
            yaxis: {
                title: probLabel, gridcolor: theme.gridcolor,
                tickmode: 'array',
                tickvals: [0.01, 0.1, 0.5, 0.9, 0.99].map(probToY),
                ticktext: ['1%', '10%', '50%', '90%', '99%']
            },
            showlegend: false,
            margin: { t: 5, r: 20, l: 50, b: 50 },
            annotations: [{
                xref: 'paper', yref: 'paper', x: 0.05, y: 0.95, xanchor: 'left', yanchor: 'top',
                text: `β = ${beta.toFixed(3)}<br>η = ${eta.toFixed(3)}`, showarrow: false
            }]
        };
        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('weibullChart', traces, layout, { responsive: true });
        }
    }
};

// Global Exposure
window.analyzeWeibull = () => Weibull.analyze();
window.resetWeibullUI = () => Weibull.resetUI();
window.weibullCurrentModel = Weibull.currentModel; // Initial reference (warning: stale if reassigned)
window.hasWeibullModel = () => !!Weibull.currentModel;
window.replotWeibull = () => { if (Weibull.currentModel) Weibull.updateUI(Weibull.currentModel); };

// Add listener for checkbox to update chart immediately
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('weibull-show-conf')?.addEventListener('change', () => window.replotWeibull());
    document.getElementById('weibull-conf-level')?.addEventListener('change', () => window.analyzeWeibull());
});
