import { Component, Host, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import { MdsPrefChangeEventDetail } from '@event/preference';
import mggConsumptionLow from '@icon/mgg/consumption-low.svg';
import mggConsumptionMedium from '@icon/mgg/consumption-medium.svg';
import mggConsumptionHigh from '@icon/mgg/consumption-high.svg';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { ConsumptionModeType } from '@type/preference';
import { TabSizeType } from '@type/button';

/**
 * @category preferences
 */
@Component({
  tag: 'mds-pref-consumption',
  styleUrl: 'mds-pref-consumption.css',
  shadow: true,
})
export class MdsPrefContrast {
  private readonly localStorageAlias: string = 'mdsPrefConsumption';
  private readonly customPropertyAlias: string = '--magma-pref-consumption';
  private readonly defaultMode: ConsumptionModeType = 'high';
  private syncingFromStore: boolean = false;
  // the consumption this instance applied last, or followed from another one
  private appliedMode?: ConsumptionModeType;
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
  @Prop({ mutable: true, reflect: true }) mode?: ConsumptionModeType;

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>;

  private readonly consumption = {
    high: {
      selector: 'pref-consumption-high',
      label: 'consumptionHigh',
    },
    medium: {
      selector: 'pref-consumption-medium',
      label: 'consumptionMedium',
    },
    low: {
      selector: 'pref-consumption-low',
      label: 'consumptionLow',
    },
  };

  private readonly isMode = (mode?: string | null): mode is ConsumptionModeType =>
    mode != null && {}.hasOwnProperty.call(this.consumption, mode);

  private readonly warnInvalidMode = (mode: string): void => {
    console.warn(
      `mds-pref-consumption: ignoring the invalid mode "${mode}", use one of: ${Object.keys(this.consumption).join(', ')}`,
    );
  };

  // Applied once, on load, then mirrored from the shared store (see mds-pref-mode). A mode
  // outside the union is ignored, and one an earlier page left in the storage is dropped: it was
  // applied, threw, and broke every following load too (#825)
  componentWillLoad(): void {
    if (this.mode != null && !this.isMode(this.mode)) this.warnInvalidMode(this.mode);
    const stored = localStorage.getItem(this.localStorageAlias);
    if (stored !== null && !this.isMode(stored)) localStorage.removeItem(this.localStorageAlias);
    this.setConsumption([this.mode, stored].find(this.isMode) ?? this.defaultMode);
  }

  connectedCallback(): void {
    this.unsubscribeStore = preferenceStore.onChange('consumption', this.syncConsumption);
  }

  disconnectedCallback(): void {
    this.unsubscribeStore?.();
  }

  /**
   * Follows a consumption applied elsewhere (another instance, or a writer of the
   * `<html>` classes) without applying it again: no event, no storage write.
   */
  private readonly syncConsumption = (mode?: string): void => {
    if (mode === undefined || mode === this.mode) {
      return;
    }
    this.syncingFromStore = true;
    this.mode = mode as ConsumptionModeType;
    this.appliedMode = mode as ConsumptionModeType;
    this.syncingFromStore = false;
  };

  /**
   * Applies a consumption once per change, and announces it once applied: the `mode` watcher
   * calls this again for the value it has just been given, which used to emit a second
   * mdsPrefChange, and the first application, the one of load, is no change to announce.
   */
  private readonly setConsumption = (mode: ConsumptionModeType): void => {
    if (mode === this.appliedMode) {
      this.mode = mode;
      return;
    }
    const isFirstApplication = this.appliedMode === undefined;
    this.appliedMode = mode;
    this.mode = mode;
    localStorage.setItem(this.localStorageAlias, this.mode);
    if (typeof document !== 'undefined') {
      const element = document.querySelector('html');
      for (const key in this.consumption) {
        if ({}.hasOwnProperty.call(this.consumption, key)) {
          element?.classList.remove(this.consumption[key].selector);
        }
      }
      element?.classList.add(this.consumption[this.mode].selector);
      element?.style.setProperty(this.customPropertyAlias, this.mode);
    }
    preferenceStore.state.consumption = mode;
    if (!isFirstApplication) {
      this.prefChangeEvent.emit({ preference: 'consumption' });
    }
  };

  @Watch('mode')
  modeChanged(newValue: ConsumptionModeType): void {
    if (this.syncingFromStore) {
      return;
    }
    // a mode outside the union, or the attribute removed, is not applied: the instance goes back
    // to the consumption of the page
    if (!this.isMode(newValue)) {
      if (newValue != null) this.warnInvalidMode(newValue);
      this.syncConsumption(preferenceStore.state.consumption);
      return;
    }
    this.setConsumption(newValue);
  }

  private readonly handleModeClick = (mode: ConsumptionModeType) => (): void => {
    this.setConsumption(mode);
  };

  render() {
    return (
      <Host pref-contrast={preferenceStore.state.contrast}>
        <mds-text class="info" typography="caption">
          <b>{this.t.get('label')}</b>{' '}
          {this.t.get(this.consumption[this.mode ?? this.defaultMode].label)}
        </mds-text>
        <mds-tab fill size={this.size}>
          <mds-tab-item
            selected={this.mode === 'low'}
            onClick={this.handleModeClick('low')}
            class="item item--low"
            icon={mggConsumptionLow}
            title={this.t.get(this.consumption.low.label)}
          ></mds-tab-item>
          <mds-tab-item
            selected={this.mode === 'medium'}
            onClick={this.handleModeClick('medium')}
            class="item item--medium"
            icon={mggConsumptionMedium}
            title={this.t.get(this.consumption.medium.label)}
          ></mds-tab-item>
          <mds-tab-item
            selected={this.mode === 'high'}
            onClick={this.handleModeClick('high')}
            class="item item--high"
            icon={mggConsumptionHigh}
            title={this.t.get(this.consumption.high.label)}
          ></mds-tab-item>
        </mds-tab>
      </Host>
    );
  }
}
