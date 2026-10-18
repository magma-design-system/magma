import { Component, Host, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import miBaselineContrast from '@icon/mi/baseline/contrast.svg';
import miOutlineAutoAwesome from '@icon/mi/outline/auto-awesome.svg';
import miBaselineAutoAwesome from '@icon/mi/baseline/auto-awesome.svg';
import miBaselineSettings from '@icon/mi/baseline/settings.svg';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { ContrastModeType } from './meta/types';
import { MdsPrefChangeEventDetail } from '@event/preference';
import { TabSizeType } from '@type/button';

@Component({
  tag: 'mds-pref-contrast',
  styleUrl: 'mds-pref-contrast.css',
  shadow: true,
})
export class MdsPrefContrast {
  private readonly localStorageAlias: string = 'mdsPrefContrast';
  private readonly customPropertyAlias: string = '--magma-pref-contrast';
  private readonly defaultMode: ContrastModeType = 'system';
  private syncingFromStore: boolean = false;
  private unsubscribeStore?: () => void;
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Sets the size of the component items nested inside it
   */
  @Prop({ reflect: true }) readonly size?: TabSizeType;

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ContrastModeType;

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>;

  private readonly contrast = {
    more: {
      selector: 'pref-contrast-more',
      label: 'contrastMore',
    },
    system: {
      selector: 'pref-contrast-system',
      label: 'systemSettings',
    },
    'no-preference': {
      selector: 'pref-contrast-no-preference',
      label: 'contrastDefault',
    },
  };

  private readonly isMode = (mode?: string | null): mode is ContrastModeType =>
    mode != null && {}.hasOwnProperty.call(this.contrast, mode);

  private readonly warnInvalidMode = (mode: string): void => {
    console.warn(
      `mds-pref-contrast: ignoring the invalid mode "${mode}", use one of: ${Object.keys(this.contrast).join(', ')}`,
    );
  };

  // Applied once, on load, then mirrored from the shared store (see mds-pref-mode). A mode
  // outside the union is ignored, and one an earlier page left in the storage is dropped: it was
  // applied, threw, and broke every following load too (#825)
  componentWillLoad(): void {
    if (this.mode != null && !this.isMode(this.mode)) this.warnInvalidMode(this.mode);
    const stored = localStorage.getItem(this.localStorageAlias);
    if (stored !== null && !this.isMode(stored)) localStorage.removeItem(this.localStorageAlias);
    this.setContrast([this.mode, stored].find(this.isMode) ?? this.defaultMode);
  }

  connectedCallback(): void {
    this.unsubscribeStore = preferenceStore.onChange('contrast', this.syncContrast);
  }

  disconnectedCallback(): void {
    this.unsubscribeStore?.();
  }

  /**
   * Follows a contrast applied elsewhere (another instance, or a writer of the
   * `<html>` classes) without applying it again: no event, no storage write.
   */
  private readonly syncContrast = (mode?: string): void => {
    if (mode === undefined || mode === this.mode) {
      return;
    }
    this.syncingFromStore = true;
    this.mode = mode as ContrastModeType;
    this.syncingFromStore = false;
  };

  private readonly setContrast = (mode: ContrastModeType): void => {
    this.prefChangeEvent.emit({ preference: 'contrast' });
    this.mode = mode;
    localStorage.setItem(this.localStorageAlias, this.mode);
    if (typeof document !== 'undefined') {
      const element = document.querySelector('html');
      for (const key in this.contrast) {
        if ({}.hasOwnProperty.call(this.contrast, key)) {
          element?.classList.remove(this.contrast[key].selector);
        }
      }
      element?.classList.add(this.contrast[mode].selector);
      element?.style.setProperty(this.customPropertyAlias, this.mode);
    }
    preferenceStore.state.contrast = mode;
  };

  @Watch('mode')
  modeChanged(newValue: ContrastModeType, oldValue: ContrastModeType): void {
    if (newValue === oldValue || this.syncingFromStore) {
      return;
    }
    // a mode outside the union, or the attribute removed, is not applied: the instance goes back
    // to the contrast of the page
    if (!this.isMode(newValue)) {
      if (newValue != null) this.warnInvalidMode(newValue);
      this.syncContrast(preferenceStore.state.contrast);
      return;
    }
    this.setContrast(newValue);
  }

  private readonly handleModeClick = (mode: ContrastModeType) => (): void => {
    this.setContrast(mode);
  };

  render() {
    return (
      <Host pref-contrast={preferenceStore.state.contrast}>
        <mds-text class="info" typography="caption">
          <b>{this.t.get('label')}</b>{' '}
          {this.t.get(this.contrast[this.mode ?? this.defaultMode].label)}
        </mds-text>
        <mds-tab fill size={this.size}>
          <mds-tab-item
            selected={this.mode === 'more'}
            onClick={this.handleModeClick('more')}
            class="item item--more"
            icon={miBaselineContrast}
            title={this.t.get(this.contrast.more.label)}
          ></mds-tab-item>
          <mds-tab-item
            selected={this.mode === 'system'}
            onClick={this.handleModeClick('system')}
            class="item item--system"
            icon={miBaselineSettings}
            title={this.t.get(this.contrast.system.label)}
          ></mds-tab-item>
          <mds-tab-item
            selected={this.mode === 'no-preference'}
            onClick={this.handleModeClick('no-preference')}
            class="item item--default"
            icon={this.mode === 'no-preference' ? miBaselineAutoAwesome : miOutlineAutoAwesome}
            title={this.t.get(this.contrast['no-preference'].label)}
          ></mds-tab-item>
          {/* <mds-tab-item selected={this.mode === 'sensor'} onClick={() => { this.setContrast('sensor') }} class="item item--sensor" icon={this.mode === 'sensor' ? miBaselineAutoAwesome : miOutlineAutoAwesome}></mds-tab-item> */}
        </mds-tab>
      </Host>
    );
  }
}
