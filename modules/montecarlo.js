/**
 * Monte Carlo Simulation Module
 */

const MonteCarlo = {
    updateInputs: function () {
        const dist = document.getElementById('mc-dist').value;
        document.getElementById('mc-params-normal').classList.toggle('hidden', dist !== 'normal');
        document.getElementById('mc-params-lognormal').classList.toggle('hidden', dist !== 'lognormal');
        document.getElementById('mc-params-weibull').classList.toggle('hidden', dist !== 'weibull');
    },

    generate: function (redrawOnly = false) {
        const dist = document.getElementById('mc-dist').value;
        const n = parseInt(document.getElementById('mc-n').value) || 1000;
        let label = "";

        if (!redrawOnly) {
            mcData = [];
            if (dist === 'normal') {
                const mu = parseFloat(document.getElementById('mc-norm-mean').value);
                const sigma = parseFloat(document.getElementById('mc-norm-std').value);
                for (let i = 0; i < n; i++) mcData.push(mu + sigma * randn_bm());
                label = `Normal (μ=${mu}, σ=${sigma})`;
            }
            else if (dist === 'lognormal') {
                const mu = parseFloat(document.getElementById('mc-log-mu').value);
                const sigma = parseFloat(document.getElementById('mc-log-sigma').value);
                for (let i = 0; i < n; i++) mcData.push(Math.exp(mu + sigma * randn_bm()));
                label = `Lognormal (Loc=${mu}, Scale=${sigma})`;
            }
            else if (dist === 'weibull') {
                const k = parseFloat(document.getElementById('mc-weib-k').value);
                const lambda = parseFloat(document.getElementById('mc-weib-lambda').value);
                for (let i = 0; i < n; i++) {
                    const u = Math.random();
                    mcData.push(lambda * Math.pow(-Math.log(1 - u), 1 / k));
                }
                label = `Weibull (Shape=${k}, Scale=${lambda})`;
            }
        } else {
            label = translations[currentLang].msgSimulated;
        }

        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const mcTitleEl = document.querySelector('#montecarlo-view .panel-title');
        if (mcTitleEl) mcTitleEl.textContent = `${translations[currentLang].msgSimulated}: ${label}`;

        // Hide welcome message to show results (and button)
        document.getElementById('welcome-msg').classList.add('hidden');
        document.getElementById('montecarlo-view').classList.remove('hidden');

        document.getElementById('mc-results-container').classList.remove('hidden');

        const mcRange = getRangeWithPadding(mcData);
        Plotly.newPlot('mcChart', [{
            x: mcData, type: 'histogram',
            marker: { color: theme.dangercolor, opacity: 0.7 }
        }], {
            title: "",
            xaxis: { title: "Value", gridcolor: theme.gridcolor, range: mcRange || undefined },
            yaxis: { title: "Count", gridcolor: theme.gridcolor },
            font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
        }, { responsive: true });

        const mcCdf = getCdfSeries(mcData);
        const mcCdfTrace = {
            x: mcCdf.x,
            y: mcCdf.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: theme.dangercolor, width: 2 },
            name: translations[currentLang].lblCdfChart || 'Cumulative Histogram (CDF)'
        };
        Plotly.newPlot('mcCdfChart', [mcCdfTrace], {
            title: "",
            xaxis: { title: "Value", gridcolor: theme.gridcolor, range: mcRange || undefined },
            yaxis: { title: (translations[currentLang].lblCdfAxis || "Cumulative Probability"), gridcolor: theme.gridcolor, rangemode: 'tozero' },
            font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
            margin: { t: 40, r: 20, l: 50, b: 50 }
        }, { responsive: true });

        setTimeout(() => Plotly.Plots.resize('mcChart'), 50);
        setTimeout(() => Plotly.Plots.resize('mcCdfChart'), 50);

        document.getElementById('mc-msg').textContent = `${n} ${translations[currentLang].msgGenerated}`;
    },

    transferData: function () {
        if (mcData.length === 0) {
            document.getElementById('mc-msg').textContent = translations[currentLang].msgClickGen;
            return;
        }

        const dist = document.getElementById('mc-dist').value;
        const header = `Simulated_${dist}`;
        const csvRows = [header, ...mcData];
        const csvString = csvRows.join('\n');

        document.getElementById('textInput').value = csvString;
        parseAndLoadData();

        document.getElementById('mc-msg').textContent = translations[currentLang].msgDataLoaded;
    },

    copyData: function () {
        if (!mcData || mcData.length === 0) {
            document.getElementById('mc-msg').textContent = translations[currentLang].msgClickGen;
            return;
        }

        const dist = document.getElementById('mc-dist').value;
        const header = `Simulated_${dist}`;
        const csvRows = [header, ...mcData];
        const textToCopy = csvRows.join('\n');

        navigator.clipboard.writeText(textToCopy).then(() => {
            document.getElementById('mc-msg').textContent = translations[currentLang].msgCopied;
        }).catch(err => {
            console.error('Failed to copy: ', err);
            document.getElementById('mc-msg').textContent = "Error copying.";
        });
    }
};

// Global exposures
window.updateMontecarloInputs = () => MonteCarlo.updateInputs();
window.generateMontecarlo = (redrawOnly) => MonteCarlo.generate(redrawOnly);
window.transferMontecarloData = () => MonteCarlo.transferData();
window.copyMontecarloData = () => MonteCarlo.copyData();
