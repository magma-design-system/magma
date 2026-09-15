import { Component, Element, Host, h, Prop, State } from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';
import { ThemeFullVariantAvatarType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot detail - Add `HTML elements` or `components` to this slot.
 * @part spinner - The spinner element
 * @part avatar - The avatar element
 */

@Component({
  tag: 'mds-entity',
  styleUrl: 'mds-entity.css',
  shadow: true,
})
export class MdsEntity {
  @Element() private hostElement: HTMLMdsEntityElement;
  @State() hasDetails: boolean;
  @State() hasActions: boolean;

  /**
   * Specifies if the component is awaiting a response from an external resource
   */
  @Prop({ reflect: true }) readonly await?: boolean;

  /**
   * Specifies the icon to be displayed if src propery is not used
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string;

  /**
   * The user's inizials displayed if there's no image available and icon is not set
   */
  @Prop({ reflect: true }) readonly initials?: string;

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType;

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType;

  private checkAvatar(): boolean {
    let hasAvatar = false;
    if (this.src !== undefined) {
      hasAvatar = true;
    }
    if (this.icon !== undefined) {
      hasAvatar = true;
    }
    if (this.initials !== undefined) {
      hasAvatar = true;
    }
    if (this.await) {
      return false;
    }
    return hasAvatar;
  }

  private onSlotChange = (): void => {
    this.hasDetails = hasChildWithSlot(this.hostElement, 'detail');
    this.hasActions = hasChildWithSlot(this.hostElement, 'action');
  };

  componentWillLoad(): void {
    this.onSlotChange();
  }

  render() {
    return (
      <Host
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="spinner" part="spinner">
          <mds-spinner running></mds-spinner>
        </div>
        {this.checkAvatar() && (
          <mds-avatar
            class="preview"
            icon={this.icon}
            initials={this.initials}
            src={this.src}
            tone={this.tone}
            variant={this.variant}
            part="avatar"
          />
        )}
        <div class="infos">
          <slot />
          <div class={clsx('details', !this.hasDetails && 'details--hidden')}>
            <slot name="detail" onSlotchange={this.onSlotChange} />
          </div>
        </div>
        <div class={clsx('actions', !this.hasActions && 'actions--hidden')}>
          <slot name="action" onSlotchange={this.onSlotChange} />
        </div>
      </Host>
    );
  }
}
