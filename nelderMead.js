// Nelder-Mead Simplex optimization for unconstrained minimization
// Adapted for use in regression optimization
// Usage: nelderMeadOptimize(fn, initial, lowerBounds, upperBounds, maxIter)

function nelderMeadOptimize(fn, initial, lowerBounds, upperBounds, maxIter = 200) {
    const n = initial.length;
    const simplex = [];
    const alpha = 1;
    const gamma = 2;
    const rho = 0.5;
    const sigma = 0.5;
    // Build initial simplex
    simplex.push({ x: initial.slice(), y: fn(initial) });
    for (let i = 0; i < n; ++i) {
        const x = initial.slice();
        x[i] = Math.min(upperBounds[i], Math.max(lowerBounds[i], x[i] + 0.05 * (upperBounds[i] - lowerBounds[i])));
        simplex.push({ x, y: fn(x) });
    }
    for (let iter = 0; iter < maxIter; ++iter) {
        simplex.sort((a, b) => a.y - b.y);
        const worst = simplex[n];
        const best = simplex[0];
        // Centroid
        const centroid = new Array(n).fill(0);
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) centroid[j] += simplex[i].x[j];
        }
        for (let j = 0; j < n; ++j) centroid[j] /= n;
        // Reflection
        const xr = centroid.map((c, j) => c + alpha * (c - worst.x[j]));
        for (let j = 0; j < n; ++j) xr[j] = Math.min(upperBounds[j], Math.max(lowerBounds[j], xr[j]));
        const yr = fn(xr);
        if (yr < simplex[0].y) {
            // Expansion
            const xe = centroid.map((c, j) => c + gamma * (xr[j] - c));
            for (let j = 0; j < n; ++j) xe[j] = Math.min(upperBounds[j], Math.max(lowerBounds[j], xe[j]));
            const ye = fn(xe);
            if (ye < yr) simplex[n] = { x: xe, y: ye };
            else simplex[n] = { x: xr, y: yr };
        } else if (yr < simplex[n - 1].y) {
            simplex[n] = { x: xr, y: yr };
        } else {
            // Contraction
            const xc = centroid.map((c, j) => c + rho * (worst.x[j] - c));
            for (let j = 0; j < n; ++j) xc[j] = Math.min(upperBounds[j], Math.max(lowerBounds[j], xc[j]));
            const yc = fn(xc);
            if (yc < worst.y) simplex[n] = { x: xc, y: yc };
            else {
                // Shrink
                for (let i = 1; i <= n; ++i) {
                    simplex[i].x = simplex[0].x.map((b, j) => b + sigma * (simplex[i].x[j] - b));
                    for (let j = 0; j < n; ++j) simplex[i].x[j] = Math.min(upperBounds[j], Math.max(lowerBounds[j], simplex[i].x[j]));
                    simplex[i].y = fn(simplex[i].x);
                }
            }
        }
    }
    simplex.sort((a, b) => a.y - b.y);
    return simplex[0];
}

if (typeof module !== 'undefined') module.exports = nelderMeadOptimize;
