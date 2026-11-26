import {
  Component,
  Element,
  Event,
  EventEmitter,
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
import { preferenceStore } from '@common/preference';

/**
 * @part badge - The badge wrapper
 * @parent mds-stepper-bar
 */

@Component({
  tag: 'mds-stepper-bar-item',
  styleUrl: 'mds-stepper-bar-item.css',
  shadow: true,
})
export class MdsStepperBarItem {
  @Element() private host: HTMLMdsStepperBarItemElement;
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

  /**
   * Specifies a short description of the component
   */
  @Prop() readonly label!: string;

  /**
   * Shows the caption of the step above the label: "Step 1", "Passo 1", in the language of the
   * page, or the text of `stepLabel`
   */
  @Prop() readonly step: boolean;

  /**
   * The text of the caption that `step` shows, in place of the one the component writes in the
   * language of the page ("Passo 2"). `{{ index }}` in it becomes the position of the step, as in
   * the phrases of the component: `"Fase {{ index }}"` gives "Fase 1", "Fase 2"; a text without
   * it is shown as it is. For another word, or a language the component has no texts for
   */
  @Prop() readonly stepLabel?: string;

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
   * Specifies the value of the step: once the step is done, mds-stepper-bar adds it to the
   * `value` of `mdsStepperBarChange`, which joins the values of the done steps with commas
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
    // childNodes counts the whitespace between the tags, so formatted markup made
    // the step numbers come out doubled: 2, 4, 6, 8 for four steps.
    if (parent) {
      this.index = Array.from(parent.children)
        .filter((child) => child.tagName === this.host.tagName)
        .indexOf(this.host);
    }
  }

  componentDidLoad(): void {
    this.km.addElement(this.host);
    this.km.attachClickBehavior();
  }

  // the text of the page, its `{{ index }}` filled as the phrases of the component are, or the
  // phrase in the language of the page: the Italian one was the English "Step" (#1428). Only the
  // position is filled, a number, so nothing in it can turn into markup
  private caption = (): string => {
    const index = this.index + 1;
    return (this.stepLabel ?? '') !== ''
      ? this.stepLabel!.replace(/\{\{\s*index\s*\}\}/g, String(index))
      : this.t.get('step', { index });
  };

  // a step already done can be gone back to: the item is a button then
  private isReachable = (): boolean => !!this.isDone && !this.isCurrent;

  /**
   * Asks to go back to this step, with its value: the event was declared and never emitted. The
   * stepper bar is driven by its `itemsDone`, so the page answers by setting it.
   */
  private handleClick = (): void => {
    if (!this.isReachable()) return;
    this.doneEvent.emit({ value: this.value ?? '' });
  };

  disconnectedCallback(): void {
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

  // the status goes through label, a watched prop: the badge reads its deprecated slot once, and
  // the render reuses the same badge from one status to the next
  private showBadge = (): MdsBadge => {
    if (this.isDone) {
      return (
        <mds-badge
          class="badge"
          variant="success"
          tone="weak"
          typography="option"
          label={this.t.get('badgeDone')}
        />
      );
    }
    if (this.isCurrent) {
      return (
        <mds-badge
          class="badge"
          variant="info"
          tone="weak"
          typography="option"
          label={this.t.get('badgeCurrent')}
        />
      );
    }
    return (
      <mds-badge
        class="badge"
        variant="dark"
        tone="weak"
        typography="option"
        label={this.t.get('badgeQueued')}
      />
    );
  };

  /**
   * Emits when the user activates a step that is done, to go back to it: the page moves the
   * stepper bar there through `itemsDone`
   */
  @Event({ eventName: 'mdsStepperBarItemDone' })
  doneEvent: EventEmitter<MdsStepperBarItemEventDetail>;

  render() {
    return (
      <Host
        onClick={this.handleClick}
        pref-animation={preferenceStore.state.animation}
        role={this.isReachable() ? 'button' : undefined}
        tabindex={this.isReachable() ? '0' : undefined}
      >
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
              {this.caption()}
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
