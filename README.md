# Bosch Power Tools | Statistics Center

A browser-based application for statistical analysis. This tool provides a suite of interactive modules for data analysis, visualization, and process control, designed for engineers, analysts, and data scientists. It operates entirely offline.

This project was originally designed for internal use at Bosch and has been prepared here as a standalone, open-source repository.

# Features

The application is a comprehensive tool that includes a wide array of statistical modules:
<!-- ... (Features list remains the same) ... -->

# Project Structure

The project has been refactored into a modular architecture for better maintainability and scalability:

```
Statistics-Center/
├── index.html
├── style.css
├── core.js
├── utils.js
├── translations.js
└── modules/
    ├── capability.js
    ├── distribution.js
    ├── graphs.js
    ├── hypothesis.js
    ├── montecarlo.js
    ├── msa.js
    ├── pareto.js
    ├── regression.js
    ├── spc.js
    ├── warranty.js
    ├── weibayes.js
    └── weibull.js
```

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

  1. Clone this repository or download the entire project folder.
  
  2. Open the `index.html` file in any modern web browser (like Chrome, Firefox, or Edge).

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
