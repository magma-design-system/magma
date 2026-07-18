import { Component, Host, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import miOutlineCircle from '@icon/mi/outline/circle.svg';
import miBaselineAnimation from '@icon/mi/baseline/animation.svg';
import miBaselineSettings from '@icon/mi/baseline/settings.svg';
import { MdsPrefChangeEventDetail } from '@event/preference';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { AnimationModeType } from './meta/types';
import { TabSizeType } from '@type/button';

@Component({
  tag: 'mds-pref-animation',
  styleUrl: 'mds-pref-animation.css',
  shadow: true,
})
export class MdsPrefAnimation {
  private readonly localStorageAlias: string = 'mdsPrefAnimation';
  private readonly customPropertyAlias: string = '--magma-pref-animation';
  private readonly defaultMode: AnimationModeType = 'system';

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
  @Prop({ mutable: true, reflect: true }) mode?: AnimationModeType;

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>;

  private readonly animation = {
    reduce: {
      selector: 'pref-animation-reduce',
      label: 'animationDisabled',
    },
    system: {
      selector: 'pref-animation-system',
      label: 'systemSettings',
    },
    'no-preference': {
      selector: 'pref-animation-no-preference',
      label: 'animationEnabled',
    },
  };

  componentWillRender(): void {
    this.setAnimation(
      this.mode ??
        (localStorage.getItem(this.localStorageAlias) as AnimationModeType) ??
        this.defaultMode,
    );
  }

  private readonly setAnimation = (mode: AnimationModeType): void => {
    this.prefChangeEvent.emit({ preference: 'animation' });
    this.mode = mode;
    localStorage.setItem(this.localStorageAlias, this.mode);
    if (typeof document !== 'undefined') {
      const element = document.querySelector('html');

      for (const key in this.animation) {
        if ({}.hasOwnProperty.call(this.animation, key)) {
          element?.classList.remove(this.animation[key].selector);
        }
      }
      element?.classList.add(this.animation[this.mode].selector);
      element?.style.setProperty(this.customPropertyAlias, this.mode);
    }
    preferenceStore.state.animation = mode;
  };

  @Watch('mode')
  modeChanged(newValue: AnimationModeType): void {
    this.setAnimation(newValue);
  }

  private readonly handleModeClick = (mode: AnimationModeType) => (): void => {
    this.setAnimation(mode);
  };

  render() {
    return (
      <Host pref-contrast={preferenceStore.state.contrast}>
        <mds-text class="info" typography="caption">
          <b>{this.t.get('label')}</b>{' '}
          {this.t.get(this.animation[this.mode ?? this.defaultMode].label)}
        </mds-text>
        <mds-tab fill size={this.size}>
          <mds-tab-item
            selected={this.mode === 'reduce'}
            onClick={this.handleModeClick('reduce')}
            class="item item--reduce"
            icon={miOutlineCircle}
          ></mds-tab-item>
          <mds-tab-item
            selected={this.mode === 'system'}
            onClick={this.handleModeClick('system')}
            class="item item--system"
            icon={miBaselineSettings}
          ></mds-tab-item>
          <mds-tab-item
            selected={this.mode === 'no-preference'}
            onClick={this.handleModeClick('no-preference')}
            class="item item--no-preference"
            icon={miBaselineAnimation}
          ></mds-tab-item>
        </mds-tab>
      </Host>
    );
  }
}
