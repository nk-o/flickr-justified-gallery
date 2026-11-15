# Changelog

## [2.3.0] - Nov 16, 2026

- changed resize handling: each gallery watches its own container with `ResizeObserver` and lays out again only when the container width changes, so a page builder or a sidebar that widens the container no longer leaves overlapping rows
- fixed a gallery inside a hidden tab or accordion being laid out at zero width and opening squashed
- fixed an endless relayout when the gallery height toggles the page scrollbar; this covers scrollable parents too, and the gallery settles at the narrower width and stays inside its container
- removed the global window `resize` and `orientationchange` listeners
- changed `onBeforeJustify` and `onJustify` to not fire while the container is hidden, and `onJustify` fires once on init instead of twice
- changed: with `calculateItemsHeight`, an item whose height changes (a caption at a new breakpoint) lays the gallery out again

## [2.2.0] - Feb 5, 2024

- added `edgeCaseMinRowHeight` and `edgeCaseMaxRowHeight` options
- changed `justified-layout` to `better-justified-layout`
- fixed `calculateItemsHeight` option to use row indexes for correct row height calculation

## [2.1.2] - Jun 12, 2022

- added ESM and CJS builds
- added Prettier
- fixed wrong image size calculation when naturalWidth return null or zero
- changed bundler to Rollup
- dropped IE support

## [2.0.0] - Oct 11, 2021

- added `maxRowsCount` option
- added `lastRow` option
- added `transitionDuration` option (CSS transition no more used)
- fixed RTL images position
- removed automatic initialization (use JS manual initialization instead)
- removed deprecated option `resizeThrottle`. Use `resizeDebounce` instead
- removed `-webkit-transform` usage
- removed `merge` dependency

## [1.0.3] - Jul 11, 2020

- added RTL support
- removed `rafl` dependency usage (use native `requestAnimationFrame` instead)
- updated all NPM dependencies

## [1.0.0] - Jun 8, 2018

- initial release
