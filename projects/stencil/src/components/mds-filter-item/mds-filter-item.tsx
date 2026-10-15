import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import { MdsFilterItemEventDetail } from './meta/event-detail';
import { KeyboardManager } from '@common/keyboard-manager';
import { preferenceStore } from '@common/preference';
import { isIconFormatIsBase64, isIconFormatIsSVG } from '@common/icon';
import { unslugName } from '@common/aria';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

@Component({
  tag: 'mds-filter-item',
  styleUrl: 'mds-filter-item.css',
  shadow: true,
})
export class MdsFilterItem {
  @Element() private element: HTMLMdsFilterItemElement;
  private km = new KeyboardManager();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  // the name this item wrote on its host, to tell it apart from one the author wrote
  private appliedName?: string;

  /**
   * Sets the component to selected state
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean;

  /**
   * Sets the label of the filter item
   */
  @Prop({ reflect: true }) label: string;

  /**
   * Sets the icon of the filter item
   */
  @Prop({ reflect: true }) icon?: string;

  /**
   * Sets the value of the component to be used with forms
   */
  @Prop({ reflect: true }) value: string;

  /**
   * Shows the number of items will be filtered by the component, also read out after the label
   * as a number of results
   */
  @Prop({ reflect: true }) count?: string;

  /**
   * Sets if the component is disabled or not
   */
  @Prop({ reflect: true }) disabled?: boolean;

  // an item of a filter bar is a toggle; the reset button mds-filter renders in its own shadow
  // root is an action, handled by the filter, and has no pressed state to announce
  private isFilter = (): boolean => this.element.closest('mds-filter') !== null;

  private toggle = () => {
    if (this.disabled || !this.isFilter()) {
      return;
    }
    this.selected = !this.selected;
    this.selectedEvent.emit({ id: this.element.id, selected: this.selected });
  };

  // Enter clicks through the keyboard manager; Space clicks on release, as on a native button,
  // and must not scroll the page while it is held
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'Space') {
      this.element.click();
    }
  };

  /**
   * The spoken name: the label, or the icon slug for an icon-only item, followed by the count as
   * a number of results. An icon given as markup has no slug: whoever renders it names the item.
   */
  private computeName = (): string | undefined => {
    const icon = this.icon ?? '';
    const iconName =
      icon !== '' && !isIconFormatIsSVG(icon) && !isIconFormatIsBase64(icon)
        ? unslugName(icon)
        : undefined;
    const name = (this.label ?? '') !== '' ? this.label : iconName;
    const count = this.count ?? '';
    if (name === undefined || count === '') {
      return name;
    }
    const results = this.t.get(Number(count) === 1 ? 'result' : 'results', { count });
    return `${name}, ${results}`;
  };

  /**
   * An aria-label written on the host by the author is the more specific name and stays; the one
   * this item wrote before is its own to update. A server-rendered host carries the name the
   * server computed, which is the same one: that also counts as its own.
   */
  private resolveName = (): string | undefined => {
    const name = this.computeName();
    const current = this.element.getAttribute('aria-label');
    if (current !== null && current !== this.appliedName && current !== name) {
      return current;
    }
    this.appliedName = name;
    return name;
  };

  /**
   * Emits when the element is active
   */
  @Event({ eventName: 'mdsFilterItemSelect' })
  selectedEvent: EventEmitter<MdsFilterItemEventDetail>;

  componentDidLoad(): void {
    this.km.addElement(this.element);
    this.km.attachClickBehavior();
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior();
  }

  render() {
    return (
      <Host
        tabindex={this.disabled ? '-1' : '0'}
        role="button"
        aria-disabled={this.disabled ? 'true' : undefined}
        aria-label={this.resolveName()}
        aria-pressed={this.isFilter() ? (this.selected ? 'true' : 'false') : undefined}
        onClick={this.toggle}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.icon && <mds-icon aria-hidden="true" name={this.icon} />}
        {this.label && (
          <mds-text aria-hidden="true" variant="info" typography="caption">
            {this.label}
          </mds-text>
        )}
        {this.count && (
          <div class="count">
            <mds-text aria-hidden="true" variant="info" typography="option">
              {this.count}
            </mds-text>
          </div>
        )}
      </Host>
    );
  }
}
