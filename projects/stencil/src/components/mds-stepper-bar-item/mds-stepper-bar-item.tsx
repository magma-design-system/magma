import {
  Component,
  Element,
  Event,
  EventEmitter,
  Method,
  Host,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';
import { TypographyType } from '@type/typography';
import clsx from 'clsx';
import { MdsBadge } from '../mds-badge/mds-badge';
import { MdsStepperBarItemEventDetail } from './meta/event-detail';
import { KeyboardManager } from '@common/keyboard-manager';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { subscribePreference } from '@common/preference';

/**
 * @part badge - The badge wrapper
 */

@Component({
  tag: 'mds-stepper-bar-item',
  styleUrl: 'mds-stepper-bar-item.css',
  shadow: true,
})
export class MdsStepperBarItem {
  @Element() private host: HTMLMdsStepperBarItemElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;

  @State() isDone: boolean;
  @State() isCurrent: boolean;
  @State() index: number;
  private km = new KeyboardManager();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
  }

  /**
   * Specifies a short description of the component
   */
  @Prop() readonly label!: string;

  /**
   * Specifies if the step is displayed
   */
  @Prop() readonly step: boolean;

  /**
   * Specifies if the badge status is displayed
   */
  @Prop({ mutable: true, reflect: true }) badge: boolean;

  /**
   * Specifies the icon displayed of the component when is not checked or the current item
   */
  @Prop() readonly icon!: string;

  /**
   * Specifies the icon displayed of the component when is checked
   */
  @Prop() iconChecked? = this.icon;

  /**
   * Specifies if the component is checked or not
   */
  @Prop({ reflect: true }) readonly done: boolean = false;

  /**
   * Specifies if the component is the current or not
   */
  @Prop({ mutable: true, reflect: true }) current = false;

  /**
   * Specifies the value the component will return mdsStepperBarItemSelect event
   */
  @Prop({ reflect: true }) value?: string;

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyType = 'h6';

  componentWillLoad(): void {
    this.isCurrent = this.current;
    this.isDone = this.done;
    const parent = this.host.parentElement;
    if (parent) this.index = [...Array.from(parent.childNodes)].indexOf(this.host);
  }

  componentDidLoad(): void {
    this.km.addElement(this.host);
    this.km.attachClickBehavior();
  }

  componentWillRender(): void {
    this.t.lang(this.host);
  }

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
    this.km.detachClickBehavior();
  }

  @Watch('done')
  selectedHandler(newValue: boolean): void {
    this.isDone = newValue;
  }

  @Watch('current')
  currentHandler(newValue: boolean): void {
    this.isCurrent = newValue;
  }

  private showBadge = (): MdsBadge => {
    if (this.isDone) {
      return (
        <mds-badge class="badge" variant="success" tone="weak" typography="option">
          {this.t.get('badgeDone')}
        </mds-badge>
      );
    }
    if (this.isCurrent) {
      return (
        <mds-badge class="badge" variant="info" tone="weak" typography="option">
          {this.t.get('badgeCurrent')}
        </mds-badge>
      );
    }
    return (
      <mds-badge class="badge" variant="dark" tone="weak" typography="option">
        {this.t.get('badgeQueued')}
      </mds-badge>
    );
  };

  /**
   * Emits when the accordion is selected
   */
  @Event({ eventName: 'mdsStepperBarItemDone' })
  doneEvent: EventEmitter<MdsStepperBarItemEventDetail>;

  render() {
    return (
      <Host pref-animation={this.prefAnimation}>
        <div class="header">
          <mds-icon
            class="icon"
            name={clsx(this.isDone && !this.isCurrent ? this.iconChecked : this.icon)}
          />
          <mds-progress aria-hidden="true" class="progress" progress={this.isDone ? 1 : 0} />
        </div>
        <div class="infos">
          {this.step && (
            <mds-text class="step" typography="option">
              {this.t.get('step', { index: this.index + 1 })}
            </mds-text>
          )}
          {this.label && (
            <mds-text class="text" typography={this.typography}>
              {this.label}
            </mds-text>
          )}
          {this.badge && <div part="badge">{this.showBadge()}</div>}
        </div>
      </Host>
    );
  }
}
