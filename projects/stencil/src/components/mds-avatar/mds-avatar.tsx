import clsx from 'clsx';
import fitty from 'fitty/dist/fitty.min.js';
import { Component, Element, Host, h, State, Prop, Watch } from '@stencil/core';
import { preferenceStore } from '@common/preference';
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
  @State() fallback = false;
  @State() loaded = true;

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

  // a removed attribute or a null bound by a framework counts as not set, like '' or 0
  private hasCount = (): boolean => {
    const count = this.count ?? 0;
    return count !== 0 && !Number.isNaN(count);
  };

  private checkTexts = (): void => {
    const initials = this.initials ?? '';
    if (initials !== '') this.checkText(initials);
    if (this.hasCount()) this.checkText(String(this.count));
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
    this.checkTexts();
  }

  componentDidRender(): void {
    if (this.textChanged) {
      // placed here becase @Watch('initials') is fired
      // BEFORE the element .fit is attached on shDOM
      this.checkTexts();
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
    const hasCount = this.hasCount();
    const icon = this.icon ?? '';
    const hasIcon = icon !== '';
    const hasInitials = (this.initials ?? '') !== '';
    const hasSrc = (this.src ?? '') !== '';

    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
      >
        <div
          class={clsx(
            'avatar',
            hasInitials && !this.fallback && !hasSrc && 'avatar--initials',
            (this.fallback || (!hasIcon && !hasInitials && !hasSrc)) && 'avatar--fallback',
            hasIcon && 'avatar--icon',
            this.loaded ? 'avatar--loaded' : 'avatar--pending',
          )}
          part="wrapper"
        >
          {hasInitials && !hasCount && !this.fallback && !hasSrc && (
            <div class="initials-text">
              <span class="fit">{this.initials?.substring(0, 2)}</span>
            </div>
          )}
          {hasCount && !this.fallback && !hasSrc && (
            <div class="initials-text">
              <span class="fit">+{this.count}</span>
            </div>
          )}
          {hasSrc && !hasCount && !this.fallback && !hasIcon && (
            <mds-img
              class="image"
              loading="lazy"
              onMdsImgLoadError={this.handleImgLoadError}
              onMdsImgLoadSuccess={this.handleImgLoadSuccess}
              part="media"
              src={this.src}
            />
          )}
          {hasIcon && !hasInitials && !hasCount && (
            <mds-icon class="icon" part="icon" name={icon}></mds-icon>
          )}
          {(this.fallback || (!hasIcon && !hasInitials && !hasCount && !hasSrc)) && (
            <i class="fallback-icon" innerHTML={miBaselinePerson} />
          )}
        </div>
      </Host>
    );
  }
}
