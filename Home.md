# Welcome to the Bosch Statistics Center Wiki

The Bosch Statistics Center is a professional-grade, browser-based statistical analysis tool designed for engineers, quality analysts, and data scientists. 

It provides a comprehensive suite of tools for process validation, hypothesis testing, and reliability engineering, all within a modern, responsive interface.

# Key Features

## Distribution & Capability Analysis

* Normal Distribution: Analyze datasets for normality and calculate Z-scores and estimated probabilities.

* Process Capability (Cp/Cpk/Pp/Ppk): Evaluate process performance using both Normal and Best-Fit (non-normal) distribution assumptions.

* Multi-Distribution Fit: Automatically compare data against Normal, Lognormal, Exponential, and Weibull distributions using Anderson-Darling statistics.

## Statistical Testing

* Hypothesis Tests: Perform 1-Sample t-tests, 2-Sample t-tests, and One-Way ANOVA to compare group means.

* Regression & Correlation: Build OLS (Ordinary Least Squares) models with support for unusual observation detection and stepwise term removal.

## Quality Control (SPC & MSA)

* Control Charts: Generate I-MR (Individual-Moving Range) and Xbar-R charts with automated alarm rule violations.

* MSA / Gage R&R: Conduct Measurement System Analysis using ANOVA or Average/Range methods to evaluate Repeatability and Reproducibility.

## Reliability & Advanced Tools

* Weibayes (1-Param) & Weibull Regression (2-Param): Calculate characteristic life (η) and Bx-life with confidence intervals.

* Pareto Analysis: Identify the "vital few" causes using impact/frequency ranking.

* Monte Carlo Simulation: Generate simulated datasets for Normal, Lognormal, and Weibull distributions for testing and validation.

## How to Use

### 1. Loading Data

You can input data in three ways:

1. File Upload: Click Data Source to upload .csv or .txt files.

2. Paste Text: Paste raw values or table data directly into the text area.

3. Simulate: Use the Monte Carlo tab to generate a random dataset.

### 2. Configuration

1. Decimal Separator: Ensure the correct separator (Dot or Comma) is selected in the settings to match your regional data format.

2. Column Selection: Once data is loaded, select the specific numeric column you wish to analyze from the sidebar dropdown.

### 3. Execution

Navigate to the desired analysis tab (e.g., Capability, SPC) via the main navigation dropdown and click Analyze. All charts are interactive and built using Plotly for high-fidelity visualization.


## Technology Stack

Core: `HTML5`, `CSS3`.

Math Engine: [jStat](https://jstat.github.io/) and custom statistical algorithms.

Visualization: [Plotly.js](https://plotly.com/javascript/).

Typesetting: [MathJax](https://www.mathjax.org/) for `LaTeX `rendering of formulas.

## Contributors

Developed by:

Gabriel Peregrino

Daniel Vesenmaier

_Note: This tool is designed to be fully functional offline once the initial libraries are cached. It supports both Light and Dark modes for optimal user experience in any environment and different languages._