# Flickr's Justified Gallery

Flickr justified images gallery based on [https://github.com/flickr/justified-layout](https://github.com/flickr/justified-layout).

## [Demo](https://free.nkdev.info/flickr-justified-gallery/)

## Sizes

 File                   | Gzipped Size
:-----------------------|:------------------------------------------------------------------------------------------------|
fjGallery.min.js         | ![fjGallery.min.js](https://img.badgesize.io/nk-o/flickr-justified-gallery/master/dist/fjGallery.min.js?compression=gzip)

## Usage with WordPress

[![Visual Portfolio](https://a.nkdev.info/visual-portfolio/preview.jpg?v=2)](https://visualportfolio.co/)

We made WordPress plugin to easily create image galleries and portfolios in your blog with masonry, tiles and Flickr's Justified Gallery layouts.

Demo: <https://visualportfolio.co/>

Download: <https://nkdev.info/downloads/visual-portfolio/>

## Getting Started

### ES6

`npm install flickr-justified-gallery --save`

```javascript
import fjGallery from 'flickr-justified-gallery';
```

### Browser

```html
<script src="flickr-justified-gallery/dist/fjGallery.min.js"></script>
<link href="flickr-justified-gallery/dist/fjGallery/fjGallery.css" rel="stylesheet">
```

#### CDN

Link directly from [unpkg](https://unpkg.com/)

```html
<script src="https://unpkg.com/flickr-justified-gallery@1/dist/fjGallery.min.js"></script>
<link href="https://unpkg.com/flickr-justified-gallery@1/dist/fjGallery.css" rel="stylesheet">
```

## Set up your HTML

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

## Call the plugin

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

## No conflict

If you already have global ***fjGallery*** variable or ***jQuery.fn.fjGallery***, you can rename plugin.

```javascript
// JavaScript:
var newFjGallery = fjGallery.noConflict();

// jQuery:
jQuery.fn.newFjGallery = jQuery.fn.fjGallery.noConflict();
```

## For Developers

### Installation

* Run `npm install` in the command line. Or if you need to update some dependencies, run `npm update`

### Building

* `npm run dev` to run build and start local server with files watcher
* `npm run build` to run build

### Linting

* `npm run js-lint` to show eslint errors
* `npm run js-lint-fix` to automatically fix some of the eslint errors
