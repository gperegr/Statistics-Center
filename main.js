         // Prevent pinch-to-zoom on iOS
     document.addEventListener('gesturestart', function (e) {
     e.preventDefault();
     });

     (function () {
     const resizer = document.getElementById('sidebarResizer');
     const content = document.querySelector('.content');
     const panel = document.querySelector('.controls-panel');
     let isResizing = false;

     resizer.addEventListener('mousedown', function (e) {
     isResizing = true;
     resizer.classList.add('resizing');
     document.body.style.cursor = 'col-resize';
     e.preventDefault(); // Prevent text selection
     });

     document.addEventListener('mousemove', function (e) {
     if (!isResizing) return;

     const panelLeft = panel.getBoundingClientRect().left;
     let newWidth = e.clientX - panelLeft;

     // Constraints
     const halfScreen = (window.innerWidth / 2) - 24;
     const effectiveMaxWidth = Math.min(1120, halfScreen);

     if (newWidth < 320) newWidth = 320;
     if (newWidth > effectiveMaxWidth) newWidth = effectiveMaxWidth;

     // Snap to grid (20px)
     newWidth = Math.round(newWidth / 40) * 40;

     content.style.setProperty('--sidebarWidth', newWidth + 'px');
     });

     document.addEventListener('mouseup', function () {
     if (isResizing) {
     isResizing = false;
     resizer.classList.remove('resizing');
     document.body.style.cursor = 'default';
     resizer.classList.remove('resizing');
     document.body.style.cursor = 'default';
     // Trigger window resize to ensure charts update after drag ends
     window.dispatchEvent(new Event('resize'));
     }
     });

     // Expose toggle function globally
     window.toggleSidebar = function () {
     const content = document.querySelector('.content');
     content.classList.toggle('sidebar-closed');
     setTimeout(() => window.dispatchEvent(new Event('resize')), 305); // Resize charts after anim
     };


     // --- AUTO RESIZE OBSERVER ---
     // Watches the content area for size changes (sidebar resize)
     // and updates Plotly charts automatically.
     const resultsPanel = document.querySelector('.results-panel') || document.querySelector('.content'); // Fallback

     if (resultsPanel) {
     const resizeObserver = new ResizeObserver(entries => {
     // Throttle slightly to avoid excessive redraws
     window.requestAnimationFrame(() => {
     const plots = document.querySelectorAll('.js-plotly-plot');
     plots.forEach(plot => {
     Plotly.Plots.resize(plot);
     });
     });
     });
     resizeObserver.observe(resultsPanel);
     }
     })();
	 
	 
	 
        function toggleAboutModal() {
            const modal = document.getElementById('aboutModal');
            modal.classList.toggle('open');
        }

        // Add 'tipAbout' translation manually since it's new
        // Extra translations merged into main object
        // Dropdown Navigation Logic
        function toggleNavDropdown() {
            const container = document.getElementById('navDropdownContainer');
            if (container) {
                container.classList.toggle('open');
            }
        }

        // Close dropdown when clicking outside
        window.addEventListener('click', function (e) {
            const container = document.getElementById('navDropdownContainer');
            const btn = document.getElementById('navDropdownBtn');
            if (container && container.classList.contains('open')) {
                // Check if click target is inside container or button
                if (!container.contains(e.target) && (!btn || !btn.contains(e.target))) {
                    container.classList.remove('open');
                }
            }
        });

        // Mobile Menu Logic
        function toggleMobileMenu() {
            const controls = document.getElementById('headerControls');
            const btn = document.querySelector('.mobile-menu-btn');
            controls.classList.toggle('show-mobile');
            if (btn) btn.classList.toggle('open');
        }


        const ICON_MOON_SVG = `<svg class="theme-icon-svg" viewBox="0 0 192 192">
            <path d="M97.75342,159.1499c-7.21631,0-14.48438-1.22217-21.48633-3.75342c-16.83789-6.08643-30.00342-18.47949-37.07178-34.89551
	c-7.06836-16.4165-7.02344-34.49756,0.12598-50.9126c10.68213-24.5249,35.88184-39.90137,62.70947-38.25977l11.64746,0.7124
	l-9.63525,6.58301c-9.13037,6.23828-15.82861,15.1123-19.37061,25.66309c-8.08691,24.08887,3.64258,51.31641,26.70361,61.98633
	c10.00391,4.62793,20.95654,5.88086,31.67188,3.61914l11.41846-2.40869l-7.53955,8.90723
	C134.49414,151.07764,116.2959,159.1499,97.75342,159.1499z M90.37402,39.74658
	c-19.08057,2.66113-35.875,15.02881-43.71777,33.03613c-6.25781,14.3667-6.29785,30.18994-0.11279,44.5542
	c6.18457,14.36426,17.70654,25.20898,32.44336,30.53613c18.33105,6.62744,38.76221,2.99268,53.79688-8.88232
	c-8.48145-0.00684-16.87842-1.80713-24.76709-5.45654c-13.02539-6.02637-23.36182-16.68799-29.10498-30.02002
	c-5.74365-13.33203-6.39111-28.16748-1.82324-41.77295C79.89404,53.38379,84.41162,45.93408,90.37402,39.74658z"/>
        </svg>`;

        const ICON_SUN_SVG = `<svg class="theme-icon-svg" viewBox="0 0 192 192">
            <path d="M32.13696,92C32.05524,93.3241,32,94.65533,32,96v-4H32.13696z M32,100h0.13696C32.05524,98.6759,32,97.34467,32,96V100z
	 M92,160h4c-1.34467,0-2.6759-0.05524-4-0.13696V160z M100,32h-4c1.34467,0,2.6759,0.05524,4,0.13696V32z M92,32v0.13696
	C93.3241,32.05524,94.65533,32,96,32H92z M159.86304,92C159.94476,93.3241,160,94.65533,160,96v-4H159.86304z M160,100v-4
	c0,1.34467-0.05524,2.6759-0.13696,4H160z M100,160v-0.13696C98.6759,159.94476,97.34467,160,96,160H100z M144,92v8h15.86304
	C159.94476,98.6759,160,97.34467,160,96s-0.05524-2.6759-0.13696-4H144z M127.1123,132.76953l11.21503,11.21503
	c2.00146-1.76691,3.89032-3.65576,5.65717-5.65729l-11.21497-11.21497L127.1123,132.76953z M132.76953,64.8877l11.21503-11.21503
	c-1.76685-2.00146-3.65576-3.89038-5.65723-5.65723L127.1123,59.23047L132.76953,64.8877z M136,96c0,22.05615-17.94385,40-40,40
	s-40-17.94385-40-40s17.94385-40,40-40S136,73.94385,136,96z M128,96c0-17.64502-14.35498-32-32-32S64,78.35498,64,96
	s14.35498,32,32,32S128,113.64502,128,96z M59.23047,127.1123L48.0155,138.32727c1.76685,2.00153,3.6557,3.89038,5.65717,5.65729
	l11.21503-11.21503L59.23047,127.1123z M92,144v15.86304C93.3241,159.94476,94.65533,160,96,160s2.6759-0.05524,4-0.13696V144H92z
	 M100,48V32.13696C98.6759,32.05524,97.34467,32,96,32s-2.6759,0.05524-4,0.13696V48H100z M64.8877,59.23047L53.67267,48.01544
	c-2.00146,1.76685-3.89038,3.65576-5.65723,5.65723L59.23047,64.8877L64.8877,59.23047z M48,92H32.13696
	C32.05524,93.3241,32,94.65533,32,96s0.05524,2.6759,0.13696,4H48V92z"/>
        </svg>`;

        // --- THEME LOGIC ---
        function toggleTheme() {
            const body = document.body;
            const icon = document.getElementById('theme-icon');
            const current = body.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';

            body.setAttribute('data-theme', newTheme);
            icon.innerHTML = newTheme === 'dark' ? ICON_SUN_SVG : ICON_MOON_SVG;
            localStorage.setItem('appTheme', newTheme);

            // Update Chart Layouts
            updateChartsTheme(newTheme);
        }

        function getChartTheme(theme) {
            const isDark = theme === 'dark';
            return {
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: {
                    color: isDark ? '#f3f2f1' : '#201f1e',
                    family: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
                },
                gridcolor: isDark ? '#484644' : '#e1dfdd',
                dangercolor: isDark ? '#f17074' : '#d13438',
                successcolor: isDark ? '#6bb700' : '#107c10',
                warningcolor: isDark ? '#ffd700' : '#ffb900',
                theme_primary: isDark ? '#4f9bdb' : '#0078d4'
            };
        }

        function updateChartsTheme(theme) {
            try {
                const themeLayout = getChartTheme(theme);
                const update = {
                    'paper_bgcolor': themeLayout.paper_bgcolor,
                    'plot_bgcolor': themeLayout.plot_bgcolor,
                    'font.color': themeLayout.font.color,
                    'xaxis.gridcolor': themeLayout.gridcolor,
                    'yaxis.gridcolor': themeLayout.gridcolor,
                    'yaxis2.gridcolor': themeLayout.gridcolor
                };

                ['mainChart', 'mainCdfChart', 'toleranceChart', 'toleranceCdfChart', 'graphsChart', 'mcChart', 'mcCdfChart', 'capChart', 'spcChart', 'spcChartSecondary', 'hypothesisChart', 'paretoChart',
                    'regStandardizedEffectsChart', 'regResidualsProbabilityChart', 'regResidualsOrderChart', 'regContourChart', 'weibullChart', 'wb-reliability-chart', 'wb-probability-chart'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el && el.data && typeof Plotly !== 'undefined') {
                            Plotly.relayout(id, update);
                            // For Pareto, we might need a full redraw to update everything correctly
                            if (id === 'paretoChart' && Object.keys(dataset).length > 0 && typeof analyzePareto === 'function') {
                                analyzePareto();
                            }
                            else if (Object.keys(dataset).length > 0 && typeof runAnalysis === 'function') {
                                runAnalysis(false);
                            }
                        }
                    });

                // Re-run analysis once to update trace colors for the active view
                if (Object.keys(dataset).length > 0 && typeof runAnalysis === 'function') {
                    runAnalysis();
                }
            } catch (e) {
                console.error("Error updating charts theme:", e);
            }
        }

        // --- STATE MANAGEMENT ---
        let currentMode = 'normal';
        let currentGraphType = 'boxplot';
        let dataset = {};
        let rawDataset = {}; // Store non-numeric columns too
        let selectedColumnName = '';
        let parseTimeout;

        // Monte Carlo Data Storage
        let mcData = [];
        let weibullCurrentModel = null;

        // --- INITIALIZATION ---
        window.onload = function () {
            // Fix: Check dependencies
            if (typeof Plotly === 'undefined' || typeof jStat === 'undefined') {
                const msg = "Error: Required libraries (Plotly, jStat) failed to load. Please check your internet connection and reload.";
                alert(msg);
                document.body.innerHTML = `<div style='padding:20px; color:red; font-family:sans-serif;'><h3>${msg}</h3></div>`;
                return;
            }
            changeLanguage(currentLang);
            updateSpcControls();
        };

        // --- RESET LOGIC ---
        // --- RESET LOGIC ---
        function resetApp() {
            dataset = {};
            rawDataset = {};
            mcData = [];
            weibullCurrentModel = null;
            selectedColumnName = null;

            // clear inputs
            document.getElementById('textInput').value = '';
            document.getElementById('fileInput').value = '';
            document.getElementById('stateFileInput').value = '';

            // Reset all input fields to default
            const inputsToReset = [
                'limitValue', 'lslValue', 'uslValue', 'targetValue',
                'mc-norm-mean', 'mc-norm-std', 'mc-n', 'histBins', 'hypoAlpha',
                'tol-confidence', 'tol-coverage',
                'spcSubgroupColumn', 'hypoResponseCol', 'hypoFactorCol'
            ];
            inputsToReset.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = el.defaultValue || '';
            });

            // Reset Selectors
            const selectsToReset = ['columnSelect', 'capDistributionMethod', 'limitType', 'spcChartType'];
            selectsToReset.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.selectedIndex = 0;
            });

            // Clear text displays
            document.getElementById('mc-msg').textContent = '';
            document.getElementById('cap-dist-label').textContent = '';

            // Clear Result Cells (Capability)
            const capIds = [
                'val-lsl', 'val-usl', 'val-target', 'val-mean', 'val-n',
                'val-cp', 'val-cpl', 'val-cpu', 'val-cpk', 'val-sig-within',
                'val-pp', 'val-ppl', 'val-ppu', 'val-ppk', 'val-cpm', 'val-sig-overall',
                'pct-ppl', 'ppm-ppl', 'pct-ppu', 'ppm-ppu', 'pct-ppt', 'ppm-ppt',
                'pct-cpl', 'ppm-cpl', 'pct-cpu', 'ppm-cpu', 'pct-cpt', 'ppm-cpt'
            ];
            capIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '-';
            });

            // Hide Containers
            const containersToHide = [
                'preview-wrapper', 'column-selector-group', 'analysis-view',
                'stats-container', 'analysis-chart-container', 'multi-table-container',
                'tolerance-view', 'tolerance-stats-wrapper', 'tolerance-normality-wrapper', 'tolerance-table-wrapper', 'tolerance-chart-container',
                'spc-violations-wrapper', 'cap-indices-within', 'cap-indices-overall',
                // Specific Analysis Containers:
                'mc-results-container', 'montecarlo-view',

                'pareto-view', 'pareto-chart-container', 'pareto-table-container',
                'regression-view', 'regression-results-container',
                'msa-view', 'msa-results-container',
                'weibayes-view', 'weibayes-results',
                'spc-view', 'graphs-view', 'capability-view', 'hypothesis-view'
            ];
            containersToHide.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add('hidden');
                    // Removed destructive innerHTML clearing here because it was deleting static headers/structure
                    // Only hide the containers to fix phantom panels.
                }
            });

            // Clear Charts
            const chartIds = ['mainChart', 'mainCdfChart', 'toleranceChart', 'toleranceCdfChart', 'capChart', 'mcChart', 'mcCdfChart', 'graphsChart', 'spcChart', 'spcChartSecondary', 'hypothesisChart', 'paretoChart', 'weibullChart'];
            chartIds.forEach(id => {
                Plotly.purge(id);
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });

            // Clear Content Areas (Specific tbodies or content divs)
            const contentIds = [
                'stats-container', 'multiDistTable tbody', 'spcViolationsTable tbody',
                'hypothesisSummaryTable', 'hypothesisGroupsTable tbody', 'paretoTable tbody', 'toleranceTable tbody'
            ];
            contentIds.forEach(id => {
                const el = document.querySelector(`#${id}`);
                if (el) el.innerHTML = '';
            });

            // Reset Tolerance Interval placeholders
            const tolBody = document.querySelector('#toleranceTable tbody');
            if (tolBody) {
                const msg = (translations && translations[currentLang] && translations[currentLang].msgTolAwait) ? translations[currentLang].msgTolAwait : 'Awaiting data...';
                tolBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#999;">${msg}</td></tr>`;
            }
            ['tol-n', 'tol-mean', 'tol-std', 'tol-min', 'tol-max', 'tol-skew', 'tol-ad-stat', 'tol-ad-p', 'tol-ad-conclusion'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '-';
            });
            const tolMsg = document.getElementById('tolerance-message');
            if (tolMsg) tolMsg.textContent = '';

            // Re-render empty column options?
            updateColumnSelect();

            switchTab('normal');
        }

        // --- SAVE / LOAD LOGIC ---
        function saveData() {
            const state = {
                version: "0.1",
                timestamp: new Date().toISOString(),
                data: document.getElementById('textInput').value,
                settings: {
                    currentMode: currentMode,
                    decimalSep: document.getElementById('decimalSep').value,
                    selectedColumn: document.getElementById('columnSelect').value,
                    limitValue: document.getElementById('limitValue').value,
                    limitType: document.getElementById('limitType').value,
                    tolConfidence: document.getElementById('tol-confidence').value,
                    tolCoverage: document.getElementById('tol-coverage').value,
                    lslValue: document.getElementById('lslValue').value,
                    uslValue: document.getElementById('uslValue').value,
                    targetValue: document.getElementById('targetValue').value,
                    capDistributionMethod: document.getElementById('capDistributionMethod').value,
                    spcChartType: document.getElementById('spcChartType').value,
                    spcSubgroupColumn: document.getElementById('spcSubgroupColumn').value,
                    hypoResponseCol: document.getElementById('hypoResponseCol').value,
                    hypoFactorCol: document.getElementById('hypoFactorCol').value,
                    hypoAlpha: document.getElementById('hypoAlpha').value,
                    hypoEqualVariances: document.getElementById('hypoEqualVariances').checked,
                    language: currentLang,
                    theme: document.body.getAttribute('data-theme')
                }
            };

            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statistics_analysis_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function loadData() {
            document.getElementById('stateFileInput').click();
        }

        function handleStateUpload(input) {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const state = JSON.parse(e.target.result);
                    restoreState(state);
                } catch (err) {
                    alert("Error loading file: " + err);
                }
            };
            reader.readAsText(file);
            input.value = ''; // reset so same file can be loaded again
        }

        function restoreState(state) {
            const s = state.settings;
            if (s.language) {
                document.getElementById('langSelect').value = s.language;
                changeLanguage(s.language);
            }
            if (s.theme) {
                document.body.setAttribute('data-theme', s.theme);
                document.getElementById('theme-icon').innerHTML = s.theme === 'dark' ? ICON_SUN_SVG : ICON_MOON_SVG;
            }

            document.getElementById('textInput').value = state.data || "";
            document.getElementById('decimalSep').value = s.decimalSep || ".";

            parseAndLoadData(); // This populates selectors

            // Restore selections after parsing
            setTimeout(() => {
                if (s.selectedColumn) {
                    document.getElementById('columnSelect').value = s.selectedColumn;
                    selectedColumnName = s.selectedColumn;
                }
                if (s.spcChartType) {
                    document.getElementById('spcChartType').value = s.spcChartType;
                    updateSpcControls();
                }
                if (s.spcSubgroupColumn) {
                    document.getElementById('spcSubgroupColumn').value = s.spcSubgroupColumn;
                }
                if (s.capDistributionMethod) {
                    document.getElementById('capDistributionMethod').value = s.capDistributionMethod;
                }
                if (s.hypoResponseCol) document.getElementById('hypoResponseCol').value = s.hypoResponseCol;
                if (s.hypoFactorCol) document.getElementById('hypoFactorCol').value = s.hypoFactorCol;
                if (s.hypoAlpha) document.getElementById('hypoAlpha').value = s.hypoAlpha;
                if (s.hypoEqualVariances !== undefined) document.getElementById('hypoEqualVariances').checked = s.hypoEqualVariances;


                document.getElementById('limitValue').value = s.limitValue || "";
                document.getElementById('limitType').value = s.limitType || "upper";
                if (s.tolConfidence) document.getElementById('tol-confidence').value = s.tolConfidence;
                if (s.tolCoverage) document.getElementById('tol-coverage').value = s.tolCoverage;
                document.getElementById('lslValue').value = s.lslValue || "";
                document.getElementById('uslValue').value = s.uslValue || "";
                document.getElementById('targetValue').value = s.targetValue || "";

                switchTab(s.currentMode || 'normal');

                runAnalysis(false);
            }, 100); // Small delay to ensure dropdowns are populated
        }

        function updateRegressionColumns() {
            const cols = Object.keys(dataset);
            const ySelect = document.getElementById('reg-response-col');
            const xContainer = document.getElementById('reg-explanatory-vars');

            ySelect.innerHTML = '';
            xContainer.innerHTML = '';

            if (cols.length === 0) {
                ySelect.innerHTML = '<option>No data loaded</option>';
                xContainer.innerHTML = '\u003cdiv style=\"color:var(--colorNeutralForeground3);\"\u003eNo data loaded\u003c/div\u003e';
                return;
            }

            // Populate Y (Response)
            cols.forEach(col => {
                const option = document.createElement('option');
                option.value = col;
                option.textContent = col;
                ySelect.appendChild(option);
            });

            // Populate X (Explanatory) - Checkboxes
            cols.forEach(col => {
                const div = document.createElement('div');
                div.style.cssText = 'display:flex; align-items:center; gap:8px;';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `reg-x-${col}`;
                checkbox.value = col;
                checkbox.className = 'reg-x-checkbox'; // Helper class for selection

                const label = document.createElement('label');
                label.htmlFor = `reg-x-${col}`;
                label.textContent = col;
                label.style.cursor = 'pointer';

                div.appendChild(checkbox);
                div.appendChild(label);
                xContainer.appendChild(div);
            });
        }

        // --- TAB SWITCHING ---
        function switchTab(mode) {
            // Determine data availability early to avoid TDZ issues
            const hasData = (typeof dataset !== 'undefined' && dataset !== null) ? Object.keys(dataset).length > 0 : false;

            // Reset Weibayes if leaving the tab
            if (typeof currentMode !== 'undefined' && currentMode === 'weibayes' && mode !== 'weibayes') {
                if (typeof Weibayes !== 'undefined') Weibayes.reset();
            }

            currentMode = mode;

            // Update Dropdown Selection & Label
            const dropdownItems = document.querySelectorAll('.nav-dropdown-item');
            let selectedText = "";

            dropdownItems.forEach(item => {
                if (item.id === `tab-${mode}`) {
                    item.classList.add('active');
                    selectedText = item.textContent; // Capture text for label
                } else {
                    item.classList.remove('active');
                }
            });

            // Update Label
            const navLabel = document.getElementById('navDropdownLabel');
            if (navLabel && selectedText) {
                navLabel.textContent = selectedText;
                // Update i18n attribute for persistence if needed
                const activeItem = document.getElementById(`tab-${mode}`);
                if (activeItem && activeItem.hasAttribute('data-i18n')) {
                    navLabel.setAttribute('data-i18n', activeItem.getAttribute('data-i18n'));
                }
            }

            // Close Dropdown automatically
            const ddContainer = document.getElementById('navDropdownContainer');
            if (ddContainer) {
                ddContainer.classList.remove('open');
            }

            // Restore global inputs visibility (reset state)
            const mainCtrl = document.getElementById('main-controls');
            if (mainCtrl) {
                Array.from(mainCtrl.children).forEach(child => child.classList.remove('hidden'));
            }

            const views = {
                analysis: document.getElementById('analysis-view'),
                tolerance: document.getElementById('tolerance-view'),
                capability: document.getElementById('capability-view'),
                hypothesis: document.getElementById('hypothesis-view'),
                spc: document.getElementById('spc-view'),
                graphs: document.getElementById('graphs-view'),
                pareto: document.getElementById('pareto-view'),

                montecarlo: document.getElementById('montecarlo-view'),
                regression: document.getElementById('regression-view'),
                weibull: document.getElementById('weibull-view'),
                weibayes: document.getElementById('weibayes-view'),
                welcome: document.getElementById('welcome-msg')
            };

            // Hide all first
            Object.values(views).forEach(el => {
                if (el) el.classList.add('hidden');
            });

            const controls = {
                main: document.getElementById('main-controls'),
                montecarlo: document.getElementById('montecarlo-controls'),
            };
            Object.values(controls).forEach(c => c.classList.add('hidden'));

            // Reset all specific parameter groups
            const paramGroups = [
                'grp-limit-value', 'grp-limit-type', 'grp-cap-limits',
                'grp-hypothesis-controls', 'grp-spc-controls', 'grp-graphs-controls', 'grp-pareto-controls', 'grp-tolerance-controls',
                'grp-regression-controls', 'grp-msa-controls', 'grp-weibayes-controls', 'grp-weibull-controls'
            ];
            paramGroups.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });

            // Reset main views
            document.querySelectorAll('.results-panel > div').forEach(el => {
                if (el.id !== 'welcome-msg') el.classList.add('hidden');
            });
            document.getElementById('analysis-params').classList.add('hidden');

            // Default: Show Welcome Message (Empty State) -> Button Hidden
            // Only hide this if we immediately show results (logic below)
            document.getElementById('welcome-msg').classList.remove('hidden');

            // Monte Carlo special handling: If we have data, we might want to show it?
            // For now, consistent behavior: Show Welcome until user acts.
            if (mode === 'montecarlo' && typeof mcData !== 'undefined' && mcData.length > 0) {
                // Optional: Restore view if desired, but for now reset is safer
                // document.getElementById('welcome-msg').classList.add('hidden');
                // views.montecarlo.classList.remove('hidden');
            }


            document.getElementById('main-controls').classList.remove('hidden'); // Default show main controls

            // Hide secondary results containers by default
            const secondaryResults = [
                'multi-table-container', 'spc-violations-wrapper',
                'graphs-stats-table-container', 'pareto-table-container',
                'analysis-chart-container', 'stats-container',
                'tolerance-stats-wrapper', 'tolerance-normality-wrapper', 'tolerance-table-wrapper', 'tolerance-chart-container',
                'capability-chart-container', 'capability-results-wrapper',
                'hypothesis-summary-wrapper', 'hypothesis-groups-wrapper',
                'hypothesis-chart-container', 'spc-chart-container-1',
                'spc-chart-container-2', 'pareto-chart-container', 'mc-results-container',
                'msa-results-wrapper', 'msaInteractionChart', 'msaComponentsChart'
            ];
            secondaryResults.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });

            // --- BUG FIX: Ensure main controls and analyze button are visible by default ---
            // (They might be hidden by MC/Weibayes, and resetApp > switchTab needs them visible)
            const mainControls = document.getElementById('main-controls');
            if (mainControls) mainControls.classList.remove('hidden');

            const btnAnalyze = document.getElementById('btn-analyze');
            if (btnAnalyze) {
                btnAnalyze.classList.remove('hidden');
                btnAnalyze.disabled = false;
                if (typeof translations !== 'undefined' && translations[currentLang]) {
                    btnAnalyze.textContent = translations[currentLang].btnAnalyze;
                }
            }

            // Toggle full-width layout
            document.querySelector('.content').classList.remove('full-width');

            // Set Active Tab (Dropdown item handled above)
            // const activeTab = document.getElementById(`tab-${mode}`);
            // if (activeTab) activeTab.classList.add('active');

            // hasData already defined at top of function



            if (mode === 'regression') {
                if (hasData) document.getElementById('regression-view').classList.remove('hidden');
                document.getElementById('grp-regression-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');

                // Hide global column selector (redundant for regression)
                document.getElementById('column-selector-group').classList.add('hidden');

                updateRegressionColumns();
                // Standard main controls remain VISIBLE (default behavior of switchTab now)
                return;
            }

            if (mode === 'msa') {
                if (hasData) document.getElementById('msa-view').classList.remove('hidden');
                document.getElementById('grp-msa-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');

                // Hide results by default (User requirement: Only show on Analyze)
                document.getElementById('msa-results-wrapper').classList.add('hidden');
                document.getElementById('msa-chart-container').classList.add('hidden');

                // Clear previous results
                document.querySelector('#msaVarCompTable tbody').innerHTML = '';
                document.getElementById('msa-ndc-result').textContent = '';
                try {
                    Plotly.purge('msaComponentsChart');
                    Plotly.purge('msaInteractionChart');
                } catch (e) { console.log("No charts to purge"); }

                updateColumnSelectors(false); // Do not trigger analysis automatically
                return;
            }

            if (mode === 'montecarlo') {
                // Check if we have data to persist
                if (typeof mcData !== 'undefined' && mcData.length > 0) {
                    document.getElementById('welcome-msg').classList.add('hidden');
                    document.getElementById('montecarlo-view').classList.remove('hidden');
                } else {
                    document.getElementById('welcome-msg').classList.remove('hidden');
                    document.getElementById('montecarlo-view').classList.add('hidden');
                }

                document.getElementById('montecarlo-controls').classList.remove('hidden');
                document.getElementById('main-controls').classList.add('hidden');
                return;
            }

            if (mode === 'weibull') {
                resetWeibullUI();

                document.getElementById('grp-weibull-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');

                document.getElementById('grp-limit-value').classList.add('hidden');
                document.getElementById('grp-limit-type').classList.add('hidden');
                document.getElementById('column-selector-group').classList.add('hidden');
                return;
            }

            if (mode === 'weibayes') {
                document.getElementById('weibayes-view').classList.remove('hidden');
                document.getElementById('grp-weibayes-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');

                // Hide main analysis control components that aren't needed
                document.getElementById('grp-limit-value').classList.add('hidden');
                document.getElementById('grp-limit-type').classList.add('hidden');

                // Hide global inputs (Data Source, Decimal, Column Selector)
                const mainCtrl = document.getElementById('main-controls');
                if (mainCtrl) {
                    const children = mainCtrl.children;
                    // Usually: 0=Decimal, 1=File, 2=ColumnSelect, 3=Params
                    if (children[0]) children[0].classList.add('hidden');
                    if (children[1]) children[1].classList.add('hidden');
                    if (children[2]) children[2].classList.add('hidden');
                }

                // Check button state when entering tab
                if (typeof Weibayes !== 'undefined') {
                    Weibayes.checkDataState();
                }

                // Hide Analyze button for Weibayes mode
                const btnAnalyze = document.getElementById('btn-analyze');
                if (btnAnalyze) btnAnalyze.classList.add('hidden');

                return;
            }

            // For other modes, show welcome if no data
            if (!hasData) {
                document.getElementById('welcome-msg').classList.remove('hidden');
            }

            if (mode === 'normal' || mode === 'multi') {
                if (hasData) document.getElementById('analysis-view').classList.remove('hidden');
            } else if (mode === 'tolerance') {
                if (hasData) document.getElementById('tolerance-view').classList.remove('hidden');
                document.getElementById('grp-tolerance-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');
            } else if (mode === 'capability') {
                // Capability might need limit value/type/cap-limits?
                // Checking original logic, it seems they are always visible in main-controls or handled by updateMainControls?
                // In original code, these 'grp-limit-value' etc were NOT in the switchTab logic explicitly enabling them for capability.
                // They are usually static in main-controls. Let's verify if they correspond to specific sub-features.
                // Actually, inspecting HTML (from memory/previous views), 'grp-limit-value' etc are generic.
                // Let's assume they should be visible for Normal/Capability.
                // Wait, original code had them in `paramGroups`.
                // I'll stick to mostly fixing the cleanup.
                if (hasData) document.getElementById('capability-view').classList.remove('hidden');
            } else if (mode === 'hypothesis') {
                if (hasData) document.getElementById('hypothesis-view').classList.remove('hidden');
                document.getElementById('grp-hypothesis-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');
                updateHypothesisTestType();
            } else if (mode === 'spc') {
                if (hasData) document.getElementById('spc-view').classList.remove('hidden');
                document.getElementById('grp-spc-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');
                updateSpcControls();
            } else if (mode === 'graphs') {
                if (hasData) document.getElementById('graphs-view').classList.remove('hidden');
                document.getElementById('grp-graphs-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');
                updateGraphsControls(); // Prepare inputs
            } else if (mode === 'pareto') {
                if (hasData) document.getElementById('pareto-view').classList.remove('hidden');
                document.getElementById('grp-pareto-controls').classList.remove('hidden');
                document.getElementById('analysis-params').classList.remove('hidden');
                updateParetoControls();
            }
            // Show/Hide specific controls base on mode (Normal/Multi) if logic remains
            if (mode === 'normal' || mode === 'multi') {
                document.getElementById('analysis-params').classList.remove('hidden');
                // Limit controls logic...
                const isMulti = mode === 'multi';
                document.getElementById('grp-cap-limits').classList.add('hidden');
                document.getElementById('grp-limit-value').classList.remove('hidden');
                document.getElementById('grp-limit-type').classList.remove('hidden');
                document.getElementById('grp-tolerance-controls').classList.add('hidden');
            } else if (mode === 'tolerance') {
                document.getElementById('analysis-params').classList.remove('hidden');
                document.getElementById('grp-limit-value').classList.add('hidden');
                document.getElementById('grp-limit-type').classList.add('hidden');
                document.getElementById('grp-cap-limits').classList.add('hidden');
                document.getElementById('grp-tolerance-controls').classList.remove('hidden');
            } else if (mode === 'capability') {
                document.getElementById('analysis-params').classList.remove('hidden');
                document.getElementById('grp-limit-value').classList.add('hidden');
                document.getElementById('grp-limit-type').classList.add('hidden');
                document.getElementById('grp-cap-limits').classList.remove('hidden');
            } else if (mode !== 'hypothesis' && mode !== 'spc' && mode !== 'graphs' && mode !== 'pareto' && mode !== 'montecarlo' && mode !== 'regression') { // Added graphs, pareto, montecarlo, regression
                document.getElementById('grp-hypothesis-controls').classList.add('hidden');
                document.getElementById('grp-spc-controls').classList.add('hidden');
                document.getElementById('grp-limit-value').classList.add('hidden'); // Added this line
                document.getElementById('grp-limit-type').classList.add('hidden'); // Added this line
                document.getElementById('grp-cap-limits').classList.add('hidden'); // Added this line
            }

            // Hide general column selector by default, then show if needed
            document.getElementById('column-selector-group').classList.add('hidden');
            if (['normal', 'multi', 'tolerance', 'capability', 'spc', 'pareto'].includes(mode)) {
                document.getElementById('column-selector-group').classList.remove('hidden');
            }

            document.getElementById('btn-analyze').textContent = translations[currentLang].btnAnalyze;
            document.getElementById('btn-analyze').classList.remove('hidden');
            document.getElementById('btn-analyze').disabled = false; // Reset disabled state by default
            if (mode === 'montecarlo' || mode === 'weibayes') { // Hide main analyze button for MC and Weibayes
                document.getElementById('btn-analyze').classList.add('hidden');
            } else if (mode === 'graphs' || mode === 'pareto') {
                document.getElementById('btn-analyze').textContent = translations[currentLang].btnUpdate;
            }

            // Don't auto-run analysis when switching tabs
            // Results should only appear when user clicks the execution button
        }

        // --- MONTE CARLO LOGIC ---
        function updateMontecarloInputs() {
            const dist = document.getElementById('mc-dist').value;
            document.getElementById('mc-params-normal').classList.toggle('hidden', dist !== 'normal');
            document.getElementById('mc-params-lognormal').classList.toggle('hidden', dist !== 'lognormal');
            document.getElementById('mc-params-weibull').classList.toggle('hidden', dist !== 'weibull');
        }

        function randn_bm() {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        }

        function generateMontecarlo(redrawOnly = false) {
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
        }

        function transferMontecarloData() {
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
        }

        function copyMontecarloData() {
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

        // --- GRAPHS LOGIC (Descriptive Statistics) ---
        function updateGraphsControls() {
            if (currentMode !== 'graphs') return;
            const container = document.getElementById('graphs-num-cols');
            const groupSelect = document.getElementById('graphs-group-col');
            container.innerHTML = '';
            groupSelect.innerHTML = '<option value="" data-i18n="optNone">None</option>';

            Object.keys(dataset).forEach(col => {
                // Determine if numeric
                const isNumeric = dataset[col].some(v => typeof v === 'number' && !isNaN(v));

                if (isNumeric) {
                    const label = document.createElement('label');
                    label.className = 'ms-checkbox';
                    label.innerHTML = `<input type="checkbox" value="${col}" checked> <span class="checkmark"></span> ${col}`;
                    container.appendChild(label);
                }

                const opt = document.createElement('option');
                opt.value = col;
                opt.text = col;
                groupSelect.add(opt);
            });

            // Translate the "None" option and headers
            const noneOpt = groupSelect.querySelector('option[value=""]');
            if (noneOpt && translations[currentLang].optNone) noneOpt.textContent = translations[currentLang].optNone;
        }

        function analyzeGraphs() {
            // 1. Get Params
            const selectedCols = Array.from(document.querySelectorAll('#graphs-num-cols input:checked')).map(cb => cb.value);
            const groupCol = document.getElementById('graphs-group-col').value;
            const normalize = document.getElementById('graphNormalize').checked;

            const stats = {
                mean: document.getElementById('statMean').checked,
                median: document.getElementById('statMedian').checked,
                stdev: document.getElementById('statStdDev').checked,
                var: document.getElementById('statVar').checked,
                min: document.getElementById('statMin').checked,
                max: document.getElementById('statMax').checked,
                quartiles: document.getElementById('statQuartiles').checked
            };

            const charts = {
                hist: document.getElementById('showHist').checked,
                box: document.getElementById('showBox').checked,
                interval: document.getElementById('showInterval').checked
            };

            if (selectedCols.length === 0) {
                alert("Please select at least one numeric column.");
                return;
            }

            // 2. Prepare Data Structure
            // Data will be organized as: { groupLabel: { colName: [values] } }
            // If no groupCol, groupLabel = "All"
            let groupedData = {};

            // Get indices for grouping
            let groups = {}; // map index -> groupName
            if (groupCol) {
                dataset[groupCol].forEach((val, i) => {
                    const key = String(val);
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(i);
                });
            } else {
                const firstCol = Object.keys(dataset)[0];
                if (firstCol) {
                    groups["All"] = dataset[firstCol].map((_, i) => i);
                } else {
                    return; // No data
                }
            }

            // Extract values per group per selected col
            Object.keys(groups).forEach(gKey => {
                groupedData[gKey] = {};
                selectedCols.forEach(col => {
                    let vals = groups[gKey].map(idx => dataset[col][idx]).filter(v => v !== null && v !== undefined && !isNaN(v));
                    if (normalize) {
                        const mean = jStat.mean(vals);
                        const std = jStat.stdev(vals, true);
                        if (std !== 0) vals = vals.map(v => (v - mean) / std);
                    }
                    groupedData[gKey][col] = vals;
                });
            });

            // 3. Render Stats Table
            const tableContainer = document.getElementById('graphs-stats-table-container');
            const tbody = document.querySelector('#graphsStatsTable tbody');
            const thead = document.querySelector('#graphsStatsTable thead');
            tableContainer.classList.remove('hidden');
            tbody.innerHTML = '';
            thead.innerHTML = '';

            // Header
            let headers = ['Variable', 'Group'];
            if (stats.mean) headers.push('Mean');
            if (stats.stdev) headers.push('StDev');
            if (stats.var) headers.push('Var');
            if (stats.min) headers.push('Min');
            if (stats.max) headers.push('Max');
            if (stats.median) headers.push('Median');
            if (stats.quartiles) headers.push('Q1', 'Q3');

            const trHead = document.createElement('tr');
            headers.forEach(h => {
                const th = document.createElement('th');
                th.textContent = h;
                trHead.appendChild(th);
            });
            thead.appendChild(trHead);

            // Body
            selectedCols.forEach(col => {
                Object.keys(groupedData).forEach(grp => {
                    const vals = groupedData[grp][col];
                    if (vals.length === 0) return;

                    const row = document.createElement('tr');

                    // Basic info
                    row.innerHTML += `<td><b>${col}</b></td><td>${grp}</td>`;

                    if (stats.mean) row.innerHTML += `<td>${jStat.mean(vals).toFixed(4)}</td>`;
                    if (stats.stdev) row.innerHTML += `<td>${jStat.stdev(vals, true).toFixed(4)}</td>`;
                    if (stats.var) row.innerHTML += `<td>${jStat.variance(vals, true).toFixed(4)}</td>`;
                    if (stats.min) row.innerHTML += `<td>${jStat.min(vals).toFixed(4)}</td>`;
                    if (stats.max) row.innerHTML += `<td>${jStat.max(vals).toFixed(4)}</td>`;
                    if (stats.median) row.innerHTML += `<td>${jStat.median(vals).toFixed(4)}</td>`;
                    if (stats.quartiles) {
                        row.innerHTML += `<td>${jStat.percentile(vals, 0.25).toFixed(4)}</td>`;
                        row.innerHTML += `<td>${jStat.percentile(vals, 0.75).toFixed(4)}</td>`;
                    }
                    tbody.appendChild(row);
                });
            });

            // 4. Render Charts
            // 4. Render Charts
            const chartContainer = document.getElementById('graphs-charts-container');
            chartContainer.innerHTML = ''; // Clear previous

            const theme = getChartTheme(document.body.getAttribute('data-theme'));
            const baseLayout = {
                font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                xaxis: { gridcolor: theme.gridcolor }, yaxis: { gridcolor: theme.gridcolor },
                margin: { t: 40, r: 20, l: 50, b: 40 }
            };

            // Helper to create chart div
            const addChartDiv = (id, title) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-container';
                if (title) {
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'panel-title';
                    titleDiv.textContent = title;
                    wrapper.appendChild(titleDiv);
                }
                const div = document.createElement('div');
                div.id = id;
                div.style.width = '100%';
                div.style.height = '400px';
                wrapper.appendChild(div);
                chartContainer.appendChild(wrapper);
                return id;
            };

            // Aggregated Traces
            let allBoxTraces = [];
            let allHistTraces = [];
            let allIntervalX = [];
            let allIntervalY = [];
            let allIntervalErr = [];
            let allIntervalNames = []; // To keep track of colors/groups if needed for scatter

            selectedCols.forEach((col, idx) => {
                Object.keys(groupedData).forEach(grp => {
                    const vals = groupedData[grp][col];
                    if (!vals || vals.length === 0) return;

                    const traceName = grp === "All" ? col : `${col} (${grp})`;

                    // Boxplot Trace
                    if (charts.box) {
                        allBoxTraces.push({
                            y: vals,
                            type: 'box',
                            name: traceName,
                            boxpoints: 'outliers'
                        });
                    }

                    // Hist Trace
                    if (charts.hist) {
                        allHistTraces.push({
                            x: vals,
                            type: 'histogram',
                            name: traceName,
                            opacity: 0.6
                        });
                    }

                    // Interval Data (Scatter needs aggregation differently or multiple traces)
                    // For Interval Plot, usually it's X=Group/Col, Y=Mean. 
                    // To maintain color consistency, best to use separate traces if we want legend per col/group
                    // BUT "Interval Plot" usually plots means with error bars. 
                    // Let's create one trace PER COL/GROUP for Interval to match Boxplot style logic?
                    // Actually, if we want one chart, we can have X axis be the categories.
                });
            });

            // Interval Plot Construction (Standard logic: X = Name, Y = Mean)
            if (charts.interval) {
                selectedCols.forEach((col) => {
                    Object.keys(groupedData).forEach(grp => {
                        const vals = groupedData[grp][col];
                        if (!vals || vals.length === 0) return;

                        const traceName = grp === "All" ? col : `${col} (${grp})`;
                        const mean = jStat.mean(vals);
                        const stdev = jStat.stdev(vals, true);

                        allIntervalX.push(traceName);
                        allIntervalY.push(mean);
                        allIntervalErr.push(stdev);
                    });
                });
            }


            // Plot Combined Boxplot
            if (charts.box && allBoxTraces.length > 0) {
                const divId = addChartDiv('chart-box-combined', 'Combined Boxplot');
                const layout = {
                    ...JSON.parse(JSON.stringify(baseLayout)),
                    title: ""
                };
                Plotly.newPlot(divId, allBoxTraces, layout, { responsive: true });
            }

            // Plot Combined Histogram
            if (charts.hist && allHistTraces.length > 0) {
                const divId = addChartDiv('chart-hist-combined', 'Combined Histogram');
                const allHistValues = allHistTraces.flatMap(t => t.x || []);
                const histRange = getRangeWithPadding(allHistValues);
                const layout = {
                    ...JSON.parse(JSON.stringify(baseLayout)),
                    title: "",
                    barmode: 'overlay',
                    xaxis: { ...baseLayout.xaxis, type: 'linear', range: histRange || undefined },
                    yaxis: { ...baseLayout.yaxis, type: 'linear' }
                };
                Plotly.newPlot(divId, allHistTraces, layout, { responsive: true });

                const cdfTitle = (translations[currentLang] && translations[currentLang].lblCdfChart) || 'Cumulative Histogram (CDF)';
                const cdfId = addChartDiv('chart-hist-cdf-combined', cdfTitle);
                const cdfTraces = allHistTraces.map((trace, idx) => {
                    const series = getCdfSeries(trace.x);
                    return {
                        x: series.x,
                        y: series.y,
                        type: 'scatter',
                        mode: 'lines',
                        name: trace.name,
                        line: { width: 2 }
                    };
                });
                const cdfLayout = {
                    ...JSON.parse(JSON.stringify(baseLayout)),
                    title: "",
                    barmode: 'overlay',
                    xaxis: { ...baseLayout.xaxis, type: 'linear', range: histRange || undefined },
                    yaxis: { ...baseLayout.yaxis, title: (translations[currentLang].lblCdfAxis || 'Cumulative Probability'), rangemode: 'tozero' }
                };
                Plotly.newPlot(cdfId, cdfTraces, cdfLayout, { responsive: true });
            }

            // Plot Combined Interval Plot
            if (charts.interval && allIntervalX.length > 0) {
                const divId = addChartDiv('chart-int-combined', 'Combined Interval Plot');
                const layout = {
                    ...JSON.parse(JSON.stringify(baseLayout)),
                    title: ""
                };
                // Single trace for interval plot to connecting lines if desired, or markers.
                // Usually Interval plot compares means. Let's do markers with error bars.
                const trace = {
                    x: allIntervalX,
                    y: allIntervalY,
                    error_y: { type: 'data', array: allIntervalErr, visible: true },
                    type: 'scatter',
                    mode: 'markers', // lines+markers? No, discrete categories usually.
                    marker: { size: 12, color: theme.primary }
                };
                Plotly.newPlot(divId, [trace], layout, { responsive: true });
            }
        }

        // --- PARETO LOGIC ---
        function updateParetoControls() {
            if (currentMode !== 'pareto') return;
            const catSelect = document.getElementById('paretoCategoryCol');
            const valSelect = document.getElementById('paretoValueCol');

            catSelect.innerHTML = '';
            valSelect.innerHTML = '<option value="">None (Count Frequencies)</option>';

            const allCols = Object.keys(dataset);
            const numericCols = allCols.filter(col => dataset[col].some(v => typeof v === 'number' && !isNaN(v)));

            allCols.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col;
                opt.text = col;
                catSelect.add(opt);
            });

            numericCols.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col;
                opt.text = col;
                valSelect.add(opt);
            });

            // Translate the "None" option
            const noneOpt = valSelect.querySelector('option[value=""]');
            if (noneOpt && translations[currentLang].optNone) noneOpt.textContent = translations[currentLang].optNone;
        }

        function analyzePareto() {
            const catCol = document.getElementById('paretoCategoryCol').value;
            const valCol = document.getElementById('paretoValueCol').value;

            if (!catCol) return;

            // 1. Group Data
            const counts = {};
            dataset[catCol].forEach((cat, i) => {
                const key = String(cat);
                const val = valCol ? (dataset[valCol][i] || 0) : 1;
                if (!isNaN(val)) {
                    counts[key] = (counts[key] || 0) + val;
                }
            });

            // 2. Sort and Calculate
            const sorted = Object.entries(counts)
                .map(([cat, val]) => ({ cat, val }))
                .sort((a, b) => b.val - a.val);

            const total = sorted.reduce((sum, item) => sum + item.val, 0);
            let cumulative = 0;

            const data = sorted.map(item => {
                cumulative += item.val;
                return {
                    ...item,
                    percent: (item.val / total) * 100,
                    cumPercent: (cumulative / total) * 100
                };
            });

            // 3. Render Table
            const tbody = document.querySelector('#paretoTable tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.cat}</td>
                    <td>${item.val.toFixed(2)}</td>
                    <td>${item.percent.toFixed(2)}%</td>
                    <td>${item.cumPercent.toFixed(2)}%</td>
                `;
                tbody.appendChild(tr);
            });

            // 4. Render Chart
            const theme = getChartTheme(document.body.getAttribute('data-theme'));
            const tr = translations[currentLang];

            const traceBars = {
                x: data.map(d => d.cat),
                y: data.map(d => d.val),
                type: 'bar',
                name: tr.lblParetoImpact || 'Impact',
                marker: { color: theme.theme_primary || '#0078d4' }
            };

            const traceLine = {
                x: data.map(d => d.cat),
                y: data.map(d => d.cumPercent),
                type: 'scatter',
                mode: 'lines+markers',
                name: tr.lblParetoCum || 'Cumulative %',
                yaxis: 'y2',
                visible: document.getElementById('paretoShowCurve').checked,
                line: { color: theme.dangercolor || '#d83b01', width: 2 }
            };

            const refVal = parseFloat(document.getElementById('paretoRefLine').value);
            const shapes = [];
            if (!isNaN(refVal)) {
                shapes.push({
                    type: 'line',
                    xref: 'paper', yref: 'y2',
                    x0: 0, x1: 1, y0: refVal, y1: refVal,
                    line: { color: theme.dangercolor, width: 2, dash: 'dash' }
                });
            }

            const layout = {
                title: "",
                xaxis: { gridcolor: theme.gridcolor, type: 'category', automargin: true },
                yaxis: { title: tr.lblParetoImpact || 'Impact', gridcolor: theme.gridcolor, automargin: true },
                yaxis2: {
                    title: tr.lblParetoCum || 'Cumulative %',
                    overlaying: 'y',
                    side: 'right',
                    range: [0, 105],
                    showgrid: false,
                    automargin: true
                },
                font: theme.font,
                paper_bgcolor: theme.paper_bgcolor,
                plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 40, r: 50, l: 50, b: 60 },
                showlegend: true,
                legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
                shapes: shapes,
                bargap: 0.02,
                autosize: true
            };

            document.getElementById('pareto-chart-container').classList.remove('hidden');
            document.getElementById('pareto-table-container').classList.remove('hidden');

            Plotly.newPlot('paretoChart', [traceBars, traceLine], layout, { responsive: true });
            setTimeout(() => Plotly.Plots.resize('paretoChart'), 50);
        }

        // Global App Version
        const APP_VERSION = "v1.0";

        // --- DATA PARSING ---
        function handleFileUpload(input) {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('textInput').value = e.target.result;
                parseAndLoadData();
            };
            reader.readAsText(file);
        }



        function debounceParse() {
            clearTimeout(parseTimeout);
            parseTimeout = setTimeout(parseAndLoadData, 500);
        }

        function reparseData() {
            parseAndLoadData();
        }

        function parseAndLoadData() {
            const text = document.getElementById('textInput').value;
            const statusDiv = document.getElementById('data-status');
            const previewDiv = document.getElementById('preview-wrapper');
            weibullCurrentModel = null;

            if (!text.trim()) {
                previewDiv.classList.add('hidden');
                dataset = {}; rawDataset = {};
                return;
            }

            previewDiv.classList.remove('hidden');
            const decimalSep = document.getElementById('decimalSep').value;
            const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length === 0) return;

            // Fix: Robust Delimiter Detection (Scan first 5 lines)
            const candidates = [',', '\t', ';'];
            const previewLines = lines.slice(0, 5);

            let bestDelimiter = ',';
            let bestScore = -1;

            candidates.forEach(delim => {
                // Calculate consistency of column counts
                const counts = previewLines.map(l => l.split(delim).length);
                const maxCount = Math.max(...counts);
                const minCount = Math.min(...counts);

                // Score: Prefer more columns, but heavily penalize inconsistency
                // If perfectly consistent (max===min) and > 1 col, score is high
                let score = 0;
                if (maxCount > 1) {
                    if (maxCount === minCount) score = 1000 + maxCount; // Consistent
                    else score = maxCount - (maxCount - minCount) * 10; // Penalize variance
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestDelimiter = delim;
                }
            });

            let delimiter = bestDelimiter;

            const rawHeader = lines[0].split(delimiter).map(s => s.trim().replace(/"/g, ''));
            const cleanVal = (val) => {
                if (!val) return NaN;
                let v = val.trim().replace(/"/g, '');
                if (decimalSep === ',') v = v.replace(/\./g, '').replace(',', '.');
                return parseFloat(v);
            };

            let hasHeader = rawHeader.some(h => isNaN(cleanVal(h)) || h === "");

            dataset = {}; rawDataset = {};
            const colNames = hasHeader ? rawHeader : rawHeader.map((_, i) => `Column ${i + 1}`);
            colNames.forEach(n => { dataset[n] = []; rawDataset[n] = []; });

            let validRows = 0;
            const startRow = hasHeader ? 1 : 0;
            for (let i = startRow; i < lines.length; i++) {
                const cells = lines[i].split(delimiter);
                let rowHasData = false;
                colNames.forEach((col, idx) => {
                    if (cells[idx] !== undefined) {
                        const rawVal = cells[idx].trim().replace(/"/g, '');
                        const num = cleanVal(rawVal);
                        rawDataset[col].push(rawVal);
                        if (!isNaN(num)) {
                            dataset[col].push(num);
                            rowHasData = true;
                        }
                    }
                });
                if (rowHasData) validRows++;
            }

            Object.keys(dataset).forEach(key => { if (dataset[key].length === 0) delete dataset[key]; });

            const table = document.getElementById('previewTable');
            table.innerHTML = '';
            const thead = document.createElement('tr');
            Object.keys(rawDataset).forEach(col => { thead.innerHTML += `<th>${col}</th>`; });
            table.appendChild(thead);

            for (let i = 0; i < Math.min(5, lines.length - startRow); i++) {
                const tr = document.createElement('tr');
                Object.keys(rawDataset).forEach(col => { tr.innerHTML += `<td>${rawDataset[col][i] || ''}</td>`; });
                table.appendChild(tr);
            }

            const numCols = Object.keys(dataset).length;
            statusDiv.textContent = `Found ${numCols} numeric columns, ${validRows} rows.`;
            statusDiv.className = numCols > 0 ? 'success-msg' : 'error-msg';

            updateColumnSelectors();
            switchTab(currentMode); // Ensure UI updates (unhide views/controls)
            runAnalysis(false);
        }

        function updateColumnSelectors(triggerAnalysis = true) {
            const numericCols = Object.keys(dataset);
            const allCols = Object.keys(rawDataset);

            const selectors = [
                { el: document.getElementById('columnSelect'), cols: numericCols },
                { el: document.getElementById('spcSubgroupColumn'), cols: allCols, hasNone: true },
                { el: document.getElementById('hypoResponseCol'), cols: numericCols },
                { el: document.getElementById('hypoFactorCol'), cols: allCols },
                { el: document.getElementById('hypoSample1Col'), cols: numericCols },
                { el: document.getElementById('hypoSample2Col'), cols: numericCols },
                { el: document.getElementById('msaMeasurementCol'), cols: numericCols },
                { el: document.getElementById('msaPartCol'), cols: allCols },
                { el: document.getElementById('msaOperatorCol'), cols: allCols },
                { el: document.getElementById('weibull-failure-col'), cols: numericCols },
                { el: document.getElementById('weibull-censor-col'), cols: allCols, hasNone: true },
            ];

            selectors.forEach(s => {
                const prev = s.el.value;
                s.el.innerHTML = '';
                if (s.hasNone) s.el.innerHTML = `<option value="">- None -</option>`;

                s.cols.forEach(col => s.el.innerHTML += `<option value="${col}">${col}</option>`);

                if (s.cols.includes(prev)) s.el.value = prev;
            });

            if (!numericCols.includes(selectedColumnName)) {
                selectedColumnName = numericCols.length > 0 ? numericCols[0] : '';
                document.getElementById('columnSelect').value = selectedColumnName;
            }

            document.getElementById('column-selector-group').classList.toggle('hidden', currentMode === 'hypothesis' || currentMode === 'graphs' || currentMode === 'montecarlo' || currentMode === 'weibull' || currentMode === 'regression' || currentMode === 'weibayes');

            updateHypothesisTestType();
            updateRegressionColumns(); // Fix: Ensure regression columns update on data load
            if (triggerAnalysis) handleColumnChange();
        }

        function handleColumnChange() {
            selectedColumnName = document.getElementById('columnSelect').value;
            runAnalysis(false);
        }

        function showError(msg) {
            const el = document.getElementById('errorDisplay');
            el.textContent = msg;

            // User requested "hint" style (italic gray) for prompts like "Please enter..."
            // We reuse the .success-msg style or similar logic
            // User requested "hint" style (italic gray) for prompts like "Please enter..."
            // We reuse the .success-msg style or similar logic
            if (msg.startsWith("Please") || msg.startsWith("Need") || msg.startsWith("Por favor") || msg.startsWith("Necessário") || msg === translations[currentLang].errMsaSameCol) {
                el.className = "success-msg";
            } else {
                el.className = "error-msg";
            }
        }

        // --- MAIN ANALYSIS ROUTINE ---
        function runAnalysis(userInitiated = false) {
            console.log("runAnalysis called, currentMode:", currentMode);
            const hasData = Object.keys(dataset).length > 0;
            console.log("hasData:", hasData, "dataset keys:", Object.keys(dataset));

            document.getElementById('welcome-msg').classList.toggle('hidden', hasData);
            if (!hasData) {
                // Clear all views if no data
                ['analysis-view', 'tolerance-view', 'capability-view', 'hypothesis-view', 'spc-view', 'graphs-view', 'pareto-view', 'montecarlo-view', 'weibull-view'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('hidden');
                });
                return;
            }

            showError(""); // Clear previous errors

            switch (currentMode) {
                case 'montecarlo':
                    // Redraw Monte Carlo if data exists
                    if (mcData.length > 0) {
                        document.getElementById('montecarlo-view').classList.remove('hidden');
                        generateMontecarlo(true);
                    }
                    break;

                case 'graphs':
                    document.getElementById('graphs-view').classList.remove('hidden');
                    analyzeGraphs();
                    break;
                case 'pareto':
                    document.getElementById('pareto-view').classList.remove('hidden');
                    analyzePareto();
                    break;
                case 'regression':
                    document.getElementById('regression-view').classList.remove('hidden');
                    analyzeRegression();
                    break;
                case 'weibull':
                    if (!userInitiated) {
                        document.getElementById('weibull-view').classList.add('hidden');
                        document.getElementById('welcome-msg').classList.remove('hidden');
                        return;
                    }
                    analyzeWeibull();
                    break;
                case 'spc':
                    if (dataset[selectedColumnName] && dataset[selectedColumnName].length > 1) {
                        document.getElementById('spc-view').classList.remove('hidden');
                        analyzeSpc();
                    }
                    break;
                case 'capability':
                    if (dataset[selectedColumnName] && dataset[selectedColumnName].length > 1) {
                        document.getElementById('capability-view').classList.remove('hidden');
                        analyzeCapability();
                    }
                    break;
                case 'hypothesis':
                    document.getElementById('hypothesis-view').classList.remove('hidden');
                    analyzeHypothesis();
                    break;
                case 'multi':
                    const limitMulti = parseFloat(document.getElementById('limitValue').value);
                    // Limit is now optional
                    if (dataset[selectedColumnName] && dataset[selectedColumnName].length > 1) {
                        document.getElementById('analysis-view').classList.remove('hidden');
                        analyzeMulti(dataset[selectedColumnName], limitMulti, document.getElementById('limitType').value);
                    }
                    break;
                case 'regression':
                    document.getElementById('regression-view').classList.remove('hidden');
                    analyzeRegression();
                    break;
                case 'msa':
                    document.getElementById('msa-view').classList.remove('hidden');
                    analyzeMsa();
                    break;
                case 'normal':
                    const limitNorm = parseFloat(document.getElementById('limitValue').value);
                    // Limit is now optional, so we don't return on NaN
                    if (dataset[selectedColumnName] && dataset[selectedColumnName].length > 1) {
                        document.getElementById('analysis-view').classList.remove('hidden');
                        analyzeNormal(dataset[selectedColumnName], limitNorm, document.getElementById('limitType').value);
                    }
                    break;
                case 'tolerance':
                    if (dataset[selectedColumnName] && dataset[selectedColumnName].length > 1) {
                        document.getElementById('tolerance-view').classList.remove('hidden');
                        analyzeTolerance(dataset[selectedColumnName]);
                    }
                    break;
            }
        }

        // --- MATH & STATS HELPERS (CDF, PDF etc.) ---
        const getMin = (arr) => Math.min(...arr);
        const getMax = (arr) => Math.max(...arr);
        const getMean = (data) => data.reduce((a, b) => a + b, 0) / data.length;
        const getSum = (data) => data.reduce((a, b) => a + b, 0);
        const getStd = (data, mean) => {
            if (data.length < 2) return 0;
            const m = mean === undefined ? getMean(data) : mean;
            return Math.sqrt(data.map(x => (x - m) ** 2).reduce((a, b) => a + b) / (data.length - 1));
        };
        function erf(x) {
            var sign = (x >= 0) ? 1 : -1; x = Math.abs(x);
            var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
            var t = 1.0 / (1.0 + p * x);
            var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
            return sign * y;
        }
        const normalCDF = (x, mean, std) => {
            if (std <= 0) return x >= mean ? 1.0 : 0.0;
            return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
        }
        const normalPDF = (x, mean, std) => {
            if (std <= 0) return 0;
            return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
        }
        const normalInv = (p) => {
            if (typeof jStat !== 'undefined') return jStat.normal.inv(p, 0, 1);
            if (p <= 0 || p >= 1) return 0;
            const a1 = -3.969683028665376e+01, a2 = 2.209460984245205e+02,
                a3 = -2.759285104469687e+02, a4 = 1.383577518672690e+02,
                a5 = -3.066479806614716e+01, a6 = 2.506628277459239e+00;
            const b1 = -5.447609879822406e+01, b2 = 1.615858368580409e+02,
                b3 = -1.556989798598866e+02, b4 = 6.680131188771972e+01,
                b5 = -1.328068155288572e+01;
            const c1 = -7.784894002430293e-03, c2 = -3.223964580411365e-01,
                c3 = -2.400758277161838e+00, c4 = -2.549732539343734e+00,
                c5 = 4.374664141464968e+00, c6 = 2.938163982698783e+00;
            const d1 = 7.784695709041462e-03, d2 = 3.224671290700398e-01,
                d3 = 2.445134137142996e+00, d4 = 3.754408661907416e+00;
            let q = p - 0.5;
            let r, t;
            if (Math.abs(q) <= 0.42) {
                t = q * q;
                r = q * (((((a1 * t + a2) * t + a3) * t + a4) * t + a5) * t + a6) / (((((b1 * t + b2) * t + b3) * t + b4) * t + b5) * t + 1);
            } else {
                t = (q > 0) ? 1 - p : p;
                r = Math.sqrt(-Math.log(t));
                r = (((((c1 * r + c2) * r + c3) * r + c4) * r + c5) * r + c6) / ((((d1 * r + d2) * r + d3) * r + d4) * r + 1);
                if (q < 0) r = -r;
            }
            return r;
        };
        const chiSqInv = (p, df) => {
            if (typeof jStat !== 'undefined') return jStat.chisquare.inv(p, df);
            if (df <= 0) return NaN;
            const z = normalInv(p);
            return df * Math.pow(1 - (2 / (9 * df)) + z * Math.sqrt(2 / (9 * df)), 3);
        };
        const calcSkewness = (data, mean, std) => {
            if (data.length < 3 || std === 0) return 0;
            const n = data.length;
            const sum = data.reduce((acc, v) => acc + Math.pow((v - mean) / std, 3), 0);
            return (n / ((n - 1) * (n - 2))) * sum;
        };
        const calcNonParametricConfidence = (n, prop) => {
            if (n < 2) return 0;
            const term1 = n * Math.pow(prop, n - 1);
            const term2 = (n - 1) * Math.pow(prop, n);
            return Math.max(0, 1 - term1 + term2);
        };
        const getCdfSeries = (data) => {
            const sorted = [...data].filter(v => v !== null && v !== undefined && !isNaN(v)).sort((a, b) => a - b);
            const n = sorted.length;
            if (n === 0) return { x: [], y: [] };
            const x = [];
            const y = [];
            for (let i = 0; i < n; i++) {
                x.push(sorted[i]);
                y.push((i + 1) / n);
            }
            return { x, y };
        };
        const getRangeWithPadding = (values, padRatio = 0.2) => {
            const clean = values.filter(v => v !== null && v !== undefined && !isNaN(v));
            if (clean.length === 0) return null;
            const minVal = Math.min(...clean);
            const maxVal = Math.max(...clean);
            const range = maxVal - minVal;
            const pad = range === 0 ? 1 : range * padRatio;
            return [minVal - pad, maxVal + pad];
        };
        const calcToleranceKFactor = (n, conf, prop) => {
            const z = normalInv((1 + prop) / 2);
            const df = n - 1;
            const chi2 = chiSqInv(1 - conf, df);
            if (!isFinite(z) || !isFinite(chi2) || chi2 <= 0) return NaN;
            return Math.sqrt((df * (1 + 1 / n) * z * z) / chi2);
        };

        // --- ADVANCED STATS (BETA, GAMMA, T, F distributions) ---
        // Using public domain approximations for self-containment
        const logGamma = (z) => {
            if (z < 0.5) return Math.log(Math.PI / (Math.sin(Math.PI * z) * Math.exp(logGamma(1 - z))));
            z -= 1;
            var x = 0.99999999999980993;
            var c = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
            for (var i = 0; i < c.length; i++) x += c[i] / (z + i + 1);
            return Math.log(Math.sqrt(2 * Math.PI)) + (z + 0.5) * Math.log(z + c.length - 0.5) - (z + c.length - 0.5) + Math.log(x);
        };

        const incompleteBeta = (x, a, b) => {
            if (x < 0 || x > 1) return 0;
            if (x === 0) return 0;
            if (x === 1) return 1;
            const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
            if (x < (a + 1) / (a + b + 2)) return bt * continuedFraction(x, a, b) / a;
            return 1 - bt * continuedFraction(1 - x, b, a) / b;
        };

        const continuedFraction = (x, a, b) => {
            const fpmin = 1e-30;
            let m = 1, m2;
            let aa, c, d, del, h;
            c = 1; d = 1 / (1 - (a + b) * x / (a + 1)); h = d;

            for (m = 1; m <= 100; m++) {
                m2 = 2 * m;
                aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
                d = 1 + aa * d;
                if (Math.abs(d) < fpmin) d = fpmin;
                c = 1 + aa / c;
                if (Math.abs(c) < fpmin) c = fpmin;
                d = 1 / d;
                h *= d * c;
                aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
                d = 1 + aa * d;
                if (Math.abs(d) < fpmin) d = fpmin;
                c = 1 + aa / c;
                if (Math.abs(c) < fpmin) c = fpmin;
                d = 1 / d;
                del = d * c;
                h *= del;
                if (Math.abs(del - 1.0) < 3e-7) break;
            }
            return h;
        };

        const inverseIncompleteBeta = (p, a, b) => {
            if (p <= 0) return 0;
            if (p >= 1) return 1;
            let x, a1, b1, lna, lnb, t, u, err, g, h;
            const e = 1e-8;
            if (a >= 1 && b >= 1) {
                a1 = a - 1; b1 = b - 1;
                if (p < 0.5) { t = Math.sqrt(-2 * Math.log(p)); u = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t); }
                else { t = Math.sqrt(-2 * Math.log(1 - p)); u = -(t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t)); }
                x = a / (a + b * Math.exp(2 * u / Math.sqrt((a + b - 2 / 3) / (2 * a * b))));
            } else {
                lna = Math.log(p * a) / a; lnb = Math.log((1 - p) * b) / b;
                t = Math.exp(lna + lnb);
                x = t / (1 + t);
            }
            for (let i = 0; i < 10; i++) {
                err = incompleteBeta(x, a, b) - p;
                t = Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) + logGamma(a + b) - logGamma(a) - logGamma(b));
                u = err / t;
                x -= u / (1 - 0.5 * u * ((a - 1) / x - (b - 1) / (1 - x)));
                if (x <= 0) x = 0.5 * (x + u);
                if (x >= 1) x = 0.5 * (x + u + 1);
                if (Math.abs(u) < e * x && i > 0) break;
            }
            return x;
        };

        const tCdf = (t, df) => {
            const x = df / (df + t * t);
            return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
        };

        const inverseTCdf = (p, df) => {
            const x = inverseIncompleteBeta(2 * Math.min(p, 1 - p), df / 2, 0.5);
            const t = Math.sqrt(df * (1 - x) / x);
            return p < 0.5 ? -t : t;
        };

        const fCdf = (f, df1, df2) => {
            const x = (df1 * f) / (df1 * f + df2);
            return incompleteBeta(x, df1 / 2, df2 / 2);
        };

        function weibullCDF(x, k, lambda) { if (x < 0) return 0; return 1 - Math.exp(-Math.pow(x / lambda, k)); }
        function weibullPDF(x, k, lambda) { if (x < 0 || k <= 0 || lambda <= 0) return 0; return (k / lambda) * Math.pow(x / lambda, k - 1) * Math.exp(-Math.pow(x / lambda, k)); }
        function exponCDF(x, lambda) { if (x < 0) return 0; return 1 - Math.exp(-lambda * x); }
        function exponPDF(x, lambda) { if (x < 0) return 0; return lambda * Math.exp(-lambda * x); }
        function lognormCDF(x, mu, sigma) { if (x <= 0) return 0; return normalCDF(Math.log(x), mu, sigma); }
        function lognormPDF(x, mu, sigma) { if (x <= 0 || sigma <= 0) return 0; return (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma)); }

        // SPC Constants Table
        const SPC_CONSTANTS = {
            n: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
            A2: [1.880, 1.023, 0.729, 0.577, 0.483, 0.419, 0.373, 0.337, 0.308, 0.285, 0.266, 0.249, 0.235, 0.223, 0.212, 0.203, 0.194, 0.187, 0.180, 0.173, 0.167, 0.162, 0.157, 0.153],
            d2: [1.128, 1.693, 2.059, 2.326, 2.534, 2.704, 2.847, 2.970, 3.078, 3.173, 3.258, 3.336, 3.407, 3.472, 3.532, 3.588, 3.640, 3.689, 3.735, 3.778, 3.819, 3.858, 3.895, 3.931],
            D3: [0, 0, 0, 0, 0, 0.076, 0.136, 0.184, 0.223, 0.256, 0.283, 0.307, 0.328, 0.347, 0.363, 0.378, 0.391, 0.403, 0.415, 0.425, 0.434, 0.443, 0.451, 0.459],
            D4: [3.267, 2.574, 2.282, 2.114, 2.004, 1.924, 1.864, 1.816, 1.777, 1.744, 1.717, 1.693, 1.672, 1.653, 1.637, 1.622, 1.608, 1.597, 1.585, 1.575, 1.566, 1.557, 1.548, 1.541]
        };
        function getSpcConstant(constant, n) {
            const index = SPC_CONSTANTS.n.indexOf(n);
            if (index === -1) return null;
            return SPC_CONSTANTS[constant][index];
        }

        // --- HYPOTHESIS TESTING ---
        function updateHypothesisTestType() {
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
        }

        function analyzeHypothesis() {
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

            Plotly.purge('hypothesisChart');

            let results;
            let groups = {};

            try {
                if (testType === 'ttest1') {
                    if (!responseCol) { showError(translations[currentLang].errSelectResponse); return; }
                    const responseData = dataset[responseCol];
                    if (isNaN(muTarget)) throw new Error(translations[currentLang].errTargetMean);
                    results = runOneSampleTTest(responseData, muTarget);
                    results.groupNames = ["All Data"];
                    groups["All Data"] = responseData;

                } else if (testType === 'ttest2') {
                    if (!sample1Col || !sample2Col) throw new Error("Please select two distinct columns for the 2-sample t-test.");
                    if (sample1Col === sample2Col) throw new Error("Please select two distinct columns for the 2-sample t-test.");
                    const g1 = dataset[sample1Col];
                    const g2 = dataset[sample2Col];
                    const equalVars = document.getElementById('hypoEqualVariances').checked;
                    results = runTTest(g1, g2, equalVars);
                    results.groupNames = [sample1Col, sample2Col]; // Use column names as group names
                    groups[sample1Col] = g1;
                    groups[sample2Col] = g2;

                } else if (testType === 'paired') {
                    if (!sample1Col || !sample2Col) throw new Error("Please select two distinct columns for the paired t-test.");
                    if (sample1Col === sample2Col) throw new Error("Please select two distinct columns for the paired t-test.");
                    const g1 = dataset[sample1Col];
                    const g2 = dataset[sample2Col];
                    results = runPairedTTest(g1, g2);
                    results.groupNames = [sample1Col, sample2Col];
                    groups[sample1Col] = g1;
                    groups[sample2Col] = g2;

                } else if (testType === 'ftest') {
                    if (!sample1Col || !sample2Col) throw new Error("Please select two distinct columns for the F-test.");
                    if (sample1Col === sample2Col) throw new Error("Please select two distinct columns for the F-test.");
                    const g1 = dataset[sample1Col];
                    const g2 = dataset[sample2Col];
                    results = runFTest(g1, g2);
                    results.groupNames = [sample1Col, sample2Col];
                    groups[sample1Col] = g1;
                    groups[sample2Col] = g2;

                } else { // ANOVA (and fallback for old logic)
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
                        results = runAnova(groupArrays);
                        results.groupNames = groupKeys;
                    }
                }

                renderHypothesisResults(results);
                plotHypothesisChart(groups);

            } catch (e) {
                showError(e.message);
            }
        }

        function runOneSampleTTest(data, mu) {
            const n = data.length;
            if (n < 2) throw new Error(translations[currentLang].errMinData);

            const mean = getMean(data);
            const std = getStd(data, mean);
            const stdErr = std / Math.sqrt(n);
            const t = (mean - mu) / stdErr;
            const df = n - 1;

            const pValue = 2 * (1 - tCdf(Math.abs(t), df));

            // CI
            const alpha = parseFloat(document.getElementById('hypoAlpha').value);
            const t_crit = inverseTCdf(1 - alpha / 2, df);
            const ci_lower = mean - t_crit * stdErr;
            const ci_upper = mean + t_crit * stdErr;

            return {
                testName: translations[currentLang].optTTest1 || "1-Sample t-test",
                t, df, pValue,
                ci: [ci_lower, ci_upper],
                groups: [data],
                mu: mu // Pass mu to results
            };
        }

        function runTTest(g1, g2, equalVariances) {
            const n1 = g1.length, n2 = g2.length;
            if (n1 < 2 || n2 < 2) throw new Error(translations[currentLang].errMinDataGroups);

            const mean1 = getMean(g1), mean2 = getMean(g2);
            const var1 = getStd(g1, mean1) ** 2, var2 = getStd(g2, mean2) ** 2;

            let t, df, stdErr;
            if (equalVariances) { // Student's t-test
                const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
                stdErr = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
                t = (mean1 - mean2) / stdErr;
                df = n1 + n2 - 2;
            } else { // Welch's t-test
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
        }

        function runPairedTTest(g1, g2) {
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
        }

        function runFTest(g1, g2) {
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
        }

        function runAnova(groups) {
            const k = groups.length;
            if (k < 3) throw new Error(translations[currentLang].errThreeGroups);

            const allData = [].concat(...groups);
            const N = allData.length;
            const overallMean = getMean(allData);

            let ssb = 0; // Sum of squares between
            const groupMeans = groups.map(g => getMean(g));
            for (let i = 0; i < k; i++) {
                ssb += groups[i].length * (groupMeans[i] - overallMean) ** 2;
            }
            const df_between = k - 1;
            const msb = ssb / df_between;

            let ssw = 0; // Sum of squares within
            for (let i = 0; i < k; i++) {
                const mean = groupMeans[i];
                ssw += groups[i].map(val => (val - mean) ** 2).reduce((a, b) => a + b, 0);
            }
            const df_within = N - k;
            const msw = ssw / df_within;

            const F = msb / msw;
            const pValue = 1 - fCdf(F, df_between, df_within);

            return { testName: translations[currentLang].testAnova, F, df_between, df_within, pValue, groups };
        }

        function renderHypothesisResults(results) {
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
            results.groups.forEach((g, i) => {
                const mean = getMean(g);
                const std = getStd(g, mean);
                const row = groupsTableBody.insertRow();

                // Check if it's 1-sample t-test to display target mean (mu)
                let targetMeanCell = '';
                if (results.testName.includes(translations[currentLang].optTTest1) || results.mu !== undefined) {
                    // Add header if not present - logic handled below or dynamically
                }

                // Actually we need to update the header first
            });

            // Dynamic Header Update
            const groupsTableHead = document.getElementById('hypothesisGroupsTable').querySelector('thead tr');
            // Reset to default
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
        }

        function plotHypothesisChart(groups) {
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

        // --- SPC ANALYSIS ---
        function analyzeSpc() {
            const data = dataset[selectedColumnName];
            Plotly.purge('spcChart');
            Plotly.purge('spcChartSecondary');
            document.getElementById('spcViolationsTable').querySelector('tbody').innerHTML = '';
            document.getElementById('spc-violations-wrapper').classList.add('hidden');

            const chartType = document.getElementById('spcChartType').value;

            try {
                document.getElementById('spc-chart-container-1').classList.remove('hidden');
                document.getElementById('spc-chart-container-2').classList.remove('hidden');
                if (chartType === 'imr') analyzeIMR(data);
                else if (chartType === 'xbarr') analyzeXbarR(data);
            } catch (e) {
                showError(e.message);
            }
        }

        function analyzeIMR(data) {
            if (data.length < 2) throw new Error("I-MR chart requires at least 2 data points.");
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
            const violations = checkSpcRules(data, meanI, sigma);

            // Plot
            plotSpcChart('spcChart', 'Individual (I) Chart', data, meanI, ucl_I, lcl_I, violations.map(v => v.index));
            plotSpcChart('spcChartSecondary', 'Moving Range (MR) Chart', mr, meanMR, ucl_MR, lcl_MR, [], 1);
            displayViolations(violations);
        }

        function analyzeXbarR(data) {
            const subgroupColName = document.getElementById('spcSubgroupColumn').value;
            if (!subgroupColName) throw new Error("Subgroup column is required for Xbar-R chart.");

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
            const violations = checkSpcRules(xbars, xbarDouble, sigma, subgroupStats.map(s => s.key));

            // Plot
            plotSpcChart('spcChart', 'X-bar Chart', xbars, xbarDouble, ucl_xbar, lcl_xbar, violations.map(v => v.index), 0, subgroupStats.map(s => s.key));
            plotSpcChart('spcChartSecondary', 'Range (R) Chart', ranges, rbar, ucl_r, lcl_r, [], 0, subgroupStats.map(s => s.key));
            displayViolations(violations);
        }

        function checkSpcRules(data, cl, sigma, labels = null) {
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
        }

        function plotSpcChart(divId, title, data, cl, ucl, lcl, violationIndices = [], startIndex = 0, labels = null) {
            const theme = getChartTheme(document.body.getAttribute('data-theme'));
            const x_axis = labels ? labels : Array.from({ length: data.length }, (_, i) => i + 1 + startIndex);

            const traces = [
                // UCL line
                { x: x_axis, y: Array(data.length).fill(ucl), mode: 'lines', name: 'UCL', line: { color: theme.dangercolor, dash: 'dash' } },
                // CL line
                { x: x_axis, y: Array(data.length).fill(cl), mode: 'lines', name: 'CL', line: { color: theme.font.color, width: 1 } },
                // LCL line
                { x: x_axis, y: Array(data.length).fill(lcl), mode: 'lines', name: 'LCL', line: { color: theme.dangercolor, dash: 'dash' } },
                // Data points (in control)
                { x: x_axis, y: data, mode: 'lines+markers', name: 'Data', line: { color: theme.theme_primary || '#0078d4' }, marker: { size: 6 } },
            ];

            if (violationIndices.length > 0) {
                const violation_x = violationIndices.map(i => x_axis[i]);
                const violation_y = violationIndices.map(i => data[i]);
                traces.push({
                    x: violation_x, y: violation_y, mode: 'markers', name: 'Violation',
                    marker: { color: theme.dangercolor, size: 10, symbol: 'x' }
                });
            }

            const layout = {
                title,
                xaxis: { title: 'Sample Index', gridcolor: theme.gridcolor, type: labels ? 'category' : 'linear' },
                yaxis: { title: 'Value', gridcolor: theme.gridcolor, zeroline: false },
                showlegend: true, legend: { orientation: 'h', y: -0.2 },
                font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 50, r: 20, l: 60, b: 50 }
            };
            Plotly.newPlot(divId, traces, layout, { responsive: true });
            setTimeout(() => Plotly.Plots.resize(divId), 50);
        }

        function displayViolations(violations) {
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
        }


        // --- CAPABILITY ANALYSIS ---
        function analyzeCapability() {
            const data = dataset[selectedColumnName];

            // Check if data exists
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
                Plotly.purge('capChart');
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
                fit = findBestFit(data);
                document.getElementById('cap-dist-label').textContent = `(${translations[currentLang].cardBest}: ${fit.name})`;
                cdf = (x, s) => fit.cdf(x);
                pdf = (x, s) => fit.pdf(x);

                // Show Overall indices for Best Fit (but keep within hidden)
                document.getElementById('cap-indices-within').classList.add('hidden');
                document.getElementById('cap-indices-overall').classList.remove('hidden');
            }

            // Performance Calculations
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

            // Standard Capability Indices (only for normal) or Equivalent for Best Fit
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

            // For Overall Best-Fit, calculate Ppk equivalent from PPM
            // Ppk = Z_min / 3
            // Z_min = -NormInv(P_defect)
            let overallIndices = calcIndices(sigmaOverall); // normal default

            if (method !== 'normal' && fit) {
                // Calculate equivalent Pp indices based on Performance (PPM)
                // This is the Benchmarking Z method

                // Inverse Normal CDF approx (probit)
                const probit = (p) => {
                    if (p <= 0 || p >= 1) return 0; // fallback
                    // A simple approximation for probit function could be added or use jStat if available. 
                    // Let's use a standard approximation for Z-score from probability
                    // Beasley-Springer-Moro Algorithm is common but let's use a simpler approx for now
                    // Or since we have jStat loaded: jStat.normal.inv(p, 0, 1)
                    if (typeof jStat !== 'undefined') return jStat.normal.inv(p, 0, 1);
                    return 0; // Fallback if jstat missing? It is included in head.
                };

                const pTotal = overallPerf.pctTotal / 100;
                const pLower = overallPerf.pctLower / 100;
                const pUpper = overallPerf.pctUpper / 100;

                let pp = null, ppl = null, ppu = null, ppk = null;

                // Ppl = (Median - LSL) / (Median - X_0.135%) ? No, usually just Z_lower/3
                // Z_lower = probit(pLower) 

                if (!isNaN(lsl)) ppl = pLower > 0 ? (probit(1 - pLower) / 3) : 99; // If pLower near 0, Z is high
                if (!isNaN(usl)) ppu = pUpper > 0 ? (probit(1 - pUpper) / 3) : 99;

                if (ppl !== null && ppu !== null) ppk = Math.min(ppl, ppu);
                else if (ppl !== null) ppk = ppl;
                else if (ppu !== null) ppk = ppu;

                // Pp roughly estimated from total spread? Standard ISO is (USL-LSL)/(X_99.865 - X_0.135)
                // We'd need quantiles for that.
                // Let's stick seamlessly to Ppk (Z-bench) for now as it's most robust for non-normals.
                // Or try to approximate quantiles if possible.
                // Let's use Ppk only? User asked for info not to disappear.

                // Let's set the calculated values to overallIndices object
                overallIndices = { cp: null, cpl: ppl, cpu: ppu, cpk: ppk };
            }

            let cpm = null;
            if (!isNaN(target) && !isNaN(lsl) && !isNaN(usl) && sigmaOverall > 0) {
                cpm = (usl - lsl) / (6 * Math.sqrt(sigmaOverall ** 2 + (mean - target) ** 2));
            }

            // --- Update UI ---
            const fmt = (v) => v !== null && v !== undefined && isFinite(v) ? v.toFixed(3) : '-';
            const fmtPPM = (v) => v !== null && v !== undefined && isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-';
            const fmtPCT = (v) => v !== null && v !== undefined && isFinite(v) ? v.toFixed(4) + '%' : '-';

            // Process Data
            document.getElementById('val-lsl').textContent = isNaN(lsl) ? '-' : lsl;
            document.getElementById('val-usl').textContent = isNaN(usl) ? '-' : usl;
            document.getElementById('val-target').textContent = isNaN(target) ? '-' : target;
            document.getElementById('val-mean').textContent = fmt(mean);
            document.getElementById('val-n').textContent = data.length;

            // Indices
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

            // Performance
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

            // Plot
            try {
                plotCapabilityChart(data, mean, pdf, sigmaOverall, sigmaWithin, lsl, usl, target, method);
            } catch (error) {
                console.error("Error in plotCapabilityChart:", error);
                showError("Error generating capability chart: " + error.message);
            }
        }

        function plotCapabilityChart(data, mean, pdf, sigmaOverall, sigmaWithin, lsl, usl, target, method) {
            document.getElementById('capability-chart-container').classList.remove('hidden');
            document.getElementById('capability-results-wrapper').classList.remove('hidden');

            const minVal = getMin(data), maxVal = getMax(data);
            const plotRange = Math.max(maxVal, usl || -Infinity) - Math.min(minVal, lsl || Infinity);
            const buffer = plotRange * 0.2;
            const plotMin = Math.min(minVal, lsl || Infinity) - buffer;
            const plotMax = Math.max(maxVal, usl || Infinity) + buffer;

            const xVals = Array.from({ length: 201 }, (_, i) => plotMin + (i / 200) * (plotMax - plotMin));
            const theme = getChartTheme(document.body.getAttribute('data-theme'));

            const traces = [
                { x: data, type: 'histogram', name: 'Data', histnorm: 'probability density', marker: { color: theme.theme_primary, opacity: 0.4 } }
            ];

            if (method === 'normal') {
                traces.push({ x: xVals, y: xVals.map(x => pdf(x, sigmaOverall)), type: 'scatter', mode: 'lines', name: 'Overall', line: { color: theme.dangercolor, width: 2 } });
                traces.push({ x: xVals, y: xVals.map(x => pdf(x, sigmaWithin)), type: 'scatter', mode: 'lines', name: 'Within', line: { color: theme.font.color, width: 2, dash: 'dash' } });
            } else {
                traces.push({ x: xVals, y: xVals.map(x => pdf(x)), type: 'scatter', mode: 'lines', name: 'Best Fit', line: { color: theme.dangercolor, width: 2 } });
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
                annotations.push({ x: target, y: 0.5, yref: 'paper', text: 'Target', showarrow: false, yshift: 10, xshift: -30 });
            }

            const capTitleEl = document.getElementById('capChartTitle');
            if (capTitleEl) capTitleEl.textContent = `Capability Analysis: ${selectedColumnName}`;

            Plotly.newPlot('capChart', traces, {
                title: "", xaxis: { title: 'Value', gridcolor: theme.gridcolor, range: [plotMin, plotMax] }, yaxis: { title: 'Density', gridcolor: theme.gridcolor },
                showlegend: true, shapes: shapes, annotations: annotations, font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 50, r: 20, l: 50, b: 50 }, legend: { orientation: 'h', y: -0.2 }
            }, { responsive: true });

            setTimeout(() => Plotly.Plots.resize('capChart'), 50);
        }


        // --- NORMAL/MULTI-DIST ANALYSIS ---
        function findBestFit(data) {
            const mean = getMean(data);
            const std = getStd(data, mean);
            const sortedData = [...data].sort((a, b) => a - b);
            const n = sortedData.length;

            const fits = [];
            fits.push({ name: 'Normal', pdf: (x) => normalPDF(x, mean, std), cdf: (x) => normalCDF(x, mean, std), params: { mean, std }, pStr: `μ=${mean.toFixed(2)}, σ=${std.toFixed(2)}` });

            if (data.every(x => x > 0)) {
                const logData = data.map(x => Math.log(x));
                const meanLog = getMean(logData), stdLog = getStd(logData, meanLog);
                if (stdLog > 0) fits.push({ name: 'Lognormal', pdf: (x) => lognormPDF(x, meanLog, stdLog), cdf: (x) => lognormCDF(x, meanLog, stdLog), params: { mu: meanLog, sigma: stdLog }, pStr: `Log-μ=${meanLog.toFixed(2)}, Log-σ=${stdLog.toFixed(2)}` });

                if (mean > 0) fits.push({ name: 'Exponential', pdf: (x) => exponPDF(x, 1 / mean), cdf: (x) => exponCDF(x, 1 / mean), params: { lambda: 1 / mean }, pStr: `λ=${(1 / mean).toFixed(4)}` });

                // Simplified parameter estimation for Weibull for robustness
                const k_weibull = (std / mean) ** (-1.086);
                const lambda_weibull = mean / Math.exp(logGamma(1 + 1 / k_weibull));
                if (k_weibull > 0 && lambda_weibull > 0) fits.push({ name: 'Weibull', pdf: (x) => weibullPDF(x, k_weibull, lambda_weibull), cdf: (x) => weibullCDF(x, k_weibull, lambda_weibull), params: { k: k_weibull, lambda: lambda_weibull }, pStr: `k=${k_weibull.toFixed(2)}, λ=${lambda_weibull.toFixed(2)}` });
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
        }


        function analyzeNormal(data, limit, limitType) {
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
            plotMultiDistribution(data, limit, [fit]);
        }

        function analyzeTolerance(data) {
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

            const adStat = calculateAD(data, (x) => normalCDF(x, mean, std));
            const adP = calculateADPValue(adStat, n, 'Normal');
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

            plotToleranceChart(data, mean, std, normLower, normUpper, minVal, maxVal, !isNormal);
        }

        function plotToleranceChart(data, mean, std, normLower, normUpper, minVal, maxVal, showNonParam) {
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
                name: tr.lblTolLimitNormal || 'Normal Limits',
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
                    name: tr.lblTolLimitRange || 'Range Limits',
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

        function analyzeMulti(data, limit, limitType) {
            const fits = [];
            const theme = getChartTheme(document.body.getAttribute('data-theme'));
            const colors = { 'Normal': theme.dangercolor, 'Lognormal': theme.successcolor, 'Weibull': theme.warningcolor, 'Exponential': theme.theme_primary };

            const bestFit = findBestFit(data);
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
                <th>Distribution</th>
                <th>Parameters</th>
                <th>Error (SSE)</th>
                <th>AD Stat</th>
                <th>P-Value</th>
                <th>${!isNaN(limit) ? (limitType === 'upper' ? `Est. % > ${limit}` : `Est. % < ${limit}`) : 'Est. % (N/A)'}</th>
                <th>Conclusion</th>
            `;

            tbody.innerHTML = '';

            // Calculate all fits manually (similar to findBestFit but return all)
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
                pStr: `μ=${mean.toFixed(2)}, σ=${std.toFixed(2)}`,
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
                        pStr: `Log-μ=${meanLog.toFixed(2)}, Log-σ=${stdLog.toFixed(2)}`,
                        color: colors['Lognormal'] || theme.successcolor
                    });
                }

                // Exponential
                if (mean > 0) {
                    allFits.push({
                        name: 'Exponential',
                        pdf: (x) => exponPDF(x, 1 / mean),
                        cdf: (x) => exponCDF(x, 1 / mean),
                        pStr: `λ=${(1 / mean).toFixed(4)}`,
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
                        pStr: `k=${k_weibull.toFixed(2)}, λ=${lambda_weibull.toFixed(2)}`,
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
                const adStat = calculateAD(data, f.cdf);
                f.ad = adStat;
                f.pValue = calculateADPValue(adStat, n, f.name);
            });

            // Sort by error (best fit first)
            allFits.sort((a, b) => a.error - b.error);

            // Populate table
            allFits.forEach((fit, index) => {
                const row = tbody.insertRow();
                if (fit.name === bestFit.name) row.classList.add('best-fit-row');

                const pValStr = fit.pValue !== null ? fit.pValue.toFixed(4) : "N/A";
                const pMsg = fit.pValue !== null
                    ? (fit.pValue < 0.05 ? `<span class="conclusion-reject">Reject (<0.05)</span>` : `<span class="conclusion-retain">Good Fit</span>`)
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

            plotMultiDistribution(data, limit, allFits.slice(0, 4));
        }

        function calculateAD(data, cdfFunc) {
            // Anderson-Darling Statistic A^2
            const n = data.length;
            const sorted = [...data].sort((a, b) => a - b);
            let s = 0;
            for (let i = 0; i < n; i++) {
                // 1-based index is i+1
                const val = sorted[i];
                const F = Math.max(1e-9, Math.min(1 - 1e-9, cdfFunc(val)));
                const F_inv = Math.max(1e-9, Math.min(1 - 1e-9, cdfFunc(sorted[n - 1 - i])));

                s += (2 * (i + 1) - 1) * (Math.log(F) + Math.log(1 - F_inv));
            }
            return -n - (1 / n) * s;
        }

        function calculateADPValue(A2, n, distName) {
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
        }

        function renderCards(stats) {
            const container = document.getElementById('stats-container');
            container.innerHTML = '';
            stats.forEach(stat => {
                container.innerHTML += `<div class="card"><div class="card-title">${stat.title}</div><div class="card-value">${stat.value}</div><div class="card-sub">${stat.sub}</div></div>`;
            });
        }

        function plotMultiDistribution(data, limit, fits) {
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

            const title = currentMode === 'normal' ? `Normal Probability Plot: ${selectedColumnName}` : `${translations[currentLang].lblDistComp}: ${selectedColumnName}`;
            const titleEl = document.getElementById('mainChartTitle');
            if (titleEl) titleEl.textContent = title;

            Plotly.newPlot('mainChart', traces, {
                title: "", xaxis: { title: 'Value', gridcolor: theme.gridcolor, range: xRange || undefined }, yaxis: { title: 'Density', gridcolor: theme.gridcolor },
                showlegend: true, shapes: shapes, font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                margin: { t: 50, r: 20, l: 50, b: 50 }, legend: { orientation: 'h', y: -0.2 }
            }, { responsive: true });
            setTimeout(() => Plotly.Plots.resize('mainChart'), 50);

            const tr = translations[currentLang] || translations.en;
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


        function initApp() {
            try {
                // Theme Initialization
                const savedTheme = localStorage.getItem('appTheme') || 'light';
                document.body.setAttribute('data-theme', savedTheme);
                const themeIcon = document.getElementById('theme-icon');
                if (themeIcon) {
                    themeIcon.innerHTML = savedTheme === 'dark' ? ICON_SUN_SVG : ICON_MOON_SVG;
                }

                try {
                    updateChartsTheme(savedTheme);
                } catch (e) {
                    console.error("Failed to update charts theme:", e);
                }

                // Language Initialization
                const savedLang = localStorage.getItem('appLang') || 'en';
                if (typeof changeLanguage === 'function') {
                    changeLanguage(savedLang);
                }

                // Set Version
                document.title = `Bosch Statistics Center ${APP_VERSION}`;
                const versionEl = document.getElementById('aboutVersionNumber');
                if (versionEl) versionEl.textContent = APP_VERSION;
            } catch (err) {
                console.error("Critical error in initApp:", err);
            }
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', initApp);
		
        // --- WEIBULL ANALYSIS (2-PARAM) ---
        function analyzeWeibull() {
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
                const results = (method === 'mle') ? runMleWeibull(data) : runWlsxyWeibull(data);
                if (!results) { showError("Could not compute Weibull parameters."); return; }

                weibullCurrentModel = { type: 'weibull', method, ...results };
                updateUIWeibull(weibullCurrentModel);
            } catch (e) {
                console.error("Weibull analysis failed:", e);
                showError(`An error occurred during analysis: ${e.message}`);
            }
        }

        function resetWeibullUI() {
            weibullCurrentModel = null;

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
        }

        function updateUIWeibull(model) {
            document.getElementById('welcome-msg').classList.add('hidden');
            document.getElementById('weibull-view').classList.remove('hidden');

            const tr = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : translations.en;
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

            document.querySelector('#weibull-percentiles-table tbody').innerHTML = model.percentiles.map(p =>
                `<tr><td>${p.percent}%</td><td>${p.time.toPrecision(4)}</td></tr>`).join('');

            plotWeibullChart(model);
        }

        function calculateCorrelation(x_array, y_array, weights = null) {
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
        }

        function calculateMedianRankPlotPoints(data) {
            const sorted = [...data].sort((a, b) => {
                if (a.time !== b.time) return a.time - b.time;
                if (a.isCensored === b.isCensored) return 0;
                return a.isCensored ? 1 : -1; // failures before suspensions at same time
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
                        let p = (adjustedRank - 0.3) / (n + 0.4); // Benard's approximation
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
        }

        function calculateKaplanMeierPlotPoints(data) {
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
        }

        function runWlsxyWeibull(data) {
            // Minitab "Least Squares (failure time(X) on rank(Y))"
            const plotData = calculateMedianRankPlotPoints(data);
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

            const gof = { ...calculateGoodnessOfFit(data, beta, eta, 'lsxy', plotData), corr: Math.pow(calculateCorrelation(x, y), 2) };
            const percentiles = calculatePercentiles(beta, eta);
            return { beta, eta, plotData, gof, percentiles };
        }

        function runMleWeibull(data) {
            const failures = data.filter(d => !d.isCensored);
            const initialGuess = runWlsxyWeibull(data);
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
            const plotData = calculateKaplanMeierPlotPoints(data);
            const corr = calculatePlotCorrelation(plotData);
            const gof = { ...calculateGoodnessOfFit(data, beta, eta, 'mle', plotData), corr: corr };
            const percentiles = calculatePercentiles(beta, eta);
            return { beta, eta, plotData, gof, percentiles };
        }

        function calculateGoodnessOfFit(data, beta, eta, method, plotData) {
            const failures = data.filter(d => !d.isCensored).sort((a, b) => a.time - b.time);
            const n = failures.length;
            if (n < 2) return { ad: 0, pValue: 1 };

            let probs;
            if (method === 'lsxy') {
                // Minitab-style AD* for LS: use fitted CDF on failures only (not plotting positions)
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
            const ad = A2 * (1 + 0.2 / Math.sqrt(nAdj));
            const pValue = calculateADPValue(A2, nAdj, 'Weibull');
            return { ad, pValue };
        }

        function calculatePlotCorrelation(plotData) {
            if (!plotData || plotData.length < 2) return 0;
            const r = calculateCorrelation(plotData.map(p => p.x), plotData.map(p => p.y));
            return r * r;
        }

        function calculatePercentiles(beta, eta) {
            return [1, 5, 10, 50, 90, 95, 99].map(p => ({
                percent: p,
                time: eta * Math.pow(-Math.log(1 - p / 100), 1 / beta)
            }));
        }

        function plotWeibullChart(model) {
            const { plotData, beta, eta } = model;
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
            const tr = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : translations.en;
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
            Plotly.newPlot('weibullChart', [dataTrace, lineTrace], layout, { responsive: true });
        }

        // --- REGRESSION ANALYSIS (IMPROVED) ---
        let currentModel = null;
        let removedOutliersHistory = [];



        function upgradeRegressionDOM() {
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
            const t = (key) => translations[lang][key] || translations['en'][key];

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
                // If the prediction section is missing (e.g. after DOM rebuild), inject it at the end
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
        }


        function analyzeRegression() {
            upgradeRegressionDOM(); // Ensure UI is ready

            removedOutliersHistory = [];
            document.getElementById('removed-outlier-table-wrapper').classList.add('hidden');
            document.getElementById('outlier-table-wrapper').classList.add('hidden');

            const yCol = document.getElementById('reg-response-col').value;
            const xCheckboxes = document.querySelectorAll('.reg-x-checkbox:checked');
            const linearXCols = Array.from(xCheckboxes).map(cb => cb.value);
            const modelType = document.getElementById('reg-model-type').value;

            const lang = document.documentElement.getAttribute('lang') || 'en';
            const t = (key) => translations[lang][key] || translations['en'][key];

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

            const model = runRegressionAnalysis(yCol, linearXCols, initialTerms, rawData);

            if (model) {
                currentModel = model;
                const outliersForDisplay = model.outliers;
                model.outliers = [];
                updateUIWithModel(model);
                model.outliers = outliersForDisplay;
                document.getElementById('btn-check-outliers').disabled = false;
                document.getElementById('btn-remove-terms').disabled = false;
                // PDF Export Disconsidered for now
                document.getElementById('btn-remove-outliers').disabled = true;
            }
        }

        function runRegressionAnalysis(yCol, linearXCols, terms, rawData) {
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
                const pValueModel = (dfModel > 0 && isFinite(F)) ? 1 - jStat.centralF.cdf(F, dfModel, dfError) : 1.0;
                const VarBeta = XtX_inv.map(row => row.map(val => val * MSE));
                const SE_Beta = VarBeta.map((row, i) => Math.sqrt(Math.abs(row[i])));
                const tValues = Beta.map((b, i) => (SE_Beta[i] > 0) ? b[0] / SE_Beta[i] : 0);
                const pValues = tValues.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), dfError)));

                // Outlier Detection (Standardized Residuals > 2)
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
        }

        function checkForOutliers() {
            const lang = document.documentElement.getAttribute('lang') || 'en';
            const t = (key) => translations[lang][key] || translations['en'][key];

            if (!currentModel) {
                showError(t('msgRunAnalysisFirst'));
                return;
            }
            const { yCol, linearXCols, terms, rawData } = currentModel;
            const allFoundOutliers = [];
            const outlierObsNumbers = new Set();
            let tempModel = { ...currentModel };
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
                tempModel = runRegressionAnalysis(yCol, linearXCols, terms, filteredData);
                if (!tempModel) break;
            }
            if (allFoundOutliers.length > 0) {
                currentModel.outliers = allFoundOutliers.sort((a, b) => a.observationOrder - b.observationOrder);
                showError(`Found a total of ${allFoundOutliers.length} unusual observation(s).`);
            } else {
                currentModel.outliers = [];
                showError("No unusual observations found in the model.");
            }
            updateUIWithModel(currentModel);
            document.getElementById('btn-check-outliers').disabled = true;
            document.getElementById('btn-remove-outliers').disabled = !(allFoundOutliers.length > 0);
        }

        function removeOutliersAndReanalyze() {
            if (!currentModel || !currentModel.rawData) {
                showError("No analysis has been run, or the model data is missing.");
                return;
            }
            if (!currentModel.outliers || currentModel.outliers.length === 0) {
                showError("No unusual observations have been identified to remove.");
                return;
            }
            removedOutliersHistory.push(...currentModel.outliers);
            const outlierObsNumbers = new Set(removedOutliersHistory.map(o => o.observationOrder - 1));
            const originalFullData = [];
            const { yCol, linearXCols, terms } = currentModel;
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
            showError(`Removed ${currentModel.outliers.length} unusual observations and re-running analysis.`);

            const newModel = runRegressionAnalysis(yCol, linearXCols, terms, newData);
            if (newModel) {
                currentModel = newModel;
                updateUIWithModel(currentModel);
                updateRemovedOutliersTable();

                document.getElementById('btn-check-outliers').disabled = false;
                document.getElementById('btn-remove-terms').disabled = false;
                document.getElementById('btn-remove-outliers').disabled = true;
            } else {
                showError("Failed to re-calculate model after removing outliers.");
            }
        }

        function stepwiseTermRemoval() {
            const lang = document.documentElement.getAttribute('lang') || 'en';
            const t = (key) => translations[lang][key] || translations['en'][key];

            if (!currentModel) {
                showError(t('msgRunAnalysisFirst'));
                return;
            }
            let model = currentModel;
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

                const newModel = runRegressionAnalysis(model.yCol, model.linearXCols, newTerms, model.rawData);
                if (newModel) {
                    model = newModel;
                } else {
                    showError(t('msgStepwiseFailed'));
                    break;
                }
            }

            currentModel = model;
            const outliersForDisplay = model.outliers;
            model.outliers = [];
            updateUIWithModel(currentModel);
            model.outliers = outliersForDisplay;

            showError(t('msgStepwiseSuccess'));
            document.getElementById('btn-check-outliers').disabled = false;
            document.getElementById('btn-remove-terms').disabled = false;
            document.getElementById('btn-remove-outliers').disabled = true;
        }

        function updateUIWithModel(model) {
                        // --- Render Optimization Section ---
                        const optForm = document.getElementById('regression-optimization-form');
                        const optResult = document.getElementById('regression-optimization-result');
                        if (optForm && model && model.linearXCols && Array.isArray(model.linearXCols)) {
                            optForm.innerHTML = '';
                            optResult.textContent = '';
                            // Goal selector
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

                            // Target value input (hidden unless 'target' selected)
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

                            // Show/hide target input based on goal
                            goalSelect.addEventListener('change', function() {
                                targetGroup.style.display = (goalSelect.value === 'target') ? 'flex' : 'none';
                            });

                            // Optimization button
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'bosch-btn-primary';
                            btn.textContent = 'Calculate Optimal Variables';
                            btn.onclick = async function(e) {
                                e.preventDefault();
                                const vars = model.linearXCols.filter(col => {
                                    if (model.terms.includes(col)) return true;
                                    return model.terms.some(term => {
                                        if (term === 'Intercept') return false;
                                        const factors = term.split('*');
                                        return factors.includes(col);
                                    });
                                });
                                // Get min/max for each variable from data
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
                                    // Brute force grid search as before
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
                                    // Use Nelder-Mead for more than 3 variables
                                    // Load script if not present
                                    if (typeof window.nelderMeadOptimize === 'undefined') {
                                        await new Promise((resolve, reject) => {
                                            const script = document.createElement('script');
                                            script.src = 'nelderMead.js';
                                            script.onload = () => resolve();
                                            script.onerror = () => reject('Failed to load optimization script.');
                                            document.head.appendChild(script);
                                        });
                                    }
                                    // Prepare optimization function
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
            // Ensure regression view and results wrapper are visible
            const regressionView = document.getElementById('regression-view');
            if (regressionView) {
                regressionView.classList.remove('hidden');
                regressionView.style.display = 'flex';
            }
            document.getElementById('regression-results-wrapper').classList.remove('hidden');
            const tr = translations[currentLang] || translations['en'];

            // Stats Cards
            document.getElementById('reg-summary-cards').innerHTML = `
                <div class="card"><div class="card-title">${tr.lblR2 || 'R-sq'}</div><div class="card-value">${(model.R2 * 100).toFixed(2)}%</div><div class="card-sub">${tr.lblCoefDet || 'Coefficient of Determination'}</div></div>
                <div class="card"><div class="card-title">${tr.lblR2Adj || 'R-sq (adj)'}</div><div class="card-value">${(model.R2_adj * 100).toFixed(2)}%</div><div class="card-sub">${tr.lblAdjPred || 'Adjusted for Predictors'}</div></div>
                <div class="card"><div class="card-title">${tr.lblStdErr || 'S'}</div><div class="card-value">${model.stdErrorEst.toFixed(4)}</div><div class="card-sub">${tr.lblStdErrEst || 'Std Error of Estimate'}</div></div>`;

            // ANOVA
            const anovaBody = document.querySelector('#reg-anova-table tbody');
            anovaBody.innerHTML = `
                <tr><td>${tr.regRowRegression || 'Regression'}</td><td>${model.anova.dfModel}</td><td>${model.anova.SSM.toFixed(4)}</td><td>${model.anova.MSM.toFixed(4)}</td><td>${model.anova.F.toFixed(2)}</td><td>${model.anova.pValueModel.toFixed(4)}</td></tr>
                <tr><td>${tr.regRowError || 'Error'}</td><td>${model.anova.dfError}</td><td>${model.anova.SSE.toFixed(4)}</td><td>${model.anova.MSE.toFixed(4)}</td><td></td><td></td></tr>
                <tr><td>${tr.regRowTotal || 'Total'}</td><td>${model.anova.dfTotal}</td><td>${model.anova.SST.toFixed(4)}</td><td></td><td></td><td></td></tr>`;

            // Coefficients
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

            // Outliers
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

            // Equation
            let equation = `${model.yCol} = `;
            model.terms.forEach((term, i) => {
                const beta = model.Beta[i][0];
                const isFirst = i === 0;
                let termStr = '';
                // Translating Intercept for display
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

            plotRegressionCharts(model);


            // --- Render Prediction Input Boxes ---
            const predForm = document.getElementById('regression-prediction-form');
            if (predForm) {
                predForm.innerHTML = '';
                if (!model || !model.terms || model.terms.length === 0) {
                    const msg = document.createElement('div');
                    msg.style.margin = '16px 0';
                    msg.textContent = 'No model available for prediction.';
                    predForm.appendChild(msg);
                } else {
                    // Show only main explanatory variables (not quadratic or interaction terms)
                    if (model.linearXCols && Array.isArray(model.linearXCols)) {
                        // Show input for variables if:
                        // - present as a main effect in model.terms
                        // - or present in any interaction/quadratic term in model.terms
                        const presentVars = model.linearXCols.filter(col => {
                            if (model.terms.includes(col)) return true;
                            // Check if col is part of any interaction/quadratic term still in model.terms
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
                    // Predict button
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'bosch-btn-primary';
                    btn.textContent = 'Predict';
                    btn.onclick = function() {
                        let y = (model.terms.find((t, i) => t === 'Intercept') !== undefined) ? model.Beta[model.terms.findIndex(t => t === 'Intercept')][0] : 0;
                        // Build a lookup for input values
                        const inputVals = {};
                        if (model.linearXCols && Array.isArray(model.linearXCols)) {
                            model.linearXCols.forEach((col) => {
                                inputVals[col] = parseFloat(predForm.elements[col]?.value || '0');
                            });
                        }
                        // Compute prediction using all terms, but only use input boxes for main variables
                        model.terms.forEach((term, i) => {
                            if (term === 'Intercept') return;
                            // For main effect
                            if (model.linearXCols.includes(term)) {
                                y += model.Beta[i][0] * inputVals[term];
                            } else {
                                // For quadratic or interaction terms, compute value from inputVals
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
        }

        function updateRemovedOutliersTable() {
            const removedWrapper = document.getElementById('removed-outlier-table-wrapper');
            if (!removedOutliersHistory || removedOutliersHistory.length === 0) {
                removedWrapper.classList.add('hidden');
                return;
            }
            const tableHead = document.querySelector('#removed-outlier-table thead tr');
            const tableBody = document.querySelector('#removed-outlier-table tbody');
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';
            removedWrapper.classList.remove('hidden');
            let headHTML = '<th>Observation</th>';
            const xCols = Object.keys(removedOutliersHistory[0].xValues);
            xCols.forEach(col => { headHTML += `<th>${col}</th>`; });
            headHTML += '<th>Std. Residual</th>';
            tableHead.innerHTML = headHTML;
            let bodyHTML = '';
            removedOutliersHistory.forEach(outlier => {
                let row = `<tr><td>${outlier.observationOrder}</td>`;
                xCols.forEach(col => {
                    row += `<td>${outlier.xValues[col]}</td>`;
                });
                row += `<td>${outlier.standardizedResidual.toFixed(3)}</td></tr>`;
                bodyHTML += row;
            });
            tableBody.innerHTML = bodyHTML;
        }



        function plotRegressionCharts(model) {
            const { rawData: data, Residuals: residuals, yCol: yName, linearXCols: xNames, Beta: beta, SE_Beta: seBeta, pValues, terms, anova } = model;
            // For plotting, the response variable in data is always 'y'
            const responseKey = 'y';
            const theme = getChartTheme(document.body.getAttribute('data-theme'));
            const hasIntercept = terms.includes('Intercept');
            const predictorTerms = hasIntercept ? terms.filter(t => t !== 'Intercept') : terms;
            const betaPredictors = hasIntercept ? beta.slice(1) : beta;
            const seBetaPredictors = hasIntercept ? seBeta.slice(1) : seBeta;

            const lang = document.documentElement.getAttribute('lang') || 'en';
            const t = (key) => translations[lang][key] || translations['en'][key];

            const effects = betaPredictors.map((b, i) => (seBetaPredictors[i] > 0) ? Math.abs(b[0] / seBetaPredictors[i]) : 0);

            // Calculate critical t-value for alpha = 0.1
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

            Plotly.newPlot('regStandardizedEffectsChart', [{
                y: predictorTerms, x: effects, type: 'bar', orientation: 'h', marker: { color: theme.theme_primary }
            }], layout, { responsive: true });

            // Normal Probability Plot
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

            // Residuals vs Order
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


            // Contour Plot (only if >= 2 predictors)
            const contourChartDiv = document.getElementById('regContourChart');
            if (contourChartDiv) Plotly.purge(contourChartDiv);
            const factorialPlotsContainer = document.getElementById('regFactorialPlotsContainer');
            if (factorialPlotsContainer) {
                // Remove all child plot divs and purge them
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
                    x: x1_grid, y: x2_grid, z: z_grid, type: 'contour', colorscale: 'Viridis', reversescale: true,
                    contours: { coloring: 'heatmap' }
                }], {
                    title: `${t('regContour')} ${yName} vs. ${sigVar1.name} & ${sigVar2.name}`,
                    font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                    xaxis: { title: sigVar1.name, gridcolor: theme.gridcolor, font: theme.font, tickfont: theme.font },
                    yaxis: { title: sigVar2.name, gridcolor: theme.gridcolor, font: theme.font, tickfont: theme.font }
                });
            } else {
                contourChartDiv.style.display = 'none';
            }

            // Factorial Plots (Main Effects, separate charts)
            if (factorialPlotsContainer) {
                if (xNames.length > 0) {
                    factorialPlotsContainer.style.display = 'flex';
                    // Plot for main effects and quadratic terms (e.g., x, x*x), but not interaction terms (e.g., x*y)
                    const mainAndQuadraticTerms = model.terms.filter(term => {
                        if (term === 'Intercept') return false;
                        const factors = term.split('*');
                        // Main effect: single factor
                        if (factors.length === 1) return true;
                        // Quadratic: two identical factors (e.g., x*x)
                        if (factors.length === 2 && factors[0] === factors[1]) return true;
                        return false;
                    });
                    mainAndQuadraticTerms.forEach(xName => {
                        // Create a div for each main effect or quadratic plot
                        const plotDiv = document.createElement('div');
                        plotDiv.id = `regFactorialPlot_${xName}`;
                        plotDiv.style.width = '350px';
                        plotDiv.style.height = '350px';
                        plotDiv.style.flex = '0 1 350px';
                        factorialPlotsContainer.appendChild(plotDiv);

                        let xVals, yMeans, xLabel;
                        if (xName.includes('*')) {
                            // Quadratic term: x*x, but plot against linear variable (x)
                            const factor = xName.split('*')[0];
                            xVals = [...new Set(data.map(d => d[factor]))].sort((a, b) => a - b);
                            yMeans = xVals.map(val => {
                                const yVals = data.filter(d => d[factor] === val).map(d => d[responseKey]);
                                return yVals.length ? getMean(yVals) : null;
                            });
                            xLabel = factor;
                        } else {
                            // Main effect
                            xVals = [...new Set(data.map(d => d[xName]))].sort((a, b) => a - b);
                            yMeans = xVals.map(val => {
                                const yVals = data.filter(d => d[xName] === val).map(d => d[responseKey]);
                                return yVals.length ? getMean(yVals) : null;
                            });
                            xLabel = xName;
                        }
                        // Debug logging
                        console.log('Factorial plot for', xName);
                        console.log('xVals:', xVals);
                        console.log('yMeans:', yMeans);
                        console.log('Sample data:', data.slice(0, 5));
                        if (xVals.length === 0 || yMeans.every(y => y === null)) {
                            console.warn(`No data for factorial plot: ${xName}`);
                            return; // Skip plotting this factor
                        }
                        // Calculate regression line/curve for this effect
                        const validPoints = xVals.map((x, i) => ({ x, y: yMeans[i] })).filter(pt => pt.y !== null);
                        let regLineTrace = null;
                        if (validPoints.length >= 2) {
                            if (xName.includes('*')) {
                                // Quadratic regression: y = a + b*x + c*x^2
                                const n = validPoints.length;
                                const sumX = validPoints.reduce((acc, pt) => acc + pt.x, 0);
                                const sumX2 = validPoints.reduce((acc, pt) => acc + pt.x * pt.x, 0);
                                const sumX3 = validPoints.reduce((acc, pt) => acc + pt.x * pt.x * pt.x, 0);
                                const sumX4 = validPoints.reduce((acc, pt) => acc + pt.x * pt.x * pt.x * pt.x, 0);
                                const sumY = validPoints.reduce((acc, pt) => acc + pt.y, 0);
                                const sumXY = validPoints.reduce((acc, pt) => acc + pt.x * pt.y, 0);
                                const sumX2Y = validPoints.reduce((acc, pt) => acc + pt.x * pt.x * pt.y, 0);
                                // Solve normal equations for quadratic fit
                                // | n    sumX   sumX2 |   | a |   | sumY   |
                                // | sumX sumX2  sumX3 | * | b | = | sumXY  |
                                // | sumX2 sumX3 sumX4 |   | c |   | sumX2Y |
                                const A = [
                                    [n, sumX, sumX2],
                                    [sumX, sumX2, sumX3],
                                    [sumX2, sumX3, sumX4]
                                ];
                                const B = [sumY, sumXY, sumX2Y];
                                // Gaussian elimination (for 3x3)
                                function solve3x3(A, B) {
                                    const m = JSON.parse(JSON.stringify(A));
                                    const v = B.slice();
                                    for (let i = 0; i < 3; i++) {
                                        let maxRow = i;
                                        for (let k = i + 1; k < 3; k++) {
                                            if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) maxRow = k;
                                        }
                                        [m[i], m[maxRow]] = [m[maxRow], m[i]];
                                        [v[i], v[maxRow]] = [v[maxRow], v[i]];
                                        for (let k = i + 1; k < 3; k++) {
                                            const c = m[k][i] / m[i][i];
                                            for (let j = i; j < 3; j++) m[k][j] -= c * m[i][j];
                                            v[k] -= c * v[i];
                                        }
                                    }
                                    const x = [0, 0, 0];
                                    for (let i = 2; i >= 0; i--) {
                                        x[i] = v[i];
                                        for (let j = i + 1; j < 3; j++) x[i] -= m[i][j] * x[j];
                                        x[i] /= m[i][i];
                                    }
                                    return x;
                                }
                                const [a, b, c] = solve3x3(A, B);
                                // Generate smooth curve
                                const regX = [];
                                const regY = [];
                                const minX = Math.min(...validPoints.map(pt => pt.x));
                                const maxX = Math.max(...validPoints.map(pt => pt.x));
                                const steps = Math.max(20, validPoints.length * 2);
                                for (let i = 0; i <= steps; i++) {
                                    const x = minX + (maxX - minX) * i / steps;
                                    regX.push(x);
                                    regY.push(a + b * x + c * x * x);
                                }
                                regLineTrace = {
                                    x: regX,
                                    y: regY,
                                    type: 'scatter',
                                    mode: 'lines',
                                    name: 'Quadratic Fit',
                                    line: { color: theme.dangercolor, width: 2, dash: 'dash' }
                                };
                            } else {
                                // Linear regression: y = a + b*x
                                const n = validPoints.length;
                                const sumX = validPoints.reduce((acc, pt) => acc + pt.x, 0);
                                const sumY = validPoints.reduce((acc, pt) => acc + pt.y, 0);
                                const sumXY = validPoints.reduce((acc, pt) => acc + pt.x * pt.y, 0);
                                const sumXX = validPoints.reduce((acc, pt) => acc + pt.x * pt.x, 0);
                                const meanX = sumX / n;
                                const meanY = sumY / n;
                                const slope = (sumXY - n * meanX * meanY) / (sumXX - n * meanX * meanX);
                                const intercept = meanY - slope * meanX;
                                // Regression line endpoints
                                const regX = [Math.min(...validPoints.map(pt => pt.x)), Math.max(...validPoints.map(pt => pt.x))];
                                const regY = regX.map(x => intercept + slope * x);
                                regLineTrace = {
                                    x: regX,
                                    y: regY,
                                    type: 'scatter',
                                    mode: 'lines',
                                    name: 'Regression',
                                    line: { color: theme.dangercolor, width: 2, dash: 'dash' }
                                };
                            }
                        }
                        // Plot only points, and regression line if available
                        const traces = [
                            {
                                x: validPoints.map(pt => pt.x),
                                y: validPoints.map(pt => pt.y),
                                type: 'scatter',
                                mode: 'markers',
                                name: xName,
                                marker: { color: theme.accentcolor, size: 8 }
                            }
                        ];
                        if (regLineTrace) traces.push(regLineTrace);
                        Plotly.newPlot(plotDiv.id, traces, {
                            title: `${t('regFactorialPlot') || 'Factorial Plot'}: ${xName}`,
                            font: theme.font, paper_bgcolor: theme.paper_bgcolor, plot_bgcolor: theme.plot_bgcolor,
                            xaxis: { title: xLabel, gridcolor: theme.gridcolor, font: theme.font, tickfont: theme.font },
                            yaxis: { title: yName, gridcolor: theme.gridcolor, font: theme.font, tickfont: theme.font },
                            margin: { t: 50, l: 50, r: 20, b: 50 },
                            showlegend: false
                        }, {responsive: true});
                    });
                } else {
                    factorialPlotsContainer.style.display = 'none';
                }
            }

            // Ensure charts are responsive to window/panel resize
            const chartIds = ['regStandardizedEffectsChart', 'regResidualsProbabilityChart', 'regResidualsOrderChart', 'regContourChart'];
            chartIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    // Ensure Plotly is aware of responsiveness
                    if (el.data) {
                        Plotly.relayout(id, { autosize: true });
                    }
                }
            });
        }

        // --- MSA / GAGE R&R ---
        function analyzeMsa() {
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
            const countPO = {}; // Count per Cell

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
        }

        function renderMsaCharts(res, structure, parts, operators) {
            const theme = getChartTheme(document.body.getAttribute('data-theme'));

            // 1. Components of Variation (Bar Chart)
            // Sources: Gage R&R, Repeat, Reprod, Part-to-Part
            const labels = [translations[currentLang].msaTotalGRR, translations[currentLang].msaRepeat, translations[currentLang].msaReprod, translations[currentLang].msaPartToPart];
            const values = [res.grr.pctSV, res.repeat.pctSV, res.reprod.pctSV, res.part.pctSV];
            // OR use VarComp contribution? Usually Study Var % is plotted or Contribution %. Let's plot Contribution % first?
            // Actually std chart is %Contribution (Var) and %StudyVar. Let's do %Contribution.
            // Wait, standard Minitab plot has "Components of Variation" showing %Contr and %StudyVar side by side? Or stacked.
            // Let's do a simple bar of %Contribution (Var) for clarity.

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
            // Let's add %Study Var side-by-side
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
            // X-axis: Parts, Y-axis: Mean Measurement, Lines: Operators
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

        // --- MATRIX MATH HELPERS ---
        function matrixMultiply(a, b) {
            var aNumRows = a.length, aNumCols = a[0].length,
                bNumRows = b.length, bNumCols = b[0].length,
                m = new Array(aNumRows);  // initialize array of rows
            for (var r = 0; r < aNumRows; ++r) {
                m[r] = new Array(bNumCols); // initialize the current row
                for (var c = 0; c < bNumCols; ++c) {
                    m[r][c] = 0;             // initialize the current cell
                    for (var i = 0; i < aNumCols; ++i) {
                        m[r][c] += a[r][i] * b[i][c];
                    }
                }
            }
            return m;
        }

        function matrixTranspose(a) {
            return Object.keys(a[0]).map(function (c) {
                return a.map(function (r) { return r[c]; });
            });
        }

        function matrixInverse(M) {
            if (!M || M.length === 0) return [];
            // Gaussian elimination
            if (M.length !== M[0].length) { return []; }
            var i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
            var I = [], C = [];
            for (i = 0; i < dim; i += 1) {
                I[I.length] = [];
                C[C.length] = [];
                for (j = 0; j < dim; j += 1) {
                    if (i == j) { I[i][j] = 1; }
                    else { I[i][j] = 0; }
                    C[i][j] = M[i][j];
                }
            }
            for (i = 0; i < dim; i += 1) {
                e = C[i][i];
                if (e == 0) {
                    for (ii = i + 1; ii < dim; ii += 1) {
                        if (C[ii][i] != 0) {
                            for (j = 0; j < dim; j += 1) {
                                e = C[i][j]; C[i][j] = C[ii][j]; C[ii][j] = e;
                                e = I[i][j]; I[i][j] = I[ii][j]; I[ii][j] = e;
                            }
                            e = C[i][i];
                            break;
                        }
                    }
                }
                for (j = 0; j < dim; j += 1) {
                    C[i][j] = C[i][j] / e;
                    I[i][j] = I[i][j] / e;
                }
                for (ii = 0; ii < dim; ii += 1) {
                    if (ii == i) { continue; }
                    e = C[ii][i];
                    for (j = 0; j < dim; j += 1) {
                        C[ii][j] -= e * C[i][j];
                        I[ii][j] -= e * I[i][j];
                    }
                }
            }
            return I;
        }

        // --- WEIBAYES MODULE ---
        const Weibayes = {
            data: [],

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
                    // pChart and mCard visibility depends on method/calc, handled in updateMethodUI/calculate
                } else {
                    if (cards) cards.classList.add('hidden');
                    if (rChart) rChart.classList.add('hidden');
                    if (pChart) pChart.classList.add('hidden');
                    if (mCard) mCard.classList.add('hidden');
                    if (tblContainer) tblContainer.classList.add('hidden');
                    if (iCard) iCard.classList.add('hidden');
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
                    // Reset opacity if it was changed
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
                const t = parseFloat(tInput.value);
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

                // Auto-calc if in regression mode
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
                // sort by time
                const sorted = [...this.data].sort((a, b) => a.time - b.time);

                sorted.forEach((pt, i) => {
                    // Find original index for deletion
                    const origIdx = this.data.indexOf(pt); // simplified
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
                let beta = parseFloat(document.getElementById('wb-beta').value);
                let conf = parseFloat(document.getElementById('wb-confidence').value) / 100;

                if (isNaN(beta) || this.data.length === 0) {
                    document.getElementById('wb-res-eta').innerText = "--";
                    return;
                }

                // Validate inputs
                if (conf <= 0 || conf >= 1) conf = 0.70;

                let sumTBeta = 0;
                let failures = 0;
                this.data.forEach(d => {
                    sumTBeta += Math.pow(d.time, beta);
                    if (d.type === 'F') failures++;
                });

                const df = 2 * failures + 2;
                // ChiSquare Critical logic
                // Using jStat if available or porting the function
                // Porting getChiSquareCritical function for stability
                const chiCrit = this.getChiSquareCritical(conf, df);
                const etaLB = Math.pow((2 * sumTBeta) / chiCrit, 1 / beta);

                // Calculate Bx Life based on Target Reliability
                const targetRel = parseFloat(document.getElementById('wb-target-rel').value);
                let bxLife = 0;
                let lblBx = "Eta";

                // If valid target (e.g. 90%), calc B10. Formula: Bx = eta * (-ln(R))^(1/beta)
                if (targetRel && targetRel > 0 && targetRel < 100) {
                    const tr = targetRel / 100;
                    bxLife = etaLB * Math.pow(-Math.log(tr), 1 / beta);
                    lblBx = `B${(100 - targetRel).toFixed(0)} Life`;
                } else {
                    bxLife = etaLB;
                    lblBx = "Characteristic Life (Eta)";
                }

                // Display Result (reusing eta container but changing label)
                document.getElementById('wb-res-eta').innerText = bxLife.toFixed(1);
                document.getElementById('wb-lbl-result').innerText = lblBx;
                document.getElementById('wb-lbl-sub').innerText = "Lower Bound";

                // Nominal Eta (50% confidence or just MLE if available)
                const chiCritNom = this.getChiSquareCritical(0.5, df);
                const etaNom = Math.pow((2 * sumTBeta) / chiCritNom, 1 / beta);

                this.currentEta = etaLB; // For quick calc
                this.currentBeta = beta;
                this.calculatedEta = etaNom; // Store for graph

                this.updateQuickCalc();

                const method = document.getElementById('wb-method').value;
                const regMethodName = document.getElementById('wb-fit-method').value === 'rr' ? 'Rank Regression' : 'MLE';

                // Nominal Eta logic connection
                let etaN = etaNom;
                if (method === 'regression' && this.calculatedEta) {
                    etaN = this.calculatedEta;
                }

                this.renderMath({
                    method, beta, etaLB, sumTBeta, chiCrit, df, confidence: conf,
                    etaNominal: etaN, regMethod: regMethodName
                });

                // Hide welcome message to show results (and button)
                document.getElementById('welcome-msg').classList.add('hidden');
                document.getElementById('weibayes-view').classList.remove('hidden');

                this.drawReliabilityChart(etaLB, etaN, beta, conf);

                // Add interpretation logic
                const interpretationCard = document.getElementById('wb-interpretation-card');
                const interpretationContent = document.getElementById('wb-interpretation-content');
                if (interpretationCard && interpretationContent) {
                    interpretationCard.classList.remove('hidden');
                    const targetRel = parseFloat(document.getElementById('wb-target-rel').value);
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
                    // Maximum Likelihood Estimation (Newton-Raphson for Beta)
                    // Equation: 1/beta + (1/k)*Sum(ln(ti)) - (Sum(tj^beta * ln(tj)) / Sum(tj^beta)) = 0
                    // k = number of failures
                    const allData = this.data;
                    const k = failures.length;
                    const sumLnFailures = failures.reduce((sum, d) => sum + Math.log(d.time), 0);

                    let beta = 1.0; // Initial guess
                    if (failures.length > 2) {
                        // Improved initial guess? Use simple regression guess if available, or just iterate
                        // A simple approximation: 1.28 / StdDev(ln(failures))
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

                        // f(beta)
                        const f = (1 / beta) + (sumLnFailures / k) - (sumT_beta_lnT / sumT_beta);

                        // f'(beta) = -1/beta^2 - [ (Sum(t^b * (ln t)^2) * Sum(t^b) - (Sum(t^b * ln t))^2) / (Sum(t^b))^2 ]
                        const num = (sumT_beta_lnT_sq * sumT_beta) - (sumT_beta_lnT * sumT_beta_lnT);
                        const den = sumT_beta * sumT_beta;
                        const f_prime = (-1 / (beta * beta)) - (num / den);

                        const diff = f / f_prime;
                        beta -= diff;

                        if (Math.abs(diff) < 0.001) break;
                    }

                    if (isNaN(beta) || beta <= 0) beta = 1.0; // Fallback
                    slope = beta;

                    // Calc Eta for MLE: ( (1/k) * Sum(t^beta) ) ^ (1/beta)
                    let sumTB = 0;
                    allData.forEach(d => sumTB += Math.pow(d.time, beta));
                    const eta = Math.pow(sumTB / k, 1 / beta);

                    // Convert to linear regression form for plot: ln(-ln(1-MR)) = b*ln(t) - b*ln(eta)
                    // Intercept = -beta * ln(eta)
                    intercept = -slope * Math.log(eta);

                } else {
                    // Standard Rank Regression (RR)
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

                // Update Inputs
                document.getElementById('wb-beta').value = slope.toFixed(2);

                // Hide welcome message to show results (and button)
                document.getElementById('welcome-msg').classList.add('hidden');
                document.getElementById('weibayes-view').classList.remove('hidden');

                // If Probability Plot is visible, draw it
                this.drawProbabilityChart(failures, slope, intercept);
            },

            updateQuickCalc: function () {
                const t = parseFloat(document.getElementById('wb-calc-time').value);
                if (!t || !this.currentEta) {
                    document.getElementById('wb-calc-result').innerText = "--%";
                    return;
                }
                const R = Math.exp(- Math.pow(t / this.currentEta, this.currentBeta));
                document.getElementById('wb-calc-result').innerText = (R * 100).toFixed(1) + "%";
            },

            // --- MATH HELPERS ---
            getChiSquareCritical: function (p, df) {
                // Inverse Chi-Square approximation
                if (typeof jStat !== 'undefined') return jStat.chisquare.inv(p, df);
                // Fallback implementation

                // Re-implementing approximation:
                if (df === 2) return -2 * Math.log(1 - p);
                const z = this.getZ(p);
                return df * Math.pow(1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df)), 3);
            },

            getZ: function (p) {
                // Beasley-Springer-Moro Algorithm for inverse normal
                let y = p - 0.5;
                if (Math.abs(y) < 0.42) {
                    let r = y * y;
                    return y * (2.5066 + r * (-18.615 + r * (41.391 - 25.441 * r))) / (1 + r * (-8.4735 + r * (23.083 + r * (-21.062 + 3.13 * r))));
                } else {
                    let r = p;
                    if (y > 0) r = 1 - p;
                    r = Math.log(-Math.log(r));
                    const c0 = -2.78718931138, c1 = -2.29796479134, c2 = 4.85014127135, c3 = 2.32121285936;
                    const d1 = 3.54388924762, d2 = 1.63706781897;
                    let z = c0 + r * (c1 + r * (c2 + r * c3)) / (1 + r * (d1 + r * d2));
                    return y > 0 ? z : -z;
                }
            },

            renderMath: function (params) {
                const container = document.getElementById('wb-math-content');
                // params can be just the eta/beta args for backward compat OR an object in newer call.

                // If called with arguments (legacy from first impl step):
                if (arguments.length > 2) {
                    // Adapter for old call signature: eta, beta, conf, df, sumS, chi
                    var eta = arguments[0], beta = arguments[1], conf = arguments[2],
                        df = arguments[3], sumS = arguments[4], chi = arguments[5];
                    params = { method: 'manual', beta, etaLB: eta, sumTBeta: sumS, chiCrit: chi, df, confidence: conf };
                }

                const sVal = params.sumTBeta.toExponential(4);
                let html = '';

                // General Formula
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
                if (window.MathJax) MathJax.typesetPromise([container]);
            },

            drawReliabilityChart: function (etaLB, etaNom, beta, confidence) {
                const theme = getChartTheme(document.body.getAttribute('data-theme'));
                // Plotly Line Chart
                // X: Log scale
                // Y: Linear 0-1
                const times = this.data.map(d => d.time).filter(x => x > 0);
                if (times.length === 0) return;

                const minT = Math.min(...times) / 2;
                const maxT = Math.max(...times) * 2;

                // Generate curve points
                const xVals = [];
                const yLB = [];
                const yNom = [];

                // Logarithmic steps
                const logMin = Math.log10(minT || 1);
                const logMax = Math.log10(maxT || 1000);
                const steps = 50;

                for (let i = 0; i <= steps; i++) {
                    const lx = logMin + (i / steps) * (logMax - logMin);
                    const x = Math.pow(10, lx);
                    xVals.push(x);

                    const R_LB = Math.exp(- Math.pow(x / etaLB, beta));
                    yLB.push(R_LB);

                    const R_Nom = Math.exp(- Math.pow(x / etaNom, beta));
                    yNom.push(R_Nom);
                }

                const traceLB = {
                    x: xVals, y: yLB, mode: 'lines',
                    name: `LB ${(confidence * 100).toFixed(0)}%`,
                    line: { color: theme.theme_primary, width: 3 }
                };
                const traceNom = {
                    x: xVals, y: yNom, mode: 'lines',
                    name: 'Nominal',
                    line: { color: '#888', dash: 'dash' }
                };

                const layout = {
                    margin: { t: 20, r: 20, l: 50, b: 40 },
                    xaxis: { type: 'log', title: 'Time (Log)', gridcolor: theme.gridcolor },
                    yaxis: { range: [0, 1.05], title: 'Reliability R(t)', gridcolor: theme.gridcolor },
                    showlegend: true,
                    paper_bgcolor: theme.paper_bgcolor,
                    plot_bgcolor: theme.plot_bgcolor,
                    font: theme.font
                };

                Plotly.newPlot('wb-reliability-chart', [traceLB, traceNom], layout, { responsive: true });
            },

            drawProbabilityChart: function (failures, slope, intercept) {
                // Weibull Probability Plot
                // X: Log Time
                // Y: ln(-ln(1-MR))  <-- Standard Weibull Y axis
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
                    // Linearized Y = ln(-ln(1-MR))
                    const y = Math.log(-Math.log(1 - mr));
                    yVals.push(y);
                    texts.push(`MR: ${(mr * 100).toFixed(1)}%`);
                });

                // Fit line
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

                // Custom Ticks for Y Axis (Weibull Probability Scale)
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
                        range: [Math.min(...yVals, -6), Math.max(...yVals, 2)] // Dynamic range but covering typical values
                    },
                    margin: { t: 20, r: 20, l: 60, b: 40 },
                    paper_bgcolor: theme.paper_bgcolor,
                    plot_bgcolor: theme.plot_bgcolor,
                    font: theme.font
                };

                Plotly.newPlot('wb-probability-chart', [tracePts, traceLine], layout, { responsive: true });
            }
        };

        const wbCalcTimeInput = document.getElementById('wb-calc-time');
        if (wbCalcTimeInput) {
            wbCalcTimeInput.addEventListener('input', () => Weibayes.updateQuickCalc());
        }

        // Initialize Weibayes module
        if (typeof Weibayes !== 'undefined' && Weibayes.init) {
            Weibayes.init();
        }

        // --- END WEIBAYES MODULE ---

// Exposição global (contrato com o HTML)
window.toggleTheme = toggleTheme;
window.toggleAboutModal = toggleAboutModal;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleNavDropdown = toggleNavDropdown;
window.switchTab = switchTab;
window.toggleSidebar = toggleSidebar;

window.saveData = saveData;
window.loadData = loadData;
window.resetApp = resetApp;
window.handleStateUpload = handleStateUpload;

window.changeLanguage = changeLanguage;

window.handleFileUpload = handleFileUpload;
window.debounceParse = debounceParse;
window.reparseData = reparseData;
window.handleColumnChange = handleColumnChange;

window.runAnalysis = runAnalysis;
window.updateSpcControls = updateSpcControls;
window.updateHypothesisTestType = updateHypothesisTestType;

// Objetos globais
window.Weibayes = Weibayes;