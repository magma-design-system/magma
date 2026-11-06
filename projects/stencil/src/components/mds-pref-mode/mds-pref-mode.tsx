import { Component, Host, Element, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import { cssDurationToMilliseconds } from '@common/unit';
import miBaselineLightMode from '@icon/mi/baseline/light-mode.svg';
import miOutlineDarkMode from '@icon/mi/outline/dark-mode.svg';
import miBaselineDarkMode from '@icon/mi/baseline/dark-mode.svg';
import miBaselineSettings from '@icon/mi/baseline/settings.svg';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import {
  PreferenceModeType,
  PreferenceThemeSchemeType,
  PreferenceThemeTransitionType,
} from '@type/preference';
import { MdsPrefChangeEventDetail } from '@event/preference';
import { TabSizeType } from '@type/button';

/**
 * @category preferences
 */
@Component({
  tag: 'mds-pref-mode',
  styleUrl: 'mds-pref-mode.css',
  shadow: true,
})
export class MdsPrefMode {
  @Element() private element: HTMLMdsPrefModeElement;
  private readonly defaultMode: PreferenceModeType = 'system';
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  private readonly localStorageAlias: string = 'mdsPrefMode';
  private readonly customPropertyAlias: string = '--magma-pref-mode';
  private readonly overlayBackgroundVisible = 'var(--magma-surface-default)';
  private readonly overlayBackgroundHidden =
    'color-mix(in srgb, var(--magma-surface-default) 0%, transparent)';
  private cssOverlayShowDuration: string = '300';
  private cssOverlayFadeoutDuration: string = '200';
  private cssOverlayZIndex: string = '6000';
  private overlayEl: HTMLElement;
  private readonly overlayId = 'mds-pref-mode-overlay';
  private overlayTimer: NodeJS.Timeout;
  private overlaySmoothTimer: NodeJS.Timeout;
  private overlayShow: boolean = false;
  private syncingFromStore: boolean = false;
  // the mode this instance applied last, or followed from another one
  private appliedMode?: PreferenceModeType;
  private unsubscribeStore?: () => void;

  private updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.element);
    this.cssOverlayShowDuration =
      elementStyles.getPropertyValue('--mds-pref-mode-overlay-show-duration') ?? '300';
    this.cssOverlayFadeoutDuration =
      elementStyles.getPropertyValue('--mds-pref-mode-overlay-fadeout-duration') ?? '200';
    this.cssOverlayZIndex =
      elementStyles.getPropertyValue('--mds-pref-mode-overlay-z-index') ?? '6000';
  };

  /**
   * Sets the size of the component items nested inside it
   */
  @Prop({ reflect: true }) readonly size?: TabSizeType;

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: PreferenceModeType;

  /**
   * Specifies the transition of switching from a mode to another one
   */
  @Prop({ mutable: true, reflect: true }) transition: PreferenceThemeTransitionType = 'smooth';

  /**
   * Locks the mode choice to one mode, `light` or `dark`: the control shows that mode
   * selected and disables the other two items, without touching the stored preference,
   * which comes back when the lock goes. `all` locks nothing. Unset, the control follows
   * the active theme: a theme that can be used in one mode only (`pref-theme-scheme-light`
   * or `-dark` on `<html>`, written by `mds-pref-theme` from the mode the theme declares,
   * #1274) locks it the same way. Not meant to be set directly.
   */
  @Prop({ reflect: true }) readonly lockedScheme?: PreferenceThemeSchemeType;

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>;

  private readonly modes = {
    dark: {
      selector: 'pref-mode-dark',
      label: 'darkMode',
    },
    system: {
      selector: 'pref-mode-system',
      label: 'systemSettings',
    },
    light: {
      selector: 'pref-mode-light',
      label: 'lightMode',
    },
  };

  // The stored mode is applied once, on load. After that each instance only mirrors
  // the shared store: re-applying its own `mode` on every render made a second
  // instance (a controller next to a settings page) revert what the other one chose.
  // Safari is no exception any more: it used to be forced to light, written to the storage,
  // while the dark refinements were Chromium-only `:host-context` rules (#960).
  componentWillLoad(): void {
    this.setMode(
      this.mode ??
        (localStorage.getItem(this.localStorageAlias) as PreferenceModeType) ??
        this.defaultMode,
    );
  }

  connectedCallback(): void {
    this.unsubscribeStore = preferenceStore.onChange('mode', this.syncMode);
  }

  disconnectedCallback(): void {
    this.unsubscribeStore?.();
  }

  componentDidLoad(): void {
    this.updateCSSCustomProps();
  }

  @Watch('mode')
  modeChanged(newValue: PreferenceModeType, oldValue: PreferenceModeType): void {
    if (newValue === oldValue || this.syncingFromStore) {
      return;
    }
    this.setMode(newValue);
  }

  /**
   * Follows a mode applied elsewhere (another instance, or a writer of the
   * `<html>` classes) without applying it again: no event, no storage write.
   */
  private readonly syncMode = (mode?: string): void => {
    if (mode === undefined || mode === this.mode) {
      return;
    }
    this.syncingFromStore = true;
    this.mode = mode as PreferenceModeType;
    this.appliedMode = mode as PreferenceModeType;
    this.syncingFromStore = false;
  };

  /**
   * Applies a mode once per change, and announces it once applied: the `mode` watcher
   * calls this again for the value it has just been given, which used to emit a second
   * mdsPrefChange, and the first application, the one of load, is no change to announce.
   */
  private readonly setMode = (mode: PreferenceModeType): void => {
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
      for (const key in this.modes) {
        if ({}.hasOwnProperty.call(this.modes, key)) {
          element?.classList.remove(this.modes[key].selector);
        }
      }
      element?.classList.add(this.modes[mode].selector);
      element?.style.setProperty(this.customPropertyAlias, this.mode);
    }
    preferenceStore.state.mode = mode;
    if (!isFirstApplication) {
      this.prefChangeEvent.emit({ preference: 'mode' });
    }
  };

  private readonly isDarkMode = (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  private readonly getColorScheme = (mode?: PreferenceModeType): PreferenceModeType => {
    if (mode !== undefined) {
      if (mode === 'system') {
        return this.isDarkMode() ? 'dark' : 'light';
      }
      return mode as PreferenceModeType;
    }

    if (this.mode === 'system') {
      return this.isDarkMode() ? 'dark' : 'light';
    }
    return this.mode as PreferenceModeType;
  };

  private instanceOverlay = (): void => {
    if (this.overlayEl == null) {
      this.overlayEl = document.createElement('div');
      this.overlayEl.className = this.overlayId;
      this.overlayEl.style.inset = '0';
      this.overlayEl.style.pointerEvents = 'none';
      this.overlayEl.style.position = 'fixed';
      this.overlayEl.style.transition = `background-color ${this.cssOverlayFadeoutDuration} ease-out`;
      this.overlayEl.style.zIndex = this.cssOverlayZIndex;
    }
    this.overlayEl.style.backgroundColor = this.overlayBackgroundHidden;
  };

  private detachOverlayTransition(): void {
    if (this.overlayEl == null) {
      return;
    }
    this.overlayEl.style.backgroundColor = this.overlayBackgroundHidden;
    clearTimeout(this.overlayTimer);

    this.overlayTimer = setTimeout(() => {
      this.overlayEl.remove();
    }, cssDurationToMilliseconds(this.cssOverlayFadeoutDuration));
  }

  private attachFlashOverlayTransition = (): void => {
    this.overlayShow = true;
    this.instanceOverlay();
    this.overlayEl.style.backgroundColor = this.overlayBackgroundVisible;
    document.body.appendChild(this.overlayEl);

    clearTimeout(this.overlayTimer);
    this.overlayTimer = setTimeout(() => {
      this.overlayShow = false;
      this.detachOverlayTransition();
    }, cssDurationToMilliseconds(this.cssOverlayShowDuration));
  };

  private attachSmoothOverlayTransition = (mode: PreferenceModeType): void => {
    this.overlayShow = true;
    this.instanceOverlay();
    document.body.appendChild(this.overlayEl);

    clearTimeout(this.overlaySmoothTimer);
    this.overlaySmoothTimer = setTimeout(() => {
      this.overlayEl.style.backgroundColor = this.overlayBackgroundVisible;
      clearTimeout(this.overlayTimer);

      this.overlayTimer = setTimeout(() => {
        this.setMode(mode);

        clearTimeout(this.overlayTimer);
        this.overlayTimer = setTimeout(() => {
          this.overlayShow = false;
          this.detachOverlayTransition();
        }, cssDurationToMilliseconds(this.cssOverlayFadeoutDuration));
      }, cssDurationToMilliseconds(this.cssOverlayShowDuration));
    }, 1);
  };

  /**
   * The mode the choice is locked to: the prop, or else the scheme of the active theme, which
   * the store mirrors from `<html>`. Read in render, so a theme picked anywhere re-renders it.
   */
  private readonly lockedMode = (): 'light' | 'dark' | undefined => {
    const scheme = this.lockedScheme ?? preferenceStore.state['theme-scheme'];
    return scheme === 'light' || scheme === 'dark' ? scheme : undefined;
  };

  /**
   * The mode the control shows: the one the theme locks the page to, since that is the mode
   * the page is in whatever was picked, or else the person's choice.
   */
  private readonly shownMode = (): PreferenceModeType =>
    this.lockedMode() ?? this.mode ?? this.defaultMode;

  private readonly isModeDisabled = (mode: PreferenceModeType): boolean => {
    const locked = this.lockedMode();
    return locked !== undefined && mode !== locked;
  };

  private changeMode = (mode: PreferenceModeType): void => {
    // under a lock no item changes the mode: the shown one is the theme's, not a pick
    if (this.lockedMode() !== undefined) {
      return;
    }

    const prevColor = this.getColorScheme();
    const nextColor = this.getColorScheme(mode);

    if (prevColor === nextColor) {
      this.setMode(mode);
      return;
    }

    switch (this.transition) {
      case 'none':
        this.setMode(mode);
        break;
      case 'flash':
        this.setMode(mode);
        this.attachFlashOverlayTransition();
        break;
      case 'smooth':
        this.attachSmoothOverlayTransition(mode);
        break;
      default:
        this.setMode(mode);
        break;
    }
  };

  private readonly handleModeClick = (mode: PreferenceModeType) => (): void => {
    if (this.overlayShow) {
      return;
    }
    this.changeMode(mode);
  };

  render() {
    return (
      <Host
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <mds-text class="info" typography="caption">
          <b>{this.t.get('label')}</b> {this.t.get(this.modes[this.shownMode()].label)}
        </mds-text>
        <mds-tab fill size={this.size}>
          <mds-tab-item
            disabled={this.isModeDisabled('light')}
            selected={this.shownMode() === 'light'}
            onClick={this.handleModeClick('light')}
            class="item item--light"
            icon={miBaselineLightMode}
            title={this.t.get(this.modes.light.label)}
          ></mds-tab-item>
          <mds-tab-item
            disabled={this.isModeDisabled('system')}
            selected={this.shownMode() === 'system'}
            onClick={this.handleModeClick('system')}
            class="item item--system"
            icon={miBaselineSettings}
            title={this.t.get(this.modes.system.label)}
          ></mds-tab-item>
          <mds-tab-item
            disabled={this.isModeDisabled('dark')}
            selected={this.shownMode() === 'dark'}
            onClick={this.handleModeClick('dark')}
            class="item item--dark"
            icon={this.shownMode() === 'dark' ? miBaselineDarkMode : miOutlineDarkMode}
            title={this.t.get(this.modes.dark.label)}
          ></mds-tab-item>
        </mds-tab>
      </Host>
    );
  }
}
