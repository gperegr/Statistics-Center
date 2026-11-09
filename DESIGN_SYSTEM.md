# Statistics Center — design system proposal

Status: an interactive proposal is implemented in `liquid-glass-mockup.html`; the application itself has not been restyled. The exact iOS 27 and macOS 27 “Golden Gate” releases and any changes specific to them still require verification against current Apple documentation. This document uses established Liquid Glass principles as design direction, not a claim of pixel equivalence to an Apple system UI.

## Source of truth and scope

- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Liquid Glass: https://developer.apple.com/design/human-interface-guidelines/liquid-glass
- Color: https://developer.apple.com/design/human-interface-guidelines/color
- Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility

These pages were blocked by the environment's outbound network policy (HTTP CONNECT 403); confirm current version details and platform naming before final visual sign-off. Recreate the behavior and hierarchy of translucent controls with web technology rather than copying system artwork or trademarks.

## Visual direction of the mockup

Build a statistical workbench around a named sample, its units, editable specification limits, and an analytical result. Use one document toolbar, a translucent sidebar, a solid plotting canvas, and an inspector. Keep summary numbers in one row with separators instead of repeated dashboard cards. Use restrained blue for emphasis, warm dashed specification lines, and consistent SVG icons. Avoid decorative avatars, notification controls, marketing copy, and unrelated gradients.

The current direction is flat and restrained. Selection uses a single moving, flat fill with a subtle border. Remove glass refraction, specular highlights, inset bevels, and backdrop blur. Use transparency in navigation, quiet background gradients, and light shadows only for floating menus, dialogs, and the outer window. Menus use nearly opaque surfaces for readability. Keep all interactions and accessibility preferences. This direction supersedes the earlier Liquid Glass material exploration.

## Principles

Keep data and charts as the visual foreground. Use a restrained translucent layer for navigation, floating toolbars, menus, and dialogs. A translucent surface needs an opaque fallback, a subtle border, and enough contrast over every background; use no backdrop blur or simulated glass highlights. Adapt to light/dark mode, reduced transparency, increased contrast, and reduced motion. Use translucency sparingly in dense analysis forms and never inside the plotting area.

## Tokens

| Role | Light | Dark | Usage |
| --- | --- | --- | --- |
| Canvas | `#FCFCFD` | `#1B2029` | Plotting and content surface |
| Inspector | `#F4F5F7` | `#202630` | Parameter panel |
| Glass tint | `rgba(244,247,252,.68)` | `rgba(37,45,58,.74)` | Navigation and floating chrome |
| Primary text | `#202936` | `#EDF0F5` | Titles and values |
| Secondary text | `#616B78` | `#AFB8C5` | Labels and metadata |
| Hairline | `#E5E7EC` | `#343C49` | Separators and grids |
| Accent | `#1462D7` | `#85B4FF` | Primary action and selection |
| Positive | `#217454` | `#81C9A8` | Favorable capacity result |
| Warning | `#A65522` | `#E8AD7A` | Specification references and caution |
| Negative | `#BE3845` | `#FF96A1` | Input errors |

Use **Arimo**, a neutral sans serif close to Arial/Helvetica, hosted locally in `assets/fonts/arimo/`. Variable weights 400–700; use 400 for text, 500 for controls and values, 600–650 for selection and headings. Stack: `'Arimo', 'Liberation Sans', Arial, sans-serif`. Use the same family in SVG and future Plotly charts. Use tabular numerals for data. Compact desktop labels start at 11px, controls 12–13px, body 14px, page heading 28px; increase touch targets to at least 44px on mobile. Spacing scale: 4, 8, 12, 16, 24, 32px. Corners: 8px fields, 12px selection, 22px window, fully rounded toolbar buttons and segments. Use a visible 3px focus ring with 3px offset.

Arimo is free for personal and commercial use under **SIL Open Font License 1.1**; it is not public domain. Preserve the license and copyright when redistributing the font. [License and source](assets/fonts/arimo/SOURCE.md) document the pinned upstream distribution. The mockup needs no external font service.

## Components

- Primary button: solid accent fill and high-contrast text. Secondary button: solid or lightly tinted surface with border. Icon buttons: 44px square, tooltip and accessible name. Hover changes tint; pressed changes scale minimally; disabled keeps readable label and clear inactive state.
- Text fields, selects, and numeric controls: solid surfaces for legibility. Persistent labels above fields, unit suffixes, visible validation messages, and a clear focus ring. Keep native keyboard and form behavior.
- Slider: accent track, visible thumb, adjacent editable numeric value and units. Provide min/max and step information; keyboard arrows must work. Do not use a slider as the only way to enter exact statistical parameters.
- Segmented controls and tabs: pill-shaped selection with clear active state. Use them for a few peer choices; long analysis lists remain in a select or navigation menu.
- Cards and sidebars: solid analytical content panels. Use restrained transparency in the header and sidebar; menus and dialogs use solid surfaces.
- Dialogs: distinct solid content surface over a dimmed backdrop; trap focus, support Escape, and restore focus to the trigger.
- Tables: fixed header where useful, numeric columns aligned on decimal or right edge, restrained row separators, and explicit units. Color alone must not convey status.

## Charts

Plotly charts use a solid or transparent background over a solid card; glass effects stay outside the plotting area. Text and grid contrast must be checked in both themes. Use a categorical palette such as `#1462D7`, `#168575`, `#8458B5`, `#B36A20`, `#B84270`, `#237F9C`, `#6E7830`, `#776351`; distinguish traces by marker shape and dash pattern too. Reference lines and control limits use labeled lines, not color alone. Keep tooltips opaque, readable, and keyboard reachable when the library permits. Exported PNG/SVG must have explicit background and font colors. Avoid animation for dense plots; honor reduced motion.

## Existing app mapping

The current CSS already defines color tokens and light/dark themes. Map them to semantic roles above rather than replacing every color in one pass. Existing `.app-btn-primary` and `.app-btn-secondary` become the button primitives. `getChartTheme` in `core.js` is the integration point for Plotly backgrounds, fonts, axes, and palette. The current header and About dialog are candidates for the restrained surface treatment. Validate all analysis modules and exports after theme changes.

## Acceptance criteria for implementation

Check light and dark mode, keyboard-only navigation, 200% zoom, narrow screens, reduced motion, reduced transparency, and increased contrast. Verify readable text over every translucent surface, visible focus, chart distinctions without color, form labels and errors, and exported chart fidelity. Treat this specification as the review baseline before changing the app's visual code.


## Reusable implementation

The canonical component code is in `assets/ui/`. Open [the interactive catalog](ui-components.html) and [the component guide](UI_COMPONENTS.md) for class names, examples, padding and background roles, keyboard behavior, and chart color/line standards. `tokens.css` is the source of truth for exact values. The mockup imports this library and keeps its document layout and statistical demo in `assets/mockup/`.
