import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import miBaselineNavigateNext from '@icon/mi/baseline/navigate-next.svg';
import { MdsBreadcrumbItemEventDetail } from './meta/event-detail';

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
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

  private toggle = () => {
    this.selected = !this.selected;
    this.selectedEvent.emit({ id: this.element.id, selected: this.selected });
  };

  render() {
    return (
      <Host>
        <mds-button onClick={this.toggle} part="button" label={this.label}></mds-button>
        <i aria-hidden="true" class="icon" innerHTML={miBaselineNavigateNext} />
      </Host>
    );
  }
}
