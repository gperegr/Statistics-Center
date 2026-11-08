
// Verification Script for B10 Calculation
// Formula in code: time = eta * Math.pow(-Math.log(1 - p / 100), 1 / beta)

function calculateB10(beta, eta) {
    const p = 10; // B10 means 10% probability of failure
    return eta * Math.pow(-Math.log(1 - p / 100), 1 / beta);
}

// Test Case 1
// Beta = 1.5, Eta = 100
// Expected: 
// -ln(0.9) = 0.10536051565
// 0.10536... ^ (1/1.5) = 0.10536... ^ 0.6666 = 0.22314355
// Result = 22.314355
const beta1 = 1.5;
const eta1 = 100;
const b10_1 = calculateB10(beta1, eta1);
console.log(`Test 1 (Beta=${beta1}, Eta=${eta1}): calculated B10 = ${b10_1}`);

// Test Case 2
// Beta = 3.0, Eta = 200
// Expected:
// -ln(0.9) = 0.10536...
// 0.10536... ^ (1/3) = 0.47226...
// Result = 94.453...
const beta2 = 3.0;
const eta2 = 200;
const b10_2 = calculateB10(beta2, eta2);
console.log(`Test 2 (Beta=${beta2}, Eta=${eta2}): calculated B10 = ${b10_2}`);
