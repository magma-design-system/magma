import { Component, Host, Event, EventEmitter, h, Prop } from '@stencil/core';
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg';
import miOutlineCircle from '@icon/mi/outline/circle.svg';
import { MdsPrefThemeEventDetail } from '@event/theme';
import { PreferenceThemeSchemeType } from '@type/preference';
import { labelFromName } from '@common/string';

/** The names mds-pref-theme accepts: a theme's preview custom properties carry the name. */
const THEME_NAME = /^[a-z]+(-[a-z]+)*$/;

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
   * Specifies the theme name; the swatch shows the preview that theme publishes,
   * `--magma-preview-<name>-wash` and `--magma-preview-<name>-accent`
   * @example 'editorial'
   */
  @Prop({ reflect: true }) readonly name: string = 'business';

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

  /**
   * The preview of the theme the item names, which the styles of that theme publish on the page
   * (`--magma-preview-<name>-{wash,accent}`, #692), so the item shows its own theme and not the
   * active one. The stylesheet falls back to the active theme when a theme publishes none.
   */
  private previewStyle = (): Record<string, string> | undefined =>
    THEME_NAME.test(this.name)
      ? {
          '--private-theme-wash': `var(--magma-preview-${this.name}-wash)`,
          '--private-theme-accent': `var(--magma-preview-${this.name}-accent)`,
        }
      : undefined;

  render() {
    return (
      // the item is an entry of the `menu` the mds-dropdown of the controller opens:
      // without the role axe rejects it as a child of that menu (aria-required-children)
      <Host onClick={this.handleClick} role="menuitem" style={this.previewStyle()}>
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
