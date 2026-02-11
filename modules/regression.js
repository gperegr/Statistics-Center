/**
 * Regression Analysis Module (Improved)
 */

const Regression = {
    currentModel: null,
    removedOutliersHistory: [],

    analyze: function () {
        this.upgradeDOM(); // Ensure UI is ready

        this.removedOutliersHistory = [];
        document.getElementById('removed-outlier-table-wrapper').classList.add('hidden');
        document.getElementById('outlier-table-wrapper').classList.add('hidden');

        const yCol = document.getElementById('reg-response-col').value;
        const xCheckboxes = document.querySelectorAll('.reg-x-checkbox:checked');
        const linearXCols = Array.from(xCheckboxes).map(cb => cb.value);
        const modelType = document.getElementById('reg-model-type').value;

        const lang = document.documentElement.getAttribute('lang') || 'en';
        const t = (key) => (typeof translations !== 'undefined' && translations[lang]) ? (translations[lang][key] || translations['en'][key]) : key;

        if (!yCol || linearXCols.length === 0) {
            showError(t('msgSelectRegVars'));
            return;
        }
        if (linearXCols.includes(yCol)) {
            showError(t('msgYEqualsX'));
            return;
        }

        const rawData = [];
        const n = dataset[yCol].length;
        for (let i = 0; i < n; i++) {
            const row = { y: dataset[yCol][i], __observationOrder: i };
            let valid = !isNaN(row.y);
            linearXCols.forEach(col => {
                row[col] = dataset[col][i];
                if (typeof row[col] !== 'number' || isNaN(row[col])) valid = false;
            });
            if (valid) rawData.push(row);
        }

        let initialTerms = ['Intercept', ...linearXCols];
        if (modelType === 'quadratic' || modelType === 'quadratic_interaction') {
            linearXCols.forEach(col => initialTerms.push(`${col}*${col}`));
        }
        if (modelType === 'quadratic_interaction') {
            for (let i = 0; i < linearXCols.length; i++) {
                for (let j = i + 1; j < linearXCols.length; j++) {
                    initialTerms.push(`${linearXCols[i]}*${linearXCols[j]}`);
                }
            }
        }

        const model = this.runAnalysis(yCol, linearXCols, initialTerms, rawData);

        if (model) {
            this.currentModel = model;
            const outliersForDisplay = model.outliers;
            model.outliers = [];
            this.updateUI(model);
            model.outliers = outliersForDisplay;
            document.getElementById('btn-check-outliers').disabled = false;
            document.getElementById('btn-remove-terms').disabled = false;
            document.getElementById('btn-remove-outliers').disabled = true;
        }
    },

    upgradeDOM: function () {
        // --- Optimization Section (inserted after prediction section) ---
        if (!document.getElementById('regression-optimization-section')) {
            const predSection = document.getElementById('regression-prediction-section');
            const optSection = document.createElement('div');
            optSection.className = 'results-table-wrapper';
            optSection.id = 'regression-optimization-section';
            optSection.style.marginTop = '32px';
            optSection.innerHTML = `
                <div class="panel-title" style="margin-bottom: 16px; color: #005FB8;">Optimization</div>
                <form id="regression-optimization-form" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;"></form>
                <div id="regression-optimization-result" style="margin-top: 16px; font-size: 1.1em; font-weight: 600;"></div>
            `;
            if (predSection && predSection.parentElement) {
                predSection.parentElement.insertBefore(optSection, predSection.nextSibling);
            }
        }
        const resultsWrapper = document.getElementById('regression-results-wrapper');
        if (!resultsWrapper) return;

        const lang = document.documentElement.getAttribute('lang') || 'en';
        const t = (key) => (typeof translations !== 'undefined' && translations[lang]) ? (translations[lang][key] || translations['en'][key]) : key;

        // Inject new Chart/Table structure if not present
        if (!document.getElementById('regStandardizedEffectsChart')) {
            resultsWrapper.innerHTML = `
                <!-- Removed Outliers Table -->
                <div class="results-table-wrapper hidden" id="removed-outlier-table-wrapper">
                    <div class="panel-title" data-i18n="regRemovedOutliers">${t('regRemovedOutliers')}</div>
                    <table class="results-table" id="removed-outlier-table">
                        <thead><tr></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
                
                <!-- Summary Cards (Preserving ID for existing CSS) -->
                <div class="stats-cards" id="reg-summary-cards"></div>

                <!-- ANOVA Table -->
                <div class="results-table-wrapper">
                    <div class="panel-title" data-i18n="regAnova">${t('regAnova')}</div>
                    <table class="results-table" id="reg-anova-table">
                        <thead>
                            <tr>
                                <th>${t('regSource')}</th> <th>${t('regDf')}</th> <th>${t('regSs')}</th> <th>${t('regMs')}</th> <th>${t('regF')}</th> <th>${t('regPValue')}</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>

                <!-- Coefficients Table -->
                <div class="results-table-wrapper">
                    <div class="panel-title" data-i18n="regCoefficients">${t('regCoefficients')}</div>
                    <table class="results-table" id="reg-coef-table">
                        <thead>
                            <tr>
                                <th>${t('regTerm')}</th> <th>${t('regCoef')}</th> <th>${t('regSeCoef')}</th> <th>${t('regTValue')}</th> <th>${t('regPValue')}</th> <th>${t('regVif')}</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>

                <!-- Current Outliers Table -->
                <div class="results-table-wrapper hidden" id="outlier-table-wrapper">
                    <div class="panel-title" data-i18n="regCurrentOutliers">${t('regCurrentOutliers')}</div>
                    <table class="results-table" id="outlier-table">
                        <thead><tr></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>

                <!-- Equation -->
                <div class="card">
                    <div class="card-title" data-i18n="regEquation">${t('regEquation')}</div>
                    <div id="reg-equation" style="font-family: monospace; font-size: 1.1em; padding: 10px; white-space: pre-wrap; word-break: break-word;"></div>
                </div>

                <!-- Charts -->
                <div class="chart-container">
                    <div class="panel-title" data-i18n="regPlots">${t('regPlots')}</div>
                    <div id="regStandardizedEffectsChart" style="width: 100%; height: 450px; margin-top: 60px;"></div>
                    <div id="regResidualsProbabilityChart" style="width: 100%; height: 450px; margin-top: 60px;"></div>
                    <div id="regResidualsOrderChart" style="width: 100%; height: 450px; margin-top: 60px;"></div>
                    <div id="regContourChart" style="width: 100%; height: 500px; margin-top: 60px;"></div>
                    <div id="regFactorialPlotsContainer" style="width: 100%; display: flex; flex-wrap: wrap; gap: 24px; margin-top: 30px;"></div>
                </div>

                <!-- Prediction Section -->
                <div class="results-table-wrapper" id="regression-prediction-section" style="margin-top: 32px;">
                    <div class="panel-title" style="margin-bottom: 16px; color: #005FB8;">Prediction</div>
                    <form id="regression-prediction-form" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;"></form>
                    <div style="margin-top: 16px; font-size: 1.1em; font-weight: 600;" id="regression-prediction-result"></div>
                </div>
            `;
        } else {
            if (!document.getElementById('regression-prediction-section')) {
                const predSection = document.createElement('div');
                predSection.className = 'results-table-wrapper';
                predSection.id = 'regression-prediction-section';
                predSection.style.marginTop = '32px';
                predSection.innerHTML = `
                    <div class="panel-title" style="margin-bottom: 16px; color: #005FB8;">Prediction</div>
                    <form id="regression-prediction-form" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;"></form>
                    <div style="margin-top: 16px; font-size: 1.1em; font-weight: 600;" id="regression-prediction-result"></div>
                `;
                resultsWrapper.appendChild(predSection);
            }
        }

        // Inject Helper Buttons if missing
        const controlsDiv = document.getElementById('grp-regression-controls');
        if (controlsDiv && !document.getElementById('btn-check-outliers')) {
            const extraButtons = document.createElement('div');
            extraButtons.style.display = 'flex';
            extraButtons.style.flexDirection = 'column';
            extraButtons.style.gap = '8px';
            extraButtons.style.marginTop = '8px';
            extraButtons.innerHTML = `
                <button id="btn-check-outliers" class="bosch-btn-secondary" onclick="checkForOutliers()" disabled data-i18n="btnCheckOutliers">${t('btnCheckOutliers')}</button>
                <button id="btn-remove-outliers" class="bosch-btn-secondary" onclick="removeOutliersAndReanalyze()" disabled data-i18n="btnRemoveOutliers">${t('btnRemoveOutliers')}</button>
                <button id="btn-remove-terms" class="bosch-btn-secondary" onclick="stepwiseTermRemoval()" disabled data-i18n="btnRemoveTerms">${t('btnRemoveTerms')}</button>
            `;
            controlsDiv.appendChild(extraButtons);
        }
    },

    runAnalysis: function (yCol, linearXCols, terms, rawData) {
        const hasIntercept = terms.includes('Intercept');
        const predictorTerms = hasIntercept ? terms.filter(t => t !== 'Intercept') : terms;

        const xMatrixColGetters = predictorTerms.map(term => {
            const factors = term.split('*');
            return r => factors.reduce((prod, factor) => prod * (r[factor] || 1), 1);
        });

        if (rawData.length < terms.length + 1) {
            showError("Insufficient data for the model complexity.");
            return null;
        }

        const Y = rawData.map(r => [r.y]);
        const X = rawData.map(r => {
            const predictors = xMatrixColGetters.map(fn => fn(r));
            return hasIntercept ? [1, ...predictors] : predictors;
        });

        if (X.length === 0 || X[0].length === 0) {
            showError("Model is empty after term removal. Cannot proceed.");
            return null;
        }

        try {
            const Xt = matrixTranspose(X);
            const XtX = matrixMultiply(Xt, X);
            const XtX_inv = matrixInverse(XtX);

            if (XtX_inv.length === 0) {
                throw new Error("Singular matrix: Check for perfect multicollinearity.");
            }

            const XtY = matrixMultiply(Xt, Y);
            const Beta = matrixMultiply(XtX_inv, XtY);
            const nPoints = Y.length;
            const p = terms.length;
            const dfError = nPoints - p;

            if (dfError <= 0) {
                showError("Not enough data points to calculate model statistics (DF Error <= 0).");
                return null;
            }

            const dfTotal = nPoints - 1;
            const dfModel = p - 1;
            const Y_pred = matrixMultiply(X, Beta);
            const Residuals = Y.map((y, i) => y[0] - Y_pred[i][0]);
            const meanY = getMean(Y.map(y => y[0]));
            const SST = Y.reduce((sum, y) => sum + (y[0] - meanY) ** 2, 0);
            const SSE = Residuals.reduce((sum, r) => sum + r ** 2, 0);
            const SSM = SST - SSE;
            const R2 = (SST > 0) ? 1 - (SSE / SST) : 1;
            const R2_adj = 1 - (1 - R2) * (dfTotal / dfError);
            const MSE = SSE / dfError;
            const stdErrorEst = Math.sqrt(MSE);
            const MSM = dfModel > 0 ? SSM / dfModel : 0;
            const F = (MSE > 0) ? MSM / MSE : (MSM > 0 ? Infinity : 0);
            const pValueModel = (dfModel > 0 && isFinite(F)) ? (1 - jStat.centralF.cdf(F, dfModel, dfError)) : 1.0;
            const VarBeta = XtX_inv.map(row => row.map(val => val * MSE));
            const SE_Beta = VarBeta.map((row, i) => Math.sqrt(Math.abs(row[i])));
            const tValues = Beta.map((b, i) => (SE_Beta[i] > 0) ? b[0] / SE_Beta[i] : 0);
            const pValues = tValues.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), dfError)));

            const standardizedResiduals = Residuals.map(r => (stdErrorEst > 0) ? r / stdErrorEst : 0);
            const outliers = [];
            const outlierThreshold = 2.0;
            standardizedResiduals.forEach((sr, index) => {
                if (Math.abs(sr) > outlierThreshold) {
                    const outlierData = {
                        observationOrder: rawData[index].__observationOrder + 1,
                        standardizedResidual: sr,
                        xValues: {}
                    };
                    linearXCols.forEach(col => {
                        outlierData.xValues[col] = rawData[index][col];
                    });
                    outliers.push(outlierData);
                }
            });

            return {
                yCol, linearXCols, terms, rawData, Beta, pValues, SE_Beta, tValues,
                R2, R2_adj, stdErrorEst, anova: { SSM, SSE, SST, MSM, MSE, F, pValueModel, dfModel, dfError, dfTotal },
                Residuals,
                outliers
            };
        } catch (err) {
            console.error("Regression failed:", err);
            showError(`Calculation error: ${err.message}. Check for multicollinearity.`);
            return null;
        }
    },

    checkForOutliers: function () {
        const lang = document.documentElement.getAttribute('lang') || 'en';
        const t = (key) => (typeof translations !== 'undefined' && translations[lang]) ? (translations[lang][key] || translations['en'][key]) : key;

        if (!this.currentModel) {
            showError(t('msgRunAnalysisFirst'));
            return;
        }
        const { yCol, linearXCols, terms, rawData } = this.currentModel;
        const allFoundOutliers = [];
        const outlierObsNumbers = new Set();
        let tempModel = { ...this.currentModel };
        let iterationCount = 0;
        while (tempModel.outliers && tempModel.outliers.length > 0 && iterationCount < 10) {
            iterationCount++;
            let foundNewInIteration = false;
            tempModel.outliers.forEach(o => {
                if (!outlierObsNumbers.has(o.observationOrder - 1)) {
                    allFoundOutliers.push(o);
                    outlierObsNumbers.add(o.observationOrder - 1);
                    foundNewInIteration = true;
                }
            });
            if (!foundNewInIteration) break;
            const filteredData = rawData.filter(row => !outlierObsNumbers.has(row.__observationOrder));

            if (filteredData.length < terms.length + 1) {
                showError(t('msgNoDataForCheck'));
                break;
            }
            tempModel = this.runAnalysis(yCol, linearXCols, terms, filteredData);
            if (!tempModel) break;
        }
        if (allFoundOutliers.length > 0) {
            this.currentModel.outliers = allFoundOutliers.sort((a, b) => a.observationOrder - b.observationOrder);
            showError(`Found a total of ${allFoundOutliers.length} unusual observation(s).`);
        } else {
            this.currentModel.outliers = [];
            showError("No unusual observations found in the model.");
        }
        this.updateUI(this.currentModel);
        document.getElementById('btn-check-outliers').disabled = true;
        document.getElementById('btn-remove-outliers').disabled = !(allFoundOutliers.length > 0);
    },

    removeOutliersAndReanalyze: function () {
        if (!this.currentModel || !this.currentModel.rawData) {
            showError("No analysis has been run, or the model data is missing.");
            return;
        }
        if (!this.currentModel.outliers || this.currentModel.outliers.length === 0) {
            showError("No unusual observations have been identified to remove.");
            return;
        }
        this.removedOutliersHistory.push(...this.currentModel.outliers);
        const outlierObsNumbers = new Set(this.removedOutliersHistory.map(o => o.observationOrder - 1));
        const originalFullData = [];
        const { yCol, linearXCols, terms } = this.currentModel;
        const n = dataset[yCol].length;
        for (let i = 0; i < n; i++) {
            const row = { y: dataset[yCol][i], __observationOrder: i };
            let valid = !isNaN(row.y);
            linearXCols.forEach(col => {
                row[col] = dataset[col][i];
                if (typeof row[col] !== 'number' || isNaN(row[col])) valid = false;
            });
            if (valid) originalFullData.push(row);
        }

        const newData = originalFullData.filter(row => !outlierObsNumbers.has(row.__observationOrder));
        showError(`Removed ${this.currentModel.outliers.length} unusual observations and re-running analysis.`);

        const newModel = this.runAnalysis(yCol, linearXCols, terms, newData);
        if (newModel) {
            this.currentModel = newModel;
            this.updateUI(this.currentModel);
            this.updateRemovedOutliersTable();

            document.getElementById('btn-check-outliers').disabled = false;
            document.getElementById('btn-remove-terms').disabled = false;
            document.getElementById('btn-remove-outliers').disabled = true;
        } else {
            showError("Failed to re-calculate model after removing outliers.");
        }
    },

    stepwiseTermRemoval: function () {
        const lang = document.documentElement.getAttribute('lang') || 'en';
        const t = (key) => (typeof translations !== 'undefined' && translations[lang]) ? (translations[lang][key] || translations['en'][key]) : key;

        if (!this.currentModel) {
            showError(t('msgRunAnalysisFirst'));
            return;
        }
        let model = this.currentModel;
        while (true) {
            if (model.terms.length <= 1) {
                showError(t('msgStepwiseOneTerm'));
                break;
            }
            let highestPValue = -1;
            let termToRemoveIndex = -1;
            for (let i = 0; i < model.terms.length; i++) {
                if (model.pValues[i] > highestPValue) {
                    highestPValue = model.pValues[i];
                    termToRemoveIndex = i;
                }
            }
            if (termToRemoveIndex === -1 || highestPValue <= 0.1) {
                showError(t('msgStepwiseNoInsignif'));
                break;
            }
            const termName = model.terms[termToRemoveIndex];
            const newTerms = model.terms.filter(t => t !== termName);

            const newModel = this.runAnalysis(model.yCol, model.linearXCols, newTerms, model.rawData);
            if (newModel) {
                model = newModel;
            } else {
                showError(t('msgStepwiseFailed'));
                break;
            }
        }

        this.currentModel = model;
        const outliersForDisplay = model.outliers;
        model.outliers = [];
        this.updateUI(this.currentModel);
        model.outliers = outliersForDisplay;

        showError(t('msgStepwiseSuccess'));
        document.getElementById('btn-check-outliers').disabled = false;
        document.getElementById('btn-remove-terms').disabled = false;
        document.getElementById('btn-remove-outliers').disabled = true;
    },

    updateUI: function (model) {
        const optForm = document.getElementById('regression-optimization-form');
        const optResult = document.getElementById('regression-optimization-result');
        if (optForm && model && model.linearXCols && Array.isArray(model.linearXCols)) {
            optForm.innerHTML = '';
            optResult.textContent = '';
            const goalGroup = document.createElement('div');
            goalGroup.style.display = 'flex';
            goalGroup.style.flexDirection = 'column';
            goalGroup.style.minWidth = '160px';
            const goalLabel = document.createElement('label');
            goalLabel.textContent = 'Goal';
            goalLabel.style.fontWeight = '700';
            goalLabel.style.fontSize = '1.1em';
            goalLabel.style.marginBottom = '4px';
            goalLabel.style.color = '#005FB8';
            goalGroup.appendChild(goalLabel);
            const goalSelect = document.createElement('select');
            goalSelect.id = 'reg-opt-goal';
            goalSelect.style.fontSize = '1em';
            ['Maximize', 'Minimize', 'Target'].forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.toLowerCase();
                o.textContent = opt;
                goalSelect.appendChild(o);
            });
            goalGroup.appendChild(goalSelect);
            optForm.appendChild(goalGroup);

            const targetGroup = document.createElement('div');
            targetGroup.style.display = 'none';
            targetGroup.style.flexDirection = 'column';
            targetGroup.style.minWidth = '120px';
            targetGroup.style.marginLeft = '16px';
            const targetLabel = document.createElement('label');
            targetLabel.textContent = 'Target Value';
            targetLabel.style.fontWeight = '700';
            targetLabel.style.fontSize = '1.1em';
            targetLabel.style.marginBottom = '4px';
            targetLabel.style.color = '#005FB8';
            targetGroup.appendChild(targetLabel);
            const targetInput = document.createElement('input');
            targetInput.type = 'number';
            targetInput.step = 'any';
            targetInput.id = 'reg-opt-target-value';
            targetInput.placeholder = 'Enter target Y';
            targetInput.style.width = '100%';
            targetGroup.appendChild(targetInput);
            optForm.appendChild(targetGroup);

            goalSelect.addEventListener('change', function () {
                targetGroup.style.display = (goalSelect.value === 'target') ? 'flex' : 'none';
            });

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'bosch-btn-primary';
            btn.textContent = 'Calculate Optimal Variables';
            btn.onclick = async (e) => {
                e.preventDefault();
                const vars = model.linearXCols.filter(col => {
                    if (model.terms.includes(col)) return true;
                    return model.terms.some(term => {
                        if (term === 'Intercept') return false;
                        const factors = term.split('*');
                        return factors.includes(col);
                    });
                });
                const data = model.rawData || [];
                const ranges = {};
                vars.forEach(col => {
                    const vals = data.map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v));
                    ranges[col] = { min: Math.min(...vals), max: Math.max(...vals) };
                });
                let bestCombo = null;
                let bestY = null;
                let target = null;
                if (goalSelect.value === 'target') {
                    target = parseFloat(targetInput.value);
                    if (isNaN(target)) {
                        optResult.textContent = 'Please enter a valid target value.';
                        return;
                    }
                }
                if (vars.length <= 3) {
                    const steps = 20;
                    function* grid(vars, ranges, steps) {
                        if (vars.length === 0) yield {};
                        else {
                            const [first, ...rest] = vars;
                            for (let i = 0; i <= steps; ++i) {
                                const val = ranges[first].min + (ranges[first].max - ranges[first].min) * (i / steps);
                                for (const combo of grid(rest, ranges, steps)) {
                                    yield { ...combo, [first]: val };
                                }
                            }
                        }
                    }
                    for (const combo of grid(vars, ranges, steps)) {
                        let y = (model.terms.find((t, i) => t === 'Intercept') !== undefined) ? model.Beta[model.terms.findIndex(t => t === 'Intercept')][0] : 0;
                        const inputVals = { ...combo };
                        model.terms.forEach((term, i) => {
                            if (term === 'Intercept') return;
                            if (vars.includes(term)) {
                                y += model.Beta[i][0] * inputVals[term];
                            } else {
                                const factors = term.split('*');
                                let prod = 1;
                                for (const f of factors) {
                                    if (typeof inputVals[f] === 'number') {
                                        prod *= inputVals[f];
                                    } else {
                                        prod = 0;
                                        break;
                                    }
                                }
                                y += model.Beta[i][0] * prod;
                            }
                        });
                        if (goalSelect.value === 'maximize') {
                            if (bestY === null || y > bestY) {
                                bestY = y;
                                bestCombo = { ...combo };
                            }
                        } else if (goalSelect.value === 'minimize') {
                            if (bestY === null || y < bestY) {
                                bestY = y;
                                bestCombo = { ...combo };
                            }
                        } else if (goalSelect.value === 'target') {
                            if (bestY === null || Math.abs(y - target) < Math.abs(bestY - target)) {
                                bestY = y;
                                bestCombo = { ...combo };
                            }
                        }
                    }
                } else {
                    if (typeof window.nelderMeadOptimize === 'undefined') {
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = 'nelderMead.js';
                            script.onload = () => resolve();
                            script.onerror = () => reject('Failed to load optimization script.');
                            document.head.appendChild(script);
                        });
                    }
                    const lowerBounds = vars.map(col => ranges[col].min);
                    const upperBounds = vars.map(col => ranges[col].max);
                    const initial = vars.map(col => (ranges[col].min + ranges[col].max) / 2);
                    function predictY(arr) {
                        let y = (model.terms.find((t, i) => t === 'Intercept') !== undefined) ? model.Beta[model.terms.findIndex(t => t === 'Intercept')][0] : 0;
                        const inputVals = {};
                        vars.forEach((col, idx) => { inputVals[col] = arr[idx]; });
                        model.terms.forEach((term, i) => {
                            if (term === 'Intercept') return;
                            if (vars.includes(term)) {
                                y += model.Beta[i][0] * inputVals[term];
                            } else {
                                const factors = term.split('*');
                                let prod = 1;
                                for (const f of factors) {
                                    if (typeof inputVals[f] === 'number') {
                                        prod *= inputVals[f];
                                    } else {
                                        prod = 0;
                                        break;
                                    }
                                }
                                y += model.Beta[i][0] * prod;
                            }
                        });
                        return y;
                    }
                    let resultObj;
                    if (goalSelect.value === 'maximize') {
                        resultObj = window.nelderMeadOptimize(arr => -predictY(arr), initial, lowerBounds, upperBounds, 200);
                        bestY = -resultObj.y;
                    } else if (goalSelect.value === 'minimize') {
                        resultObj = window.nelderMeadOptimize(arr => predictY(arr), initial, lowerBounds, upperBounds, 200);
                        bestY = resultObj.y;
                    } else if (goalSelect.value === 'target') {
                        resultObj = window.nelderMeadOptimize(arr => Math.abs(predictY(arr) - target), initial, lowerBounds, upperBounds, 200);
                        bestY = predictY(resultObj.x);
                    }
                    bestCombo = {};
                    vars.forEach((col, idx) => { bestCombo[col] = resultObj.x[idx]; });
                }
                if (bestCombo) {
                    const yName = model.yCol || 'Y';
                    let result = '';
                    if (goalSelect.value === 'maximize') result += 'Maximum ' + yName + ': ' + bestY.toFixed(4) + '<br>';
                    else if (goalSelect.value === 'minimize') result += 'Minimum ' + yName + ': ' + bestY.toFixed(4) + '<br>';
                    else if (goalSelect.value === 'target') result += 'Closest ' + yName + ': ' + bestY.toFixed(4) + '<br>';
                    result += '<div style="margin-top: 16px; font-weight: 700;">Variable values:</div>';
                    result += '<table style="margin-top: 8px; border-collapse: collapse;">';
                    Object.entries(bestCombo).forEach(([k, v]) => {
                        result += '<tr><td style="padding: 4px 12px; font-weight: 600; color: #005FB8;">' + k + '</td>';
                        result += '<td style="padding: 4px 12px;">' + v.toFixed(4) + '</td></tr>';
                    });
                    result += '</table>';
                    optResult.innerHTML = result;
                } else {
                    optResult.textContent = 'No solution found.';
                }
            };
            optForm.appendChild(btn);
        }
        const regressionView = document.getElementById('regression-view');
        if (regressionView) {
            regressionView.classList.remove('hidden');
            regressionView.style.display = 'flex';
        }
        document.getElementById('regression-results-wrapper').classList.remove('hidden');
        const tr = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : (typeof translations !== 'undefined' ? translations.en : {});

        document.getElementById('reg-summary-cards').innerHTML = `
                <div class="card"><div class="card-title">${tr.lblR2 || 'R-sq'}</div><div class="card-value">${(model.R2 * 100).toFixed(2)}%</div><div class="card-sub">${tr.lblCoefDet || 'Coefficient of Determination'}</div></div>
                <div class="card"><div class="card-title">${tr.lblR2Adj || 'R-sq (adj)'}</div><div class="card-value">${(model.R2_adj * 100).toFixed(2)}%</div><div class="card-sub">${tr.lblAdjPred || 'Adjusted for Predictors'}</div></div>
                <div class="card"><div class="card-title">${tr.lblStdErr || 'S'}</div><div class="card-value">${model.stdErrorEst.toFixed(4)}</div><div class="card-sub">${tr.lblStdErrEst || 'Std Error of Estimate'}</div></div>`;

        const anovaBody = document.querySelector('#reg-anova-table tbody');
        anovaBody.innerHTML = `
                <tr><td>${tr.regRowRegression || 'Regression'}</td><td>${model.anova.dfModel}</td><td>${model.anova.SSM.toFixed(4)}</td><td>${model.anova.MSM.toFixed(4)}</td><td>${model.anova.F.toFixed(2)}</td><td>${model.anova.pValueModel.toFixed(4)}</td></tr>
                <tr><td>${tr.regRowError || 'Error'}</td><td>${model.anova.dfError}</td><td>${model.anova.SSE.toFixed(4)}</td><td>${model.anova.MSE.toFixed(4)}</td><td></td><td></td></tr>
                <tr><td>${tr.regRowTotal || 'Total'}</td><td>${model.anova.dfTotal}</td><td>${model.anova.SST.toFixed(4)}</td><td></td><td></td><td></td></tr>`;

        const coefBody = document.querySelector('#reg-coef-table tbody');
        let coefRows = '';
        model.terms.forEach((term, i) => {
            const displayName = (term === 'Intercept') ? (tr.regIntercept || 'Intercept') : term;
            coefRows += `
                    <tr>
                        <td>${displayName}</td>
                        <td>${model.Beta[i][0].toFixed(4)}</td>
                        <td>${model.SE_Beta[i].toFixed(4)}</td>
                        <td>${model.tValues[i].toFixed(2)}</td>
                        <td>${model.pValues[i].toFixed(4)}</td>
                        <td>-</td>
                    </tr>`;
        });
        coefBody.innerHTML = coefRows;

        const outlierWrapper = document.getElementById('outlier-table-wrapper');
        const outlierTableHead = document.querySelector('#outlier-table thead tr');
        const outlierTableBody = document.querySelector('#outlier-table tbody');
        outlierTableHead.innerHTML = '';
        outlierTableBody.innerHTML = '';
        if (model.outliers && model.outliers.length > 0) {
            outlierWrapper.classList.remove('hidden');
            let headHTML = '<th>Observation</th>';
            model.linearXCols.forEach(col => { headHTML += `<th>${col}</th>`; });
            headHTML += '<th>Std. Residual</th>';
            outlierTableHead.innerHTML = headHTML;
            let bodyHTML = '';
            model.outliers.forEach(outlier => {
                let row = `<tr><td>${outlier.observationOrder}</td>`;
                model.linearXCols.forEach(col => {
                    row += `<td>${outlier.xValues[col]}</td>`;
                });
                row += `<td>${outlier.standardizedResidual.toFixed(3)}</td></tr>`;
                bodyHTML += row;
            });
            outlierTableBody.innerHTML = bodyHTML;
        } else {
            outlierWrapper.classList.add('hidden');
        }

        let equation = `${model.yCol} = `;
        model.terms.forEach((term, i) => {
            const beta = model.Beta[i][0];
            const isFirst = i === 0;
            let termStr = '';
            const displayTerm = (term === 'Intercept') ? (tr.regIntercept || 'Intercept') : term;

            if (isFirst) {
                termStr = (term === 'Intercept') ? beta.toFixed(4) : `${beta.toFixed(4)}*${displayTerm}`;
            } else {
                const sign = beta >= 0 ? ' + ' : ' - ';
                const absBeta = Math.abs(beta).toFixed(4);
                termStr = (term === 'Intercept') ? `${sign}${absBeta}` : `${sign}${absBeta}*${displayTerm}`;
            }
            equation += termStr;
        });
        document.getElementById('reg-equation').textContent = equation;

        this.plotCharts(model);

        const predForm = document.getElementById('regression-prediction-form');
        if (predForm) {
            predForm.innerHTML = '';
            if (!model || !model.terms || model.terms.length === 0) {
                const msg = document.createElement('div');
                msg.style.margin = '16px 0';
                msg.textContent = 'No model available for prediction.';
                predForm.appendChild(msg);
            } else {
                if (model.linearXCols && Array.isArray(model.linearXCols)) {
                    const presentVars = model.linearXCols.filter(col => {
                        if (model.terms.includes(col)) return true;
                        return model.terms.some(term => {
                            if (term === 'Intercept') return false;
                            const factors = term.split('*');
                            return factors.includes(col);
                        });
                    });
                    presentVars.forEach((col) => {
                        const group = document.createElement('div');
                        group.style.display = 'flex';
                        group.style.flexDirection = 'column';
                        group.style.minWidth = '120px';
                        const inputId = 'reg-pred-' + col.replace(/\W/g, '_');
                        const label = document.createElement('label');
                        label.setAttribute('for', inputId);
                        label.textContent = col;
                        label.style.fontWeight = '700';
                        label.style.fontSize = '1.1em';
                        label.style.marginBottom = '4px';
                        label.style.color = '#005FB8';
                        group.appendChild(label);
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.step = 'any';
                        input.name = col;
                        input.placeholder = col;
                        input.style.width = '100%';
                        input.id = inputId;
                        group.appendChild(input);
                        predForm.appendChild(group);
                    });
                }
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'bosch-btn-primary';
                btn.textContent = 'Predict';
                btn.onclick = () => {
                    let y = (model.terms.find((t, i) => t === 'Intercept') !== undefined) ? model.Beta[model.terms.findIndex(t => t === 'Intercept')][0] : 0;
                    const inputVals = {};
                    if (model.linearXCols && Array.isArray(model.linearXCols)) {
                        model.linearXCols.forEach((col) => {
                            const inputEl = document.getElementById('reg-pred-' + col.replace(/\W/g, '_'));
                            inputVals[col] = parseFloat(inputEl ? inputEl.value : '0');
                        });
                    }
                    model.terms.forEach((term, i) => {
                        if (term === 'Intercept') return;
                        if (model.linearXCols.includes(term)) {
                            y += model.Beta[i][0] * inputVals[term];
                        } else {
                            const factors = term.split('*');
                            let prod = 1;
                            for (const f of factors) {
                                if (typeof inputVals[f] === 'number') {
                                    prod *= inputVals[f];
                                } else {
                                    prod = 0;
                                    break;
                                }
                            }
                            y += model.Beta[i][0] * prod;
                        }
                    });
                    let resultDiv = document.getElementById('regression-prediction-result');
                    if (!resultDiv) {
                        resultDiv = document.createElement('div');
                        resultDiv.id = 'regression-prediction-result';
                        resultDiv.style.marginTop = '16px';
                        resultDiv.style.fontWeight = '600';
                        predForm.parentElement.appendChild(resultDiv);
                    }
                    resultDiv.textContent = 'Predicted Y: ' + y.toFixed(4);
                };
                predForm.appendChild(btn);
            }
        }
    },

    updateRemovedOutliersTable: function () {
        const removedWrapper = document.getElementById('removed-outlier-table-wrapper');
        if (!this.removedOutliersHistory || this.removedOutliersHistory.length === 0) {
            removedWrapper.classList.add('hidden');
            return;
        }
        const tableHead = document.querySelector('#removed-outlier-table thead tr');
        const tableBody = document.querySelector('#removed-outlier-table tbody');
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        removedWrapper.classList.remove('hidden');
        let headHTML = '<th>Observation</th>';
        const xCols = Object.keys(this.removedOutliersHistory[0].xValues);
        xCols.forEach(col => { headHTML += `<th>${col}</th>`; });
        headHTML += '<th>Std. Residual</th>';
        tableHead.innerHTML = headHTML;
        let bodyHTML = '';
        this.removedOutliersHistory.forEach(outlier => {
            let row = `<tr><td>${outlier.observationOrder}</td>`;
            xCols.forEach(col => {
                row += `<td>${outlier.xValues[col]}</td>`;
            });
            row += `<td>${outlier.standardizedResidual.toFixed(3)}</td></tr>`;
            bodyHTML += row;
        });
        tableBody.innerHTML = bodyHTML;
    },

    plotCharts: function (model) {
        const { rawData: data, Residuals: residuals, yCol: yName, linearXCols: xNames, Beta: beta, SE_Beta: seBeta, pValues, terms, anova } = model;
        const theme = getChartTheme(document.body.getAttribute('data-theme'));
        const hasIntercept = terms.includes('Intercept');
        const predictorTerms = hasIntercept ? terms.filter(t => t !== 'Intercept') : terms;
        const betaPredictors = hasIntercept ? beta.slice(1) : beta;
        const seBetaPredictors = hasIntercept ? seBeta.slice(1) : seBeta;

        const lang = document.documentElement.getAttribute('lang') || 'en';
        const t = (key) => (typeof translations !== 'undefined' && translations[lang]) ? (translations[lang][key] || translations['en'][key]) : key;

        const effects = betaPredictors.map((b, i) => (seBetaPredictors[i] > 0) ? Math.abs(b[0] / seBetaPredictors[i]) : 0);

        const alpha = 0.1;
        const t_critical = jStat.studentt.inv(1 - alpha / 2, anova.dfError);

        const layout = {
            title: t('regStdEffects'),
            font: theme.font,
            paper_bgcolor: theme.paper_bgcolor,
            plot_bgcolor: theme.plot_bgcolor,
            yaxis: { title: t('regTerm'), automargin: true, gridcolor: theme.gridcolor },
            xaxis: { title: t('regTValue') + ' (Abs)', gridcolor: theme.gridcolor },
            shapes: [{
                type: 'line', xref: 'x', yref: 'paper',
                x0: t_critical, y0: 0, x1: t_critical, y1: 1,
                line: { color: theme.dangercolor, width: 2, dash: 'dash' },
                name: `α = ${alpha}`
            }]
        };

        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('regStandardizedEffectsChart', [{
                y: predictorTerms, x: effects, type: 'bar', orientation: 'h', marker: { color: theme.theme_primary }
            }], layout, { responsive: true });

            const sortedResiduals = [...residuals].sort((a, b) => a - b);
            const n = sortedResiduals.length;
            const theoreticalQuantiles = sortedResiduals.map((_, i) => jStat.normal.inv((i + 0.5) / n, 0, 1));
            const q1Actual = jStat.percentile(sortedResiduals, 0.25);
            const q3Actual = jStat.percentile(sortedResiduals, 0.75);
            const q1Theory = jStat.normal.inv(0.25, 0, 1);
            const q3Theory = jStat.normal.inv(0.75, 0, 1);
            const slope = (q3Actual - q1Actual) / (q3Theory - q1Theory);
            const intercept = q1Actual - slope * q1Theory;
            const lineY = theoreticalQuantiles.map(x => intercept + slope * x);

            Plotly.newPlot('regResidualsProbabilityChart', [{
                x: theoreticalQuantiles, y: sortedResiduals, mode: 'markers', name: t('lblResiduals'), type: 'scatter', marker: { color: theme.theme_primary }
            }, {
                x: theoreticalQuantiles, y: lineY, mode: 'lines', name: t('lblNormalLine'), line: { color: theme.dangercolor }
            }], {
                title: t('regResidualsProb'), font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                xaxis: { title: t('lblTheoreticalQuantiles'), gridcolor: theme.gridcolor, zeroline: false, font: theme.font, tickfont: theme.font },
                yaxis: { title: t('lblSampleQuantiles'), gridcolor: theme.gridcolor, zeroline: false, font: theme.font, tickfont: theme.font },
                showlegend: true, legend: { x: 0.05, y: 0.95, font: theme.font }
            }, { responsive: true });

            const obsOrder = data.map(d => d.__observationOrder);
            Plotly.newPlot('regResidualsOrderChart', [{
                x: obsOrder, y: residuals, mode: 'markers', type: 'scatter', marker: { color: theme.theme_primary }
            }, {
                x: [Math.min(...obsOrder), Math.max(...obsOrder)], y: [0, 0], mode: 'lines', name: 'Zero', line: { color: theme.dangercolor, dash: 'dash' }
            }], {
                title: t('regResidualsOrder'), font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                xaxis: { title: t('thRunOrder'), gridcolor: theme.gridcolor, font: theme.font, tickfont: theme.font },
                yaxis: { title: 'Residual', gridcolor: theme.gridcolor, font: theme.font, tickfont: theme.font }
            }, { responsive: true });

            const contourChartDiv = document.getElementById('regContourChart');
            if (contourChartDiv) Plotly.purge(contourChartDiv);
            const factorialPlotsContainer = document.getElementById('regFactorialPlotsContainer');
            if (factorialPlotsContainer) {
                Array.from(factorialPlotsContainer.children).forEach(child => {
                    if (child.id && child.id.startsWith('regFactorialPlot_')) {
                        Plotly.purge(child);
                    }
                });
                factorialPlotsContainer.innerHTML = '';
            }

            if (xNames.length >= 2) {
                contourChartDiv.style.display = 'block';
                const pValuesX = hasIntercept ? pValues.slice(1, xNames.length + 1) : pValues.slice(0, xNames.length);
                const varsWithP = xNames.map((name, i) => ({ name, p: pValuesX[i] })).sort((a, b) => a.p - b.p);
                const sigVar1 = varsWithP[0], sigVar2 = varsWithP[1];
                const x1_data = data.map(d => d[sigVar1.name]);
                const x2_data = data.map(d => d[sigVar2.name]);
                const x1_min = Math.min(...x1_data), x1_max = Math.max(...x1_data);
                const x2_min = Math.min(...x2_data), x2_max = Math.max(...x2_data);
                const nGrid = 30;
                const x1_grid = Array.from({ length: nGrid }, (_, i) => x1_min + i * (x1_max - x1_min) / (nGrid - 1));
                const x2_grid = Array.from({ length: nGrid }, (_, i) => x2_min + i * (x2_max - x2_min) / (nGrid - 1));
                const otherVarsMeans = {};
                xNames.forEach(name => {
                    if (name !== sigVar1.name && name !== sigVar2.name) {
                        otherVarsMeans[name] = getMean(data.map(d => d[name]));
                    }
                });
                const z_grid = x2_grid.map(y_val => {
                    return x1_grid.map(x_val => {
                        const point = { ...otherVarsMeans };
                        point[sigVar1.name] = x_val;
                        point[sigVar2.name] = y_val;
                        let prediction = 0;
                        terms.forEach((termName, i) => {
                            const termBeta = beta[i][0];
                            let termValue = 1;
                            if (termName !== 'Intercept') {
                                termName.split('*').forEach(factor => {
                                    termValue *= point[factor] || 1;
                                });
                            }
                            prediction += termBeta * termValue;
                        });
                        return prediction;
                    });
                });
                Plotly.newPlot('regContourChart', [{
                    z: z_grid, x: x1_grid, y: x2_grid, type: 'contour',
                    colorscale: 'RdBu', reversescale: true
                }], {
                    title: `Contour Plot of ${yName} vs ${sigVar1.name}, ${sigVar2.name}`,
                    xaxis: { title: sigVar1.name, gridcolor: theme.gridcolor },
                    yaxis: { title: sigVar2.name, gridcolor: theme.gridcolor },
                    font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor
                }, { responsive: true });
            }
        }
    }
};

// Global Exposure
window.analyzeRegression = () => Regression.analyze();
window.checkForOutliers = () => Regression.checkForOutliers();
window.removeOutliersAndReanalyze = () => Regression.removeOutliersAndReanalyze();
window.stepwiseTermRemoval = () => Regression.stepwiseTermRemoval();
window.regCurrentModel = Regression.currentModel;
window.removedOutliersHistory = Regression.removedOutliersHistory;
