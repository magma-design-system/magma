import { Component, Element, Event, EventEmitter, Listen, Host, h, Prop } from '@stencil/core';
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg';
import { MdsBreadcrumbEventDetail } from './meta/event-detail';
import { MdsBreadcrumbItemEventDetail } from '@component/mds-breadcrumb-item/meta/event-detail';
import { KeyboardManager } from '@common/keyboard-manager';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `mds-breadcrumb-item` element/s.
 */

@Component({
  tag: 'mds-breadcrumb',
  styleUrl: 'mds-breadcrumb.css',
  shadow: true,
})
export class MdsBreadcrumb {
  @Element() private element: HTMLMdsBreadcrumbElement;
  private kb = new KeyboardManager();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Hides the back arrow button
   */
  @Prop() readonly hideBack?: boolean = false;

  /**
   * Emits when the breadcrumb is changed
   */
  @Event({ eventName: 'mdsBreadcrumbChange' }) changedEvent: EventEmitter<MdsBreadcrumbEventDetail>;

  private queryItems = (): NodeListOf<HTMLMdsBreadcrumbItemElement> =>
    this.element.querySelectorAll<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item');

  private updateBackButton = (id: number): void => {
    if (this.hideBack) return;
    const backElement = this.element.shadowRoot?.querySelector('.back') as HTMLElement;
    if (id === 0) {
      backElement.setAttribute('disabled', '');
      this.kb.detachClickBehavior();
      return;
    }
    backElement.removeAttribute('disabled');
    this.kb.attachClickBehavior();
  };

  componentDidLoad(): void {
    // an item keeps the id its author gave it, one without gets `item-<index>`; the breadcrumb
    // tells the items apart by element and by position, not by id. It used to overwrite every id
    // (#827)
    const items = this.queryItems();
    items.forEach((item, key) => {
      if (item.id === '') item.id = `item-${key}`;
    });

    const item = this.element.querySelector<HTMLMdsBreadcrumbItemElement>(
      'mds-breadcrumb-item[selected]',
    );
    if (!item || item === items[0]) {
      this.updateBackButton(0);
    }

    if (!this.hideBack) {
      const backElement = this.element.shadowRoot?.querySelector('.back') as HTMLElement;
      this.kb.addElement(backElement);
      this.kb.attachClickBehavior();
    }
  }

  componentDidUpdate(): void {
    if (!this.hideBack) {
      const backElement = this.element.shadowRoot?.querySelector('.back') as HTMLElement;
      this.kb.addElement(backElement);
      this.kb.attachClickBehavior();
      return;
    }
    this.kb.detachClickBehavior();
  }

  disconnectedCallback(): void {
    this.kb.detachClickBehavior();
  }

  @Listen('mdsBreadcrumbItemSelect')
  activedEventHandler(event: CustomEvent<MdsBreadcrumbItemEventDetail>): void {
    const items = this.queryItems();
    let selectedId = 0;

    items.forEach((item, key) => {
      item.selected = item === event.target && event.detail.selected;
      if (item.selected) {
        selectedId = key;
      }
    });
    this.updateBackButton(selectedId);
    this.onChanged(selectedId, event.target as HTMLMdsBreadcrumbItemElement);
  }

  private togglePrevious = (): void => {
    const item = this.element.querySelector<HTMLMdsBreadcrumbItemElement>(
      'mds-breadcrumb-item[selected]',
    );
    if (!item) return;
    const id = Array.from(this.queryItems()).indexOf(item);
    const items = this.queryItems();
    let selectedId = 0;

    items.forEach((item, key) => {
      item.selected = key === id - 1;
      if (item.selected) {
        selectedId = key;
      }
    });

    this.updateBackButton(selectedId);
    // the caller is the item the step selects, as on a click: it used to be the one it left
    this.onChanged(selectedId, items[selectedId]);
  };

  private onChanged = (id: number, caller: HTMLMdsBreadcrumbItemElement): void => {
    this.changedEvent.emit({ id: id.toString(), caller });
  };

  render() {
    return (
      <Host>
        {!this.hideBack && (
          <mds-button
            title={this.t.get('back')}
            class="back"
            tone="text"
            variant="dark"
            icon={miBaselineArrowBack}
            onClick={this.togglePrevious}
          ></mds-button>
        )}
        <slot />
      </Host>
    );
  }
}
