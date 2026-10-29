import { Build, Component, Element, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { BookBindingType, BookFormatType, BookPoseType } from './meta/types';
import { LoadingType } from '@type/loading';
import { Locale } from '@common/locale';
import { bookFormatRatio, bookWidth, cssUrl, defaultBookRatio, isBookFormat } from './meta/format';
import { boardVolume, defaultPages, isPageCount, pageCount, pageRange } from './meta/volume';
import {
  BookPose,
  dragPerWidth,
  dragRange,
  easePose,
  easeTime,
  faceLight,
  frontLight,
  glarePosition,
  lean,
  restPose,
  samePose,
  slatLight,
} from './meta/pose';
import { hardcoverCap, hardcoverSlats } from './meta/spine';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @part cover - The native `<img>` that shows the front cover
 * @category content
 */
@Component({
  tag: 'mds-book',
  styleUrl: 'mds-book.css',
  shadow: true,
})
export class MdsBook {
  @Element() private host: HTMLMdsBookElement;
  // the image as loaded, its currentSrc: the spine is painted with the same file
  @State() private coverUrl?: string;
  @State() private imageError: boolean = false;
  // the proportions of the loaded image, what `format="auto"` shapes the book on
  @State() private imageRatio?: number;
  @State() private logoError: boolean = false;
  // the mark of the publisher as loaded, its absolute url: what its mask is painted with
  @State() private logoUrl?: string;

  // The pose is animated here, not in CSS: the light on each face and the gloss of the cover
  // follow the angle frame by frame, which a transition of the transform alone cannot do. It
  // eases toward its goal, and runs only while it moves, as the 3D card of the docs home does.
  // Only opacities and transforms change on the way, which the compositor applies without a
  // repaint.
  private current: BookPose = restPose();
  private drag?: { moved: boolean; pointerId: number; startTurn: number; startX: number };
  private dragged = false;
  // the listeners that end a drag the pointer took out of the window, while it lasts
  private dragWatch?: AbortController;
  private frame?: number;
  private goal: BookPose = restPose();
  private hovering = false;
  private lastTime?: number;
  // the mark of the publisher, loaded apart to know whether its mask can be painted
  private logoLoader?: HTMLImageElement;
  // where the pointer is on the book, from -1 to 1 on each axis
  private pointer = { x: 0, y: 0 };
  private scene?: HTMLDivElement;
  private slats: HTMLDivElement[] = [];

  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * The accessible name of the book. Without it the name is built from `name` and `author`;
   * an empty `alt` marks the book as decorative, left out by assistive technologies
   */
  @Prop() readonly alt?: string;

  /**
   * The author, printed on the cover drawn when there is no image, above the title, and on the
   * spine after the title, or under it where the spine has room for two lines
   */
  @Prop() readonly author?: string;

  /**
   * How the book is bound: a thin flexible cover flush with the pages, rigid boards a little
   * larger than the page block, with a rounded spine, or not at all (`none`), a stack of loose
   * sheets, a document: its cover is only the sheet on top, and the pages show on every side,
   * the side of the spine too, where nothing is printed
   */
  @Prop({ reflect: true }) readonly binding: BookBindingType = 'paperback';

  /**
   * The proportions of the book. `auto` takes them from the image; a named format (`a4`, `a5`,
   * `b5`) is portrait; any other one is `WxH` in centimetres, the order of the two numbers being
   * the orientation (`17x24` portrait, `24x17` landscape, `21x21` square)
   * @example '17x24'
   */
  @Prop({ reflect: true }) readonly format: BookFormatType = 'auto';

  /**
   * Specifies whether a browser should load the cover immediately or defer it until it is near
   * the viewport
   */
  @Prop() readonly loading?: LoadingType = 'lazy';

  /**
   * The title of the book, printed on the spine and on the cover drawn when there is no image
   */
  @Prop() readonly name?: string;

  /**
   * The number of pages, which sets how deep the book is, against the width of its format (17 cm
   * for `auto`). A page is as thick as `--mds-book-page-weight-min` at 1 page, going to
   * `--mds-book-page-weight-max` at 1000 pages and more, in proportion: by default from 0.1 mm,
   * the bulky paper of a short book, to 0.05 mm, the thin paper of a volume, so 64 pages make
   * 6 mm, 300 pages 2.5 cm and 1000 pages 5 cm. A spine under 5 mm deep carries no text
   */
  @Prop() readonly pages: number = 300;

  /**
   * How the book is shown: standing, turned to show its spine (`spine`) or its pages
   * (`fore-edge`), or facing the reader (`front`); lying on its back, seen from above, its tail
   * toward the reader (`lying`) or spun on the surface (`lying-turned`). A drag turns it from
   * there, and it goes back when released
   */
  @Prop({ reflect: true }) readonly pose: BookPoseType = 'spine';

  /**
   * The publisher, printed at the foot of the spine and of the cover drawn when there is no
   * image, unless its `publisher-logo` is printed there instead
   */
  @Prop() readonly publisher?: string;

  /**
   * The mark of the publisher, printed instead of its name at the foot of the spine and of the
   * cover drawn when there is no image: the path to an svg, or a png on a transparent ground.
   * Its shape is printed, not its colours, in `--mds-book-publisher-color`. An image from
   * another origin needs CORS headers, as any mask does; one that does not load leaves the name
   * @example '/logos/maggioli-editore.svg'
   */
  @Prop() readonly publisherLogo?: string;

  /**
   * Specifies the path to the image of the front cover
   */
  @Prop() readonly src?: string;

  @Watch('format')
  formatHandler(newValue?: string | null): void {
    this.warnInvalidFormat(newValue);
  }

  @Watch('pages')
  pagesHandler(newValue?: number | null): void {
    this.warnInvalidPages(newValue);
  }

  // to another pose, the book moves there, or jumps when it keeps still
  @Watch('pose')
  poseHandler(): void {
    this.aim();
  }

  @Watch('publisherLogo')
  publisherLogoHandler(): void {
    this.loadLogo();
  }

  @Watch('src')
  srcHandler(): void {
    this.coverUrl = undefined;
    this.imageError = false;
    this.imageRatio = undefined;
  }

  @Listen('pointerenter')
  pointerEnterHandler(ev: PointerEvent): void {
    if (ev.pointerType === 'touch' || this.still()) return;
    this.hovering = true;
    this.aim();
  }

  // the book leans toward the pointer; a finger has no hover, it only drags
  @Listen('pointermove')
  pointerMoveHandler(ev: PointerEvent): void {
    if (this.still()) return;
    const { left, top, width, height } = this.host.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const clamp = (value: number): number => Math.max(-1, Math.min(1, value));
    if (ev.pointerType !== 'touch') {
      this.pointer = {
        x: clamp(((ev.clientX - left) / width) * 2 - 1),
        y: clamp(((ev.clientY - top) / height) * 2 - 1),
      };
    }
    // back over the book with no button held: the drag was released where nothing could tell
    if (this.drag?.pointerId === ev.pointerId && ev.pointerType !== 'touch' && ev.buttons === 0) {
      this.endDrag(false);
    }
    if (this.drag?.pointerId === ev.pointerId) {
      const distance = ev.clientX - this.drag.startX;
      if (Math.abs(distance) > 4) this.drag.moved = true;
      const { max, min } = dragRange(restPose(this.pose));
      this.goal.turn = Math.max(
        min,
        Math.min(max, this.drag.startTurn + (distance / width) * dragPerWidth),
      );
      this.wake();
      return;
    }
    this.aim();
  }

  // a drag turns the book, within limits, to see a side, and lets it go back when released
  @Listen('pointerdown')
  pointerDownHandler(ev: PointerEvent): void {
    if (ev.button !== 0 || this.still()) return;
    this.dragged = false;
    this.drag = {
      moved: false,
      pointerId: ev.pointerId,
      startTurn: this.current.turn,
      startX: ev.clientX,
    };
    // the drag goes on outside the book; a pointer the browser no longer tracks cannot be captured
    try {
      this.host.setPointerCapture(ev.pointerId);
    } catch {
      // the drag still follows the pointer while it stays over the book
    }
    this.scene?.classList.add('scene--dragging');
    this.watchDrag();
    this.aim();
  }

  @Listen('pointerup')
  pointerUpHandler(ev: PointerEvent): void {
    if (this.drag?.pointerId === ev.pointerId) this.endDrag(this.drag.moved);
  }

  // the browser took the pointer back (a scroll, a gesture), or let it go out of the frame
  @Listen('pointercancel')
  @Listen('lostpointercapture')
  pointerLostHandler(ev: PointerEvent): void {
    if (this.drag?.pointerId === ev.pointerId) this.endDrag(false);
  }

  @Listen('pointerleave')
  pointerLeaveHandler(): void {
    if (this.drag !== undefined) return;
    this.hovering = false;
    this.pointer = { x: 0, y: 0 };
    this.aim();
  }

  // a drag that turned the book is not a click: inside a link, it would follow the link
  @Listen('click', { capture: true })
  clickHandler(ev: MouseEvent): void {
    if (!this.dragged) return;
    this.dragged = false;
    ev.preventDefault();
    ev.stopPropagation();
  }

  componentWillLoad(): void {
    this.warnInvalidFormat(this.format);
    this.warnInvalidPages(this.pages);
    this.current = this.goal = restPose(this.pose);
    this.loadLogo();
  }

  // after every render, so the faces a new binding brings take the light of the pose at once,
  // and a book told to keep still (a preference that changed) goes back to its pose
  componentDidRender(): void {
    if (!Build.isBrowser) return;
    if (this.still()) this.current = this.goal = restPose(this.pose);
    this.writePose();
  }

  disconnectedCallback(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.drag = undefined;
    this.dragWatch?.abort();
    this.dragWatch = undefined;
    this.hovering = false;
  }

  // Out of the window, or of the frame the page is in, the pointer is no longer ours: its
  // release would never reach the book, which would go on turning when it comes back. The
  // drag ends there, and when the window loses the focus or is hidden.
  private watchDrag = (): void => {
    this.dragWatch?.abort();
    this.dragWatch = new AbortController();
    const { signal } = this.dragWatch;
    const leave = (): void => {
      this.hovering = false;
      this.pointer = { x: 0, y: 0 };
      this.endDrag(false);
    };
    const out = (ev: MouseEvent): void => {
      if (ev.relatedTarget === null) leave();
    };
    window.addEventListener('pointerout', out, { signal });
    window.addEventListener('mouseout', out, { signal });
    window.addEventListener('blur', leave, { signal });
    document.addEventListener('visibilitychange', () => document.hidden && leave(), { signal });
  };

  // the drag is over: released over the page (`clicked`, which takes the click that follows if
  // the book turned), or lost
  private endDrag = (clicked: boolean): void => {
    if (this.drag === undefined) return;
    this.dragged = clicked;
    this.drag = undefined;
    this.dragWatch?.abort();
    this.dragWatch = undefined;
    this.scene?.classList.remove('scene--dragging');
    this.aim();
  };

  // reduced, the book keeps its resting pose: the preference of the page, or the system's when
  // the page has no controller or follows the system
  private reducedMotion = (): boolean => {
    const preference = this.host.getAttribute('pref-animation');
    if (preference === 'reduce') return true;
    if (preference !== null && preference !== 'system') return false;
    return (
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  };

  // The consumption preference sets how much the book costs: at `low` it is drawn once, in its
  // pose, and never animated; at `medium` it moves without the gloss, whose band repaints the
  // cover; at `high`, the default on a page without the controller, it does everything.
  private consumption = (): string => this.host.getAttribute('pref-consumption') ?? 'high';

  private still = (): boolean => this.reducedMotion() || this.consumption() === 'low';

  // the goal of the pose, from what the pointer does: resting, hovered, dragged
  private aim = (): void => {
    const rest = restPose(this.pose);
    if (this.still()) {
      this.current = this.goal = rest;
      this.writePose();
      return;
    }
    const active = this.hovering || this.drag !== undefined;
    const glare = this.drag !== undefined ? 1 : this.hovering ? 0.45 : 0;
    this.goal = {
      glare: this.consumption() === 'high' ? glare : 0,
      lay: rest.lay,
      lift: active ? 1 : 0,
      tilt: this.hovering ? rest.tilt - this.pointer.y * lean.tilt : rest.tilt,
      turn:
        this.drag !== undefined
          ? this.goal.turn
          : this.hovering
            ? rest.turn + this.pointer.x * lean.turn
            : rest.turn,
    };
    this.wake();
  };

  private wake = (): void => {
    this.frame ??= requestAnimationFrame(this.tick);
  };

  private tick = (time: number): void => {
    this.frame = undefined;
    const elapsed = this.lastTime === undefined ? 1000 / 60 : time - this.lastTime;
    const settling = this.drag === undefined && !this.hovering;
    this.current = easePose(
      this.current,
      this.goal,
      elapsed,
      settling ? easeTime.settle : easeTime.follow,
    );
    this.writePose();
    if (samePose(this.current, this.goal)) {
      this.lastTime = undefined;
      return;
    }
    this.lastTime = time;
    this.wake();
  };

  // written on the element, not through render: the pose changes far more often than a book
  // needs to render
  private writePose = (): void => {
    const style = this.scene?.style;
    if (!style) return;
    const rest = restPose(this.pose);
    const reference = frontLight(rest);
    const { glare, lay, lift, tilt, turn } = this.current;
    const lights = faceLight(this.current, reference);
    style.setProperty('--private-book-lay', `${lay.toFixed(2)}deg`);
    style.setProperty('--private-book-turn', `${turn.toFixed(2)}deg`);
    style.setProperty('--private-book-tilt', `${tilt.toFixed(2)}deg`);
    style.setProperty('--private-book-lift', lift.toFixed(3));
    // how far the book is lying down, from 0 standing to 1 lying: which surface it rests on,
    // so where its shadow falls and which way it rises
    const lying = Math.max(0, Math.min(1, lay / 90));
    style.setProperty('--private-book-lie', lying.toFixed(3));
    style.setProperty('--private-book-stand', (1 - lying).toFixed(3));
    style.setProperty('--private-book-glare', glare.toFixed(3));
    style.setProperty(
      '--private-book-glare-x',
      glarePosition(turn, rest, this.pointer.x).toFixed(1),
    );
    for (const face of Object.keys(lights) as (keyof typeof lights)[]) {
      style.setProperty(`--private-book-${face}-light`, lights[face].toFixed(3));
    }
    // each slat of a rounded spine faces its own way, so each one takes its own light
    const slats = slatLight(
      hardcoverSlats.map(({ yaw }) => yaw),
      this.current,
      reference,
    );
    this.slats.forEach((slat, index) =>
      slat.style.setProperty('--private-book-light', slats[index].toFixed(3)),
    );
  };

  private warnInvalidFormat = (format?: string | null): void => {
    if (!isBookFormat(format)) {
      console.warn(
        `mds-book: "${format}" is not a format, the book takes the proportions of its image. Use auto, a4, a5, b5 or WxH in centimetres`,
      );
    }
  };

  private warnInvalidPages = (pages?: number | null): void => {
    if (!isPageCount(pages)) {
      console.warn(
        `mds-book: "${pages}" is not a number of pages, the book is drawn with ${defaultPages}. Use a positive number, up to ${pageRange.max}`,
      );
    }
  };

  private onLoad = (ev: Event): void => {
    const image = ev.target as HTMLImageElement;
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      this.imageRatio = image.naturalWidth / image.naturalHeight;
    }
    this.coverUrl = image.currentSrc || image.src;
  };

  private onError = (): void => {
    this.coverUrl = undefined;
    this.imageError = true;
  };

  private hasImage = (): boolean => (this.src ?? '') !== '' && !this.imageError;

  // The mark is fetched as a mask fetches its image, with CORS, so a mark the mask could not
  // paint fails here too and leaves the name of the publisher; a new one forgets the last.
  private loadLogo = (): void => {
    if (this.logoLoader) {
      this.logoLoader.onload = null;
      this.logoLoader.onerror = null;
    }
    this.logoLoader = undefined;
    this.logoError = false;
    this.logoUrl = undefined;
    const src = (this.publisherLogo ?? '').trim();
    if (src === '' || !Build.isBrowser) return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      this.logoUrl = image.src;
    };
    image.onerror = () => {
      this.logoError = true;
    };
    image.src = src;
    this.logoLoader = image;
  };

  private logoPending = (): boolean =>
    (this.publisherLogo ?? '').trim() !== '' && this.logoUrl === undefined && !this.logoError;

  // a fixed format wins over the image; auto waits for it, and keeps 17x24 without one
  private ratio = (): number => bookFormatRatio(this.format) ?? this.imageRatio ?? defaultBookRatio;

  private label = (): string => {
    if (this.alt != null) return this.alt;
    const name = (this.name ?? '').trim();
    const author = (this.author ?? '').trim();
    if (author !== '') {
      return this.t.get('byAuthor', { name: name !== '' ? name : this.t.get('book'), author });
    }
    return name !== '' ? name : this.t.get('book');
  };

  // a book is named by its label, and a decorative one is left out of the accessibility tree
  private hostRole = (): { role: string; 'aria-label'?: string } => {
    const label = this.label();
    return label === '' ? { role: 'presentation' } : { role: 'img', 'aria-label': label };
  };

  // What the stylesheet draws the volume from: the pages (their depth is its, from the
  // thickness of a page), the width of the format in millimetres they are measured against, and
  // the boards of a hardcover, as shares of that width.
  private bookStyle = (): Record<string, string> => {
    const width = bookWidth(this.format);
    const boards = boardVolume(width, this.binding === 'hardcover');
    const share = (value: number): string => `${(value * 100).toFixed(3)}cqi`;
    const style: Record<string, string> = {
      '--private-book-board': share(boards.board),
      '--private-book-page-count': String(pageCount(this.pages)),
      '--private-book-square': share(boards.square),
      '--private-book-width-mm': String(width * 10),
    };
    if (this.coverUrl !== undefined && this.hasImage()) {
      style['--private-book-cover'] = cssUrl(this.coverUrl);
    }
    if (this.logoUrl !== undefined) {
      style['--private-book-logo'] = cssUrl(this.logoUrl);
    }
    return style;
  };

  // The publisher at the foot of the spine and of a drawn cover: its mark once loaded, its name
  // without one or when the mark fails. While the mark loads the place stays empty, so the name
  // does not show for a moment and then give way to it.
  private renderPublisher = (place: 'drawn' | 'spine') => {
    if (this.logoUrl !== undefined) return <span class={`${place}-logo`}></span>;
    if (this.logoPending() || (this.publisher ?? '') === '') return null;
    return <span class={`${place}-publisher`}>{this.publisher}</span>;
  };

  // a spine too narrow for its text shows none, as a thin booklet does (see .spine-text)
  private renderSpineText = () => (
    <div class="spine-text">
      {this.name && <span class="spine-name">{this.name}</span>}
      {this.author && <span class="spine-author">{this.author}</span>}
      {this.renderPublisher('spine')}
    </div>
  );

  // the light of a face: a dark layer whose opacity follows how much the face turns away
  private shade = () => <span class="shade"></span>;

  // Rigid boards are slabs with edges of their own, a little larger than the page block they
  // hold, around a rounded spine; the endpapers show in the gap above and below the pages.
  private renderHardcover = () => [
    ...['top', 'bottom'].flatMap((edge) => [
      <div
        key={`board-${edge}-front`}
        class={`face board-${edge} board-${edge}--front lit-${edge}`}
      >
        {this.shade()}
      </div>,
      <div key={`board-${edge}-back`} class={`face board-${edge} board-${edge}--back lit-${edge}`}>
        {this.shade()}
      </div>,
      <div key={`endpaper-${edge}`} class={`face endpaper endpaper--${edge} lit-front`}>
        {this.shade()}
      </div>,
      <div key={`pages-${edge}`} class={`face pages-${edge} lit-${edge}`}>
        {this.shade()}
      </div>,
      <div
        key={`cap-${edge}`}
        class={`face cap cap--${edge} lit-${edge}`}
        style={{ clipPath: hardcoverCap }}
      >
        {this.shade()}
      </div>,
    ]),
    <div key="board-fore-front" class="face board-fore board-fore--front lit-fore">
      {this.shade()}
    </div>,
    <div key="board-fore-back" class="face board-fore board-fore--back lit-fore">
      {this.shade()}
    </div>,
    <div key="endpaper-fore" class="face endpaper endpaper--fore lit-front">
      {this.shade()}
    </div>,
    <div key="pages-fore" class="face pages-fore lit-fore">
      {this.shade()}
    </div>,
    ...hardcoverSlats.map(({ width, x, yaw, z }, index) => (
      <div
        key={`slat-${index}`}
        class="face slat"
        ref={(el) => el && (this.slats[index] = el)}
        style={{
          '--private-book-slat-width': String(width),
          '--private-book-slat-x': String(x),
          '--private-book-slat-yaw': `${yaw}deg`,
          '--private-book-slat-z': String(z),
        }}
      >
        {this.shade()}
      </div>
    )),
    <div key="spine-label" aria-hidden="true" class="face spine-label">
      {this.renderSpineText()}
    </div>,
  ];

  // A paperback is cut flush: cover and pages end on the same edge, the cover a hairline.
  private renderPaperback = () => [
    <div key="pages-top" class="face pages-top pages-flush pages-flush--across lit-top">
      {this.shade()}
    </div>,
    <div key="pages-bottom" class="face pages-bottom pages-flush pages-flush--across lit-bottom">
      {this.shade()}
    </div>,
    <div key="pages-fore" class="face pages-fore pages-flush pages-flush--along lit-fore">
      {this.shade()}
    </div>,
    <div key="spine" aria-hidden="true" class="face spine lit-spine">
      {this.renderSpineText()}
      {this.shade()}
    </div>,
  ];

  // Unbound, a stack of sheets cut flush: the cover is only the sheet on top, nothing wraps the
  // pages, so they show on the side of the spine too, which has no text.
  private renderLoose = () => [
    <div key="pages-top" class="face pages-top pages-flush pages-flush--across pages-loose lit-top">
      {this.shade()}
    </div>,
    <div
      key="pages-bottom"
      class="face pages-bottom pages-flush pages-flush--across pages-loose lit-bottom"
    >
      {this.shade()}
    </div>,
    <div
      key="pages-fore"
      class="face pages-fore pages-flush pages-flush--along pages-loose lit-fore"
    >
      {this.shade()}
    </div>,
    <div key="pages-spine" class="face pages-spine lit-spine">
      {this.shade()}
    </div>,
  ];

  private renderBinding = () => {
    if (this.binding === 'hardcover') return this.renderHardcover();
    if (this.binding === 'none') return this.renderLoose();
    return this.renderPaperback();
  };

  render() {
    if (this.binding !== 'hardcover') this.slats = [];
    return (
      <Host
        {...this.hostRole()}
        pref-animation={preferenceStore.state.animation}
        pref-consumption={preferenceStore.state.consumption}
        // the proportions of the book are those of the host, as an image keeps its own
        style={{ '--private-book-ratio': String(this.ratio()) }}
      >
        <div class="scene" ref={(el) => (this.scene = el)}>
          <div class="stage">
            <div
              class={{
                book: true,
                'book--printed': this.hasImage(),
              }}
              style={this.bookStyle()}
            >
              <div class="floor floor--stand"></div>
              <div class="floor floor--lie"></div>
              <div class="body">
                <div class="face front lit-front">
                  {this.hasImage() ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      class="cover"
                      draggable={false}
                      loading={this.loading}
                      onError={this.onError}
                      onLoad={this.onLoad}
                      part="cover"
                      src={this.src}
                    />
                  ) : (
                    <div aria-hidden="true" class="drawn-cover">
                      {this.author && <span class="drawn-author">{this.author}</span>}
                      {this.name && <span class="drawn-name">{this.name}</span>}
                      {this.renderPublisher('drawn')}
                    </div>
                  )}
                  <span class="gloss"></span>
                  {this.shade()}
                </div>
                {this.renderBinding()}
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
