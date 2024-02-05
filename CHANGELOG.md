# Changelog

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
