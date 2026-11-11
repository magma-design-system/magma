import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  h,
  State,
  Watch,
} from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';
import { ThemeVariantType } from '@type/variant';
import { ToneMinimalBoxVariantType } from '@type/tone';

import miBaselineClose from '@icon/mi/baseline/close.svg';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { bannerTypographyDictionary } from './meta/dictionary';
import { BannerTypographyType } from './meta/types';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @part text - The text wrapper of the `default` and `content` slots
 * @category feedback
 */

@Component({
  tag: 'mds-banner',
  styleUrl: 'mds-banner.css',
  shadow: true,
})
export class MdsBanner {
  @Element() host: HTMLMdsBannerElement;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @State() closeButtonVariant: ThemeVariantType;
  @State() hasActions: boolean;
  // the banner is the window of a dialog: a child of mds-modal in its slot window (#1192)
  @State() isWindow = false;
  private placeObserver?: MutationObserver;

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'primary';

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalBoxVariantType = 'weak';

  /**
   * Hides the decoration around the banner icon
   */
  @Prop({ reflect: true }) readonly hideCockade?: boolean = false;

  /**
   * Shows a close button that dismisses the banner: activating it emits `mdsBannerClose`
   */
  @Prop() readonly dismissible?: boolean;

  /**
   * Shows the close button, as `dismissible` does.
   * @deprecated Use `dismissible`: the button dismisses the message, it deletes nothing.
   * Goes in the next major.
   */
  @Prop() readonly deletable?: boolean;

  /**
   * The title on the top of the banner
   */
  @Prop() readonly headline?: string;

  /**
   * The style of the headline: `h6`, the title of a part, or `h5`, the title of a dialog
   * (#1189, titles). Left out, it follows the place of the banner: `h6` in the page, `h5` as
   * the window of a dialog (`slot="window"` on a child of `mds-modal`), above the `h6` of the
   * parts and the groups of fields it holds. Nothing larger: `h4` is too large for a banner
   */
  @Prop() readonly typography?: BannerTypographyType;

  /**
   * An icon displayed at the top left of the banner
   */
  @Prop() readonly icon?: string;

  private ariaVariants: Record<
    ThemeVariantType,
    { role: string; live: 'polite' | 'assertive' | undefined }
  > = {
    ai: { role: 'status', live: 'polite' },
    dark: { role: 'presentation', live: undefined },
    error: { role: 'alert', live: 'assertive' },
    info: { role: 'status', live: 'polite' },
    light: { role: 'presentation', live: undefined },
    primary: { role: 'status', live: 'polite' },
    success: { role: 'status', live: 'polite' },
    warning: { role: 'alert', live: 'assertive' },
  };

  private isDismissible = (): boolean => this.dismissible === true || this.deletable === true;

  // The place of the banner (#1192): the window of a dialog is a child of mds-modal with
  // slot="window", the child mds-modal takes as its window (hasChildWithSlot). A banner moved in
  // or out of a modal is disconnected and connected again without loading again, so the place
  // is read on every connection, and again when its own slot attribute changes.
  private readPlace = (): void => {
    this.isWindow =
      this.host.getAttribute('slot') === 'window' &&
      this.host.parentElement?.tagName.toLowerCase() === 'mds-modal';
  };

  // The style of the headline: a value of the dictionary wins; left out, or a value it does not
  // know, the title of the place by its role (#1189, titles), `dialog` as the window of a dialog
  // and `part` in the page. A role is the style of its level at the default theme (h5, h6) and
  // reads the tokens of the role, so a theme that moves the role moves the headline too.
  private headlineTypography = (): BannerTypographyType | 'dialog' | 'part' => {
    const written = bannerTypographyDictionary.find((style) => style === this.typography);
    if (written !== undefined) return written;
    return this.isWindow ? 'dialog' : 'part';
  };

  connectedCallback(): void {
    this.readPlace();
    this.placeObserver?.disconnect();
    // no MutationObserver in the hydrate/SSR runtime: the place read above holds there
    if (typeof MutationObserver === 'undefined') return;
    this.placeObserver = new MutationObserver(this.readPlace);
    this.placeObserver.observe(this.host, { attributeFilter: ['slot'] });
  }

  componentWillLoad(): void {
    this.hasActions = hasChildWithSlot(this.host, 'action');
    this.setCloseButtonVariant(this.variant);
  }

  disconnectedCallback(): void {
    this.placeObserver?.disconnect();
    this.placeObserver = undefined;
  }

  @Watch('variant')
  variantHandler(newValue: ThemeVariantType): void {
    this.setCloseButtonVariant(newValue);
  }

  /**
   * Emits when the url view is closed
   */
  @Event({ eventName: 'mdsBannerClose' }) closeEvent: EventEmitter<void>;

  private setCloseButtonVariant = (newValue?: ThemeVariantType): void => {
    if (newValue === 'dark') {
      this.closeButtonVariant = 'light';
      return;
    }
    if (newValue === 'light') {
      this.closeButtonVariant = 'dark';
      return;
    }
    this.closeButtonVariant = newValue ?? 'primary';
  };

  private onActionSlotChange = (): void => {
    this.hasActions = hasChildWithSlot(this.host, 'action');
  };

  private closeBanner = (): void => {
    this.closeEvent.emit();
    const modalEL = this.host?.closest('mds-modal') as HTMLMdsModalElement;
    if (modalEL != null) {
      modalEL.opened = false;
    }
  };

  render() {
    return (
      <Host
        aria-label={this.headline}
        role={this.ariaVariants[this.variant ?? 'primary'].role}
        aria-live={this.ariaVariants[this.variant ?? 'primary'].live}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class={clsx('body', this.isDismissible() && 'body--dismissible')}>
          {this.icon && <mds-icon aria-hidden="true" class="icon" name={this.icon} />}
          <div class="content">
            {this.headline && (
              <mds-text aria-hidden="true" class="headline" typography={this.headlineTypography()}>
                {this.headline}
              </mds-text>
            )}
            <div class="text" part="text">
              <slot />
            </div>
          </div>
          {/* mds-button clicks on Enter and Space by itself, and gives that back when the banner
              is moved in the page: a handler of the banner on top of it clicked twice (#1356) */}
          {this.isDismissible() && (
            <mds-button
              class="close-button"
              icon={miBaselineClose}
              onClick={this.closeBanner}
              title={this.t.get('cancel')}
              variant={this.closeButtonVariant}
              tone="text"
            />
          )}
        </div>
        <div class={clsx('actions', !this.hasActions && 'actions--hidden')}>
          <slot name="action" onSlotchange={this.onActionSlotChange} />
        </div>
      </Host>
    );
  }
}
