import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import miBaselineNavigateNext from '@icon/mi/baseline/navigate-next.svg';
import { MdsBreadcrumbItemEventDetail } from './meta/event-detail';

/**
 * @part button - The `mds-button` of the item, which shows its `label`
 * @parent mds-breadcrumb
 */
@Component({
  tag: 'mds-breadcrumb-item',
  styleUrl: 'mds-breadcrumb-item.css',
  shadow: true,
})
export class MdsBreadcrumbItem {
  @Element() private element: HTMLMdsBreadcrumbItemElement;

  /**
   * Choose if the component is selected or not
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean;

  /**
   * Sets the label of the breadcrumb item
   */
  @Prop({ reflect: true }) label?: string;

  /**
   * Emits when the breadcrumb is active
   */
  @Event({ eventName: 'mdsBreadcrumbItemSelect' })
  selectedEvent: EventEmitter<MdsBreadcrumbItemEventDetail>;

  // the selected item is the current page: the pointer cannot click it, and the keyboard neither
  // deselects it, which used to leave the trail with nothing selected
  private select = () => {
    if (this.selected) return;
    this.selected = true;
    this.selectedEvent.emit({ id: this.element.id, selected: this.selected });
  };

  render() {
    return (
      <Host>
        <mds-button
          aria-current={this.selected ? 'page' : undefined}
          label={this.label}
          onClick={this.select}
          part="button"
        ></mds-button>
        <i aria-hidden="true" class="icon" innerHTML={miBaselineNavigateNext} />
      </Host>
    );
  }
}
