/**
 * MSA (Measurement System Analysis) Module
 * Handles Gage R&R (ANOVA and X-bar/R methods) and variation component analysis.
 */

window.analyzeMsa = function () {
    const measCol = document.getElementById('msaMeasurementCol').value;
    const partCol = document.getElementById('msaPartCol').value;
    const opCol = document.getElementById('msaOperatorCol').value;
    const method = document.getElementById('msaMethod').value;
    const tolerance = parseFloat(document.getElementById('msaTolerance').value);
    const sigmaMul = parseFloat(document.getElementById('msaSigmaMul').value) || 6.0;

    if (!measCol || !partCol || !opCol) {
        showError(translations[currentLang].errMsaSelect);
        return;
    }

    if (partCol === opCol) {
        showError(translations[currentLang].errMsaSameCol);
        return;
    }

    // Extract Data
    const Y = dataset[measCol];
    const P = rawDataset[partCol].map(v => String(v)); // Ensure strings
    const O = rawDataset[opCol].map(v => String(v));

    if (Y.length !== P.length || Y.length !== O.length) {
        showError(translations[currentLang].errMsaLength);
        return;
    }

    // Group Data Structure
    // Map: Part -> Operator -> [Measurements]
    const structure = {};
    const parts = [...new Set(P)];
    const operators = [...new Set(O)];

    const nParts = parts.length;
    const nOps = operators.length;
    let totalN = Y.length;

    if (nParts < 2 || nOps < 2) {
        showError(translations[currentLang].errMsaData);
        return;
    }

    P.forEach((p, i) => {
        if (!structure[p]) structure[p] = {};
        if (!structure[p][O[i]]) structure[p][O[i]] = [];
        structure[p][O[i]].push(Y[i]);
    });

    // Check replicates (assuming balanced for standard ANOVA for now)
    // If unbalanced, we'll try to use average replicate count or simple Method
    // Using full ANOVA formulas based on sums

    // 1. Calculate Sums
    let sumY = 0;
    let sumYsq = 0;

    const sumP = {}; // Sum per Part
    const sumO = {}; // Sum per Op
    const sumPO = {}; // Sum per Interaction (Cell)

    // Calc n (replicates)
    const nRep = totalN / (nParts * nOps);

    // Fix: MSA Robustness Check
    if (!Number.isInteger(nRep)) {
        showError(`Warning: Data is unbalanced (Total rows / (Parts * Operators) = ${nRep.toFixed(2)}). MSA calculations assume balanced data and may be inaccurate.`);
        // Continue but warn
    }

    // Calculation Variables
    let varRep, varOp, varInt, varPart;

    if (method === 'xbar') {
        // --- Average and Range Method ---

        // d2 CONSTANTS TABLE
        // Index is sample size (2 to 20 sufficient for most MSA)
        const d2Table = {
            2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534, 7: 2.704, 8: 2.847, 9: 2.970, 10: 3.078,
            11: 3.173, 12: 3.258, 13: 3.336, 14: 3.407, 15: 3.472, 16: 3.532, 17: 3.588, 18: 3.640, 19: 3.689, 20: 3.735
        };
        const getD2 = (n) => d2Table[Math.round(n)] || (n > 20 ? 3.735 : 1.128); // Fallback

        // 1. Calculate Averages and Ranges
        const partAvgs = {}; // avg per part
        const opAvgs = {};   // avg per op
        const cellRanges = []; // R for each cell

        parts.forEach(p => {
            let pSum = 0;
            let pN = 0;
            operators.forEach(o => {
                const vals = structure[p]?.[o] || [];
                if (vals.length > 0) {
                    const min = Math.min(...vals);
                    const max = Math.max(...vals);
                    cellRanges.push(max - min);

                    const sum = vals.reduce((a, b) => a + b, 0);
                    pSum += sum;
                    pN += vals.length;

                    // Op accumulation
                    if (!opAvgs[o]) opAvgs[o] = { sum: 0, n: 0 };
                    opAvgs[o].sum += sum;
                    opAvgs[o].n += vals.length;
                }
            });
            partAvgs[p] = pN > 0 ? pSum / pN : 0;
        });

        // Finalize Op Avgs
        const opAvgValues = Object.values(opAvgs).map(obj => obj.n > 0 ? obj.sum / obj.n : 0);
        const partAvgValues = Object.values(partAvgs);

        // 2. Compute Statistics
        const R_bar = cellRanges.reduce((a, b) => a + b, 0) / cellRanges.length;
        const X_diff = Math.max(...opAvgValues) - Math.min(...opAvgValues);
        const R_p = Math.max(...partAvgValues) - Math.min(...partAvgValues);

        // 3. Components
        // K1 = 1/d2(nRep), K2 = 1/d2(nOps), K3 = 1/d2(nParts)
        const d2_rep = getD2(nRep);
        const d2_op = getD2(nOps);
        const d2_part = getD2(nParts);

        // Equipment Variation (Repeatability)
        const EV = R_bar / d2_rep;
        varRep = EV * EV;

        // Appraiser Variation (Reproducibility)
        const AV_sq = Math.pow((X_diff / d2_op), 2) - (varRep / (nParts * nRep));
        // Note: Standard Xbar-R assumes No Interaction explicitly derived, 
        // but AV covers operator diffs. Interaction is pooled into Rep if not separable.
        // In classic Xbar-R, Interaction is typically not calculated separately unless using ANOVA.
        // We set Interaction to 0 for strict Xbar-R method.
        varInt = 0;

        let varReprodTemp = Math.max(0, AV_sq); // Determine AV
        varOp = varReprodTemp; // In simple Xbar-R, Reprod = Op Var (AV)

        // Part Variation (PV)
        const PV = R_p / d2_part;
        varPart = PV * PV;

    } else {
        // --- ANOVA Method (Existing) ---

        // 1. Calculate Sums
        let sumY = 0;
        let sumYsq = 0;

        const sumP = {}; // Sum per Part
        const sumO = {}; // Sum per Op
        const sumPO = {}; // Sum per Interaction (Cell)

        for (let i = 0; i < totalN; i++) {
            const val = Y[i];
            const p = P[i];
            const o = O[i];
            const po = `${p}|${o}`;

            sumY += val;
            sumYsq += val * val;

            sumP[p] = (sumP[p] || 0) + val;
            sumO[o] = (sumO[o] || 0) + val;
            sumPO[po] = (sumPO[po] || 0) + val;
        }

        // SST
        const CF = (sumY * sumY) / totalN;
        const SST = sumYsq - CF;

        // SS Part
        let termsP = 0;
        Object.values(sumP).forEach(s => termsP += s * s);
        const SSP = (termsP / (nOps * nRep)) - CF;

        // SS Operator
        let termsO = 0;
        Object.values(sumO).forEach(s => termsO += s * s);
        const SSO = (termsO / (nParts * nRep)) - CF;

        // SS Interaction
        let termsSub = 0;
        Object.values(sumPO).forEach(s => termsSub += s * s);
        const SSSub = (termsSub / nRep) - CF;

        const SSInt = SSSub - SSP - SSO;
        const SSE = SST - SSSub;

        // Degrees of Freedom
        const dfP = nParts - 1;
        const dfO = nOps - 1;
        const dfInt = (nParts - 1) * (nOps - 1);
        const dfErr = nParts * nOps * (nRep - 1);

        // Mean Squares
        const MSP = SSP / dfP;
        const MSO = SSO / dfO;
        const MSInt = SSInt / dfInt;
        const MSE = SSE / dfErr;

        // Variance Components
        varRep = MSE;
        varInt = (MSInt - MSE) / nRep;
        if (varInt < 0) varInt = 0;

        varOp = (MSO - MSInt) / (nParts * nRep);
        if (varOp < 0) varOp = 0;

        varPart = (MSP - MSInt) / (nOps * nRep);
        if (varPart < 0) varPart = 0;
    }

    // Gage R&R
    const varReprod = varOp + varInt;
    const varGRR = varRep + varReprod;
    const varTotal = varGRR + varPart;

    // Metric Calculations function
    const calcMetrics = (v) => {
        const sd = Math.sqrt(v);
        const sv = sd * sigmaMul;
        const pctSV = (sd / Math.sqrt(varTotal)) * 100;
        const pctTol = !isNaN(tolerance) ? (sv / tolerance) * 100 : null;
        return { var: v, sd, sv, pctSV, pctTol };
    };

    const res = {
        total: calcMetrics(varTotal),
        grr: calcMetrics(varGRR),
        repeat: calcMetrics(varRep),
        reprod: calcMetrics(varReprod),
        op: calcMetrics(varOp),
        int: calcMetrics(varInt),
        part: calcMetrics(varPart)
    };

    // NDC
    const ndc = 1.41 * (res.part.sd / res.grr.sd);

    // Render Table
    document.getElementById('msa-results-wrapper').classList.remove('hidden');

    const tbody = document.querySelector('#msaVarCompTable tbody');
    tbody.innerHTML = '';

    const addRow = (name, metrics, isHeader = false) => {
        const tr = document.createElement('tr');
        if (isHeader) tr.style.fontWeight = 'bold';
        const pctCont = (metrics.var / res.total.var) * 100;

        tr.innerHTML = `
                    <td>${name}</td>
                    <td>${metrics.var.toFixed(5)}</td>
                    <td>${pctCont.toFixed(2)}%</td>
                    <td>${metrics.sd.toFixed(5)}</td>
                    <td>${metrics.sv.toFixed(5)}</td>
                    <td>${metrics.pctSV.toFixed(2)}%</td>
                    <td>${metrics.pctTol !== null ? metrics.pctTol.toFixed(2) + '%' : '-'}</td>
                `;
        tbody.appendChild(tr);
    };

    addRow(translations[currentLang].msaTotalGRR, res.grr, true);
    addRow("&nbsp;&nbsp;" + translations[currentLang].msaRepeat, res.repeat);
    addRow("&nbsp;&nbsp;" + translations[currentLang].msaReprod, res.reprod);
    addRow("&nbsp;&nbsp;&nbsp;&nbsp;" + translations[currentLang].msaOperator, res.op);
    addRow("&nbsp;&nbsp;&nbsp;&nbsp;" + translations[currentLang].msaOpPart, res.int);
    addRow(translations[currentLang].msaPartToPart, res.part);
    addRow(translations[currentLang].msaTotalVar, res.total, true);

    document.getElementById('msa-ndc-result').textContent = `${translations[currentLang].msaNDC} = ${Math.floor(ndc)} (${translations[currentLang].lblTruncated})`;

    // Charts
    document.getElementById('msa-chart-container').classList.remove('hidden');
    document.getElementById('msaComponentsChart').classList.remove('hidden');
    document.getElementById('msaInteractionChart').classList.remove('hidden');
    renderMsaCharts(res, structure, parts, operators);
};

function renderMsaCharts(res, structure, parts, operators) {
    const theme = getChartTheme(document.body.getAttribute('data-theme'));

    // 1. Components of Variation (Bar Chart)
    const labels = [translations[currentLang].msaTotalGRR, translations[currentLang].msaRepeat, translations[currentLang].msaReprod, translations[currentLang].msaPartToPart];

    const contrVals = [
        (res.grr.var / res.total.var) * 100,
        (res.repeat.var / res.total.var) * 100,
        (res.reprod.var / res.total.var) * 100,
        (res.part.var / res.total.var) * 100
    ];

    const trace1 = {
        x: labels,
        y: contrVals,
        type: 'bar',
        name: translations[currentLang].msaContrib,
        marker: { color: theme.theme_primary }
    };

    const svVals = [res.grr.pctSV, res.repeat.pctSV, res.reprod.pctSV, res.part.pctSV];
    const trace2 = {
        x: labels,
        y: svVals,
        type: 'bar',
        name: translations[currentLang].msaStudyVar,
        marker: { color: theme.dangercolor }
    };

    const layoutComponents = {
        title: translations[currentLang].msaCompPlot,
        barmode: 'group',
        yaxis: { title: 'Percent %', gridcolor: theme.gridcolor },
        font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor
    };
    Plotly.newPlot('msaComponentsChart', [trace1, trace2], layoutComponents, { responsive: true });

    // 2. Interaction Plot (Operator x Part)
    const tracesInt = [];
    operators.forEach(op => {
        const yVals = [];
        parts.forEach(p => {
            const vals = structure[p][op];
            const mean = vals ? getMean(vals) : null;
            yVals.push(mean);
        });
        tracesInt.push({
            x: parts,
            y: yVals,
            type: 'scatter',
            mode: 'lines+markers',
            name: op
        });
    });

    const layoutInt = {
        title: translations[currentLang].msaInteractPlot,
        xaxis: { title: translations[currentLang].lblPartCol, gridcolor: theme.gridcolor },
        yaxis: { title: 'Average Measurement', gridcolor: theme.gridcolor },
        font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor
    };
    Plotly.newPlot('msaInteractionChart', tracesInt, layoutInt, { responsive: true });
}
