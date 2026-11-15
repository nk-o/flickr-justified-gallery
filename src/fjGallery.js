import { debounce } from 'throttle-debounce';
import rafSchd from 'raf-schd';
import justifiedLayout from 'better-justified-layout';

import global from './utils/global';
import getImgDimensions from './utils/get-img-dimensions';

// Longer than one turn of the scrollbar loop, debounce and transitions included.
const SCROLLBAR_LOOP_TIME = 1000;

let instanceID = 0;

// fjGallery class
class FJGallery {
  constructor(container, userOptions) {
    const self = this;

    self.instanceID = instanceID;
    instanceID += 1;

    self.$container = container;

    self.images = [];

    self.defaults = {
      itemSelector: '.fj-gallery-item',
      imageSelector: 'img',
      gutter: 10, // supports object like `{ horizontal: 10, vertical: 10 }`.
      rowHeight: 320,
      rowHeightTolerance: 0.25, // [0, 1]
      maxRowsCount: Number.POSITIVE_INFINITY,
      edgeCaseMinRowHeight: 0.5,
      edgeCaseMaxRowHeight: 2.5,
      lastRow: 'left', // left, center, right, hide
      transitionDuration: '0.3s',
      calculateItemsHeight: false,
      resizeDebounce: 100,
      isRtl: self.css(self.$container, 'direction') === 'rtl',

      // events
      onInit: null, // function() {}
      onDestroy: null, // function() {}
      onAppendImages: null, // function() {}
      onBeforeJustify: null, // function() {}
      onJustify: null, // function() {}
    };

    // prepare data-options
    const dataOptions = self.$container.dataset || {};
    const pureDataOptions = {};
    Object.keys(dataOptions).forEach((key) => {
      const loweCaseOption = key.substr(0, 1).toLowerCase() + key.substr(1);
      if (loweCaseOption && typeof self.defaults[loweCaseOption] !== 'undefined') {
        pureDataOptions[loweCaseOption] = dataOptions[key];
      }
    });

    self.options = {
      ...self.defaults,
      ...pureDataOptions,
      ...userOptions,
    };

    self.pureOptions = {
      ...self.options,
    };

    // debounce for resize
    self.resize = debounce(self.options.resizeDebounce, self.resize);
    self.justify = rafSchd(self.justify.bind(self));

    self.init();
  }

  // add styles to element
  // eslint-disable-next-line class-methods-use-this
  css(el, styles) {
    if (typeof styles === 'string') {
      return global.getComputedStyle(el).getPropertyValue(styles);
    }

    Object.keys(styles).forEach((key) => {
      el.style[key] = styles[key];
    });
    return el;
  }

  // set temporary transition with event listener
  applyTransition($item, properties) {
    const self = this;

    // Remove previous event listener
    self.onTransitionEnd($item)();

    // Add transitions
    self.css($item, {
      'transition-property': properties.join(', '),
      'transition-duration': self.options.transitionDuration,
    });

    // Add event listener
    $item.addEventListener('transitionend', self.onTransitionEnd($item, properties), false);
  }

  onTransitionEnd($item) {
    const self = this;

    return () => {
      self.css($item, {
        'transition-property': '',
        'transition-duration': '',
      });

      $item.removeEventListener('transitionend', self.onTransitionEnd($item));
    };
  }

  getView() {
    return this.$container.ownerDocument.defaultView || global;
  }

  getContainerWidth() {
    return this.$container.getBoundingClientRect().width;
  }

  // lay out again when the container width changes, not the window
  observe() {
    const self = this;
    const view = self.getView();

    self.resizeObserver = new view.ResizeObserver(() => {
      const width = self.getContainerWidth();

      if (width && (self.isPending || !self.lastLayout || width !== self.lastLayout.width)) {
        self.resize();
      }
    });
    self.resizeObserver.observe(self.$container);

    // late fonts change caption heights without changing the width
    if (view.document.readyState !== 'complete') {
      self.onWindowLoad = () => {
        self.resize();
      };
      view.addEventListener('load', self.onWindowLoad, { once: true });
    }
  }

  unobserve() {
    const self = this;

    if (self.resizeObserver) {
      self.resizeObserver.disconnect();
      self.resizeObserver = null;
    }
    if (self.onWindowLoad) {
      self.getView().removeEventListener('load', self.onWindowLoad);
      self.onWindowLoad = null;
    }
  }

  rememberLayout(width) {
    const self = this;
    const view = self.getView();

    if (!self.lastLayout || self.lastLayout.width !== width) {
      self.beforeLayout = self.lastLayout;
      self.lastLayout = {
        width,
        viewport: view.innerWidth,
        scrollbar: view.innerWidth - view.document.documentElement.clientWidth,
        time: view.performance.now(),
      };
    }
  }

  // The page height can sit between its two scrollbar states: the wide layout
  // brings the scrollbar, the narrow one it leaves loses it, and back. Items
  // are placed in px, so the loop stops at the narrow layout, which fits.
  isScrollbarLoop(width) {
    const self = this;
    const before = self.beforeLayout;
    const last = self.lastLayout;

    if (!before || !last) {
      return false;
    }

    const view = self.getView();
    const viewport = view.innerWidth;
    const scrollbar = viewport - view.document.documentElement.clientWidth;

    return (
      width === before.width &&
      width > last.width &&
      viewport === before.viewport &&
      viewport === last.viewport &&
      scrollbar < last.scrollbar &&
      view.performance.now() - last.time < SCROLLBAR_LOOP_TIME
    );
  }

  init() {
    const self = this;

    self.appendImages(self.$container.querySelectorAll(self.options.itemSelector));

    self.observe();

    // call onInit event
    if (self.options.onInit) {
      self.options.onInit.call(self);
    }
  }

  // append images
  appendImages($images) {
    const self = this;

    // check if jQuery
    if (global.jQuery && $images instanceof global.jQuery) {
      $images = $images.get();
    }

    if (!$images || !$images.length) {
      return;
    }

    $images.forEach(($item) => {
      // if $images is jQuery, for some reason in this array there is undefined item, that not a DOM,
      // so we need to check for $item.querySelector.
      if ($item && !$item.fjGalleryImage && $item.querySelector) {
        const $image = $item.querySelector(self.options.imageSelector);

        if ($image) {
          $item.fjGalleryImage = self;
          const data = {
            $item,
            $image,
            width: parseFloat($image.getAttribute('width')) || false,
            height: parseFloat($image.getAttribute('height')) || false,
            loadSizes() {
              const itemData = this;
              getImgDimensions($image, (dimensions) => {
                if (itemData.width !== dimensions.width || itemData.height !== dimensions.height) {
                  itemData.width = dimensions.width;
                  itemData.height = dimensions.height;
                  self.resize();
                }
              });
            },
          };
          data.loadSizes();

          self.images.push(data);
        }
      }
    });

    // call onAppendImages event
    if (self.options.onAppendImages) {
      self.options.onAppendImages.call(self, [$images]);
    }

    self.justify();
  }

  // justify images
  justify() {
    const self = this;
    const justifyArray = [];
    const containerWidth = self.getContainerWidth();

    // a hidden container keeps its layout until it gets a width again
    if (!containerWidth) {
      self.isPending = true;
      return;
    }

    self.isPending = false;
    self.rememberLayout(containerWidth);

    self.justifyCount = (self.justifyCount || 0) + 1;

    // call onBeforeJustify event
    if (self.options.onBeforeJustify) {
      self.options.onBeforeJustify.call(self);
    }

    self.images.forEach((data) => {
      if (data.width && data.height) {
        justifyArray.push(data.width / data.height);
      }
    });

    const justifiedOptions = {
      containerWidth,
      containerPadding: {
        top: parseFloat(self.css(self.$container, 'padding-top')) || 0,
        right: parseFloat(self.css(self.$container, 'padding-right')) || 0,
        bottom: parseFloat(self.css(self.$container, 'padding-bottom')) || 0,
        left: parseFloat(self.css(self.$container, 'padding-left')) || 0,
      },
      boxSpacing: self.options.gutter,
      targetRowHeight: self.options.rowHeight,
      targetRowHeightTolerance: self.options.rowHeightTolerance,
      maxNumRows: self.options.maxRowsCount,
      edgeCaseMinRowHeight: self.options.edgeCaseMinRowHeight,
      edgeCaseMaxRowHeight: self.options.edgeCaseMaxRowHeight,
      showWidows: self.options.lastRow !== 'hide',
    };
    const justifiedData = justifiedLayout(justifyArray, justifiedOptions);

    // Align last row
    if (
      justifiedData.widowCount &&
      (self.options.lastRow === 'center' || self.options.lastRow === 'right')
    ) {
      const lastItemData = justifiedData.boxes[justifiedData.boxes.length - 1];
      let gapSize = justifiedOptions.containerWidth - lastItemData.width - lastItemData.left;

      if (self.options.lastRow === 'center') {
        gapSize /= 2;
      }
      if (self.options.lastRow === 'right') {
        gapSize -= justifiedOptions.containerPadding.right;
      }

      for (let i = 1; i <= justifiedData.widowCount; i += 1) {
        justifiedData.boxes[justifiedData.boxes.length - i].left =
          justifiedData.boxes[justifiedData.boxes.length - i].left + gapSize;
      }
    }

    // RTL compatibility
    if (self.options.isRtl) {
      justifiedData.boxes.forEach((boxData, i) => {
        justifiedData.boxes[i].left =
          justifiedOptions.containerWidth -
          justifiedData.boxes[i].left -
          justifiedData.boxes[i].width -
          justifiedOptions.containerPadding.right +
          justifiedOptions.containerPadding.left;
      });
    }

    let i = 0;
    let additionalTopOffset = 0;
    const rowsMaxHeight = {};

    // Set image sizes.
    self.images.forEach((data, imgI) => {
      if (justifiedData.boxes[i] && data.width && data.height) {
        // calculate additional offset based on actual items height.
        if (
          self.options.calculateItemsHeight &&
          typeof rowsMaxHeight[justifiedData.boxes[i].row] === 'undefined' &&
          Object.keys(rowsMaxHeight).length
        ) {
          additionalTopOffset +=
            rowsMaxHeight[Object.keys(rowsMaxHeight).pop()] - justifiedData.boxes[imgI - 1].height;
        }

        if (self.options.transitionDuration && self.justifyCount > 1) {
          self.applyTransition(data.$item, ['transform']);
        }

        self.css(data.$item, {
          display: '',
          position: 'absolute',
          transform: `translateX(${justifiedData.boxes[i].left}px) translateY(${
            justifiedData.boxes[i].top + additionalTopOffset
          }px) translateZ(0)`,
          width: `${justifiedData.boxes[i].width}px`,
        });

        // calculate actual items height.
        if (self.options.calculateItemsHeight) {
          const rect = data.$item.getBoundingClientRect();

          if (
            typeof rowsMaxHeight[justifiedData.boxes[i].row] === 'undefined' ||
            rowsMaxHeight[justifiedData.boxes[i].row] < rect.height
          ) {
            rowsMaxHeight[justifiedData.boxes[i].row] = rect.height;
          }
        }

        i += 1;
      } else {
        self.css(data.$item, {
          display: 'none',
        });
      }
    });

    // increase additional offset based on the latest row items height.
    if (self.options.calculateItemsHeight && Object.keys(rowsMaxHeight).length) {
      additionalTopOffset +=
        rowsMaxHeight[Object.keys(rowsMaxHeight).pop()] -
        justifiedData.boxes[justifiedData.boxes.length - 1].height;
    }

    if (self.options.transitionDuration) {
      self.applyTransition(self.$container, ['height']);
    }

    // Set container height.
    self.css(self.$container, {
      height: `${justifiedData.containerHeight + additionalTopOffset}px`,
    });

    // call onJustify event
    if (self.options.onJustify) {
      self.options.onJustify.call(self);
    }
  }

  // update options and resize gallery items
  updateOptions(options) {
    const self = this;
    self.options = {
      ...self.options,
      ...options,
    };
    self.justify();
  }

  destroy() {
    const self = this;

    self.unobserve();
    self.resize.cancel();
    self.justify.cancel();

    self.justifyCount = 0;

    // call onDestroy event
    if (self.options.onDestroy) {
      self.options.onDestroy.call(self);
    }

    // remove styles.
    self.css(self.$container, {
      height: '',
      transition: '',
    });
    self.images.forEach((data) => {
      self.css(data.$item, {
        position: '',
        transform: '',
        transition: '',
        width: '',
        height: '',
      });
    });

    // delete fjGalleryImage instance from images
    self.images.forEach((val) => {
      delete val.$item.fjGalleryImage;
    });

    // delete fjGallery instance from container
    delete self.$container.fjGallery;
  }

  resize() {
    const self = this;
    const width = self.getContainerWidth();

    if (!width || self.isScrollbarLoop(width)) {
      return;
    }

    self.justify();
  }
}

// global definition
const fjGallery = function (items, options, ...args) {
  // check for dom element
  // thanks: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  if (
    typeof HTMLElement === 'object'
      ? items instanceof HTMLElement
      : items &&
        typeof items === 'object' &&
        items !== null &&
        items.nodeType === 1 &&
        typeof items.nodeName === 'string'
  ) {
    items = [items];
  }

  const len = items.length;
  let k = 0;
  let ret;

  for (k; k < len; k += 1) {
    if (typeof options === 'object' || typeof options === 'undefined') {
      if (!items[k].fjGallery) {
        // eslint-disable-next-line new-cap
        items[k].fjGallery = new FJGallery(items[k], options);
      }
    } else if (items[k].fjGallery) {
      // eslint-disable-next-line prefer-spread
      ret = items[k].fjGallery[options].apply(items[k].fjGallery, args);
    }
    if (typeof ret !== 'undefined') {
      return ret;
    }
  }

  return items;
};
fjGallery.constructor = FJGallery;

export default fjGallery;
