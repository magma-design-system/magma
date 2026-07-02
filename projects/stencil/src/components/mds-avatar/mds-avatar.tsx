import clsx from 'clsx';
import fitty from 'fitty/dist/fitty.min.js';
import { Component, Element, Host, h, State, Prop, Watch } from '@stencil/core';
import { subscribePreference } from '@common/preference';
import { ThemeFullVariantAvatarType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import { avatarVariant } from './meta/variants';
import miBaselinePerson from '@icon/mi/baseline/person.svg';

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
  // BUG: when user switch from initials to other and turn back to initials fitty breaks

  @Element() private element: HTMLMdsAvatarElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() fallback = false;
  @State() loaded = true;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
    this.unsubscribePrefContrast?.();
  }

  private observer: ResizeObserver;
  private fittyElements;
  private fittyInitialized = false;
  private textChanged = false;

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

  private addFontResize = (): void => {
    if (this.fittyInitialized) {
      return;
    }
    const initialsElement = this.element.shadowRoot?.querySelector('.fit');
    this.fittyElements = fitty(initialsElement as HTMLElement, { minSize: 10 });
    this.observer = new ResizeObserver((entries) => {
      entries.forEach(() => {
        this.fittyElements.fit();
      });
    });
    this.observer.observe(this.element);
    this.fittyInitialized = true;
  };

  private removeFontResize = (): void => {
    if (!this.fittyInitialized) {
      return;
    }
    this.fittyInitialized = false;
    this.observer.unobserve(this.element);
  };

  private checkText = (value: string): void => {
    if (value !== '' && value !== undefined) {
      if (this.fittyInitialized) return;
      if (!this.fittyInitialized) this.addFontResize();
      return;
    }
    if (this.fittyInitialized) this.removeFontResize();
  };

  private readonly handleImgLoadError = (): void => {
    this.loaded = true;
    this.fallback = true;
  };

  private readonly handleImgLoadSuccess = (): void => {
    this.loaded = true;
  };

  private checkInitialsVariant = (): void => {
    if (this.initials !== undefined && this.initials !== '') {
      let cleanedInitials = this.initials
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '')
        .substring(0, 2);
      if (cleanedInitials.length === 1) {
        cleanedInitials = cleanedInitials + cleanedInitials;
      }
      this.variant =
        this.variants[
          (cleanedInitials.substring(0, 1).charCodeAt(0) +
            cleanedInitials.substring(1, 2).charCodeAt(0)) %
            avatarVariant.length
        ];
    }
  };

  componentWillLoad(): void {
    this.checkInitialsVariant();
  }

  componentDidLoad(): void {
    if (this.src !== undefined) {
      this.loaded = false;
    }
    if (this.initials !== undefined && this.initials !== '') {
      this.checkText(this.initials);
    }
    if (this.count !== undefined && this.count !== 0 && !Number.isNaN(this.count)) {
      this.checkText(this.count.toString());
    }
  }

  componentDidRender(): void {
    if (this.textChanged) {
      // placed here becase @Watch('initials') is fired
      // BEFORE the element .fit is attached on shDOM
      if (this.initials !== undefined && this.initials !== '') this.checkText(this.initials);
      if (this.count !== undefined && this.count !== 0 && !Number.isNaN(this.count))
        this.checkText(this.count.toString());
      this.textChanged = false;
    }
  }

  @Watch('initials')
  initialsHandler(): void {
    this.textChanged = true;
    this.checkInitialsVariant();
  }

  @Watch('count')
  countHandler(): void {
    this.textChanged = true;
    this.checkInitialsVariant();
  }

  @Watch('src')
  srcHandler(newValue: string): void {
    if (newValue === undefined) {
      this.loaded = true;
    }
  }

  @Watch('icon')
  iconHandler(newValue: string): void {
    if (newValue !== undefined) {
      this.loaded = true;
    }
  }

  render() {
    return (
      <Host pref-animation={this.prefAnimation} pref-contrast={this.prefContrast}>
        <div
          class={clsx(
            'avatar',
            this.initials &&
              !this.fallback &&
              (this.src === undefined || this.src === '') &&
              'avatar--initials',
            (this.fallback ||
              ((this.icon === undefined || this.icon === '') &&
                (this.initials === undefined || this.initials === '') &&
                (this.src === undefined || this.src === ''))) &&
              'avatar--fallback',
            this.icon && 'avatar--icon',
            this.loaded ? 'avatar--loaded' : 'avatar--pending',
          )}
          part="wrapper"
        >
          {this.initials &&
            (this.count === undefined || this.count === 0 || Number.isNaN(this.count)) &&
            !this.fallback &&
            (this.src === undefined || this.src === '') && (
              <div class="initials-text">
                <span class="fit">{this.initials.substring(0, 2)}</span>
              </div>
            )}
          {this.count && !this.fallback && (this.src === undefined || this.src === '') && (
            <div class="initials-text">
              <span class="fit">+{this.count}</span>
            </div>
          )}
          {this.src &&
            (this.count === undefined || this.count === 0 || Number.isNaN(this.count)) &&
            !this.fallback &&
            (this.icon === undefined || this.icon === '') && (
              <mds-img
                class="image"
                loading="lazy"
                onMdsImgLoadError={this.handleImgLoadError}
                onMdsImgLoadSuccess={this.handleImgLoadSuccess}
                part="media"
                src={this.src}
              />
            )}
          {this.icon &&
            (this.initials === undefined || this.initials === '') &&
            (this.count === undefined || this.count === 0 || Number.isNaN(this.count)) && (
              <mds-icon class="icon" part="icon" name={this.icon}></mds-icon>
            )}
          {(this.fallback ||
            ((this.icon === undefined || this.icon === '') &&
              (this.initials === undefined || this.initials === '') &&
              (this.count === undefined || this.count === 0 || Number.isNaN(this.count)) &&
              (this.src === undefined || this.src === ''))) && (
            <i class="fallback-icon" innerHTML={miBaselinePerson} />
          )}
        </div>
      </Host>
    );
  }
}
