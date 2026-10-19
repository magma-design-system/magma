import clsx from 'clsx';
import fitty from 'fitty/dist/fitty.min.js';
import { Build, Component, Element, Host, h, State, Prop, Watch } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { ThemeFullVariantAvatarType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import miBaselinePerson from '@icon/mi/baseline/person.svg';

type AvatarContent = 'count' | 'image' | 'initials' | 'icon' | 'fallback';

/**
 * @part icon - The selected icon of the avatar
 * @part wrapper - The wrapper which contains media displayed
 * @part media - The media displayed
 */

@Component({
  tag: 'mds-avatar',
  styleUrl: 'mds-avatar.css',
  shadow: true,
})
export class MdsAvatar {
  @Element() private element: HTMLMdsAvatarElement;
  // the image of `src` failed to load: the avatar shows the next source in the order
  @State() imageFailed = false;
  @State() loaded = true;

  private observer?: ResizeObserver;
  private fittyElements;
  // the element fitty sizes: initials and count render their own, and a change of source
  // replaces it, so the text is fitted again whenever it is another element
  private fitElement?: HTMLElement;

  /**
   * Specifies the path to the icon
   * @see https://magma.maggiolicloud.it/storybook/?path=/story/design-icon--default
   */
  @Prop({ reflect: true }) readonly icon?: string | undefined;

  /**
   * The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others
   */
  @Prop({ mutable: true, reflect: true }) readonly initials?: string;

  /**
   * The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others
   */
  @Prop({ mutable: true, reflect: true }) readonly count?: number;

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string;

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType;

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeFullVariantAvatarType;

  private variants: ThemeFullVariantAvatarType[] = [
    'amaranth',
    'aqua',
    'blue',
    'error',
    'green',
    'info',
    'lime',
    'orange',
    'orchid',
    'primary',
    'sky',
    'success',
    'violet',
    'warning',
    'yellow',
  ];

  private addFontResize = (fitElement: HTMLElement): void => {
    this.fitElement = fitElement;
    this.fittyElements = fitty(fitElement, { minSize: 10 });
    this.observer = new ResizeObserver((entries) => {
      entries.forEach(() => {
        this.fittyElements.fit();
      });
    });
    this.observer.observe(this.element);
  };

  private removeFontResize = (): void => {
    if (!this.fitElement) {
      return;
    }
    this.fitElement = undefined;
    this.fittyElements?.unsubscribe();
    this.observer?.disconnect();
  };

  private syncFontResize = (): void => {
    if (!Build.isBrowser) return;
    const fitElement = this.element.shadowRoot?.querySelector<HTMLElement>('.fit') ?? undefined;
    if (fitElement === this.fitElement) return;
    this.removeFontResize();
    if (fitElement) this.addFontResize(fitElement);
  };

  private readonly handleImgLoadError = (): void => {
    this.loaded = true;
    this.imageFailed = true;
  };

  private readonly handleImgLoadSuccess = (): void => {
    this.loaded = true;
  };

  // a removed attribute or a null bound by a framework counts as not set, like '' or 0
  private hasCount = (): boolean => {
    const count = this.count ?? 0;
    return count !== 0 && !Number.isNaN(count);
  };

  private hasSrc = (): boolean => (this.src ?? '') !== '';

  /**
   * The one source the avatar shows, in a single order: `count`, then the image of `src` (until
   * it fails to load), then `initials`, then `icon`, then the person glyph. Each pair of sources
   * used to be resolved on its own, in a circle (`icon` hid `src`, `src` hid `initials`,
   * `initials` hid `icon`), and some combinations rendered an empty avatar.
   */
  private content = (): AvatarContent => {
    if (this.hasCount()) return 'count';
    if (this.hasSrc() && !this.imageFailed) return 'image';
    if ((this.initials ?? '') !== '') return 'initials';
    if ((this.icon ?? '') !== '') return 'icon';
    return 'fallback';
  };

  private checkInitialsVariant = (): void => {
    const initials = this.initials ?? '';
    if (initials !== '') {
      let cleanedInitials = initials
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '')
        .substring(0, 2);
      if (cleanedInitials.length === 1) {
        cleanedInitials = cleanedInitials + cleanedInitials;
      }
      // the initials pick one of 17 slots, the length of the v1 list of colors: the 15 slots this
      // list has keep the color they always gave, the 2 past its end, which left the avatar with
      // no variant (#825), take the first two
      const slot =
        (cleanedInitials.substring(0, 1).charCodeAt(0) +
          cleanedInitials.substring(1, 2).charCodeAt(0)) %
        17;
      this.variant = this.variants[slot % this.variants.length];
    }
  };

  componentWillLoad(): void {
    this.checkInitialsVariant();
    this.loaded = !this.hasSrc();
  }

  componentDidRender(): void {
    // after the render: the element that shows the text is in the shadow root only now
    this.syncFontResize();
  }

  @Watch('initials')
  initialsHandler(): void {
    this.checkInitialsVariant();
  }

  @Watch('count')
  countHandler(): void {
    this.checkInitialsVariant();
  }

  @Watch('src')
  srcHandler(): void {
    // a new image is pending until it loads, and the failure of the previous one is forgotten
    this.imageFailed = false;
    this.loaded = !this.hasSrc();
  }

  render() {
    const content = this.content();

    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
      >
        <div
          class={clsx(
            'avatar',
            `avatar--${content}`,
            content === 'image' && !this.loaded ? 'avatar--pending' : 'avatar--loaded',
          )}
          part="wrapper"
        >
          {content === 'count' && (
            <div class="initials-text">
              <span class="fit">+{this.count}</span>
            </div>
          )}
          {content === 'image' && (
            <mds-img
              class="image"
              loading="lazy"
              onMdsImgLoadError={this.handleImgLoadError}
              onMdsImgLoadSuccess={this.handleImgLoadSuccess}
              part="media"
              src={this.src}
            />
          )}
          {content === 'initials' && (
            <div class="initials-text">
              <span class="fit">{this.initials?.substring(0, 2)}</span>
            </div>
          )}
          {content === 'icon' && (
            <mds-icon class="icon" part="icon" name={this.icon ?? ''}></mds-icon>
          )}
          {content === 'fallback' && <i class="fallback-icon" innerHTML={miBaselinePerson} />}
        </div>
      </Host>
    );
  }
}
