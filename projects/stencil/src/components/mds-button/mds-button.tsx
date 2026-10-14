import {
  ButtonIconPositionType,
  ButtonSizeType,
  ButtonTargetType,
  ButtonType,
  ButtonVariantType,
} from '@type/button';
import { Component, Host, Element, h, Prop, Watch, AttachInternals } from '@stencil/core';
import { KeyboardManager } from '@common/keyboard-manager';
import { ToneBoxVariantType } from '@type/tone';

import { TypographyType } from '@type/typography';
import { buttonSizeTypographyVariant } from './meta/variants';
import { setAttributeIfEmpty, unslugName } from '@common/aria';
import { isIconFormatIsBase64, isIconFormatIsSVG } from '@common/icon';
import { TypographyTruncateType } from '@type/text';
import { readSlottedLabel, sanitizeLabel } from '@common/slot';
import { preferenceStore } from '@common/preference';
import { requestSubmitAs } from '@common/form';
import { NavigationService } from '@common/navigation';
import mdiApple from '@icon/mdi/apple.svg';
import logoGoogle from './asset/logo-google.svg';
import { TextAnimationType } from '@component/mds-text/meta/types';

/**
 * @slot - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @slot notification - Add `HTML elements` or `components`, it is **recommended** to use `mds-notification` element.
 * @part icon - The icon inside the component
 */

@Component({
  tag: 'mds-button',
  styleUrl: 'mds-button.css',
  shadow: true,
  formAssociated: true,
})
export class MdsButton {
  private typography?: TypographyType;
  private km = new KeyboardManager();
  private anchor?: HTMLAnchorElement;

  @Element() host: HTMLMdsButtonElement;

  @AttachInternals() internals: ElementInternals;

  /**
   * Specifies if the component is focused when is loaded on the viewport
   */
  @Prop() readonly autoFocus: boolean;

  /**
   * The label of the button
   */
  @Prop({ reflect: true, mutable: true }) label?: string;

  /**
   * Specifies if the text is animated when it is rendered
   */
  @Prop({ reflect: true }) readonly animation?: TextAnimationType = 'none';

  /**
   * The icon displayed in the button
   */
  @Prop({ reflect: true, mutable: true }) icon?: string;

  /**
   * Specifies the horizontal position of the icon displayed in the button
   */
  @Prop({ reflect: true }) readonly iconPosition?: ButtonIconPositionType = 'left';

  /**
   * The type of the button element
   */
  @Prop({ reflect: true }) readonly type?: ButtonType = 'submit';

  /**
   * The name sent with `value` to the form the button submits, as a native submit button
   * does: buttons that submit the same form tell the receiver which one was chosen
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * The value sent under `name` to the form the button submits
   */
  @Prop({ reflect: true }) readonly value?: string;

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'primary';

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneBoxVariantType = 'strong';

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'md';

  /**
   * Specifies if the button is active or not
   */
  @Prop({ mutable: true, reflect: true }) active: boolean;

  /**
   * Specifies if the component is disabled or not
   */
  @Prop({ mutable: true, reflect: true }) disabled?: boolean;

  /**
   * Specifies if the button is awaiting for a response
   */
  @Prop({ reflect: true, mutable: true }) await?: boolean;

  /**
   * Turns the button into a link to this URL: a real anchor in its shadow root, so the browser
   * gives it what it gives every link (new tab on a modifier or middle click, the context menu,
   * drag). A client-side router takes the plain clicks over once registered with
   * `NavigationService.setHandler()` (from `@maggioli-design-system/magma/services`); without
   * one, a click listener on the host can still cancel the navigation with `preventDefault()`.
   */
  @Prop({ reflect: true }) readonly href?: string;

  /**
   * Specifies the target of the URL, if self or blank
   */
  @Prop() readonly target: ButtonTargetType = 'self';

  /**
   * Specifies if the text shoud be truncated or should behave as a normal text
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word';

  @Watch('disabled')
  disabledChanged(newValue: boolean | undefined): void {
    if (newValue) {
      this.km.attachClickBehavior();
      return;
    }
    this.km.detachClickBehavior();

    /**
     * When the component is disabled="false" it won't work with onClick events
     * since formAssociated where added to it.
     * https://github.com/ionic-team/stencil/issues/5461
     */
    this.disabled = undefined;
  }

  @Watch('label')
  labelChanged(newValue?: string): void {
    this.label = sanitizeLabel(newValue);
  }

  @Watch('await')
  awaitChanged(newValue?: boolean): void {
    this.host.setAttribute('aria-busy', (!!newValue).toString());
    if (newValue) {
      this.km.attachClickBehavior();
      return;
    }
    this.km.detachClickBehavior();
  }

  @Watch('type')
  handleTypeChange(newValue: string): void {
    // If not participating we don't do anything
    if (!this.internals.form) return;

    if (newValue === 'submit') {
      this.host.removeEventListener('click', this.handleReset);
      this.host.addEventListener('click', this.handleRequestSubmitForm);
    } else if (newValue === 'reset') {
      this.host.removeEventListener('click', this.handleRequestSubmitForm);
      this.host.addEventListener('click', this.handleReset);
    } else {
      this.host.removeEventListener('click', this.handleRequestSubmitForm);
      this.host.removeEventListener('click', this.handleReset);
    }
  }

  // the role tells the assistive technology what the host is; one set by the caller
  // (mds-tab-item names its button a tab) is theirs and stays
  @Watch('href')
  handleHrefChange(): void {
    const role = this.host.getAttribute('role');
    if (role === null || role === 'button' || role === 'link') {
      this.host.setAttribute('role', this.isLink() ? 'link' : 'button');
    }
    this.handleTypeChange(this.isLink() ? 'link' : (this.type ?? ''));
  }

  @Watch('variant')
  handleVariantChange(newValue?: ButtonVariantType): void {
    if (newValue === 'google') {
      this.icon = logoGoogle;
      return;
    }
    if (newValue === 'apple') {
      this.icon = mdiApple;
      return;
    }
  }

  private handleRequestSubmitForm = (e: MouseEvent) => {
    e.preventDefault();
    if (this.internals.form) requestSubmitAs(this.internals.form, this.name, this.value);
  };

  private handleReset = (e: MouseEvent) => {
    e.preventDefault();
    this.internals.form?.reset();
  };

  private mouseDown = () => {
    this.active = true;
  };

  private mouseUp = () => {
    this.active = false;
  };

  private isLink = (): boolean => (this.href ?? '') !== '';

  // a link the browser opens in a new tab or window: asked by the button, or by the user
  private opensElsewhere = (event: MouseEvent): boolean =>
    this.target === 'blank' || event.ctrlKey || event.metaKey || event.shiftKey;

  /**
   * A click on the anchor is the browser's to follow, unless the router registered with
   * `NavigationService` takes it over: then the navigation is cancelled here, before the page
   * loads, and the router renders the route.
   *
   * A click that did not land on the anchor comes from the keyboard, a script or an assistive
   * technology: the host follows the link as the anchor would, once every listener on the page
   * had its say. The timeout is what lets a listener added after this one, or delegated to the
   * document by a framework, cancel the navigation: a microtask could run between two listeners.
   */
  private handleLinkClick = (event: MouseEvent): void => {
    if (!this.isLink() || this.disabled || this.await) return;
    const href = this.href ?? '';
    if (this.anchor && event.composedPath().includes(this.anchor)) {
      if (this.opensElsewhere(event) || !NavigationService.canHandle(href, event)) return;
      event.preventDefault();
      this.route(href, event);
      return;
    }
    setTimeout(() => {
      if (!event.defaultPrevented) this.follow(event);
    });
  };

  private follow = (event: MouseEvent): void => {
    if (typeof window === 'undefined') return;
    const href = this.href ?? '';
    if (this.opensElsewhere(event)) {
      window.open(href, '_blank');
      return;
    }
    if (NavigationService.canHandle(href, event)) {
      this.route(href, event);
      return;
    }
    window.location.assign(href);
  };

  // the registered router renders the route; a link it declines is loaded as the browser would
  private route = (href: string, event: MouseEvent): void => {
    if (!NavigationService.handle(href, event)) window.location.assign(href);
  };

  // the host is the only tab stop: a click still focuses the anchor, which hands the focus back
  private focusHost = (): void => {
    this.host.focus();
  };

  componentWillLoad(): void {
    this.handleVariantChange(this.variant);

    if (this.isLink()) return;
    if (this.internals.form) {
      if (this.type === 'submit') {
        this.host.addEventListener('click', this.handleRequestSubmitForm);
      } else if (this.type === 'reset') {
        this.host.addEventListener('click', this.handleReset);
      }
    }
  }

  componentDidLoad(): void {
    this.km.addElement(this.host);
    if (!this.await) {
      this.km.attachClickBehavior();
    }
    this.host.setAttribute('aria-busy', this.await ? 'true' : 'false');

    if (this.autoFocus) {
      this.host.focus();
    }

    if (isIconFormatIsBase64(this.icon)) {
      return;
    }
    if (isIconFormatIsSVG(this.icon)) {
      return;
    }

    if (this.label === '') {
      this.label = undefined;
    }

    if ((this.label ?? '') === '' && this.icon != null && this.icon !== '') {
      const iconTitle = unslugName(this.icon);
      if (!this.host.hasAttribute('aria-label')) {
        setAttributeIfEmpty(this.host, 'title', iconTitle);
      }
      if (!this.host.hasAttribute('title')) {
        setAttributeIfEmpty(this.host, 'aria-label', iconTitle);
      }
    }

    setAttributeIfEmpty(this.host, 'role', this.isLink() ? 'link' : 'button');
  }

  @Watch('await')
  handleAwaitChange(newValue: boolean): void {
    if (newValue === false) {
      this.await = undefined;
      this.km.detachClickBehavior();
      return;
    }
    this.km.attachClickBehavior();
  }

  connectedCallback(): void {
    if (!this.disabled) this.host.removeAttribute('disabled');
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior();
  }

  private onSlotChangeHandler = (): void => {
    /* this should be removed in the future once slotted text is no longer used, use the label property instead */
    if ((this.label ?? '') !== '') return;
    this.label = readSlottedLabel(this.host);
  };

  render() {
    this.typography = (buttonSizeTypographyVariant[this.size] ??
      buttonSizeTypographyVariant.md) as TypographyType;
    return (
      <Host
        onClick={this.handleLinkClick}
        onMouseDown={this.mouseDown}
        onMouseUp={this.mouseUp}
        onMouseOut={this.mouseUp}
        tabindex="0"
        pref-animation={preferenceStore.state.animation}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.isLink() && (
          // the link under the pointer, over the whole button: the host keeps the focus, the
          // role and the name, so the anchor is out of the tab order and hidden from the
          // assistive technology
          <a
            aria-hidden="true"
            class="link"
            href={this.href}
            onFocus={this.focusHost}
            ref={(el) => (this.anchor = el)}
            tabindex="-1"
            target={this.target === 'blank' ? '_blank' : undefined}
          ></a>
        )}
        <div class="await">
          <mds-spinner class="spinner" running={this.await} />
        </div>
        {this.icon && this.iconPosition === 'left' && (
          <mds-icon aria-hidden="true" class="icon" name={this.icon} part="icon" />
        )}
        <mds-text
          class="text"
          part="label"
          tag="span"
          typography={this.typography}
          truncate={this.truncate}
          animation={this.animation}
          text={this.label}
        >
          {this.label || <slot onSlotchange={this.onSlotChangeHandler} />}
        </mds-text>
        <slot name="notification" />
        {this.icon && this.iconPosition === 'right' && (
          <mds-icon aria-hidden="true" class="icon" name={this.icon} part="icon" />
        )}
      </Host>
    );
  }
}
