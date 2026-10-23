import { Component, Host, Event, EventEmitter, h, Prop } from '@stencil/core';
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg';
import miOutlineCircle from '@icon/mi/outline/circle.svg';
import { MdsPrefThemeEventDetail } from '@event/theme';
import { PreferenceThemeSchemeType } from '@type/preference';
import { labelFromName } from '@common/string';

/**
 * @parent mds-pref-theme
 */
@Component({
  tag: 'mds-pref-theme-item',
  styleUrl: 'mds-pref-theme-item.css',
  shadow: true,
})
export class MdsPrefThemeItem {
  /**
   * Specifies the theme name
   */
  @Prop({ reflect: true, mutable: true }) label?: string;

  /**
   * Specifies the theme name
   * @example 'maggioli-editore'
   */
  @Prop({ reflect: true }) readonly name: string = 'default';

  /**
   * Specifies the theme scheme which can be 'light', 'dark' or 'all'
   */
  @Prop({ reflect: true }) readonly scheme?: PreferenceThemeSchemeType = 'all';

  /**
   * Specifies if the element is selected
   */
  @Prop({ reflect: true }) readonly selected?: boolean = false;

  /**
   * Emits when the component trigger the language
   */
  @Event({ eventName: 'mdsPrefThemeItemSelect' })
  selectThemeEvent: EventEmitter<MdsPrefThemeEventDetail>;

  componentWillRender(): void {
    if ((this.label ?? '') === '') {
      this.label = labelFromName(this.name);
    }
  }

  private handleClick = (): void => {
    this.selectThemeEvent.emit({ name: this.name, scheme: this.scheme });
  };

  render() {
    return (
      // the item is an entry of the `menu` the mds-dropdown of the controller opens:
      // without the role axe rejects it as a child of that menu (aria-required-children)
      <Host onClick={this.handleClick} role="menuitem">
        <mds-button
          icon={this.selected ? miBaselineCheckCircle : miOutlineCircle}
          variant="dark"
          tone="text"
          label={this.label}
        ></mds-button>
        {/* next to the button, not in it: the default slot of mds-button takes text only, and
            anything else put there disappears once the button has read its label from it */}
        <span aria-hidden="true" class="theme-preview">
          <span class="theme-color theme-color--variant-primary"></span>
          <span class="theme-color theme-color--status-success"></span>
          <span class="theme-color theme-color--status-warning"></span>
          <span class="theme-color theme-color--status-error"></span>
        </span>
      </Host>
    );
  }
}
