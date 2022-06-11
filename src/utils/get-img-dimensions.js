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

    // check for non-zero, non-undefined naturalWidth
    if (!img.naturalWidth) {
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
    if (0 < img.naturalWidth) {
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

export default getImgDimensions;
