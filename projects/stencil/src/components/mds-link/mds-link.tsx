import { ButtonIconPositionType, ButtonTargetType } from '@type/button';
import { Component, Element, Host, h, Prop } from '@stencil/core';
import { ToneMinimalVariantType } from '@type/tone';
import { KeyboardManager } from '@common/keyboard-manager';
import { Locale } from '@common/locale';
import { NavigationService } from '@common/navigation';
import { preferenceStore } from '@common/preference';
import { LinkUnderlineType, LinkVariantType } from './meta/types';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `text string` to this slot, the text of the link when `label` is not set; **avoid** to add `HTML elements` or `components` here.
 * @part link - The element that carries the link and the focus: an anchor with `href`, an inline button without it
 * @part icon - The icon of the link
 * @category actions
 */

@Component({
  tag: 'mds-link',
  styleUrl: 'mds-link.css',
  shadow: { delegatesFocus: true },
})
export class MdsLink {
  private km = new KeyboardManager();
  private link?: HTMLElement;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @Element() host: HTMLMdsLinkElement;

  /**
   * The text of the link; without it, the text of the default slot
   */
  @Prop({ reflect: true }) readonly label?: string;

  /**
   * The URL of the link: a real anchor in its shadow root, so the browser gives it what it gives
   * every link (new tab on a modifier or middle click, the context menu, drag). A client-side
   * router takes the plain clicks over once registered with `NavigationService.setHandler()`
   * (from `@maggioli-design-system/magma/services`); without one, a click listener on the host can
   * still cancel the navigation with `preventDefault()`. Without `href` the link is an inline
   * button: it answers to click, Enter and Space with a `click` event and never submits a form.
   */
  @Prop({ reflect: true }) readonly href?: string;

  /**
   * Specifies the target of the URL, if self or blank: blank opens a new tab, without giving it
   * access to the page (`rel="noopener noreferrer"`), and tells the assistive technology so
   */
  @Prop() readonly target: ButtonTargetType = 'self';

  /**
   * The icon displayed in the link
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Specifies the horizontal position of the icon, which never wraps to a line of its own
   */
  @Prop({ reflect: true }) readonly iconPosition?: ButtonIconPositionType = 'right';

  /**
   * Specifies the color of the link: `primary` paints it with the accent, `inherit` takes the
   * color of the text around it, for a link on a colored surface
   */
  @Prop({ reflect: true }) readonly variant?: LinkVariantType = 'primary';

  /**
   * Specifies the tone of the underline: `strong` draws it in the color of the link, `weak` in
   * a tint of it, which takes the full color under the pointer
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong';

  /**
   * Specifies the style of the underline, which is always visible
   */
  @Prop({ reflect: true }) readonly underline?: LinkUnderlineType = 'solid';

  private isLink = (): boolean => (this.href ?? '') !== '';

  private opensInNewTab = (): boolean => this.isLink() && this.target === 'blank';

  // a link the browser opens in a new tab or window: asked by the link, or by the user
  private opensElsewhere = (event: MouseEvent): boolean =>
    this.target === 'blank' || event.ctrlKey || event.metaKey || event.shiftKey;

  /**
   * A click on the anchor is the browser's to follow, unless the router registered with
   * `NavigationService` takes it over: then the navigation is cancelled here, before the page
   * loads, and the router renders the route. The keyboard clicks the anchor too.
   *
   * A click that did not land on the anchor comes from a script: the host follows the link as
   * the anchor would, once every listener on the page had its say. The timeout is what lets a
   * listener added after this one, or delegated to the document by a framework, cancel it.
   */
  private handleClick = (event: MouseEvent): void => {
    if (!this.isLink()) return;
    const href = this.href ?? '';
    if (this.link && event.composedPath().includes(this.link)) {
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
      window.open(href, '_blank', 'noopener,noreferrer');
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

  // the inline button is a span, which the browser does not click on Enter and Space: the
  // element changes when href comes or goes, so it is wired again after every render. The
  // listeners live in the shadow root, so a link taken out of the page keeps them
  componentDidRender(): void {
    this.km.detachClickBehavior();
    if (this.isLink() || !this.link) return;
    this.km.addElement(this.link);
    this.km.attachClickBehavior('element', { space: true });
  }

  render() {
    const Tag = this.isLink() ? 'a' : 'span';
    const blank = this.opensInNewTab();
    const attributes = this.isLink()
      ? {
          href: this.href,
          rel: blank ? 'noopener noreferrer' : undefined,
          target: blank ? '_blank' : undefined,
        }
      : { role: 'button', tabindex: '0' };
    // the word joiner keeps the icon on the line of the word next to it: the icon is drawn in
    // the padding of an inline box, which the line breaks with the text
    const icon = this.icon && (
      <span class={`glue glue-${this.iconPosition === 'left' ? 'left' : 'right'}`}>
        {'⁠'}
        <mds-icon aria-hidden="true" class="icon" name={this.icon} part="icon" />
      </span>
    );
    return (
      <Host
        onClick={this.handleClick}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
      >
        <Tag
          class="link"
          part="link"
          ref={(el?: HTMLElement) => {
            this.link = el;
          }}
          {...attributes}
        >
          {this.iconPosition === 'left' && icon}
          {this.label || <slot />}
          {blank && <span class="hint">{` ${this.t.get('newTab')}`}</span>}
          {this.iconPosition !== 'left' && icon}
        </Tag>
      </Host>
    );
  }
}
