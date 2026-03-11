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
        if (window.__resultsPanelResizeObserver) {
            window.__resultsPanelResizeObserver.disconnect();
        }
        const resizeObserver = new ResizeObserver(entries => {
            // Throttle slightly to avoid excessive redraws
            window.requestAnimationFrame(() => {
                const plots = document.querySelectorAll('.js-plotly-plot');
                plots.forEach(plot => {
                    Plotly.Plots.resize(plot);
                });
            });
        });
        window.__resultsPanelResizeObserver = resizeObserver;
        resizeObserver.observe(resultsPanel);
    }
})();

window.darkenColor = function(c, amt) {
    if (!c) return c;
    if (Array.isArray(c)) return c.map(v => window.darkenColor(v, amt));
    if (typeof c === 'string' && c.startsWith('#')) {
        let col = c.slice(1);
        if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
        let num = parseInt(col, 16);
        let r = (num >> 16) + amt;
        let g = ((num >> 8) & 0x00FF) + amt;
        let b = (num & 0x0000FF) + amt;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return c;
};

function installPlotlyExportPatch() {
    if (typeof Plotly === 'undefined' || Plotly.__statsCenterPatched) return;
    Plotly.__statsCenterPatched = true;


    const ICON_DELETE_SVG = `<svg viewBox="0 0 192 192" style="enable-background:new 0 0 192 192;" xml:space="preserve"><path d="M151.9994,56.00021h-3.99957H44.00043h-4.00089v-15.9996h24.00006h63.99973h24.00007V56.00021z M139.99936,159.9996	c0,4.41168-3.58878,8.00046-7.99913,8.00046H60.00004c-4.41167,0-8.00046-3.58878-8.00046-8.00046V64.00067H68.0005v55.99927	h7.99915V64.00067h16.00092v55.99927h7.99915V64.00067h15.9996v55.99927h8.00046V64.00067h15.9996V159.9996z M80.00053,23.99968	h31.99921c4.41167,0,8.00045,3.58879,8.00045,8.00046H72.00007C72.00007,27.58846,75.58885,23.99968,80.00053,23.99968	 M159.99986,32.00014h-32.00053c0-8.82203-7.17757-15.9996-15.9996-15.9996H80.00053c-8.82336,0-16.00092,7.17757-16.00092,15.9996	H32.0004v32.00053h12.00003v95.99893c0,8.82204,7.17756,16.00092,15.9996,16.00092h72.00019	c8.82204,0,15.9996-7.17888,15.9996-16.00092V64.00067h12.00003V32.00014z"/></svg>`;
    let axisScaleModalInitialized = false;
    let percentileLineModalInitialized = false;
    let percentileLineDeleteUiInitialized = false;
    let activeAxisScaleChart = null;
    let activePercentileLineChart = null;
    let activePercentileDeleteChart = null;
    let activePercentileDeleteLineId = null;
    let percentileLineIdCounter = 0;
    let percentileLineDeleteOpenedAt = 0;
    let chartContextMenuInitialized = false;
    let contextMenuTargetChart = null;
    let percentileLinesToRestore = new Map();
    const getAxisScaleTypeLabels = () => {
        return {
            linear: (translations[currentLang] && translations[currentLang].lblLinear) || 'Linear',
            log: (translations[currentLang] && translations[currentLang].lblLog) || 'Log',
            auto: (translations[currentLang] && translations[currentLang].lblAuto) || 'Auto'
        };
    };
    const getPercentileModeLabels = () => {
        return {
            percentile: (translations[currentLang] && translations[currentLang].lblPercentile) || 'Percentile',
            value: (translations[currentLang] && translations[currentLang].lblDataValue) || 'Data Value'
        };
    };

    window.prepareForThemeChange = () => {
        percentileLinesToRestore.clear();
        const plots = document.querySelectorAll('.js-plotly-plot');
        plots.forEach(gd => {
            if (gd.id && Array.isArray(gd.__percentileLines) && gd.__percentileLines.length > 0) {
                // Deep copy the lines state
                percentileLinesToRestore.set(gd.id, JSON.parse(JSON.stringify(gd.__percentileLines)));
            }
        });
    };

    const toNumeric = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const axisRangeToDisplay = (axis) => {
        if (!axis || !Array.isArray(axis.range) || axis.range.length < 2) {
            return { min: '', max: '' };
        }
        if (axis.type === 'log') {
            return {
                min: Number.isFinite(axis.range[0]) ? String(10 ** axis.range[0]) : '',
                max: Number.isFinite(axis.range[1]) ? String(10 ** axis.range[1]) : ''
            };
        }
        return {
            min: Number.isFinite(axis.range[0]) ? String(axis.range[0]) : '',
            max: Number.isFinite(axis.range[1]) ? String(axis.range[1]) : ''
        };
    };

    const setAxisScaleError = (message) => {
        const errorEl = document.getElementById('axisScaleError');
        if (!errorEl) return;
        if (message) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        } else {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }
    };

    const setPercentileLineError = (message) => {
        const errorEl = document.getElementById('percentileLineError');
        if (!errorEl) return;
        if (message) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        } else {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }
    };

    const hidePercentileLineDeletePopover = () => {
        const popover = document.getElementById('percentileLineDeletePopover');
        if (!popover) return;
        popover.classList.add('hidden');
        popover.setAttribute('aria-hidden', 'true');
        activePercentileDeleteChart = null;
        activePercentileDeleteLineId = null;
    };

    const showPercentileLineDeletePopover = (gd, lineId, clientX, clientY) => {
        const popover = document.getElementById('percentileLineDeletePopover');
        if (!popover) return;
        activePercentileDeleteChart = gd;
        activePercentileDeleteLineId = lineId;
        percentileLineDeleteOpenedAt = Date.now();
        popover.classList.remove('hidden');
        popover.setAttribute('aria-hidden', 'false');

        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - popover.offsetWidth - margin);
        const maxTop = Math.max(margin, window.innerHeight - popover.offsetHeight - margin);
        const left = Math.min(Math.max(margin, clientX + 6), maxLeft);
        const top = Math.min(Math.max(margin, clientY + 6), maxTop);
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
    };

    const getClickClientPosition = (evt, point, gd) => {
        const e = evt && evt.event ? evt.event : null;
        const src = (e && e.srcEvent) ? e.srcEvent : e;

        const cx = src && Number.isFinite(src.clientX) ? src.clientX : null;
        const cy = src && Number.isFinite(src.clientY) ? src.clientY : null;
        if (cx !== null && cy !== null) return { x: cx, y: cy };

        const rect = gd && gd.getBoundingClientRect ? gd.getBoundingClientRect() : null;
        if (rect && point && point.xaxis && point.yaxis && Number.isFinite(point.x) && Number.isFinite(point.y)) {
            const px = rect.left + point.xaxis.l2p(point.x);
            const py = rect.top + point.yaxis.l2p(point.y);
            if (Number.isFinite(px) && Number.isFinite(py)) return { x: px, y: py };
        }

        if (rect) {
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };

    const axisValueToClientPixel = (gd, axisName, value) => {
        if (!gd || !Number.isFinite(value)) return null;
        const fullLayout = gd._fullLayout || {};
        const axis = fullLayout[`${axisName}axis`];
        const size = fullLayout._size;
        const rect = gd.getBoundingClientRect ? gd.getBoundingClientRect() : null;
        if (!axis || !size || !rect || !Array.isArray(axis.range) || axis.range.length < 2) return null;

        const r0 = axis.range[0];
        const r1 = axis.range[1];
        if (!Number.isFinite(r0) || !Number.isFinite(r1) || r0 === r1) return null;

        let t;
        if (axis.type === 'log') {
            if (value <= 0) return null;
            const lv = Math.log10(value);
            t = (lv - r0) / (r1 - r0);
        } else {
            t = (value - r0) / (r1 - r0);
        }

        if (!Number.isFinite(t)) return null;
        if (axisName === 'x') {
            return rect.left + size.l + (t * size.w);
        }
        return rect.top + size.t + ((1 - t) * size.h);
    };

    const findClosestPercentileLineAtClientPoint = (gd, clientX, clientY) => {
        if (!gd || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
        const lines = Array.isArray(gd.__percentileLines) ? gd.__percentileLines : [];
        if (lines.length === 0) return null;

        const rect = gd.getBoundingClientRect ? gd.getBoundingClientRect() : null;
        const size = gd._fullLayout && gd._fullLayout._size;
        if (!rect || !size) return null;

        const plotLeft = rect.left + size.l;
        const plotRight = plotLeft + size.w;
        const plotTop = rect.top + size.t;
        const plotBottom = plotTop + size.h;
        const expand = 10;

        let best = null;
        lines.forEach(line => {
            if (!line || !line.axis || !Number.isFinite(line.value)) return;
            if (line.axis === 'y') {
                if (clientX < (plotLeft - expand) || clientX > (plotRight + expand)) return;
                const yPx = axisValueToClientPixel(gd, 'y', line.value);
                if (!Number.isFinite(yPx)) return;
                const d = Math.abs(clientY - yPx);
                if (!best || d < best.distance) best = { id: line.id, distance: d };
                return;
            }
            if (line.axis === 'x') {
                if (clientY < (plotTop - expand) || clientY > (plotBottom + expand)) return;
                const xPx = axisValueToClientPixel(gd, 'x', line.value);
                if (!Number.isFinite(xPx)) return;
                const d = Math.abs(clientX - xPx);
                if (!best || d < best.distance) best = { id: line.id, distance: d };
            }
        });

        if (!best || best.distance > 10) return null;
        return best.id;
    };

    const closeChartContextMenu = () => {
        const menu = document.getElementById('chartContextMenu');
        if (!menu) return;
        menu.classList.add('hidden');
        menu.setAttribute('aria-hidden', 'true');
        contextMenuTargetChart = null;
        hidePercentileLineDeletePopover();
    };

    const openChartContextMenu = (gd, clientX, clientY) => {
        const menu = document.getElementById('chartContextMenu');
        if (!menu) return;
        contextMenuTargetChart = gd;
        menu.classList.remove('hidden');
        menu.setAttribute('aria-hidden', 'false');

        // Position after showing so offsetWidth/Height are available.
        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - menu.offsetWidth - margin);
        const maxTop = Math.max(margin, window.innerHeight - menu.offsetHeight - margin);
        const left = Math.min(Math.max(margin, clientX), maxLeft);
        const top = Math.min(Math.max(margin, clientY), maxTop);
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    };

    const closeAxisScaleDialog = () => {
        const modal = document.getElementById('axisScaleModal');
        if (modal) modal.classList.remove('open');
        document.querySelectorAll('.axis-custom-select-menu').forEach(menu => menu.classList.add('hidden'));
        document.querySelectorAll('.axis-custom-select-trigger').forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
        setAxisScaleError('');
        activeAxisScaleChart = null;
    };

    const closePercentileLineDialog = () => {
        const modal = document.getElementById('percentileLineModal');
        if (modal) modal.classList.remove('open');
        document.querySelectorAll('.axis-custom-select-menu').forEach(menu => menu.classList.add('hidden'));
        document.querySelectorAll('.axis-custom-select-trigger').forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
        setPercentileLineError('');
        activePercentileLineChart = null;
        hidePercentileLineDeletePopover();
    };

    const setCustomSelectValue = (inputId, value, explicitLabel) => {
        const input = document.getElementById(inputId);
        const trigger = document.getElementById(`${inputId}Trigger`);
        if (input) input.value = value;
        if (trigger) {
            const optionLabel = document.querySelector(`.axis-custom-option[data-target="${inputId}"][data-value="${value}"]`)?.getAttribute('data-label');
            const fallback =
                getAxisScaleTypeLabels()[value] ||
                getPercentileModeLabels()[value] ||
                value;
            trigger.textContent = explicitLabel || optionLabel || fallback;
        }
    };

    const setAxisScaleTypeValue = (inputId, value) => {
        setCustomSelectValue(inputId, value);
    };

    const setAxisAutoInModal = (axis) => {
        if (axis === 'x') {
            setAxisScaleTypeValue('axisScaleXType', 'auto');
            const xMinEl = document.getElementById('axisScaleXMin');
            const xMaxEl = document.getElementById('axisScaleXMax');
            if (xMinEl) xMinEl.value = '';
            if (xMaxEl) xMaxEl.value = '';
            return;
        }
        if (axis === 'y') {
            setAxisScaleTypeValue('axisScaleYType', 'auto');
            const yMinEl = document.getElementById('axisScaleYMin');
            const yMaxEl = document.getElementById('axisScaleYMax');
            if (yMinEl) yMinEl.value = '';
            if (yMaxEl) yMaxEl.value = '';
        }
    };

    const getVisibleChartTitle = (gd) => {
        if (!gd) return 'plot';

        const chartContainer = gd.closest('.chart-container');
        if (chartContainer) {
            const panelTitleEl = chartContainer.querySelector('.panel-title');
            if (panelTitleEl) {
                const panelTitle = (panelTitleEl.textContent || '').trim();
                if (panelTitle) return panelTitle;
            }
        }

        const layoutTitle = gd._fullLayout && gd._fullLayout.title;
        if (typeof layoutTitle === 'string' && layoutTitle.trim()) return layoutTitle.trim();
        if (layoutTitle && typeof layoutTitle.text === 'string' && layoutTitle.text.trim()) return layoutTitle.text.trim();

        return gd.id || 'plot';
    };

    const saveAxisScaleDialog = () => {
        if (!activeAxisScaleChart || typeof Plotly === 'undefined') return;

        const xType = (document.getElementById('axisScaleXType')?.value || 'linear').trim().toLowerCase();
        const yType = (document.getElementById('axisScaleYType')?.value || 'linear').trim().toLowerCase();
        const xMin = toNumeric(document.getElementById('axisScaleXMin')?.value);
        const xMax = toNumeric(document.getElementById('axisScaleXMax')?.value);
        const yMin = toNumeric(document.getElementById('axisScaleYMin')?.value);
        const yMax = toNumeric(document.getElementById('axisScaleYMax')?.value);

        const validType = (type) => ['linear', 'log', 'auto'].includes(type);
        if (!validType(xType) || !validType(yType)) {
            setAxisScaleError('Invalid scale type. Use linear, log, or auto.');
            return;
        }

        const xHasAny = xMin !== null || xMax !== null;
        const yHasAny = yMin !== null || yMax !== null;
        const xHasRange = xMin !== null && xMax !== null;
        const yHasRange = yMin !== null && yMax !== null;
        if (xHasAny && !xHasRange) {
            setAxisScaleError('Fill both X-axis min and max, or leave both blank.');
            return;
        }
        if (yHasAny && !yHasRange) {
            setAxisScaleError('Fill both Y-axis min and max, or leave both blank.');
            return;
        }

        const update = {};
        if (xType === 'auto') {
            update['xaxis.autorange'] = true;
        } else {
            update['xaxis.type'] = xType;
            if (xHasRange) {
                if (xMin >= xMax) {
                    setAxisScaleError('X-axis min must be lower than max.');
                    return;
                }
                if (xType === 'log' && (xMin <= 0 || xMax <= 0)) {
                    setAxisScaleError('X-axis log scale requires positive min and max.');
                    return;
                }
                update['xaxis.autorange'] = false;
                update['xaxis.range'] = xType === 'log' ? [Math.log10(xMin), Math.log10(xMax)] : [xMin, xMax];
            } else {
                update['xaxis.autorange'] = true;
            }
        }

        if (yType === 'auto') {
            update['yaxis.autorange'] = true;
        } else {
            update['yaxis.type'] = yType;
            if (yHasRange) {
                if (yMin >= yMax) {
                    setAxisScaleError('Y-axis min must be lower than max.');
                    return;
                }
                if (yType === 'log' && (yMin <= 0 || yMax <= 0)) {
                    setAxisScaleError('Y-axis log scale requires positive min and max.');
                    return;
                }
                update['yaxis.autorange'] = false;
                update['yaxis.range'] = yType === 'log' ? [Math.log10(yMin), Math.log10(yMax)] : [yMin, yMax];
            } else {
                update['yaxis.autorange'] = true;
            }
        }

        Plotly.relayout(activeAxisScaleChart, update);
        closeAxisScaleDialog();
    };

    const parseNumericList = (text) => {
        if (!text || typeof text !== 'string') return [];
        return text
            .split(/[\s,;]+/)
            .map(part => part.trim())
            .filter(Boolean)
            .map(raw => ({ raw, value: Number(raw) }))
            .filter(item => Number.isFinite(item.value));
    };

    const getNumericAxisValuesFromChart = (gd, axisKey) => {
        const values = [];
        const traces = Array.isArray(gd?.data) ? gd.data : [];
        traces.forEach(trace => {
            if (!trace || trace.visible === 'legendonly') return;
            const series = trace[axisKey];
            if (!Array.isArray(series)) return;
            series.forEach(v => {
                if (typeof v === 'number' && Number.isFinite(v)) {
                    values.push(v);
                    return;
                }
                if (typeof v === 'string' && v.trim() !== '') {
                    const asNum = Number(v);
                    if (Number.isFinite(asNum)) values.push(asNum);
                }
            });
        });
        return values.sort((a, b) => a - b);
    };

    const dataValueAtPercentile = (sortedValues, percentile) => {
        if (!Array.isArray(sortedValues) || sortedValues.length === 0 || !Number.isFinite(percentile)) return null;
        const clamped = Math.max(0, Math.min(100, percentile));
        if (sortedValues.length === 1) return sortedValues[0];
        return jStat.percentile(sortedValues, clamped / 100);
    };

    const percentileOfDataValue = (sortedValues, value) => {
        if (!Array.isArray(sortedValues) || sortedValues.length === 0 || !Number.isFinite(value)) return null;
        const n = sortedValues.length;
        if (n === 1) return value < sortedValues[0] ? 0 : 100;
        if (value <= sortedValues[0]) return 0;
        if (value >= sortedValues[n - 1]) return 100;

        let left = 0;
        while (left < n && sortedValues[left] < value) left += 1;
        if (left < n && sortedValues[left] === value) {
            let right = left;
            while (right + 1 < n && sortedValues[right + 1] === value) right += 1;
            return ((left + right) / 2 / (n - 1)) * 100;
        }

        const low = left - 1;
        const high = left;
        const lowVal = sortedValues[low];
        const highVal = sortedValues[high];
        const frac = (value - lowVal) / (highVal - lowVal);
        return ((low + frac) / (n - 1)) * 100;
    };

    const truncateLabel = (num, digits = 3) => {
        if (!Number.isFinite(num)) return '';
        return Number(num.toFixed(digits)).toString();
    };

    const getThemeForLines = () => {
        const bodyTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const theme = getChartTheme(bodyTheme);
        return {
            xColor: theme.theme_primary || '#0078d4',
            yColor: theme.dangercolor || '#d13438',
            fontColor: theme.font?.color || '#201f1e',
            annotationBgColor: bodyTheme === 'dark' ? '#1a1a1a' : 'rgba(255,255,255,0.35)'
        };
    };

    const ensurePercentileLineState = (gd) => {
        if (!gd) return;
        const layout = gd.layout || {};
        if (!Array.isArray(gd.__percentileLines)) gd.__percentileLines = [];
        if (!Number.isInteger(gd.__percentileLineBaseShapeCount)) {
            gd.__percentileLineBaseShapeCount = Array.isArray(layout.shapes) ? layout.shapes.length : 0;
        }
        if (!Number.isInteger(gd.__percentileLineBaseAnnotationCount)) {
            gd.__percentileLineBaseAnnotationCount = Array.isArray(layout.annotations) ? layout.annotations.length : 0;
        }
        if (!Number.isInteger(gd.__percentileLineBaseTraceCount)) {
            gd.__percentileLineBaseTraceCount = Array.isArray(gd.data) ? gd.data.length : 0;
        }
    };

    const buildPercentileLineEntries = (gd, cfg) => {
        const xSeries = getNumericAxisValuesFromChart(gd, 'x');
        const ySeries = getNumericAxisValuesFromChart(gd, 'y');
        const entries = [];
        const theme = getThemeForLines();
        const xMin = xSeries.length > 0 ? xSeries[0] : null;
        const xMax = xSeries.length > 0 ? xSeries[xSeries.length - 1] : null;
        const yMin = ySeries.length > 0 ? ySeries[0] : null;
        const yMax = ySeries.length > 0 ? ySeries[ySeries.length - 1] : null;
        const canBuildXHelper = Number.isFinite(xMin) && Number.isFinite(xMax) && xMin !== xMax;
        const canBuildYHelper = Number.isFinite(yMin) && Number.isFinite(yMax) && yMin !== yMax;

        if (cfg.yValues.length > 0) {
            if (ySeries.length < 2) return { error: 'Not enough numeric Y values in this chart to calculate percentiles.' };
            cfg.yValues.forEach(item => {
                const raw = item.value;
                let yValue = null;
                let pct = null;
                if (cfg.yMode === 'percentile') {
                    pct = raw;
                    yValue = dataValueAtPercentile(ySeries, raw);
                } else {
                    yValue = raw;
                    pct = percentileOfDataValue(ySeries, raw);
                }
                if (!Number.isFinite(yValue) || !Number.isFinite(pct)) return;
                const lineId = `pct-line-${++percentileLineIdCounter}`;
                const shape = {
                    type: 'line',
                    xref: 'paper',
                    yref: 'y',
                    x0: 0,
                    x1: 1,
                    y0: yValue,
                    y1: yValue,
                    line: { color: theme.yColor, width: 2, dash: 'dot' }
                };
                const annotation = {
                    xref: 'paper',
                    yref: 'y',
                    x: 0.995,
                    y: yValue,
                    text: cfg.yMode === 'value' ? `Y ${item.raw}` : `Y P${truncateLabel(pct, 2)}`,
                    showarrow: false,
                    xanchor: 'right',
                    yanchor: 'bottom',
                    font: { color: theme.fontColor, size: 11 },
                    bgcolor: theme.annotationBgColor
                };
                const helperTrace = canBuildXHelper ? {
                    type: 'scatter',
                    mode: 'lines',
                    x: [xMin, xMax],
                    y: [yValue, yValue],
                    line: { color: 'rgba(0,0,0,0.001)', width: 14 },
                    hoverinfo: 'none',
                    hovertemplate: null,
                    showlegend: false,
                    meta: { percentileLineHelper: true, percentileLineId: lineId },
                    name: '__percentile_line_helper_y'
                } : null;

                entries.push({ id: lineId, axis: 'y', value: yValue, percentile: pct, shape, annotation, helperTrace });
            });
        }

        if (cfg.xValues.length > 0) {
            if (xSeries.length < 2) return { error: 'Not enough numeric X values in this chart to calculate percentiles.' };
            cfg.xValues.forEach(item => {
                const raw = item.value;
                let xValue = null;
                let pct = null;
                if (cfg.xMode === 'percentile') {
                    pct = raw;
                    xValue = dataValueAtPercentile(xSeries, raw);
                } else {
                    xValue = raw;
                    pct = percentileOfDataValue(xSeries, raw);
                }
                if (!Number.isFinite(xValue) || !Number.isFinite(pct)) return;
                const lineId = `pct-line-${++percentileLineIdCounter}`;
                const shape = {
                    type: 'line',
                    xref: 'x',
                    yref: 'paper',
                    x0: xValue,
                    x1: xValue,
                    y0: 0,
                    y1: 1,
                    line: { color: theme.xColor, width: 2, dash: 'dot' }
                };
                const annotation = {
                    xref: 'x',
                    yref: 'paper',
                    x: xValue,
                    y: 0.995,
                    text: cfg.xMode === 'value' ? `X ${item.raw}` : `X P${truncateLabel(pct, 2)}`,
                    showarrow: false,
                    xanchor: 'left',
                    yanchor: 'top',
                    textangle: -90,
                    font: { color: theme.fontColor, size: 11 },
                    bgcolor: theme.annotationBgColor
                };
                const helperTrace = canBuildYHelper ? {
                    type: 'scatter',
                    mode: 'lines',
                    x: [xValue, xValue],
                    y: [yMin, yMax],
                    line: { color: 'rgba(0,0,0,0.001)', width: 14 },
                    hoverinfo: 'none',
                    hovertemplate: null,
                    showlegend: false,
                    meta: { percentileLineHelper: true, percentileLineId: lineId },
                    name: '__percentile_line_helper_x'
                } : null;

                entries.push({ id: lineId, axis: 'x', value: xValue, percentile: pct, shape, annotation, helperTrace });
            });
        }

        return { entries };
    };

    const syncPercentileLinesOnChart = (gd) => {
        ensurePercentileLineState(gd);
        const layout = gd?.layout || {};

        // Fix: Prevent legend from appearing if it was auto-hidden and we are just adding helper traces
        const shouldForceHideLegend = typeof layout.showlegend === 'undefined' && gd._fullLayout && gd._fullLayout.showlegend === false;

        const allShapes = Array.isArray(layout.shapes) ? layout.shapes.slice() : [];
        const allAnnotations = Array.isArray(layout.annotations) ? layout.annotations.slice() : [];
        const currentTraceCount = Array.isArray(gd?.data) ? gd.data.length : 0;

        const baseShapeCount = Math.max(0, Math.min(gd.__percentileLineBaseShapeCount, allShapes.length));
        const baseAnnotationCount = Math.max(0, Math.min(gd.__percentileLineBaseAnnotationCount, allAnnotations.length));
        if (gd.__percentileLineBaseTraceCount > currentTraceCount) {
            gd.__percentileLineBaseTraceCount = currentTraceCount;
        }

        const nextShapes = allShapes.slice(0, baseShapeCount).concat(gd.__percentileLines.map(line => line.shape));
        const nextAnnotations = allAnnotations.slice(0, baseAnnotationCount).concat(gd.__percentileLines.map(line => line.annotation));
        const helperTraces = gd.__percentileLines
            .map(line => line.helperTrace)
            .filter(Boolean);

        const helperIndexes = [];
        for (let i = gd.__percentileLineBaseTraceCount; i < currentTraceCount; i += 1) {
            helperIndexes.push(i);
        }

        const removePromise = helperIndexes.length > 0
            ? Plotly.deleteTraces(gd, helperIndexes)
            : Promise.resolve();
        return removePromise
            .then(() => helperTraces.length > 0 ? Plotly.addTraces(gd, helperTraces) : Promise.resolve())
            .then(() => {
                const update = { shapes: nextShapes, annotations: nextAnnotations };
                if (shouldForceHideLegend) {
                    update.showlegend = false;
                }
                return Plotly.relayout(gd, update);
            });
    };

    const addPercentileLinesToChart = (gd, entriesToAdd) => {
        ensurePercentileLineState(gd);
        const entries = Array.isArray(entriesToAdd) ? entriesToAdd : [];
        gd.__percentileLines = gd.__percentileLines.concat(entries);
        return syncPercentileLinesOnChart(gd);
    };

    const removePercentileLineFromChart = (gd, lineId) => {
        if (!gd || !lineId || typeof Plotly === 'undefined') return Promise.resolve();
        ensurePercentileLineState(gd);
        const previousCount = gd.__percentileLines.length;
        gd.__percentileLines = gd.__percentileLines.filter(line => line.id !== lineId);
        if (gd.__percentileLines.length === previousCount) return Promise.resolve();
        return syncPercentileLinesOnChart(gd);
    };

    const clearPercentileLinesFromChart = (gd) => {
        if (!gd || typeof Plotly === 'undefined') return;
        ensurePercentileLineState(gd);
        gd.__percentileLines = [];
        return syncPercentileLinesOnChart(gd);
    };

    const savePercentileLineDialog = () => {
        if (!activePercentileLineChart || typeof Plotly === 'undefined') return;
        const yMode = (document.getElementById('percentileLineYMode')?.value || 'percentile').trim().toLowerCase();
        const xMode = (document.getElementById('percentileLineXMode')?.value || 'percentile').trim().toLowerCase();
        const yValues = parseNumericList(document.getElementById('percentileLineYValues')?.value || '');
        const xValues = parseNumericList(document.getElementById('percentileLineXValues')?.value || '');
        const validMode = (mode) => mode === 'percentile' || mode === 'value';

        if (!validMode(yMode) || !validMode(xMode)) {
            setPercentileLineError('Invalid input mode.');
            return;
        }
        if (yValues.length === 0 && xValues.length === 0) {
            setPercentileLineError('Enter at least one Y or X value.');
            return;
        }
        if (yMode === 'percentile' && yValues.some(v => v.value < 0 || v.value > 100)) {
            setPercentileLineError('Y percentile values must be between 0 and 100.');
            return;
        }
        if (xMode === 'percentile' && xValues.some(v => v.value < 0 || v.value > 100)) {
            setPercentileLineError('X percentile values must be between 0 and 100.');
            return;
        }

        const built = buildPercentileLineEntries(activePercentileLineChart, {
            yMode,
            xMode,
            yValues,
            xValues
        });

        if (built.error) {
            setPercentileLineError(built.error);
            return;
        }

        addPercentileLinesToChart(activePercentileLineChart, built.entries)
            .then(() => closePercentileLineDialog())
            .catch(() => setPercentileLineError('Could not apply percentile lines.'));
    };

    const initPercentileLineDeleteUi = () => {
        if (percentileLineDeleteUiInitialized) return;
        percentileLineDeleteUiInitialized = true;

        const popover = document.getElementById('percentileLineDeletePopover');
        const deleteBtn = document.getElementById('percentileLineDeleteBtn');
        if (!popover || !deleteBtn) return;

        deleteBtn.innerHTML = ICON_DELETE_SVG + '<span>' + (translations[currentLang].lblDeleteLine || 'Delete line') + '</span>';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.style.width = '120px';
        deleteBtn.style.gap = '5px';

        const svg = deleteBtn.querySelector('svg');
        if (svg) {
            svg.style.width = '24px';
            svg.style.height = '24px';
            svg.style.padding = '0';
            svg.style.fill = '#d13438';
        }

        deleteBtn.addEventListener('click', () => {
            if (!activePercentileDeleteChart || !activePercentileDeleteLineId) return;
            removePercentileLineFromChart(activePercentileDeleteChart, activePercentileDeleteLineId)
                .finally(() => hidePercentileLineDeletePopover());
        });

        document.addEventListener('click', (e) => {
            if (popover.classList.contains('hidden')) return;
            if (Date.now() - percentileLineDeleteOpenedAt < 150) return;
            if (!popover.contains(e.target)) hidePercentileLineDeletePopover();
        });
        document.addEventListener('scroll', hidePercentileLineDeletePopover, true);
        window.addEventListener('resize', hidePercentileLineDeletePopover);
    };

    const initAxisScaleModal = () => {
        if (axisScaleModalInitialized) return;
        axisScaleModalInitialized = true;

        const saveBtn = document.getElementById('axisScaleSaveBtn');
        if (saveBtn) saveBtn.addEventListener('click', saveAxisScaleDialog);
        const xAutoBtn = document.getElementById('axisScaleXAutoBtn');
        if (xAutoBtn) xAutoBtn.addEventListener('click', () => setAxisAutoInModal('x'));
        const yAutoBtn = document.getElementById('axisScaleYAutoBtn');
        if (yAutoBtn) yAutoBtn.addEventListener('click', () => setAxisAutoInModal('y'));

        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.axis-custom-select-trigger');
            const option = e.target.closest('.axis-custom-option');
            const isInsideCustomSelect = e.target.closest('.axis-custom-select');

            if (option) {
                const targetInput = option.getAttribute('data-target');
                const value = option.getAttribute('data-value');
                const label = option.getAttribute('data-label');
                if (targetInput && value) {
                    setCustomSelectValue(targetInput, value, label || undefined);
                }
                document.querySelectorAll('.axis-custom-select-menu').forEach(menu => menu.classList.add('hidden'));
                document.querySelectorAll('.axis-custom-select-trigger').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
                return;
            }

            if (trigger) {
                const selectWrap = trigger.closest('.axis-custom-select');
                const menu = selectWrap ? selectWrap.querySelector('.axis-custom-select-menu') : null;
                const willOpen = !!(menu && menu.classList.contains('hidden'));
                document.querySelectorAll('.axis-custom-select-menu').forEach(m => m.classList.add('hidden'));
                document.querySelectorAll('.axis-custom-select-trigger').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
                if (menu && willOpen) {
                    menu.classList.remove('hidden');
                    trigger.setAttribute('aria-expanded', 'true');
                }
                return;
            }

            if (!isInsideCustomSelect) {
                document.querySelectorAll('.axis-custom-select-menu').forEach(menu => menu.classList.add('hidden'));
                document.querySelectorAll('.axis-custom-select-trigger').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
            }
        });

        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('axisScaleModal');
            const percentileModal = document.getElementById('percentileLineModal');
            if (e.key !== 'Escape') return;
            if (modal && modal.classList.contains('open')) {
                closeAxisScaleDialog();
            } else if (percentileModal && percentileModal.classList.contains('open')) {
                closePercentileLineDialog();
            }
        });
    };

    const initPercentileLineModal = () => {
        if (percentileLineModalInitialized) return;
        percentileLineModalInitialized = true;
        initAxisScaleModal();
        initPercentileLineDeleteUi();

        const saveBtn = document.getElementById('percentileLineSaveBtn');
        if (saveBtn) saveBtn.addEventListener('click', savePercentileLineDialog);
        const clearBtn = document.getElementById('percentileLineClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (!activePercentileLineChart) return;
                clearPercentileLinesFromChart(activePercentileLineChart)
                    .finally(() => closePercentileLineDialog());
            });
        }
    };

    const updatePercentileLineModalUI = () => {
        if (typeof translations === 'undefined') return;
        const t = translations[currentLang];
        
        // Buttons
        const saveBtn = document.getElementById('percentileLineSaveBtn');
        if (saveBtn) saveBtn.textContent = t.lblAddLines || 'Add Lines';
        const clearBtn = document.getElementById('percentileLineClearBtn');
        if (clearBtn) clearBtn.textContent = t.lblClearLines || 'Clear All Lines';

        // Labels
        const map = {
            'percentileLineYMode': t.lblYAxisMode || 'Y Axis Mode',
            'percentileLineXMode': t.lblXAxisMode || 'X Axis Mode',
            'percentileLineYValues': t.lblValuesInput || 'Values (comma separated)',
            'percentileLineXValues': t.lblValuesInput || 'Values (comma separated)'
        };
        
        for (const [id, text] of Object.entries(map)) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = text;
        }

        // Style text areas to be single-line and non-resizable for a compact layout
        const yValuesEl = document.getElementById('percentileLineYValues');
        if (yValuesEl && yValuesEl.tagName === 'TEXTAREA') {
            yValuesEl.rows = 1;
            yValuesEl.style.resize = 'none';
            yValuesEl.style.overflowY = 'hidden';
        }
        const xValuesEl = document.getElementById('percentileLineXValues');
        if (xValuesEl && xValuesEl.tagName === 'TEXTAREA') {
            xValuesEl.rows = 1;
            xValuesEl.style.resize = 'none';
            xValuesEl.style.overflowY = 'hidden';
        }

        // Dropdown Options
        const labels = getPercentileModeLabels();
        document.querySelectorAll('.axis-custom-option').forEach(opt => {
            const val = opt.getAttribute('data-value');
            if (labels[val]) {
                opt.textContent = labels[val];
                opt.setAttribute('data-label', labels[val]);
            }
        });
    };

    const updateAxisScaleModalUI = () => {
        if (typeof translations === 'undefined') return;
        const labels = getAxisScaleTypeLabels();
        document.querySelectorAll('.axis-custom-option').forEach(opt => {
            const val = opt.getAttribute('data-value');
            if (labels[val]) {
                opt.textContent = labels[val];
                opt.setAttribute('data-label', labels[val]);
            }
        });
    };

    const openAxisScaleDialog = (gd) => {
        if (!gd || typeof Plotly === 'undefined') return;
        closeChartContextMenu();
        initAxisScaleModal();

        const modal = document.getElementById('axisScaleModal');
        const chartName = document.getElementById('axisScaleChartName');
        const xTypeEl = document.getElementById('axisScaleXType');
        const yTypeEl = document.getElementById('axisScaleYType');
        const xMinEl = document.getElementById('axisScaleXMin');
        const xMaxEl = document.getElementById('axisScaleXMax');
        const yMinEl = document.getElementById('axisScaleYMin');
        const yMaxEl = document.getElementById('axisScaleYMax');
        if (!modal || !xTypeEl || !yTypeEl || !xMinEl || !xMaxEl || !yMinEl || !yMaxEl) return;

        updateAxisScaleModalUI();

        const xAxis = (gd._fullLayout && gd._fullLayout.xaxis) || {};
        const yAxis = (gd._fullLayout && gd._fullLayout.yaxis) || {};
        const xCurrentType = xAxis.type === 'log' ? 'log' : 'linear';
        const yCurrentType = yAxis.type === 'log' ? 'log' : 'linear';
        const xRangeDisplay = axisRangeToDisplay(xAxis);
        const yRangeDisplay = axisRangeToDisplay(yAxis);

        activeAxisScaleChart = gd;
        if (chartName) chartName.textContent = getVisibleChartTitle(gd);
        setAxisScaleTypeValue('axisScaleXType', xCurrentType);
        setAxisScaleTypeValue('axisScaleYType', yCurrentType);
        xMinEl.value = xRangeDisplay.min;
        xMaxEl.value = xRangeDisplay.max;
        yMinEl.value = yRangeDisplay.min;
        yMaxEl.value = yRangeDisplay.max;
        setAxisScaleError('');
        modal.classList.add('open');
    };

    const openPercentileLineDialog = (gd) => {
        if (!gd || typeof Plotly === 'undefined') return;
        closeChartContextMenu();
        initPercentileLineModal();

        const modal = document.getElementById('percentileLineModal');
        const chartName = document.getElementById('percentileLineChartName');
        const yModeEl = document.getElementById('percentileLineYMode');
        const xModeEl = document.getElementById('percentileLineXMode');
        const yValuesEl = document.getElementById('percentileLineYValues');
        const xValuesEl = document.getElementById('percentileLineXValues');
        if (!modal || !chartName || !yModeEl || !xModeEl || !yValuesEl || !xValuesEl) return;

        updatePercentileLineModalUI();

        activePercentileLineChart = gd;
        chartName.textContent = getVisibleChartTitle(gd);
        setCustomSelectValue('percentileLineYMode', yModeEl.value || 'percentile');
        setCustomSelectValue('percentileLineXMode', xModeEl.value || 'percentile');
        yValuesEl.value = '';
        xValuesEl.value = '';
        setPercentileLineError('');
        modal.classList.add('open');
    };

    window.closeAxisScaleModal = closeAxisScaleDialog;
    window.closePercentileLineModal = closePercentileLineDialog;

    const initChartContextMenu = () => {
        if (chartContextMenuInitialized) return;
        chartContextMenuInitialized = true;

        const menu = document.getElementById('chartContextMenu');
        const axisBtn = document.getElementById('ctxAxisScaleBtn');
        const percentileBtn = document.getElementById('ctxPercentileBtn');
        if (!menu || !axisBtn || !percentileBtn) return;

        axisBtn.addEventListener('click', () => {
            if (contextMenuTargetChart) openAxisScaleDialog(contextMenuTargetChart);
            closeChartContextMenu();
        });
        percentileBtn.addEventListener('click', () => {
            if (contextMenuTargetChart) openPercentileLineDialog(contextMenuTargetChart);
            closeChartContextMenu();
        });

        document.addEventListener('click', (e) => {
            if (menu.classList.contains('hidden')) return;
            if (!menu.contains(e.target)) closeChartContextMenu();
        });
        document.addEventListener('scroll', closeChartContextMenu, true);
        window.addEventListener('resize', closeChartContextMenu);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeChartContextMenu();
        });
    };

    const attachAxisScaleClickHandler = (gd) => {
        if (!gd || gd.__axisScaleClickBound) return;
        gd.__axisScaleClickBound = true;
        initChartContextMenu();
        initPercentileLineDeleteUi();

        gd.addEventListener('mousemove', (event) => {
            if (!gd.__percentileLines || gd.__percentileLines.length === 0) return;

            const lineId = findClosestPercentileLineAtClientPoint(gd, event.clientX, event.clientY);
            const dragLayer = gd.querySelector('.nsewdrag');

            if (lineId) {
                gd.style.cursor = 'pointer';
                if (dragLayer && dragLayer.style.cursor !== 'pointer') {
                    gd.__prevDragCursor = dragLayer.style.cursor;
                    dragLayer.style.cursor = 'pointer';
                }
            } else {
                if (gd.style.cursor === 'pointer') gd.style.cursor = '';
                if (dragLayer && dragLayer.style.cursor === 'pointer') {
                    dragLayer.style.cursor = gd.__prevDragCursor || '';
                }
            }
        });

        gd.addEventListener('contextmenu', (event) => {
            if (event.target && event.target.closest('.modebar, .modebar-btn')) return;
            event.preventDefault();
            hidePercentileLineDeletePopover();
            openChartContextMenu(gd, event.clientX, event.clientY);
        });

        if (typeof gd.on === 'function') {
            gd.on('plotly_click', (evt) => {
                const point = evt && Array.isArray(evt.points) ? evt.points[0] : null;
                const meta = (point && point.data && point.data.meta) || null;
                const metaLineId = meta && meta.percentileLineHelper ? meta.percentileLineId : null;
                const rawEvent = evt && evt.event ? (evt.event.srcEvent || evt.event) : null;
                if (rawEvent && Number.isFinite(rawEvent.button) && rawEvent.button !== 0) return;
                const pos = getClickClientPosition(evt, point, gd);
                const lineId = metaLineId || findClosestPercentileLineAtClientPoint(gd, pos.x, pos.y);
                if (!lineId) {
                    hidePercentileLineDeletePopover();
                    return;
                }
                showPercentileLineDeletePopover(gd, lineId, pos.x, pos.y);
            });
            gd.on('plotly_doubleclick', hidePercentileLineDeletePopover);
        }

        gd.addEventListener('click', (event) => {
            if (event.button !== 0) return;
            if (event.target && event.target.closest('.modebar, .modebar-btn')) return;
            if (event.target && event.target.closest('#percentileLineDeletePopover')) return;
            const lineId = findClosestPercentileLineAtClientPoint(gd, event.clientX, event.clientY);
            if (!lineId) {
                hidePercentileLineDeletePopover();
                return;
            }
            showPercentileLineDeletePopover(gd, lineId, event.clientX, event.clientY);
        });

        let longPressTimer = null;
        let pressX = 0;
        let pressY = 0;
        const clearLongPress = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        gd.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'touch') return;
            if (event.target && event.target.closest('.modebar, .modebar-btn')) return;
            pressX = event.clientX;
            pressY = event.clientY;
            clearLongPress();
            longPressTimer = setTimeout(() => {
                openChartContextMenu(gd, pressX, pressY);
                longPressTimer = null;
            }, 600);
        });

        gd.addEventListener('pointermove', (event) => {
            if (!longPressTimer || event.pointerType !== 'touch') return;
            const moved = Math.abs(event.clientX - pressX) > 10 || Math.abs(event.clientY - pressY) > 10;
            if (moved) clearLongPress();
        });
        gd.addEventListener('pointerup', clearLongPress);
        gd.addEventListener('pointercancel', clearLongPress);
        gd.addEventListener('pointerleave', clearLongPress);
    };

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
        const divId = (typeof div === 'string') ? div : div.id;

        // Patch: Fix inverted X-axis on Capability chart when only LSL is present
        if (divId === 'capChart' && layout && layout.xaxis && Array.isArray(layout.xaxis.range)) {
            if (layout.xaxis.range.length === 2) {
                const r0 = parseFloat(layout.xaxis.range[0]);
                const r1 = parseFloat(layout.xaxis.range[1]);
                if (!isNaN(r0) && !isNaN(r1) && r0 > r1) {
                    layout.xaxis.range = [r1, r0];
                    layout.xaxis.autorange = false;
                }
            }
        }

        if (Array.isArray(data)) {
            const theme = document.body.getAttribute('data-theme');
            if (typeof getChartTheme === 'function') {
                const colors = getChartTheme(theme);
                data.forEach(trace => {
                    if (trace.type === 'bar' || trace.type === 'histogram') {
                        if (!trace.marker) trace.marker = {};
                        if (!trace.marker.line) trace.marker.line = {};
                        if (trace.marker.color) {
                            trace.marker.line.color = window.darkenColor(trace.marker.color, -40);
                        } else {
                            trace.marker.line.color = colors.theme_primary_darker;
                        }
                        if (trace.marker.line.width === undefined) trace.marker.line.width = 1;
                    }
                });
            }
        }
        const result = originalNewPlot.call(this, div, data, layout, buildPlotlyConfig(config || {}));
        return result.then(gd => {
            attachAxisScaleClickHandler(gd);

            if (percentileLinesToRestore.has(divId)) {
                const linesToRestore = percentileLinesToRestore.get(divId);
                percentileLinesToRestore.delete(divId); // Consume it

                if (linesToRestore && linesToRestore.length > 0) {
                    const newTheme = getThemeForLines();
                    linesToRestore.forEach(line => {
                        // Assign a new unique ID to avoid conflicts
                        line.id = `pct-line-${++percentileLineIdCounter}`;
                        if (line.axis === 'x') {
                            line.shape.line.color = newTheme.xColor;
                        } else {
                            line.shape.line.color = newTheme.yColor;
                        }
                        line.annotation.font.color = newTheme.fontColor;
                        line.annotation.bgcolor = newTheme.annotationBgColor;
                        // Update the ID in the helper trace meta if it exists
                        if (line.helperTrace && line.helperTrace.meta) {
                            line.helperTrace.meta.percentileLineId = line.id;
                        }
                    });
                    // Use a timeout to ensure the chart is fully rendered before adding shapes
                    setTimeout(() => addPercentileLinesToChart(gd, linesToRestore), 50);
                }
            }
            return gd;
        });
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
        theme_primary: isDark ? '#4f9bdb' : '#0078d4',
        theme_primary_darker: isDark ? '#2d6ca2' : '#005a9e'
    };
}

function updateChartsTheme(theme) {
    try {
        if (window.prepareForThemeChange) {
            window.prepareForThemeChange();
        }

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

                    el.data.forEach((trace, i) => {
                        if (trace.type === 'bar' || trace.type === 'histogram') {
                            let newLineColor = themeLayout.theme_primary_darker;
                            if (trace.marker && trace.marker.color) {
                                newLineColor = window.darkenColor(trace.marker.color, -40);
                            }
                            Plotly.restyle(id, {
                                'marker.line.color': newLineColor,
                                'marker.line.width': 1
                            }, [i]);
                        }
                    });

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

function clearSensitiveDataFromUi() {
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');
    const previewTable = document.getElementById('previewTable');
    const previewWrapper = document.getElementById('preview-wrapper');
    const dataStatus = document.getElementById('data-status');

    if (textInput) textInput.value = '';
    if (fileInput) fileInput.value = '';
    if (previewTable) previewTable.innerHTML = '';
    if (previewWrapper) previewWrapper.classList.add('hidden');
    if (dataStatus) dataStatus.textContent = '';

    dataset = {};
    rawDataset = {};
    selectedColumnName = '';
}

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
    const url = new URL(window.location.href);
    url.searchParams.set('reset', 'true');
    window.location.href = url.toString();
}

// --- SAVE / LOAD LOGIC ---
async function saveData() {
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

    const jsonContent = JSON.stringify(state, null, 2);
    const defaultFilename = `statistics_analysis_${new Date().toISOString().slice(0, 10)}`;

    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: `${defaultFilename}.stat`,
                types: [{
                    description: 'Statistics Analysis File',
                    accept: { 'text/plain': ['.stat'] },
                }],
                excludeAcceptAllOption: true
            });
            const writable = await handle.createWritable();
            await writable.write(jsonContent);
            await writable.close();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Save failed:', err);
                alert('Failed to save file.');
            }
        }
    } else {
        // Fallback: Use prompt to allow user to customize filename
        let filename = prompt("Save Analysis As:", defaultFilename);
        if (filename !== null) {
            if (!filename.endsWith('.stat')) filename += '.stat';

            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
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
        if (s.capSubgroupCol) document.getElementById('capSubgroupCol').value = s.capSubgroupCol;
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
    let hasData = (typeof dataset !== 'undefined' && dataset !== null) ? Object.keys(dataset).length > 0 : false;
    if (mode === 'pareto' && typeof rawDataset !== 'undefined' && rawDataset !== null) {
        hasData = hasData || Object.keys(rawDataset).length > 0;
    }

    // Reset Weibayes if leaving the tab
    if (typeof currentMode !== 'undefined' && currentMode === 'weibayes' && mode !== 'weibayes') {
        if (typeof Weibayes !== 'undefined') Weibayes.reset();
    }

    currentMode = mode;

    // Hide controls panel for modes that don't use it (like DOE)
    const controlsPanel = document.querySelector('.controls-panel');
    if (controlsPanel) {
        if (mode === 'doe') {
            controlsPanel.classList.add('hidden');
        } else {
            controlsPanel.classList.remove('hidden');
        }
    }

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
        doe: document.getElementById('doe-view'),
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

    if (mode === 'doe') {
        document.getElementById('welcome-msg').classList.add('hidden');
        document.getElementById('doe-view').classList.remove('hidden');
        document.getElementById('main-controls').classList.add('hidden');
        
        // Ensure DOE setup is initialized
        if (typeof renderDoeMode === 'function') renderDoeMode();
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
    if (['normal', 'multi', 'tolerance', 'capability', 'spc'].includes(mode)) {
        document.getElementById('column-selector-group').classList.remove('hidden');
    }

    document.getElementById('btn-analyze').textContent = translations[currentLang].btnAnalyze;
    document.getElementById('btn-analyze').classList.remove('hidden');
    document.getElementById('btn-analyze').disabled = false; // Reset disabled state by default
    if (mode === 'montecarlo' || mode === 'weibayes' || mode === 'doe') { // Hide main analyze button for MC, Weibayes, DOE
        document.getElementById('btn-analyze').classList.add('hidden');
    } else if (mode === 'graphs' || mode === 'pareto') {
        document.getElementById('btn-analyze').textContent = translations[currentLang].btnUpdate;
    }

    // Don't auto-run analysis when switching tabs
    // Results should only appear when user clicks the execution button
}

// Global App Version
const APP_VERSION = "v1.2.3";
const SHOW_DEVELOPMENT_ENVIRONMENT = 0; // 0 = hide, 1 = show

// --- DATA PARSING ---
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Check for Excel extension
    const filename = file.name.toLowerCase();
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        handleExcelUpload(file);
        return;
    }

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
    let candidates = [',', '\t', ';'];
    if (decimalSep === ',') {
        candidates = [';', '\t'];
    }
    const previewLines = lines.slice(0, 5);

    let bestDelimiter = candidates[0];
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
        v = v.replace(/\s/g, '');
        if (decimalSep === ',') v = v.replace(/\./g, '').replace(',', '.');
        else v = v.replace(/,/g, '');
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
        Object.keys(rawDataset).forEach(col => {
            const raw = rawDataset[col][i];
            const parsed = cleanVal(raw);
            const display = (!isNaN(parsed)) ? parsed : (raw || '');
            tr.innerHTML += `<td>${display}</td>`;
        });
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
        { el: document.getElementById('capSubgroupCol'), cols: allCols, hasNone: true },
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

    let hasData = Object.keys(dataset).length > 0;
    if (currentMode === 'pareto') {
        hasData = Object.keys(rawDataset).length > 0;
    }
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
            updateWeibullCounts();
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

function updateWeibullCounts() {
    const failCol = document.getElementById('weibull-failure-col').value;
    const censorCol = document.getElementById('weibull-censor-col').value;
    const censorVal = document.getElementById('weibull-censor-val').value.trim();
    const decimalSep = document.getElementById('decimalSep').value;

    if (!failCol || !rawDataset[failCol]) return;

    let failureCount = 0;
    let censorCount = 0;
    const failData = rawDataset[failCol];
    const censData = censorCol ? rawDataset[censorCol] : null;

    for (let i = 0; i < failData.length; i++) {
        let rawVal = failData[i];
        if (typeof rawVal === 'string') {
            rawVal = rawVal.trim().replace(/"/g, '');
            if (decimalSep === ',') rawVal = rawVal.replace(/\./g, '').replace(',', '.');
        }
        const val = parseFloat(rawVal);
        
        if (isNaN(val)) continue;

        let isCensored = false;
        if (censData) {
            const cVal = String(censData[i]).trim();
            if (cVal === censorVal) isCensored = true;
        }

        if (isCensored) censorCount++;
        else failureCount++;
    }

    const elFail = document.getElementById('weibull-count-failures');
    const elCens = document.getElementById('weibull-count-censored');
    if (elFail) elFail.textContent = failureCount;
    if (elCens) elCens.textContent = censorCount;
}

function initApp() {
    try {
        // Check for reset flag and clear inputs if present
        const url = new URL(window.location.href);
        if (url.searchParams.get('reset') === 'true') {
            document.querySelectorAll('input, textarea, select').forEach(el => {
                if (el.id === 'langSelect') return; // Preserve language selector
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = el.defaultChecked;
                } else if (el.tagName === 'SELECT') {
                    const defaultOpt = Array.from(el.options).find(opt => opt.defaultSelected);
                    if (defaultOpt) el.value = defaultOpt.value;
                    else if (el.options.length > 0) el.selectedIndex = 0;
                } else {
                    el.value = el.defaultValue;
                }
            });
            url.searchParams.delete('reset');
            window.history.replaceState({}, document.title, url.toString());
        }

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

        // Initialize Excel Modal
        initExcelModal();

        // Set Version
        document.title = `Bosch Statistics Center ${APP_VERSION}`;
        const versionEl = document.getElementById('aboutVersionNumber');
        if (versionEl) versionEl.textContent = APP_VERSION;

        const devTagEl = document.getElementById('devEnvironmentTag');
        if (devTagEl) {
            const isVisible = Number(SHOW_DEVELOPMENT_ENVIRONMENT) === 1;
            devTagEl.classList.toggle('hidden', !isVisible);
        }

        // Update file input to accept .stat files
        const stateInput = document.getElementById('stateFileInput');
        if (stateInput) stateInput.setAttribute('accept', '.stat');

        // Bind Decimal Separator Change
        const decimalSepEl = document.getElementById('decimalSep');
        if (decimalSepEl) {
            decimalSepEl.addEventListener('change', reparseData);
        }

        // Confidentiality hardening: avoid browser form restoration/autofill on data inputs.
        const textInput = document.getElementById('textInput');
        const fileInput = document.getElementById('fileInput');
        if (textInput) {
            textInput.setAttribute('autocomplete', 'off');
            textInput.setAttribute('autocorrect', 'off');
            textInput.setAttribute('autocapitalize', 'off');
            textInput.setAttribute('spellcheck', 'false');
        }
        if (fileInput) fileInput.setAttribute('autocomplete', 'off');
    } catch (err) {
        console.error("Critical error in initApp:", err);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApp);

// Confidentiality hardening: clear sensitive data when page is being hidden/unloaded.
window.addEventListener('pagehide', clearSensitiveDataFromUi);
window.addEventListener('beforeunload', clearSensitiveDataFromUi);




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
    const ensureTooltipContainer = () => {
        let el = document.getElementById('custom-tooltip-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'custom-tooltip-container';
            el.className = 'tooltip-bubble';
            document.body.appendChild(el);
        }
        return el;
    };

    // Ensure tooltip exists even on DOM re-builds.
    ensureTooltipContainer();

    if (window.__customTooltipsListenersBound) return;
    window.__customTooltipsListenersBound = true;

    // Create tooltip element
    let tooltip = document.getElementById('custom-tooltip-container');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip-container';
        tooltip.className = 'tooltip-bubble';
        document.body.appendChild(tooltip);
    }

    let hoverTimeout;

    document.addEventListener('mouseover', function (e) {
        // Convert native 'title' attributes to custom tooltips to prevent browser UI
        const targetWithTitle = e.target.closest('[title]');
        if (targetWithTitle) {
            const titleText = targetWithTitle.getAttribute('title');
            if (titleText) {
                targetWithTitle.setAttribute('data-tooltip-text', titleText);
                targetWithTitle.removeAttribute('title');
            }
        }

        // Find triggers
        const target = e.target.closest('[data-tooltip-text], .info-icon');

        if (target) {
            const text = target.getAttribute('data-tooltip-text');
            if (!text) return;

            hoverTimeout = setTimeout(() => {
                tooltip = ensureTooltipContainer();
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
            tooltip = ensureTooltipContainer();
            // Fix: Prevent tooltip from hiding when moving to a child element (e.g. text node)
            if (e.relatedTarget && target.contains(e.relatedTarget)) {
                return;
            }

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