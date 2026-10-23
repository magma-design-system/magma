import { Component, Host, h, Prop, Element } from '@stencil/core';
import { KeyboardManager } from '@common/keyboard-manager';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @parent mds-paginator
 */

@Component({
  tag: 'mds-paginator-item',
  styleUrl: 'mds-paginator-item.css',
  shadow: true,
})
export class MdsPaginatorItem {
  @Element() host: HTMLMdsPaginatorItemElement;
  private km = new KeyboardManager();

  /**
   * Specifies the icon used inside the paginator item
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Specifies if the item is selected or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly selected?: boolean;

  /**
   * Specifies if the item is disabled or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly disabled?: boolean;

  /**
   * The item is a button: Enter and Space click it as the pointer does, never while it is
   * disabled or is the selected page, which the pointer cannot click either. A disabled item
   * leaves the tab order; the selected page stays in it, so the keyboard finds where it is.
   */
  private syncClickBehavior = (): void => {
    if (this.disabled || this.selected) {
      this.km.detachClickBehavior();
      return;
    }
    this.km.attachClickBehavior('element', { space: true });
  };

  componentDidLoad(): void {
    this.km.addElement(this.host);
    this.syncClickBehavior();
  }

  componentDidUpdate(): void {
    this.syncClickBehavior();
  }

  // an item moved in the page is disconnected and connected again, without loading again
  connectedCallback(): void {
    this.syncClickBehavior();
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior();
  }

  render() {
    return (
      <Host
        aria-current={this.selected ? 'page' : undefined}
        aria-disabled={this.disabled ? 'true' : undefined}
        role="button"
        tabindex={this.disabled ? undefined : '0'}
        pref-animation={preferenceStore.state.animation}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.icon !== undefined ? (
          <mds-icon class="icon" name={this.icon} />
        ) : (
          <mds-text class="text" typography="caption">
            <b>
              <slot />
            </b>
          </mds-text>
        )}
      </Host>
    );
  }
}
