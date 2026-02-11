/**
 * Hypothesis Testing Module
 */

const Hypothesis = {
    updateTestType: function () {
        const testType = document.getElementById('hypoTestType').value;
        const grpMu = document.getElementById('grp-hypo-mu');
        const factorSelect = document.getElementById('hypoFactorCol').parentElement;
        const responseSelect = document.getElementById('hypoResponseCol').parentElement;
        const sample1Select = document.getElementById('grp-hypo-sample1');
        const sample2Select = document.getElementById('grp-hypo-sample2');
        const equalVarGrp = document.getElementById('grp-equal-variances');

        if (testType === 'ttest1') {
            grpMu.style.display = 'block';
            responseSelect.style.display = 'block';
            factorSelect.style.display = 'none';
            sample1Select.classList.add('hidden');
            sample2Select.classList.add('hidden');
            equalVarGrp.style.display = 'none';
        } else if (testType === 'ttest2') {
            grpMu.style.display = 'none';
            responseSelect.style.display = 'none';
            factorSelect.style.display = 'none';
            sample1Select.classList.remove('hidden');
            sample2Select.classList.remove('hidden');
            equalVarGrp.style.display = 'block';
        } else if (testType === 'paired') {
            grpMu.style.display = 'none';
            responseSelect.style.display = 'none';
            factorSelect.style.display = 'none';
            sample1Select.classList.remove('hidden');
            sample2Select.classList.remove('hidden');
            equalVarGrp.style.display = 'none';
        } else if (testType === 'ftest') {
            grpMu.style.display = 'none';
            responseSelect.style.display = 'none';
            factorSelect.style.display = 'none';
            sample1Select.classList.remove('hidden');
            sample2Select.classList.remove('hidden');
            equalVarGrp.style.display = 'none';
        } else { // ANOVA
            grpMu.style.display = 'none';
            responseSelect.style.display = 'block';
            factorSelect.style.display = 'block';
            sample1Select.classList.add('hidden');
            sample2Select.classList.add('hidden');
            equalVarGrp.style.display = 'none';
        }
    },

    analyze: function () {
        const responseCol = document.getElementById('hypoResponseCol').value;
        const factorCol = document.getElementById('hypoFactorCol').value;
        const sample1Col = document.getElementById('hypoSample1Col').value;
        const sample2Col = document.getElementById('hypoSample2Col').value;
        const testType = document.getElementById('hypoTestType').value;
        const muTarget = parseFloat(document.getElementById('hypoMu').value);

        // Clear previous results
        const summaryTable = document.getElementById('hypothesisSummaryTable');
        const groupsTable = document.getElementById('hypothesisGroupsTable').querySelector('tbody');
        if (summaryTable) summaryTable.innerHTML = '';
        if (groupsTable) groupsTable.innerHTML = '';

        if (typeof Plotly !== 'undefined') Plotly.purge('hypothesisChart');

        let results;
        let groups = {};

        try {
            if (testType === 'ttest1') {
                if (!responseCol) { showError(translations[currentLang].errSelectResponse); return; }
                const responseData = dataset[responseCol];
                if (isNaN(muTarget)) throw new Error(translations[currentLang].errTargetMean);
                results = this.runOneSampleTTest(responseData, muTarget);
                results.groupNames = ["All Data"];
                groups["All Data"] = responseData;

            } else if (testType === 'ttest2') {
                if (!sample1Col || !sample2Col) throw new Error("Please select two distinct columns for the 2-sample t-test.");
                if (sample1Col === sample2Col) throw new Error("Please select two distinct columns for the 2-sample t-test.");
                const g1 = dataset[sample1Col];
                const g2 = dataset[sample2Col];
                const equalVars = document.getElementById('hypoEqualVariances').checked;
                results = this.runTTest(g1, g2, equalVars);
                results.groupNames = [sample1Col, sample2Col];
                groups[sample1Col] = g1;
                groups[sample2Col] = g2;

            } else if (testType === 'paired') {
                if (!sample1Col || !sample2Col) throw new Error("Please select two distinct columns for the paired t-test.");
                if (sample1Col === sample2Col) throw new Error("Please select two distinct columns for the paired t-test.");
                const g1 = dataset[sample1Col];
                const g2 = dataset[sample2Col];
                results = this.runPairedTTest(g1, g2);
                results.groupNames = [sample1Col, sample2Col];
                groups[sample1Col] = g1;
                groups[sample2Col] = g2;

            } else if (testType === 'ftest') {
                if (!sample1Col || !sample2Col) throw new Error("Please select two distinct columns for the F-test.");
                if (sample1Col === sample2Col) throw new Error("Please select two distinct columns for the F-test.");
                const g1 = dataset[sample1Col];
                const g2 = dataset[sample2Col];
                results = this.runFTest(g1, g2);
                results.groupNames = [sample1Col, sample2Col];
                groups[sample1Col] = g1;
                groups[sample2Col] = g2;

            } else { // ANOVA
                if (!responseCol) { showError(translations[currentLang].errSelectResponse); return; }
                const responseData = dataset[responseCol];
                if (!factorCol) throw new Error(translations[currentLang].errFactorCol);

                const factorData = rawDataset[factorCol];
                // Group data
                for (let i = 0; i < responseData.length; i++) {
                    const factor = factorData[i];
                    if (factor === undefined || factor.trim() === '') continue;
                    if (!groups[factor]) groups[factor] = [];
                    groups[factor].push(responseData[i]);
                }
                const groupKeys = Object.keys(groups);

                if (testType === 'anova') {
                    if (groupKeys.length < 3) throw new Error(translations[currentLang].errThreeGroups);
                    const groupArrays = groupKeys.map(key => groups[key]);
                    results = this.runAnova(groupArrays);
                    results.groupNames = groupKeys;
                }
            }

            this.renderResults(results);
            this.plotChart(groups);

        } catch (e) {
            showError(e.message);
        }
    },

    runOneSampleTTest: function (data, mu) {
        const n = data.length;
        if (n < 2) throw new Error(translations[currentLang].errMinData);

        const mean = getMean(data);
        const std = getStd(data, mean);
        const stdErr = std / Math.sqrt(n);
        const t = (mean - mu) / stdErr;
        const df = n - 1;

        const pValue = 2 * (1 - tCdf(Math.abs(t), df));
        const alpha = parseFloat(document.getElementById('hypoAlpha').value);
        const t_crit = inverseTCdf(1 - alpha / 2, df);
        const ci_lower = mean - t_crit * stdErr;
        const ci_upper = mean + t_crit * stdErr;

        return {
            testName: translations[currentLang].optTTest1 || "1-Sample t-test",
            t, df, pValue,
            ci: [ci_lower, ci_upper],
            groups: [data],
            mu: mu
        };
    },

    runTTest: function (g1, g2, equalVariances) {
        const n1 = g1.length, n2 = g2.length;
        if (n1 < 2 || n2 < 2) throw new Error(translations[currentLang].errMinDataGroups);

        const mean1 = getMean(g1), mean2 = getMean(g2);
        const var1 = getStd(g1, mean1) ** 2, var2 = getStd(g2, mean2) ** 2;

        let t, df, stdErr;
        if (equalVariances) {
            const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
            stdErr = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
            t = (mean1 - mean2) / stdErr;
            df = n1 + n2 - 2;
        } else {
            stdErr = Math.sqrt(var1 / n1 + var2 / n2);
            t = (mean1 - mean2) / stdErr;
            df = (var1 / n1 + var2 / n2) ** 2 / (((var1 / n1) ** 2 / (n1 - 1)) + ((var2 / n2) ** 2 / (n2 - 1)));
        }

        const pValue = 2 * (1 - tCdf(Math.abs(t), df));
        const alpha = parseFloat(document.getElementById('hypoAlpha').value);
        const t_crit = inverseTCdf(1 - alpha / 2, df);
        const ci_lower = (mean1 - mean2) - t_crit * stdErr;
        const ci_upper = (mean1 - mean2) + t_crit * stdErr;

        return { testName: translations[currentLang].optTTest2 || "2-Sample t-test", t, df, pValue, ci: [ci_lower, ci_upper], groups: [g1, g2] };
    },

    runPairedTTest: function (g1, g2) {
        const n1 = g1.length, n2 = g2.length;
        if (n1 < 2 || n2 < 2) throw new Error(translations[currentLang].errMinDataGroups);
        if (n1 !== n2) throw new Error(translations[currentLang].errPairedLength);

        const diffs = g1.map((v, i) => v - g2[i]).filter(v => v !== null && v !== undefined && !isNaN(v));
        const n = diffs.length;
        if (n < 2) throw new Error(translations[currentLang].errMinData);

        const meanDiff = getMean(diffs);
        const stdDiff = getStd(diffs, meanDiff);
        const stdErr = stdDiff / Math.sqrt(n);
        const df = n - 1;

        let t;
        if (stdErr === 0) {
            t = meanDiff === 0 ? 0 : (meanDiff > 0 ? Infinity : -Infinity);
        } else {
            t = meanDiff / stdErr;
        }
        const pValue = stdErr === 0 ? (meanDiff === 0 ? 1 : 0) : 2 * (1 - tCdf(Math.abs(t), df));

        const alpha = parseFloat(document.getElementById('hypoAlpha').value);
        const t_crit = inverseTCdf(1 - alpha / 2, df);
        const ci_lower = meanDiff - t_crit * stdErr;
        const ci_upper = meanDiff + t_crit * stdErr;

        return {
            testName: translations[currentLang].optPairedTTest || "Paired t-test",
            t, df, pValue,
            ci: [ci_lower, ci_upper],
            groups: [g1, g2]
        };
    },

    runFTest: function (g1, g2) {
        const n1 = g1.length, n2 = g2.length;
        if (n1 < 2 || n2 < 2) throw new Error(translations[currentLang].errFTestMinData || translations[currentLang].errMinDataGroups);

        const mean1 = getMean(g1), mean2 = getMean(g2);
        const var1 = getStd(g1, mean1) ** 2;
        const var2 = getStd(g2, mean2) ** 2;
        if (var1 === 0 || var2 === 0) {
            throw new Error(translations[currentLang].errFTestZeroVar || "F-test requires non-zero variance in both groups.");
        }

        const F = var1 / var2;
        const df1 = n1 - 1;
        const df2 = n2 - 1;
        const pLower = fCdf(F, df1, df2);
        const pUpper = 1 - pLower;
        const pValue = Math.min(1, 2 * Math.min(pLower, pUpper));

        return {
            testName: translations[currentLang].optFTest || "F-test (Equal Variances)",
            F,
            df_between: df1,
            df_within: df2,
            pValue,
            groups: [g1, g2]
        };
    },

    runAnova: function (groups) {
        const k = groups.length;
        if (k < 3) throw new Error(translations[currentLang].errThreeGroups);

        const allData = [].concat(...groups);
        const N = allData.length;
        const overallMean = getMean(allData);

        let ssb = 0;
        const groupMeans = groups.map(g => getMean(g));
        for (let i = 0; i < k; i++) {
            ssb += groups[i].length * (groupMeans[i] - overallMean) ** 2;
        }
        const df_between = k - 1;
        const msb = ssb / df_between;

        let ssw = 0;
        for (let i = 0; i < k; i++) {
            const mean = groupMeans[i];
            ssw += groups[i].map(val => (val - mean) ** 2).reduce((a, b) => a + b, 0);
        }
        const df_within = N - k;
        const msw = ssw / df_within;

        const F = msb / msw;
        const pValue = 1 - fCdf(F, df_between, df_within);

        return { testName: translations[currentLang].testAnova, F, df_between, df_within, pValue, groups };
    },

    renderResults: function (results) {
        const alpha = parseFloat(document.getElementById('hypoAlpha').value);
        const tr = translations[currentLang];
        const conclusion = results.pValue < alpha ? `<span class="conclusion-reject">${tr.conclusionReject}</span>` : `<span class="conclusion-retain">${tr.conclusionRetain}</span>`;

        const summaryTable = document.getElementById('hypothesisSummaryTable');
        let summaryHTML = `<thead><tr>
                <th>${tr.thHypoTest}</th>
                <th>${results.t ? 't-value' : 'F-value'}</th>
                <th>${tr.thHypoDf}</th>
                <th>${tr.thHypoPval}</th>`;
        if (results.ci) summaryHTML += `<th>${tr.thHypoCI.replace('95', (1 - alpha) * 100)}</th>`;
        summaryHTML += `<th>${tr.thHypoConclusion.replace('0.05', alpha)}</th></tr></thead><tbody><tr>`;

        summaryHTML += `<td>${results.testName}</td>`;
        summaryHTML += `<td>${(results.t ?? results.F).toFixed(4)}</td>`;
        if (results.df) summaryHTML += `<td>${results.df.toFixed(2)}</td>`;
        else summaryHTML += `<td>${results.df_between}, ${results.df_within}</td>`;
        summaryHTML += `<td>${results.pValue < 0.0001 ? '<0.0001' : results.pValue.toFixed(4)}</td>`;
        if (results.ci) summaryHTML += `<td>[${results.ci[0].toFixed(3)}; ${results.ci[1].toFixed(3)}]</td>`;
        summaryHTML += `<td>${conclusion}</td>`;
        summaryHTML += `</tr></tbody>`;
        summaryTable.innerHTML = summaryHTML;

        const groupsTableBody = document.getElementById('hypothesisGroupsTable').querySelector('tbody');
        groupsTableBody.innerHTML = '';

        const groupsTableHead = document.getElementById('hypothesisGroupsTable').querySelector('thead tr');
        groupsTableHead.innerHTML = `
                    <th>${tr.thHypoGrp}</th>
                    <th>${tr.thHypoN}</th>
                    <th>${tr.thHypoMean}</th>
                    ${results.mu !== undefined ? `<th>${tr.thHypoTargetMean}</th>` : ''}
                    <th>${tr.thHypoStdDev}</th>
                `;

        results.groups.forEach((g, i) => {
            const mean = getMean(g);
            const std = getStd(g, mean);
            const row = groupsTableBody.insertRow();
            let html = `<td>${results.groupNames[i]}</td><td>${g.length}</td><td>${mean.toFixed(3)}</td>`;
            if (results.mu !== undefined) html += `<td>${results.mu}</td>`;
            html += `<td>${std.toFixed(3)}</td>`;
            row.innerHTML = html;
        });

        document.getElementById('hypothesis-summary-wrapper').classList.remove('hidden');
        document.getElementById('hypothesis-groups-wrapper').classList.remove('hidden');
        document.getElementById('hypothesis-chart-container').classList.remove('hidden');
    },

    plotChart: function (groups) {
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const traces = [];
        Object.keys(groups).forEach(key => {
            traces.push({
                y: groups[key],
                type: 'box',
                name: key,
                boxpoints: 'all',
                jitter: 0.3,
                pointpos: -1.8
            });
        });

        const layout = {
            title: 'Group Comparison',
            yaxis: { title: 'Value', zeroline: false, gridcolor: theme.gridcolor },
            xaxis: { gridcolor: theme.gridcolor },
            font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
            margin: { t: 50, r: 20, l: 50, b: 50 },
            showlegend: false
        };
        Plotly.newPlot('hypothesisChart', traces, layout, { responsive: true });
        setTimeout(() => Plotly.Plots.resize('hypothesisChart'), 50);
    }
};

// Global exposures
window.updateHypothesisTestType = () => Hypothesis.updateTestType();
window.analyzeHypothesis = () => Hypothesis.analyze();
