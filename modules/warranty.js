/**
 * Warranty Prediction Module
 * Handles Monte Carlo simulations for failure risk prediction.
 */
const WarrantyPrediction = {
    getLognormal: function (mu, sigma) {
        return Math.exp(mu + sigma * randn_bm());
    },
    getWeibull: function (shape, scale) {
        return scale * Math.pow(-Math.log(1 - Math.random()), 1 / shape);
    },
    run: function () {
        const shape = parseFloat(document.getElementById('warranty-weibull-shape').value);
        const scale = parseFloat(document.getElementById('warranty-weibull-scale').value);
        const mu = parseFloat(document.getElementById('warranty-lognormal-mu').value);
        const sigma = parseFloat(document.getElementById('warranty-lognormal-sigma').value);
        const snapshotYear = parseInt(document.getElementById('warranty-snapshot-year').value);

        if (isNaN(shape) || isNaN(scale) || isNaN(mu) || isNaN(sigma) || isNaN(snapshotYear)) {
            alert(translations[currentLang].errWarrantyInputs || "Please provide valid inputs.");
            return;
        }

        const iterations = 1000000;
        let failuresAtSnapshot = 0;

        // Simulação para o Ano de Referência (KPIs e Histograma)
        let loads = new Float32Array(50000);
        let limits = new Float32Array(50000);

        // Run full simulation for precise failures count
        for (let i = 0; i < iterations; i++) {
            const loadVal = this.getLognormal(mu, sigma) * snapshotYear;
            const limitVal = this.getWeibull(shape, scale);
            if (loadVal > limitVal) failuresAtSnapshot++;
            // Store only a subset for charting
            if (i < 50000) {
                loads[i] = loadVal;
                limits[i] = limitVal;
            }
        }

        // Show results and hide welcome message
        document.getElementById('welcome-msg').classList.add('hidden');
        document.getElementById('warranty-view').classList.remove('hidden');

        const probSnapshot = (failuresAtSnapshot / iterations) * 100;
        const probSnapshotPpm = (probSnapshot / 100) * 1e6;
        const elFailures = document.getElementById('warranty-val-failures');
        if (elFailures) elFailures.textContent = failuresAtSnapshot.toLocaleString();

        const elProb = document.getElementById('warranty-val-prob');
        if (elProb) elProb.textContent = `${probSnapshot.toFixed(2)}%`;

        const elProbPpm = document.getElementById('warranty-val-prob-ppm');
        if (elProbPpm) elProbPpm.textContent = Math.round(probSnapshotPpm).toLocaleString();

        const elYear = document.getElementById('warranty-val-snapshot-year-display');
        if (elYear) elYear.textContent = snapshotYear;

        // Simulação da Linha de Tendência (Anos 1 a 5)
        let trendYears = [1, 2, 3, 4, 5];
        let trendProbs = [];

        trendYears.forEach(year => {
            let yearlyFailures = 0;
            const trendIter = 1000000; // Increased to 1M per user request
            for (let i = 0; i < trendIter; i++) {
                if (this.getLognormal(mu, sigma) * year > this.getWeibull(shape, scale)) {
                    yearlyFailures++;
                }
            }
            trendProbs.push((yearlyFailures / trendIter) * 100);
        });

        this.renderTrendChart(trendYears, trendProbs);
        this.renderOverlapChart(mu, sigma, shape, scale, snapshotYear);
    },

    renderTrendChart: function (years, probs) {
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const trace = {
            x: years,
            y: probs,
            type: 'scatter',
            mode: 'lines+markers',
            name: translations[currentLang].lblEstimatedRisk,
            line: { color: theme.theme_primary, width: 3 },
            marker: { size: 8 }
        };

        const layout = {
            xaxis: {
                title: translations[currentLang].lblYear,
                gridcolor: theme.gridcolor,
                zerolinecolor: theme.gridcolor,
                dtick: 1
            },
            yaxis: {
                title: translations[currentLang].lblRiskProb,
                gridcolor: theme.gridcolor,
                zerolinecolor: theme.gridcolor
            },
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: { family: 'Bosch Sans, sans-serif', size: 12, color: theme.font.color },
            margin: { t: 40, r: 40, l: 60, b: 60 },
            hovermode: 'closest'
        };

        Plotly.newPlot('warrantyTrendChart', [trace], layout, { responsive: true, displayModeBar: false });
    },

    renderOverlapChart: function (mu, sigma, shape, scale, year) {
        const theme = getChartTheme(document.body.getAttribute('data-theme'));

        // Generate points for PDF curves
        const meanLoad = Math.exp(mu + (sigma * sigma) / 2) * year;
        const sdLoad = Math.sqrt((Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma)) * year;

        const meanLimit = scale * jStat.gammafn(1 + 1 / shape);
        const maxRange = Math.max(meanLoad + 4 * sdLoad, scale * 1.5);

        const xValues = [];
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            xValues.push((maxRange / steps) * i);
        }

        const muScaled = mu + Math.log(year);
        const yLoad = xValues.map(x => (x === 0) ? 0 : jStat.lognormal.pdf(x, muScaled, sigma));
        const yLimit = xValues.map(x => jStat.weibull.pdf(x, scale, shape));

        const traceLoad = {
            x: xValues,
            y: yLoad,
            type: 'scatter',
            mode: 'lines',
            name: translations[currentLang].lblLognormalScaled,
            fill: 'tozeroy',
            line: { color: '#007bc0', width: 2 }, // Bosch Blue
            fillcolor: 'rgba(0, 123, 192, 0.2)'
        };

        const traceLimit = {
            x: xValues,
            y: yLimit,
            type: 'scatter',
            mode: 'lines',
            name: translations[currentLang].lblWeibullThreshold,
            fill: 'tozeroy',
            line: { color: '#ed0007', width: 2 }, // Bosch Red
            fillcolor: 'rgba(237, 0, 7, 0.2)'
        };

        const layout = {
            xaxis: {
                title: translations[currentLang].lblValue,
                gridcolor: theme.gridcolor,
                zerolinecolor: theme.gridcolor
            },
            yaxis: {
                title: translations[currentLang].lblDensity,
                gridcolor: theme.gridcolor,
                zerolinecolor: theme.gridcolor,
                showticklabels: false
            },
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            font: { family: 'Bosch Sans, sans-serif', size: 12, color: theme.font.color },
            margin: { t: 40, r: 40, l: 60, b: 60 },
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };

        Plotly.newPlot('warrantyOverlapChart', [traceLoad, traceLimit], layout, { responsive: true, displayModeBar: false });
    }
};

// Global Exposure
window.runWarrantyPrediction = () => WarrantyPrediction.run();
