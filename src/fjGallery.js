import { window, jQuery } from 'global';
import fjGallery from './fjGallery.esm';

// no conflict
const oldPlugin = window.fjGallery;
window.fjGallery = fjGallery;
window.fjGallery.noConflict = function () {
    window.fjGallery = oldPlugin;
    return this;
};

// jQuery support
if (typeof jQuery !== 'undefined') {
    // add data to jQuery .data('fjGallery')
    const oldInit = window.fjGallery.constructor.prototype.init;
    window.fjGallery.constructor.prototype.init = function () {
        this.jQcontainer = jQuery(this.$container);
        this.jQcontainer.data('fjGallery', this);
        if (oldInit) {
            oldInit.call(this);
        }
    };

    // remove data from jQuery .data('fjGallery')
    const oldDestroy = window.fjGallery.constructor.prototype.destroy;
    window.fjGallery.constructor.prototype.destroy = function () {
        if (this.jQcontainer) {
            this.jQcontainer.removeData('fjGallery');
        }
        if (oldDestroy) {
            oldDestroy.call(this);
        }
    };

    const jQueryPlugin = function () {
        const args = arguments || [];
        Array.prototype.unshift.call(args, this);
        const res = fjGallery.apply(window, args);
        return typeof res !== 'object' ? res : this;
    };
    jQueryPlugin.constructor = fjGallery.constructor;

    // no conflict
    const oldJqPlugin = jQuery.fn.fjGallery;
    jQuery.fn.fjGallery = jQueryPlugin;
    jQuery.fn.fjGallery.noConflict = function () {
        jQuery.fn.fjGallery = oldJqPlugin;
        return this;
    };
}
