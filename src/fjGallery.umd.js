import global from './utils/global';
import fjGallery from './fjGallery';

const $ = global.jQuery;

// jQuery support
if ('undefined' !== typeof $) {
  // add data to jQuery .data('fjGallery')
  const oldInit = fjGallery.constructor.prototype.init;
  fjGallery.constructor.prototype.init = function () {
    $(this.$container).data('fjGallery', this);

    if (oldInit) {
      oldInit.call(this);
    }
  };

  // remove data from jQuery .data('fjGallery')
  const oldDestroy = fjGallery.constructor.prototype.destroy;
  fjGallery.constructor.prototype.destroy = function () {
    if (this.$container) {
      $(this.$container).removeData('fjGallery');
    }
    if (oldDestroy) {
      oldDestroy.call(this);
    }
  };

  const $Plugin = function (...args) {
    Array.prototype.unshift.call(args, this);
    const res = fjGallery.apply(global, args);
    return 'object' !== typeof res ? res : this;
  };
  $Plugin.constructor = fjGallery.constructor;

  // no conflict
  const old$Plugin = $.fn.fjGallery;
  $.fn.fjGallery = $Plugin;
  $.fn.fjGallery.noConflict = function () {
    $.fn.fjGallery = old$Plugin;
    return this;
  };
}

export default fjGallery;
