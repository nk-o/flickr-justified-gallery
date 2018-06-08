import domReady from 'lite-ready';
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

// .fj-gallery initialization
domReady(() => {
    fjGallery(document.querySelectorAll('.fj-gallery'));
});
