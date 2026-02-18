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

function installPlotlyExportPatch() {
    if (typeof Plotly === 'undefined' || Plotly.__statsCenterPatched) return;
    Plotly.__statsCenterPatched = true;

    const buildPlotlyConfig = (userConfig = {}) => {
        const baseConfig = {
            responsive: true,
            displaylogo: false
        };

        const toImageDefaults = {
            format: 'png',
            scale: 2
        };

        const merged = { ...baseConfig, ...userConfig };
        merged.toImageButtonOptions = { ...toImageDefaults, ...(userConfig.toImageButtonOptions || {}) };

        const removeList = Array.isArray(merged.modeBarButtonsToRemove) ? merged.modeBarButtonsToRemove.slice() : [];
        if (!removeList.includes('toImage')) removeList.push('toImage');
        merged.modeBarButtonsToRemove = removeList;

        const addList = Array.isArray(merged.modeBarButtonsToAdd) ? merged.modeBarButtonsToAdd.slice() : [];
        addList.push({
            name: 'downloadPngKaleido',
            title: 'Download plot as PNG',
            icon: Plotly.Icons && Plotly.Icons.camera ? Plotly.Icons.camera : undefined,
            click: (gd) => downloadPlotAsPng(gd)
        });
        addList.push({
            name: 'downloadSvg',
            title: 'Download plot as SVG',
            icon: Plotly.Icons && Plotly.Icons.camera ? Plotly.Icons.camera : undefined,
            click: (gd) => downloadPlotAsSvg(gd)
        });
        merged.modeBarButtonsToAdd = addList;

        return merged;
    };

    const downloadPlotAsPng = (gd) => {
        if (!gd || typeof Plotly === 'undefined') return;
        const filenameBase = gd.id ? gd.id : 'plot';
        const scale = 2;

        const triggerDownload = (dataUrl) => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${filenameBase}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        const fallbackToPlotly = (err) => {
            if (err) console.error('PNG export failed (SVG path)', err);
            const size = gd._fullLayout ? { width: gd._fullLayout.width, height: gd._fullLayout.height } : {};
            const baseOptions = { format: 'png', filename: filenameBase, scale, ...size };
            const kaleidoOptions = window.PlotlyKaleido ? { ...baseOptions, engine: 'kaleido' } : baseOptions;
            Plotly.toImage(gd, kaleidoOptions)
                .then(triggerDownload)
                .catch(err2 => {
                    console.error('PNG export failed (Plotly fallback)', err2);
                    alert('Sorry, there was a problem downloading your snapshot!');
                });
        };

        const svgNode = gd.querySelector('svg');
        if (!svgNode) {
            fallbackToPlotly();
            return;
        }

        const width = Math.round((gd._fullLayout && gd._fullLayout.width) || gd.clientWidth || 800);
        const height = Math.round((gd._fullLayout && gd._fullLayout.height) || gd.clientHeight || 600);

        const svgClone = svgNode.cloneNode(true);
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                fallbackToPlotly();
                return;
            }
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            try {
                const pngUrl = canvas.toDataURL('image/png');
                triggerDownload(pngUrl);
            } catch (err) {
                fallbackToPlotly(err);
            }
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            fallbackToPlotly(err);
        };
        img.src = url;
    };

    const downloadPlotAsSvg = (gd) => {
        if (!gd) return;
        const filenameBase = gd.id ? gd.id : 'plot';
        const svgNode = gd.querySelector('svg');
        if (!svgNode) return;
        const width = Math.round((gd._fullLayout && gd._fullLayout.width) || gd.clientWidth || 800);
        const height = Math.round((gd._fullLayout && gd._fullLayout.height) || gd.clientHeight || 600);
        const svgClone = svgNode.cloneNode(true);
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filenameBase}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const originalNewPlot = Plotly.newPlot;
    Plotly.newPlot = function (div, data, layout, config) {
        return originalNewPlot.call(this, div, data, layout, buildPlotlyConfig(config || {}));
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installPlotlyExportPatch);
} else {
    installPlotlyExportPatch();
}



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

function toggleLanguagePopup(forceOpen) {
    const container = document.getElementById('languageMenuContainer');
    const btn = document.getElementById('languageMenuBtn');
    if (!container || !btn) return;

    const nextState = typeof forceOpen === 'boolean' ? forceOpen : !container.classList.contains('open');
    container.classList.toggle('open', nextState);
    btn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
}

function closeLanguagePopup() {
    toggleLanguagePopup(false);
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

    const langContainer = document.getElementById('languageMenuContainer');
    if (langContainer && langContainer.classList.contains('open') && !langContainer.contains(e.target)) {
        closeLanguagePopup();
    }
});

window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeLanguagePopup();
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
            'regStandardizedEffectsChart', 'regResidualsProbabilityChart', 'regResidualsOrderChart', 'regContourChart', 'weibullChart', 'wb-reliability-chart', 'wb-probability-chart',
            'warrantyTrendChart', 'warrantyOverlapChart'].forEach(id => {
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
    location.reload();
    return;
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
        'warranty-view',
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
    const chartIds = ['mainChart', 'mainCdfChart', 'toleranceChart', 'toleranceCdfChart', 'capChart', 'mcChart', 'mcCdfChart', 'graphsChart', 'spcChart', 'spcChartSecondary', 'hypothesisChart', 'paretoChart', 'weibullChart', 'warrantyTrendChart', 'warrantyOverlapChart'];
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
        'grp-regression-controls', 'grp-msa-controls', 'grp-weibayes-controls', 'grp-weibull-controls', 'grp-warranty-controls'
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
    if (mainControls) {
        mainControls.classList.remove('hidden');
        // Restore visibility of global controls that might have been hidden by Warranty tab
        const decimalGrp = document.getElementById('grp-decimal-settings');
        const fileGrp = document.getElementById('grp-file-input');
        const colGrp = document.getElementById('column-selector-group');
        if (decimalGrp) decimalGrp.classList.remove('hidden');
        if (fileGrp) fileGrp.classList.remove('hidden');
        if (colGrp) colGrp.classList.remove('hidden');
    }

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

    if (mode === 'warranty') {
        document.getElementById('welcome-msg').classList.remove('hidden');
        document.getElementById('warranty-view').classList.add('hidden');
        document.getElementById('grp-warranty-controls').classList.remove('hidden');
        document.getElementById('analysis-params').classList.remove('hidden');

        // Hide global inputs for a cleaner simulation-only view
        const decimalGrp = document.getElementById('grp-decimal-settings');
        const fileGrp = document.getElementById('grp-file-input');
        const colGrp = document.getElementById('column-selector-group');

        if (decimalGrp) decimalGrp.classList.add('hidden');
        if (fileGrp) fileGrp.classList.add('hidden');
        if (colGrp) colGrp.classList.add('hidden');

        // Standard analyze button logic
        const btnAnalyze = document.getElementById('btn-analyze');
        if (btnAnalyze) {
            btnAnalyze.textContent = translations[currentLang].btnRunSimulation || "Run Simulation";
            btnAnalyze.classList.remove('hidden');
            btnAnalyze.disabled = false;
        }
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

// Global App Version
const APP_VERSION = "v1.1.2";

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

    document.getElementById('column-selector-group').classList.toggle('hidden', currentMode === 'hypothesis' || currentMode === 'montecarlo' || currentMode === 'weibull' || currentMode === 'regression' || currentMode === 'weibayes');

    updateHypothesisTestType();
    updateRegressionColumns(); // Fix: Ensure regression columns update on data load
    if (triggerAnalysis) handleColumnChange();
}

function handleColumnChange() {
    selectedColumnName = document.getElementById('columnSelect').value;
    runAnalysis(false);
}

function renderCards(cards) {
    const container = document.getElementById('stats-container');
    if (!container) return;
    container.innerHTML = '';
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-value">${card.value}</div>
            <div class="card-sub">${card.sub}</div>
        `;
        container.appendChild(cardEl);
    });
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
    if (currentMode === 'warranty') {
        if (typeof runWarrantyPrediction === 'function') runWarrantyPrediction();
        return;
    }
    console.log("runAnalysis called, currentMode:", currentMode);

    // Weibayes can run without external data (manual entry), so we skip the global dataset check for it
    if (currentMode === 'weibayes') {
        document.getElementById('welcome-msg').classList.add('hidden'); // Ensure welcome is hidden
        document.getElementById('weibayes-view').classList.remove('hidden'); // Ensure view is shown
        if (typeof Weibayes !== 'undefined') Weibayes.calculate();
        return;
    }

    const hasData = Object.keys(dataset).length > 0;
    console.log("hasData:", hasData, "dataset keys:", Object.keys(dataset));

    document.getElementById('welcome-msg').classList.toggle('hidden', hasData);
    if (!hasData) {
        // Clear all views if no data
        ['analysis-view', 'tolerance-view', 'capability-view', 'hypothesis-view', 'spc-view', 'montecarlo-view', 'weibull-view'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        return;
    }

    showError(""); // Clear previous errors

    switch (currentMode) {
        case 'graphs':
            analyzeGraphs();
            break;
        case 'montecarlo':
            // Redraw Monte Carlo if data exists
            if (mcData.length > 0) {
                document.getElementById('montecarlo-view').classList.remove('hidden');
                generateMontecarlo(true);
            }
            break;

        case 'regression':
            document.getElementById('regression-view').classList.remove('hidden');
            analyzeRegression();
            break;
        case 'weibull':
            if (!userInitiated) {
                // Fix: If we have a calculated model, rebuild the UI (charts with new theme) instead of hiding
                if (typeof window.hasWeibullModel === 'function' && window.hasWeibullModel()) {
                    document.getElementById('weibull-view').classList.remove('hidden');
                    document.getElementById('welcome-msg').classList.add('hidden');
                    if (typeof window.replotWeibull === 'function') window.replotWeibull();
                    return;
                }
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
        case 'pareto':
            document.getElementById('pareto-view').classList.remove('hidden');
            analyzePareto();
            break;
        case 'weibayes':
            // Weibayes typicaly handles its own trigger but for consistency:
            if (typeof Weibayes !== 'undefined') Weibayes.calculate();
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

// --- SPC ANALYSIS ---

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

        // Initialize Custom Tooltips
        initCustomTooltips();

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




// --- END ---

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
window.renderCards = renderCards;
window.getChartTheme = getChartTheme;
window.showError = showError;

// --- CUSTOM TOOLTIPS ---
function initCustomTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'custom-tooltip-container';
    tooltip.className = 'tooltip-bubble';
    document.body.appendChild(tooltip);

    let hoverTimeout;

    document.addEventListener('mouseover', function (e) {
        // Find triggers
        const target = e.target.closest('[data-tooltip-text], .info-icon');

        if (target) {
            const text = target.getAttribute('data-tooltip-text');
            if (!text) return;

            hoverTimeout = setTimeout(() => {
                tooltip.textContent = text;
                tooltip.style.opacity = '1';

                // Positioning
                const rect = target.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect(); // Need dimensions

                // Default: Top Center
                let top = rect.top - tooltipRect.height - 8;
                let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

                // Reposition if off-screen
                if (top < 0) {
                    top = rect.bottom + 8; // Flip to bottom
                }
                if (left < 0) left = 10;
                if (left + tooltipRect.width > window.innerWidth) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
            }, 500); // 0.5s Delay (User Refinement)
        }
    });

    document.addEventListener('mouseout', function (e) {
        const target = e.target.closest('[data-tooltip-text], .info-icon');
        if (target) {
            clearTimeout(hoverTimeout);
            tooltip.style.opacity = '0';
            // Hide after transition
            setTimeout(() => {
                if (tooltip.style.opacity === '0') {
                    tooltip.style.top = '-9999px';
                }
            }, 200);
        }
    });
}
