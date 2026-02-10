# Bosch Power Tools | Statistics Center

A browser-based application for statistical analysis. This tool provides a suite of interactive modules for data analysis, visualization, and process control, designed for engineers, analysts, and data scientists. It operates entirely offline as a single HTML file.

This project was originally designed for internal use at Bosch and has been prepared here as a standalone, open-source repository.

# Features

The application is a single-page tool that includes a wide array of statistical modules:
Data Handling & Utilities

  * Flexible Data Input: Paste data directly, upload `.csv` or `.txt` files.

  * Monte Carlo Generator: Create simulated datasets from Normal, Lognormal, or Weibull distributions.

  * Monte Carlo CDF: Displays cumulative distribution plots below the histogram.

  * International Support: Handles both `.` and `,` as decimal separators.

  * Session Management: Save and load your complete analysis state (data and settings) to a `.json` file.

  * Customization: Switch between light and dark themes.

  * Multilingual: UI translated into English, Portuguese, and German.

Statistical Analysis Modules

 * Normal & Multi-Distribution Analysis:

     * Analyze data against a normal distribution.

     * Compare the fit of Normal, Lognormal, Weibull, and Exponential distributions using the Anderson-Darling test to find the best fit.

     * Includes CDF (cumulative distribution) plots below histograms.

   * Descriptive Statistics & Graphs:

     * Generate key statistics (Mean, Median, Std. Dev, etc.).

     * Visualize data with interactive Histograms, Box Plots, and Interval Plots.

      * Group data by a categorical variable for comparative analysis.

      * Includes CDF (cumulative distribution) plots below histograms.

  * Tolerance Interval (Normal & Non-Parametric):

      * Calculate two-sided tolerance limits using the normal method (k-factor) or non-parametric sample range.

      * Includes normality check via Anderson-Darling and a histogram with fitted normal curve.

      * Includes CDF (cumulative distribution) plot below the histogram.

  * Process Capability (Cp, Cpk, Pp, Ppk):

      * Conduct full capability analysis for both normal and non-normal (best-fit) data.

      * Visualize results with a capability plot showing data distribution against specification limits (LSL/USL).

  * Hypothesis Testing:

       * Perform 1-Sample t-tests, 2-Sample t-tests, Paired t-tests, F-tests (equal variances), and One-Way ANOVA.

       * View detailed summaries, group statistics, and box plot comparisons.

   * Statistical Process Control (SPC):

        * Generate I-MR (Individuals & Moving Range) and Xbar-R (X-bar & Range) charts.

        * Automatically detect and flag standard alarm rule violations.

   * Pareto Analysis:

        * Create Pareto charts to identify the most significant factors in a dataset.

        * Supports both frequency counts and summation of a value column.

   * Regression & Correlation:

        * Perform linear regression with multiple explanatory variables.

        * Provides an ANOVA table, coefficient analysis, and a regression equation.

        * Includes diagnostic plots (Normal Probability of Residuals, Residuals vs. Order, Standardized Effects).

        * Features tools for outlier detection/removal and stepwise term removal.

   * Measurement System Analysis (MSA / Gage R&R):

        * Analyze measurement system variation using ANOVA or the Average & Range method.

        * Calculates key metrics like %Contribution, %Study Var, and the Number of Distinct Categories (ndc).

        * Generates charts for Components of Variation and Operator-Part interaction.

   * Weibayes Analysis:

        * Perform 1-Param (fixed Beta) and 2-Param (Weibull Regression) reliability analysis.

        * Calculate Characteristic Life (Eta) and Bx Life at specified confidence levels.

        * Visualize results with interactive Reliability and Probability plots.
        
   * Weibull Analysis:

        * Fit 2-Param Weibull models using LSXY (rank regression) or MLE methods.

        * Supports right-censored data and reports Goodness of Fit and Percentiles.

        * Visualize results with an interactive Weibull Probability Plot.

   * Warranty Prediction:

        * Predict future warranty claims and costs based on historical failure data parameters.

        * Supports Weibull, Normal, and Exponential distributions.

        * Flexible production schedule input (variable batches or constant rates).

        * Visualizes forecasts with confidence intervals.

# Libraries Used

The application is built with vanilla JavaScript and does not require a web server or any build steps.

  `Plotly.js:` For all interactive charting and data visualization.

  `jStat.js:` For core statistical calculations and distributions.

  `MathJax:` For rendering mathematical formulas and symbols beautifully.

# Design System

The application's UI is built upon a simple, token-based design system defined directly within the CSS. This ensures a consistent and maintainable visual style across all components and themes (light and dark).

## Tokens

Design tokens are used to manage the core visual properties of the UI. They are defined as CSS variables and include:
  
  `Colors:` A palette for text, backgrounds, borders, and accents. These tokens are swapped out when switching between themes.

  `Typography:` Font sizes, weights, and families for headings, body text, and labels.

  `Spacing:` Consistent margins and padding values for layout and component spacing.

  `Sizing:` Standard sizes for UI elements like buttons and form inputs.

# How to Use

  1. Clone this repository or download the index.html file.
  
  2. Open the index.html file in any modern web browser (like Chrome, Firefox, or Edge).

  3. Use the sidebar to input your data by pasting it, uploading a file, or using the Monte Carlo generator.

  4. Select your desired analysis from the top dropdown menu.

  5. Configure the specific parameters for your chosen analysis in the sidebar.

  6. Click Analyze (or the relevant action button) to view the results.

# Contributing

Contributions are welcome! If you have a feature request, bug report, or want to improve the code, please feel free to open an issue or submit a pull request.

# Acknowledgments

  This tool was originally created and designed for Bosch Power Tools, by the authors:

  * Gabriel Peregrino

  * Daniel Vesenmaier
