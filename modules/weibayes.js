/**
 * Weibayes (1-Param Weibull) Module
 * Handles reliability calculations based on fixed Beta and test data (failures/suspensions).
 */

const Weibayes = {
    data: [],
    currentEta: null,
    currentBeta: null,
    calculatedEta: null,

    init: function () {
        // Initial update
        this.updateMethodUI();
        // Add Enter Key Listener
        const tInput = document.getElementById('wb-input-time');
        const typeInput = document.getElementById('wb-input-type');

        const handleEnter = (e) => {
            if (e.key === 'Enter') this.addDataPoint();
        };

        if (tInput) tInput.addEventListener('keydown', handleEnter);
        if (typeInput) typeInput.addEventListener('keydown', handleEnter);

        // Add Listener for Method Change
        const methodSelect = document.getElementById('wb-method');
        if (methodSelect) {
            methodSelect.addEventListener('change', () => this.updateMethodUI());
        }

        // Add Listener for Fit Method Change (RR vs MLE)
        const fitMethodSelect = document.getElementById('wb-fit-method');
        if (fitMethodSelect) {
            fitMethodSelect.addEventListener('change', () => this.updateMethodUI());
        }

        const wbCalcTimeInput = document.getElementById('wb-calc-time');
        if (wbCalcTimeInput) {
            wbCalcTimeInput.addEventListener('input', () => this.updateQuickCalc());
        }
    },

    checkDataState: function () {
        const hasData = this.data.length > 0;

        // Toggle Results Visibility
        const cards = document.getElementById('wb-stats-cards');
        const rChart = document.getElementById('wb-rel-chart-container');
        const pChart = document.getElementById('wb-prob-chart-container');
        const mCard = document.getElementById('wb-math-card');
        const tblContainer = document.getElementById('wb-data-table-container');
        const iCard = document.getElementById('wb-interpretation-card');

        if (hasData) {
            if (cards) cards.classList.remove('hidden');
            if (rChart) rChart.classList.remove('hidden');
            if (tblContainer) tblContainer.classList.remove('hidden');

            // Explicitly hide the main "Data Status" message when local data exists
            const welcome = document.getElementById('welcome-msg');
            if (welcome) welcome.classList.add('hidden');

        } else {
            if (cards) cards.classList.add('hidden');
            if (rChart) rChart.classList.add('hidden');
            if (pChart) pChart.classList.add('hidden');
            if (mCard) mCard.classList.add('hidden');
            if (tblContainer) tblContainer.classList.add('hidden');
            if (iCard) iCard.classList.add('hidden');

            // Show welcome message if no data
            const welcome = document.getElementById('welcome-msg');
            if (welcome) welcome.classList.remove('hidden');
        }
    },

    reset: function () {
        this.data = [];
        // Reset Inputs
        const tInput = document.getElementById('wb-input-time');
        if (tInput) tInput.value = '';

        document.getElementById('wb-beta').value = "2.0";
        document.getElementById('wb-confidence').value = "70";
        document.getElementById('wb-target-rel').value = "90";
        document.getElementById('wb-method').value = "manual";

        // Clear Table
        const tbody = document.getElementById('wb-data-tbody');
        if (tbody) tbody.innerHTML = '';

        // Clear Logic State
        this.updateMethodUI(); // Resets method UI to manual
        this.checkDataState(); // Hides results
    },

    updateMethodUI: function () {
        const method = document.getElementById('wb-method').value;
        const fitGroup = document.getElementById('wb-grp-fit-method');
        const betaInput = document.getElementById('wb-beta');

        if (method === 'manual') {
            fitGroup.classList.add('hidden');
            betaInput.disabled = false;
            document.getElementById('wb-prob-chart-container').classList.add('hidden');
            betaInput.style.opacity = '1';
        } else {
            const failures = this.data.filter(d => d.type === 'F').length;
            if (failures < 2) {
                alert("Need at least 2 failures for Regression.");
                document.getElementById('wb-method').value = 'manual';
                return this.updateMethodUI();
            }
            fitGroup.classList.remove('hidden');
            betaInput.disabled = true;
            betaInput.style.opacity = '0.7';
            document.getElementById('wb-prob-chart-container').classList.remove('hidden');
            this.calculateAutoBeta();
        }
        this.calculate();
    },

    addDataPoint: function () {
        const tInput = document.getElementById('wb-input-time');
        const t = parseNumber(tInput.value);
        const type = document.getElementById('wb-input-type').value;

        if (isNaN(t) || t <= 0) {
            alert("Please enter a valid time > 0");
            return;
        }

        this.data.push({ time: t, type: type });
        tInput.value = '';
        tInput.focus();

        this.renderTable();
        this.checkDataState();

        if (document.getElementById('wb-method').value === 'regression') {
            this.calculateAutoBeta();
        }
        this.calculate();
    },

    removeDataPoint: function (index) {
        this.data.splice(index, 1);
        this.renderTable();
        if (document.getElementById('wb-method').value === 'regression') {
            const failures = this.data.filter(d => d.type === 'F').length;
            if (failures < 2) {
                document.getElementById('wb-method').value = 'manual';
                this.updateMethodUI();
            } else {
                this.calculateAutoBeta();
            }
        }
        this.calculate();
        this.checkDataState();
    },

    renderTable: function () {
        const tbody = document.getElementById('wb-data-tbody');
        tbody.innerHTML = '';
        const sorted = [...this.data].sort((a, b) => a.time - b.time);

        sorted.forEach((pt) => {
            const origIdx = this.data.indexOf(pt);
            const color = pt.type === 'F' ? '#d13438' : '#605e5c';
            const row = `<tr>
                        <td style="padding:4px;">${pt.time}</td>
                        <td style="padding:4px; color:${color}; font-weight:bold;">${pt.type}</td>
                        <td style="padding:4px; text-align:right;">
                            <span style="cursor:pointer; color:#a4262c;" onclick="Weibayes.removeDataPoint(${origIdx})">&times;</span>
                        </td>
                     </tr>`;
            tbody.innerHTML += row;
        });
    },

    calculate: function () {
        let beta = parseNumber(document.getElementById('wb-beta').value);
        let conf = parseNumber(document.getElementById('wb-confidence').value) / 100;

        if (isNaN(beta) || this.data.length === 0) {
            document.getElementById('wb-res-eta').innerText = "--";
            return;
        }

        if (conf <= 0 || conf >= 1) conf = 0.70;

        let sumTBeta = 0;
        let failures = 0;
        this.data.forEach(d => {
            sumTBeta += Math.pow(d.time, beta);
            if (d.type === 'F') failures++;
        });

        const df = 2 * failures + 2;
        const chiCrit = getChiSquareCritical(conf, df);
        const etaLB = Math.pow((2 * sumTBeta) / chiCrit, 1 / beta);

        // Bx Life Calculation
        const targetRel = parseFloat(document.getElementById('wb-target-rel').value) || 90;
        const bxProb = (100 - targetRel) / 100;
        const bxLife = etaLB * Math.pow(-Math.log(1 - bxProb), 1 / beta);
        const lblBx = "B" + (100 - targetRel);

        // Nominal Eta (50% confidence or just MLE if available)
        const chiCritNom = getChiSquareCritical(0.5, df);
        const etaNom = Math.pow((2 * sumTBeta) / chiCritNom, 1 / beta);

        this.currentEta = etaLB;
        this.currentBeta = beta;
        this.calculatedEta = etaNom;

        document.getElementById('wb-res-eta').innerText = etaLB.toFixed(2);
        document.getElementById('wb-res-bx-type').innerText = lblBx;
        document.getElementById('wb-res-bx-val').innerText = bxLife.toFixed(1);

        this.updateQuickCalc();

        const method = document.getElementById('wb-method').value;
        const regMethodName = document.getElementById('wb-fit-method').value === 'rr' ? 'Rank Regression' : 'MLE';

        let etaN = etaNom;
        if (method === 'regression' && this.calculatedEta) {
            etaN = this.calculatedEta;
        }

        try {
            this.renderMath({
                method, beta, etaLB, sumTBeta, chiCrit, df, confidence: conf,
                etaNominal: etaN, regMethod: regMethodName
            });
        } catch (e) {
            console.error("MathJax render error:", e);
        }

        console.log('Weibayes: Hiding welcome-msg and showing view');
        const welcome = document.getElementById('welcome-msg');
        const view = document.getElementById('weibayes-view');

        if (welcome) welcome.classList.add('hidden');
        else console.error('Weibayes: welcome-msg element not found');

        if (view) view.classList.remove('hidden');
        else console.error('Weibayes: weibayes-view element not found');

        this.drawReliabilityChart(etaLB, etaN, beta, conf);

        // Add interpretation logic
        const interpretationCard = document.getElementById('wb-interpretation-card');
        const interpretationContent = document.getElementById('wb-interpretation-content');
        if (interpretationCard && interpretationContent) {
            interpretationCard.classList.remove('hidden');
            const confLevel = (conf * 100).toFixed(0);
            const relLevel = targetRel.toFixed(0);
            const timeValue = bxLife.toFixed(1);

            let modeKey = "";
            if (beta < 1) modeKey = "msgBetaEarly";
            else if (beta === 1) modeKey = "msgBetaRandom";
            else if (beta < 2) modeKey = "msgBetaWearOutEarly";
            else if (beta === 2) modeKey = "msgBetaWearOutMod";
            else modeKey = "msgBetaWearOutRapid";

            const modeDesc = translations[currentLang][modeKey] || "wear-out";
            let template = translations[currentLang].msgWbInterpretation || "With {conf}% confidence, we can state that at least {rel}% of the population ({targetLife}) will survive for at least {time} units of time, under a {mode} characteristic (beta = {beta}).";

            const resultText = template
                .replace("{conf}", confLevel)
                .replace("{rel}", relLevel)
                .replace("{targetLife}", lblBx)
                .replace("{time}", timeValue)
                .replace("{mode}", modeDesc)
                .replace("{beta}", beta.toFixed(1));

            interpretationContent.innerText = resultText;
        }
    },

    calculateAutoBeta: function () {
        const fitMethod = document.getElementById('wb-fit-method') ? document.getElementById('wb-fit-method').value : 'rr';
        const failures = this.data.filter(d => d.type === 'F').sort((a, b) => a.time - b.time);
        if (failures.length < 2) return;

        let slope = 2.0;
        let intercept = 0;

        if (fitMethod === 'mle') {
            const allData = this.data;
            const k = failures.length;
            const sumLnFailures = failures.reduce((sum, d) => sum + Math.log(d.time), 0);

            let beta = 1.0;
            if (failures.length > 2) {
                const meanLn = sumLnFailures / k;
                const varLn = failures.reduce((sum, d) => sum + Math.pow(Math.log(d.time) - meanLn, 2), 0) / (k - 1);
                beta = 1.28 / Math.sqrt(varLn);
                if (beta < 0.1) beta = 1.0;
            }

            for (let iter = 0; iter < 20; iter++) {
                let sumT_beta = 0;
                let sumT_beta_lnT = 0;
                let sumT_beta_lnT_sq = 0;

                allData.forEach(d => {
                    const t = d.time;
                    const t_beta = Math.pow(t, beta);
                    const lnT = Math.log(t);
                    sumT_beta += t_beta;
                    sumT_beta_lnT += t_beta * lnT;
                    sumT_beta_lnT_sq += t_beta * lnT * lnT;
                });

                const f = (1 / beta) + (sumLnFailures / k) - (sumT_beta_lnT / sumT_beta);
                const num = (sumT_beta_lnT_sq * sumT_beta) - (sumT_beta_lnT * sumT_beta_lnT);
                const den = sumT_beta * sumT_beta;
                const f_prime = (-1 / (beta * beta)) - (num / den);

                const diff = f / f_prime;
                beta -= diff;

                if (Math.abs(diff) < 0.001) break;
            }

            if (isNaN(beta) || beta <= 0) beta = 1.0;
            slope = beta;

            let sumTB = 0;
            allData.forEach(d => sumTB += Math.pow(d.time, beta));
            const eta = Math.pow(sumTB / k, 1 / beta);
            intercept = -slope * Math.log(eta);

        } else {
            const n = this.data.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, k = failures.length;

            failures.forEach((pt) => {
                const allSorted = [...this.data].sort((a, b) => a.time - b.time);
                let rank = 0;
                for (let m = 0; m < allSorted.length; m++) {
                    if (allSorted[m] === pt) { rank = m + 1; break; }
                }

                const mr = (rank - 0.3) / (n + 0.4);
                const X = Math.log(pt.time);
                const Y = Math.log(-Math.log(1 - mr));

                sumX += X; sumY += Y; sumXY += X * Y; sumXX += X * X;
            });

            slope = (k * sumXY - sumX * sumY) / (k * sumXX - sumX * sumX);
            intercept = (sumY - slope * sumX) / k;
        }

        document.getElementById('wb-beta').value = slope.toFixed(2);
        document.getElementById('welcome-msg').classList.add('hidden');
        document.getElementById('weibayes-view').classList.remove('hidden');
        this.drawProbabilityChart(failures, slope, intercept);
    },

    updateQuickCalc: function () {
        const t = parseNumber(document.getElementById('wb-calc-time').value);
        // Ensure parameters are available
        if (!t || t <= 0 || !this.currentEta || !this.currentBeta) {
            document.getElementById('wb-calc-result').innerText = "--%";
            return;
        }
        const R = Math.exp(- Math.pow(t / this.currentEta, this.currentBeta));
        document.getElementById('wb-calc-result').innerText = (R * 100).toFixed(4) + "%";
    },

    renderMath: function (params) {
        const container = document.getElementById('wb-math-content');
        if (!container) return;

        const sVal = params.sumTBeta.toExponential(4);
        let html = '';

        html += `
                <div class="math-step" style="margin-bottom:12px;">
                    <div style="font-weight:600; margin-bottom:4px; border-bottom:1px solid #eee;">General</div>
                    $$ R(t) = e^{-(t/\\eta)^\\beta} $$
                </div>`;

        if (params.method === 'manual') {
            html += `
                     <div class="math-step">
                        <div style="font-weight:600; margin-bottom:4px;">Weibayes (1-Param)</div>
                        $$ \\beta = ${params.beta.toFixed(2)} \\quad \\text{(Fixed)} $$
                        $$ CL = ${(params.confidence * 100).toFixed(1)}\\% $$
                        $$ S = \\sum t^\\beta = ${sVal} $$
                        $$ \\chi^2_{crit} (df=${params.df}) = ${params.chiCrit.toFixed(3)} $$
                        $$ \\eta_{LB} = \\left( \\frac{2 \\cdot S}{\\chi^2} \right)^{1/\\beta} = \\mathbf{${params.etaLB.toFixed(2)}} $$
                     </div>`;
        } else {
            html += `
                     <div class="math-step">
                        <div style="font-weight:600; margin-bottom:4px;">Regression (${params.regMethod})</div>
                         $$ \\text{Analysis via Linear Regression on Probability Plot} $$
                         $$ X = \\ln(t), \\quad Y = \\ln(-\\ln(1-MR)) $$
                         $$ \\beta \\text{ (Slope)} = ${params.beta.toFixed(3)} $$
                         $$ \\eta \\text{ (Char. Life)} = ${params.etaNominal.toFixed(2)} $$
                         <br>
                         <div style="margin-top:8px; font-style:italic; font-size:11px;">Lower Bound calculated via simplified Chi-Square approximation for this tool:</div>
                         $$ \\eta_{LB} = \\mathbf{${params.etaLB.toFixed(2)}} $$
                     </div>`;
        }

        container.innerHTML = html;
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([container]).catch(err => console.log('MathJax error:', err));
        }
    },

    drawReliabilityChart: function (etaLB, etaNom, beta, confidence) {
        console.log("Weibayes: drawReliabilityChart called with", { etaLB, etaNom, beta, confidence });

        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const times = this.data.map(d => d.time).filter(x => x > 0);

        console.log("Weibayes: Found times", times);
        if (times.length === 0) {
            console.warn("Weibayes: No times found, chart skipped");
            return;
        }

        const minT = Math.min(...times) / 2;
        const maxT = Math.max(...times) * 2;

        const xVals = [];
        const yLB = [];
        const yNom = [];

        const logMin = Math.log10(minT || 1);
        const logMax = Math.log10(maxT || 1000);
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
            const lx = logMin + (i / steps) * (logMax - logMin);
            const x = Math.pow(10, lx);
            xVals.push(x);

            const R_LB = Math.exp(- Math.pow(x / etaLB, beta));
            yLB.push(R_LB);

            if (etaNom) {
                const R_Nom = Math.exp(- Math.pow(x / etaNom, beta));
                yNom.push(R_Nom);
            }
        }

        console.log("Weibayes: Generated points:", xVals.length);

        const traces = [];

        traces.push({
            x: xVals, y: yLB, mode: 'lines',
            name: `LB ${(confidence * 100).toFixed(0)}%`,
            line: { color: theme.theme_primary, width: 3 }
        });

        if (etaNom) {
            traces.push({
                x: xVals, y: yNom, mode: 'lines',
                name: 'Nominal',
                line: { color: theme.font.color, dash: 'dash', width: 2 }
            });
        }

        console.log("Weibayes: Traces created:", traces);

        const layout = {
            margin: { t: 30, r: 20, l: 60, b: 50 },
            xaxis: { type: 'log', title: 'Time (Log Scale)', gridcolor: theme.gridcolor },
            yaxis: { range: [0, 1.05], title: 'Reliability R(t)', gridcolor: theme.gridcolor },
            showlegend: true,
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: theme.font,
            legend: { orientation: 'h', y: -0.2 }
        };

        if (typeof Plotly !== 'undefined') {
            console.log("Weibayes: Calling Plotly.newPlot");
            Plotly.newPlot('wb-reliability-chart', traces, layout, { responsive: true }).then(() => {
                console.log("Weibayes: Plotly promise resolved");
                requestAnimationFrame(() => {
                    Plotly.Plots.resize('wb-reliability-chart');
                    console.log("Weibayes: Plotly resized");
                });
            }).catch(err => console.error("Weibayes: Plotly error", err));
        } else {
            console.error('Weibayes: Plotly is not defined');
        }
    },

    drawProbabilityChart: function (failures, slope, intercept) {
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const xVals = [];
        const yVals = [];
        const texts = [];
        const n = this.data.length;
        const allSorted = [...this.data].sort((a, b) => a.time - b.time);

        failures.forEach(pt => {
            let rank = 0;
            for (let m = 0; m < allSorted.length; m++) { if (allSorted[m] === pt) { rank = m + 1; break; } }
            const mr = (rank - 0.3) / (n + 0.4);
            xVals.push(pt.time);
            const y = Math.log(-Math.log(1 - mr));
            yVals.push(y);
            texts.push(`MR: ${(mr * 100).toFixed(1)}%`);
        });

        const lineX = [Math.min(...xVals), Math.max(...xVals)];
        const lineY = lineX.map(x => slope * Math.log(x) + intercept);

        const tracePts = {
            x: xVals, y: yVals, mode: 'markers', type: 'scatter',
            text: texts,
            marker: { color: 'red', size: 8 },
            name: 'Failures'
        };

        const traceLine = {
            x: lineX, y: lineY, mode: 'lines',
            name: `Fit (beta=${slope.toFixed(2)})`,
            line: { color: 'blue' }
        };

        const probs = [0.01, 0.05, 0.10, 0.20, 0.50, 0.80, 0.90, 0.95, 0.99];
        const tickVals = probs.map(p => Math.log(-Math.log(1 - p)));
        const tickText = probs.map(p => (p * 100) + "%");

        const layout = {
            xaxis: { type: 'log', title: 'Time (t)', gridcolor: theme.gridcolor },
            yaxis: {
                title: 'Unreliability F(t) (%)',
                gridcolor: theme.gridcolor,
                tickvals: tickVals,
                ticktext: tickText,
                range: [Math.min(...yVals, -6), Math.max(...yVals, 2)]
            },
            margin: { t: 20, r: 20, l: 60, b: 40 },
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: theme.font
        };

        Plotly.newPlot('wb-probability-chart', [tracePts, traceLine], layout, { responsive: true });
    }
};

// Global Exposure
window.Weibayes = Weibayes;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (window.Weibayes && typeof window.Weibayes.init === 'function') {
        window.Weibayes.init();
    }
});
