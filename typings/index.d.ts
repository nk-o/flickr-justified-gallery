type GalleryElements = Element | ArrayLike<Element>;
type GalleryResult<T extends GalleryElements> = T extends Element ? T[] : T;
type GalleryItems = readonly Element[] | NodeListOf<Element>;

export interface FJGalleryOptions {
  itemSelector?: string;
  imageSelector?: string;
  gutter?: number | { horizontal: number; vertical: number };
  rowHeight?: number;
  rowHeightTolerance?: number;
  maxRowsCount?: number;
  edgeCaseMinRowHeight?: number;
  edgeCaseMaxRowHeight?: number;
  lastRow?: 'left' | 'center' | 'right' | 'hide';
  transitionDuration?: string | false;
  calculateItemsHeight?: boolean;
  resizeDebounce?: number;
  isRtl?: boolean;
  onInit?: ((this: FJGalleryInstance) => void) | null;
  onDestroy?: ((this: FJGalleryInstance) => void) | null;
  onAppendImages?: ((this: FJGalleryInstance, images: [GalleryItems]) => void) | null;
  onBeforeJustify?: ((this: FJGalleryInstance) => void) | null;
  onJustify?: ((this: FJGalleryInstance) => void) | null;
}

export interface FJGalleryInstance {
  readonly $container: Element;
  resize(): void;
  appendImages(images: GalleryItems | { get(): Element[] }): void;
  updateOptions(options: FJGalleryOptions): void;
  destroy(): void;
}

type GalleryMethod = 'resize' | 'appendImages' | 'updateOptions' | 'destroy';

declare const fjGallery: {
  <T extends GalleryElements>(elements: T, options?: FJGalleryOptions | null): GalleryResult<T>;
  <T extends GalleryElements, M extends GalleryMethod>(
    elements: T,
    methodName: M,
    ...args: Parameters<FJGalleryInstance[M]>
  ): GalleryResult<T>;
  constructor: new (element: Element, options?: FJGalleryOptions | null) => FJGalleryInstance;
};

export default fjGallery;
