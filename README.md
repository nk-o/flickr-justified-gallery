# Flickr's Justified Gallery <!-- omit in toc -->

![fjGallery.min.js](https://img.badgesize.io/nk-o/flickr-justified-gallery/master/dist/fjGallery.min.js?compression=gzip)

Flickr justified images gallery layout.

## [Online Demo](https://flickr-justified-gallery.nkdev.info)

## Table of Contents <!-- omit in toc -->

- [Online Demo](#online-demo)
- [WordPress Plugin](#wordpress-plugin)
- [Import fjGallery](#import-fjgallery)
  - [ESM](#esm)
  - [ESM + Skypack](#esm--skypack)
  - [UMD](#umd)
  - [UMD + UNPKG](#umd--unpkg)
  - [CJS (Bundlers like Webpack)](#cjs-bundlers-like-webpack)
- [Add Styles](#add-styles)
- [Prepare HTML](#prepare-html)
- [Run fjGallery](#run-fjgallery)
  - [A. JavaScript way](#a-javascript-way)
  - [B. jQuery way](#b-jquery-way)
- [Options](#options)
- [Events](#events)
- [Methods](#methods)
  - [Call methods example](#call-methods-example)
- [For Developers](#for-developers)

## WordPress Plugin

[![Visual Portfolio](https://a.nkdev.info/visual-portfolio/preview.jpg?v=2)](https://visualportfolio.co/)

We made WordPress plugin to easily create image galleries and portfolios in your blog with masonry, tiles and Flickr's Justified Gallery layouts.

Demo: <https://visualportfolio.co/>

Download: <https://wordpress.org/plugins/visual-portfolio/>

## Import fjGallery

Use one of the following examples to import fjGallery.

### ESM

We provide a version of fjGallery built as ESM (fjGallery.esm.js and fjGallery.esm.min.js) which allows you to use fjGallery as a module in your browser, if your [targeted browsers support it](https://caniuse.com/es6-module).

```html
<script type="module">
  import fjGallery from "fjGallery.esm.min.js";
</script>
```

### ESM + [Skypack](https://www.skypack.dev/)

```html
<script type="module">
  import fjGallery from "https://cdn.skypack.dev/flickr-justified-gallery@2.1?min";
</script>
```

### UMD

fjGallery may be also used in a traditional way by including script in HTML and using library by accessing `window.fjGallery`.

```html
<link href="fjGallery.css" rel="stylesheet">
<script src="fjGallery.min.js"></script>
```

### UMD + [UNPKG](https://unpkg.com/)

```html
<link href="https://unpkg.com/flickr-justified-gallery@2.1/dist/fjGallery.css" rel="stylesheet">
<script src="https://unpkg.com/flickr-justified-gallery@2.1"></script>
```

### CJS (Bundlers like Webpack)

Install fjGallery as a Node.js module using npm

```
npm install flickr-justified-gallery
```

Import fjGallery by adding this line to your app's entry point (usually `index.js` or `app.js`):

```javascript
import fjGallery from "flickr-justified-gallery";
```

## Add Styles

These styles required to set proper image position. Import style from `/dist/fjGallery.css`.

## Prepare HTML

```html
<div class="fj-gallery">
  <div class="fj-gallery-item">
    <img src="<image_url_here>" alt="" width="200" height="200">
  </div>
  <div class="fj-gallery-item">
    <img src="<image_url_here>" alt="" width="200" height="200">
  </div>
  ...
</div>
```

## Run fjGallery

### A. JavaScript way

```javascript
fjGallery(document.querySelectorAll('.fj-gallery'), {
  itemSelector: '.fj-gallery-item'
});
```

### B. jQuery way

```javascript
$('.fj-gallery').fjGallery({
  itemSelector: '.fj-gallery-item'
});
```

#### No conflict (only if you use jQuery) <!-- omit in toc -->

Sometimes to prevent existing namespace collisions you may call `.noConflict` on the script to revert the value of.

```javascript
const fjGalleryPlugin = $.fn.fjGallery.noConflict() // return $.fn.fjGallery to previously assigned value
$.fn.newFjGallery = fjGalleryPlugin // give $().newFjGallery the fjGallery functionality
```

## Options

Name | Type | Default | Description
:--- | :--- | :------ | :----------
itemSelector | string | `.fj-gallery-item` | Items selector.
imageSelector | string | `img` | Image selector, will find in `itemSelector`.
gutter | int/object | `10` | Gutter between items, supports object like `{ horizontal: 10, vertical: 10 }`.
rowHeight | int | `320` | Rows height.
rowHeightTolerance | float | `0.25` | How far row heights can stray from `rowHeight`. `0` would force rows to be the `rowHeight` exactly and would likely make it impossible to justify. The value must be between `0` and `1`.
maxRowsCount | int | `Number.POSITIVE_INFINITY` | Limits the number of rows to show at this number regardless of how many items still need to be laid out.
lastRow | string | `left` | Last row align. Available values: `left`, `center`, `right`, `hide`.
transitionDuration | string|bool | `0.3s` | Duration of the transition when items change position, set in a CSS time format. Set boolean `false` to disable transitions.
calculateItemsHeight | bool | `false` | Calculate items height in order to support images captions and other content, so rows can be displayed properly.
resizeDebounce | int | `100` | Window resize debounce timeout in `ms`.

## Events

Events used the same way as Options.

Name | Description
:--- | :----------
onInit | Called after init end.
onDestroy | Called after destroy.
onAppendImages | Called after appended new images (available 1 argument with images array).
onBeforeJustify | Called before justification algorythm start working.
onJustify | Called after images justified.

## Methods

Name | Result | Description
:--- | :----- | :----------
resize | - | Justify images and container. Called on window resize and load.
appendImages | - | Called after you appended new items in the gallery container, required 1 argument with new items array.
updateOptions | - | Update current gallery options and recalculate it, required 1 argument with new options.
destroy | - | Destroy fjGallery and set block as it was before plugin init.

### Call methods example

```javascript
// Javascript
fjGallery(document.querySelectorAll('.fj-gallery'), 'destroy');

// jQuery
$('.fj-gallery').fjGallery('destroy');
```

## For Developers

### Installation <!-- omit in toc -->

* Run `npm install` in the command line

### Building <!-- omit in toc -->

* `npm run dev` to run build and start local server with files watcher
* `npm run build` to run build

### Linting <!-- omit in toc -->

* `npm run js-lint` to show eslint errors
* `npm run js-lint-fix` to automatically fix some of the eslint errors
