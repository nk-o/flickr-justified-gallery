import { debounce } from 'throttle-debounce';
import rafSchd from 'raf-schd';
import domReady from 'lite-ready';
import justifiedLayout from 'justified-layout';
import { window } from 'global';

// list with all fjGallery instances
// need to render all in one scroll/resize event
const fjGalleryList = [];

const updateFjGallery = rafSchd(() => {
    fjGalleryList.forEach((item) => {
        item.resize();
    });
});

window.addEventListener('resize', updateFjGallery);
window.addEventListener('orientationchange', updateFjGallery);
window.addEventListener('load', updateFjGallery);
domReady(() => {
    updateFjGallery();
});

// get image dimensions
// thanks https://gist.github.com/dimsemenov/5382856
function getImgDimensions(img, cb) {
    let interval;
    let hasSize = false;
    let addedListeners = false;

    const onHasSize = () => {
        if (hasSize) {
            cb(hasSize);
            return;
        }

        hasSize = {
            width: img.naturalWidth,
            height: img.naturalHeight,
        };
        cb(hasSize);

        clearInterval(interval);
        if (addedListeners) {
            // eslint-disable-next-line no-use-before-define
            removeListeners();
        }
    };
    const onLoaded = () => {
        onHasSize();
    };
    const onError = () => {
        onHasSize();
    };
    const checkSize = () => {
        if (img.naturalWidth > 0) {
            onHasSize();
        }
    };
    const addListeners = () => {
        addedListeners = true;
        img.addEventListener('load', onLoaded);
        img.addEventListener('error', onError);
    };
    const removeListeners = () => {
        addedListeners = false;
        img.removeEventListener('load', onLoaded);
        img.removeEventListener('error', onError);
    };

    checkSize();

    if (!hasSize) {
        addListeners();
        interval = setInterval(checkSize, 100);
    }
}

let instanceID = 0;

// fjGallery class
class fjGallery {
    constructor(container, userOptions) {
        const self = this;

        self.instanceID = instanceID++;

        self.$container = container;

        self.images = [];

        self.defaults = {
            itemSelector: '.fj-gallery-item',
            imageSelector: 'img',
            gutter: 10, // supports object like `{ horizontal: 10, vertical: 10 }`.
            rowHeight: 320,
            rowHeightTolerance: 0.25, // [0, 1]
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

        // deprecated resizeThrottle option.
        if (typeof self.options.resizeThrottle !== 'undefined') {
            // eslint-disable-next-line no-console
            console.warning('`resizeThrottle` option is deprecated, use `resizeDebounce` instead');
            self.options.resizeDebounce = self.options.resizeThrottle;
        }

        self.pureOptions = {
            ...self.options,
        };

        // debounce for resize
        self.resize = debounce(self.options.resizeDebounce, self.resize);
        self.justify = rafSchd(self.justify.bind(self));

        self.init();
    }

    // add styles to element
    css(el, styles) {
        if (typeof styles === 'string') {
            return window.getComputedStyle(el).getPropertyValue(styles);
        }

        // add transform property with vendor prefix
        if (styles.transform) {
            styles['-webkit-transform'] = styles.transform;
        }

        Object.keys(styles).forEach((key) => {
            el.style[key] = styles[key];
        });
        return el;
    }

    // add to fjGallery instances list
    addToFjGalleryList() {
        fjGalleryList.push(this);
        updateFjGallery();
    }

    // remove from fjGallery instances list
    removeFromFjGalleryList() {
        const self = this;

        fjGalleryList.forEach((item, key) => {
            if (item.instanceID === self.instanceID) {
                fjGalleryList.splice(key, 1);
            }
        });
    }

    init() {
        const self = this;

        self.appendImages(self.$container.querySelectorAll(self.options.itemSelector));

        self.addToFjGalleryList();

        // call onInit event
        if (self.options.onInit) {
            self.options.onInit.call(self);
        }
    }

    // append images
    appendImages($images) {
        const self = this;

        // check if jQuery
        if (window.jQuery && $images instanceof window.jQuery) {
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

        // call onBeforeJustify event
        if (self.options.onBeforeJustify) {
            self.options.onBeforeJustify.call(self);
        }

        self.images.forEach((data) => {
            if (data.width && data.height) {
                justifyArray.push(data.width / data.height);
            }
        });

        const justifiedData = justifiedLayout(justifyArray, {
            containerWidth: self.$container.getBoundingClientRect().width,
            containerPadding: {
                top: parseFloat(self.css(self.$container, 'padding-top')) || 0,
                right: parseFloat(self.css(self.$container, 'padding-right')) || 0,
                bottom: parseFloat(self.css(self.$container, 'padding-bottom')) || 0,
                left: parseFloat(self.css(self.$container, 'padding-left')) || 0,
            },
            boxSpacing: self.options.gutter,
            targetRowHeight: self.options.rowHeight,
            targetRowHeightTolerance: self.options.rowHeightTolerance,
        });

        let i = 0;
        let additionalTopOffset = 0;
        const rowsMaxHeight = {};

        // Set image sizes.
        self.images.forEach((data, imgI) => {
            if (data.width && data.height) {
                // calculate additional offset based on actual items height.
                if (self.options.calculateItemsHeight && typeof rowsMaxHeight[justifiedData.boxes[i].top] === 'undefined' && Object.keys(rowsMaxHeight).length) {
                    additionalTopOffset += rowsMaxHeight[Object.keys(rowsMaxHeight).pop()] - justifiedData.boxes[imgI - 1].height;
                }

                self.css(data.$item, {
                    position: 'absolute',
                    transform: `translateX(${(self.options.isRtl ? -1 : 1) * justifiedData.boxes[i].left}px) translateY(${justifiedData.boxes[i].top + additionalTopOffset}px) translateZ(0)`,
                    width: `${justifiedData.boxes[i].width}px`,
                });

                // calculate actual items height.
                if (self.options.calculateItemsHeight) {
                    const rect = data.$item.getBoundingClientRect();

                    if (typeof rowsMaxHeight[justifiedData.boxes[i].top] === 'undefined' || rowsMaxHeight[justifiedData.boxes[i].top] < rect.height) {
                        rowsMaxHeight[justifiedData.boxes[i].top] = rect.height;
                    }
                }

                i++;
            }
        });

        // increase additional offset based on the latest row items height.
        if (self.options.calculateItemsHeight && Object.keys(rowsMaxHeight).length) {
            additionalTopOffset += rowsMaxHeight[Object.keys(rowsMaxHeight).pop()] - justifiedData.boxes[justifiedData.boxes.length - 1].height;
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

        self.removeFromFjGalleryList();

        // call onDestroy event
        if (self.options.onDestroy) {
            self.options.onDestroy.call(self);
        }

        // remove styles.
        self.css(self.$container, {
            height: '',
        });
        self.images.forEach((data) => {
            self.css(data.$item, {
                position: '',
                transform: '',
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

        self.justify();
    }
}

// global definition
const plugin = function (items) {
    // check for dom element
    // thanks: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    if (typeof HTMLElement === 'object' ? items instanceof HTMLElement : items && typeof items === 'object' && items !== null && items.nodeType === 1 && typeof items.nodeName === 'string') {
        items = [items];
    }

    const options = arguments[1];
    const args = Array.prototype.slice.call(arguments, 2);
    const len = items.length;
    let k = 0;
    let ret;

    for (k; k < len; k++) {
        if (typeof options === 'object' || typeof options === 'undefined') {
            if (!items[k].fjGallery) {
                // eslint-disable-next-line new-cap
                items[k].fjGallery = new fjGallery(items[k], options);
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
plugin.constructor = fjGallery;

export default plugin;
