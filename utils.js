/**
 * Statistics Center Utilities
 * Shared mathematical and statistical functions.
 */

// --- RANDOM GENERATORS ---
function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// --- BASIC STATS ---
const getMin = (arr) => Math.min(...arr);
const getMax = (arr) => Math.max(...arr);
const getMean = (data) => data.reduce((a, b) => a + b, 0) / data.length;
const getSum = (data) => data.reduce((a, b) => a + b, 0);
const getStd = (data, mean) => {
    if (data.length < 2) return 0;
    const m = mean === undefined ? getMean(data) : mean;
    return Math.sqrt(data.map(x => (x - m) ** 2).reduce((a, b) => a + b) / (data.length - 1));
};

// --- CORE STATISTICAL HELPERS ---
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

// --- ADVANCED DISTRIBUTIONS ---
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

// --- SPC CONSTANTS ---
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

// --- MATRIX MATH HELPERS ---
function matrixMultiply(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols);
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;
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

// --- WEIBAYES HELPERS ---
function getChiSquareCritical(p, df) {
    if (typeof jStat !== 'undefined') return jStat.chisquare.inv(p, df);
    if (df === 2) return -2 * Math.log(1 - p);
    const z = getZ(p);
    return df * Math.pow(1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df)), 3);
}

function getZ(p) {
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
}
