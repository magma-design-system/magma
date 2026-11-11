import {
  AttachInternals,
  Build,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  Watch,
  State,
} from '@stencil/core';
import { setFormValue } from '@common/form';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import { MdsInputRangeValuesEventDetail } from './meta/event-detail';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

const VALUE_TAG = 'mds-input-range-value';

/**
 * A thumb of a range with `mds-input-range-value` children: the child it stands for, its value
 * and its name.
 */
interface Thumb {
  element: HTMLMdsInputRangeValueElement;
  // the key of its native input: the input, and its focus, stay with the child when the thumbs
  // are drawn again in another order
  key: number;
  name: string;
  value: number;
}

/*
 * Several values on one track (#1261): one `mds-input-range-value` child per value, as an
 * `<option>` per choice of a `<select>`. The criteria, written here and in the usage:
 *
 * - Each thumb is a native `<input type="range">`, all of them as wide as the track and stacked
 *   on it. The native input gives the slider role, the value, the accessible name, the focus and
 *   the drag of the pointer, and the one value without children keeps the input it always had:
 *   one control for one value and for many. Elements with `role="slider"` would rewrite the drag
 *   and the focus, and leave the one value on another control. The form goes through the
 *   ElementInternals of the host either way: an input in the shadow root never reaches a form.
 * - The component handles the keys of a thumb itself, the only part the native input cannot
 *   give: it knows `min` and `max`, not the neighbours, and a thumb stops at its neighbours (Home
 *   and End go to them). The arrows move one `step`, Page Up and Page Down a tenth of the range,
 *   as on a native range input. The one value without children keeps the native keys.
 * - The values are the children's from the first `mds-input-range-value` on, one child included:
 *   where the values live does not change with their count, and a range that loses all but one
 *   child keeps its thumb and its name. Without children, `value` holds the one value.
 * - The children are read in order of value, whatever their order in the markup: each child
 *   keeps its own text, so "Massimo" written before "Minimo" still names the higher thumb. A
 *   value outside `min` and `max`, or off the step, is brought inside and onto the step, as a
 *   native input sanitizes it, and written back on its child; a child without a value starts in
 *   the middle, as a native range input.
 */

/**
 * @part header - The element containing the labels displayed over the input element
 * @part track - The element containing the track of the input range
 * @slot - The label of the range, as text. Add an `mds-input-range-value` per value to hold
 * several values, a thumb each, on one track
 * @category forms
 */
@Component({
  tag: 'mds-input-range',
  styleUrl: 'mds-input-range.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputRange {
  @State() private progress: number;
  // the label of the range: its text, the mds-input-range-value children left out
  @State() private label = '';
  // the thumbs of the mds-input-range-value children, in order of value; empty without children,
  // when the range has the one thumb of `value`
  @State() private thumbs: Thumb[] = [];
  private inputElement?: HTMLInputElement | null;
  // the value of load, which a form reset brings back as the value attribute of a native input;
  // undefined when the markup sets none, and the native default (the middle of the range) applies
  private loadValue?: number;
  // the value of load of each child, the first the range read from it, which a form reset brings
  // back: a child added later starts from the value it came with
  private readonly childLoadValues = new WeakMap<Element, number>();
  private readonly thumbKeys = new WeakMap<Element, number>();
  private nextThumbKey = 0;
  // the values of the last mdsInputRangeValuesChange, not to emit the same list twice, and
  // undefined until the list of load is recorded
  private emittedValues?: string;
  private childObserver?: MutationObserver;
  private loaded = false;
  // the last child is gone: the input of `value` comes back with the next render
  private singlePending = false;
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @Element() private element: HTMLMdsInputRangeElement;
  @AttachInternals() internals: ElementInternals;

  // the disabled state of the host as a form control: its own disabled, or a disabled fieldset
  // around it, which disables the host but not the native control in its shadow root
  @State() private formDisabled = false;

  /**
   * A function to custom how value is represented
   */
  @Prop() readonly formatValue?: (value: number) => string;

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * The greatest value in the range of permitted values
   */
  @Prop() readonly max: number = 100;

  /**
   * The lowest value in the range of permitted values
   */
  @Prop() readonly min: number = 0;

  /**
   * The step attribute is a number that specifies the granularity that
   * the value must adhere to, or the special value any, which is described below.
   */
  @Prop() readonly step: number = 1;

  /**
   * Sets if the component is disabled
   */
  @Prop({ mutable: true, reflect: true }) disabled?: boolean;

  /**
   * The value attribute contains a number which contains a representation of the selected number.
   * It holds the one value of a range without `mds-input-range-value` children: with children the
   * values are theirs, and this one is left out
   */
  @Prop({ mutable: true, reflect: true }) value: number;

  /**
   * Emits when the input range is changed: the value of a range without
   * `mds-input-range-value` children
   */
  @Event({ eventName: 'mdsInputRangeChange' }) changeEvent: EventEmitter<number>;

  /**
   * Emits when the values of a range with `mds-input-range-value` children change: from a thumb,
   * from code, as a child comes or goes, or on a form reset. `values` holds them in order, from
   * the lowest. The values of load are not a change
   */
  // The name is mds + the component + what changed + Change, as mdsInputDateRangeValueChange and
  // mdsTableSelectionChange name the second change event of their component. The detail is an
  // object, as in every Magma event with more than one value (mdsInputSelectChange): a field can
  // join `values` later without a break. mdsInputRangeChange keeps its number for the one value.
  @Event({ eventName: 'mdsInputRangeValuesChange' })
  valuesChangeEvent: EventEmitter<MdsInputRangeValuesEventDetail>;

  /** As on a native input, a step that is not a positive number falls back to the default, 1. */
  private allowedStep(): number {
    const step = Number(this.step);
    return step > 0 ? step : 1;
  }

  /**
   * A value inside `min` and `max`, on the nearest step from `min`, as a native range input
   * sanitizes it; a step past `max` falls back one step. The values are scaled to integers by
   * the decimals of the step and of `min`, so that a decimal step snaps without float errors.
   */
  private normalize(value: number): number {
    const step = this.allowedStep();
    const scale = Math.pow(10, Math.max(this.countDecimals(step), this.countDecimals(this.min)));
    const min = Math.round(this.min * scale);
    const max = Math.round(this.max * scale);
    const size = Math.round(step * scale);
    const inside = Math.min(Math.max(value * scale, min), max);
    let snapped = Math.round((inside - min) / size) * size + min;
    if (snapped > max) snapped -= size;
    return snapped / scale;
  }

  /** The default of a native range input: the middle of the range, on the step. */
  private middle(): number {
    return this.normalize(this.min + (this.max - this.min) / 2);
  }

  /** Where a value sits on the track, from 0 at `min` to 100 at `max`. */
  private percent(value: number): number {
    return this.max === this.min ? 0 : ((value - this.min) / (this.max - this.min)) * 100;
  }

  private calculateProgress(): void {
    if (this.inputElement == null) return;
    this.value = this.normalize(Number(this.inputElement.value));
    setFormValue(this.internals, this.value.toString());
    const total = this.max - this.min;
    const current = this.value - this.min;
    this.progress = (current / total) * 100;
  }

  private onInput = () => {
    if (this.inputElement == null) return;
    // a range input always holds a number: the browser sanitizes anything else
    // trigger valueChanged that update progress and emit event
    this.value = Number(this.inputElement.value);
  };

  private countDecimals(num: number) {
    if (Math.floor(num) === num) return 0;
    return num.toString().split('.')[1].length || 0;
  }

  /** The label of the range: its text, without the names of its values. */
  private readLabel(): string {
    return Array.from(this.element.childNodes)
      .filter((node) => node.nodeName.toLowerCase() !== VALUE_TAG)
      .map((node) => node.textContent ?? '')
      .join('')
      .trim();
  }

  /**
   * The mds-input-range-value children as thumbs, each value inside the range and on its step, in
   * order of value. Two thumbs on one value keep the order they had, so that a thumb that reaches
   * its neighbour does not take its place; a new one comes after them, in the order of the markup.
   */
  private readThumbs(): Thumb[] {
    const previous = new Map<Element, number>(
      this.thumbs.map(({ element }, index) => [element, index]),
    );
    const children = Array.from(this.element.children).filter(
      (child) => child.tagName.toLowerCase() === VALUE_TAG,
    ) as HTMLMdsInputRangeValueElement[];
    return children
      .map((element, index) => {
        // the prop, or the attribute of a child not defined yet
        const raw: unknown = element.value ?? element.getAttribute('value');
        const parsed = raw == null || String(raw).trim() === '' ? NaN : Number(raw);
        let key = this.thumbKeys.get(element);
        if (key === undefined) {
          key = this.nextThumbKey++;
          this.thumbKeys.set(element, key);
        }
        return {
          element,
          key,
          name: element.textContent?.trim() ?? '',
          rank: previous.get(element) ?? previous.size + index,
          value: this.normalize(Number.isNaN(parsed) ? this.middle() : parsed),
        };
      })
      .sort((a, b) => a.value - b.value || a.rank - b.rank)
      .map(({ element, key, name, value }) => ({ element, key, name, value }));
  }

  private sameThumbs(thumbs: Thumb[]): boolean {
    return (
      thumbs.length === this.thumbs.length &&
      thumbs.every(({ element, name, value }, index) => {
        const current = this.thumbs[index];
        return element === current.element && name === current.name && value === current.value;
      })
    );
  }

  /** Writes a value on its child: through the prop, or the attribute until the child is defined. */
  private writeChildValue(element: HTMLMdsInputRangeValueElement, value: number): void {
    if (globalThis.customElements?.get(VALUE_TAG)) {
      element.value = value;
    } else {
      element.setAttribute('value', String(value));
    }
  }

  private writeChildValues(thumbs: Thumb[]): void {
    thumbs.forEach(({ element, value }) => {
      if (Number(element.value) !== value) this.writeChildValue(element, value);
    });
  }

  /** Takes a new list of thumbs: their values on the children, in the form and in the event. */
  private updateThumbs(thumbs: Thumb[]): void {
    this.thumbs = thumbs;
    this.writeChildValues(thumbs);
    this.updateFormValue();
    this.emitValues();
  }

  /**
   * Emits mdsInputRangeValuesChange once per list of values. The first list, the one of load, is
   * recorded without an event: nothing has moved yet.
   */
  private emitValues(): void {
    const values = this.thumbs.map(({ value }) => value);
    const serial = JSON.stringify(values);
    if (serial === this.emittedValues) return;
    const loading = this.emittedValues === undefined;
    this.emittedValues = serial;
    if (loading) return;
    this.valuesChangeEvent.emit({ values });
  }

  /**
   * Reports the values to the form: the one value without children; with children an entry per
   * value under `name`, in order, as a native `<select multiple>` and `mds-input-select multiple`.
   */
  private updateFormValue(): void {
    if (this.thumbs.length === 0) {
      setFormValue(this.internals, this.value == null ? null : this.value.toString());
      return;
    }
    const name = this.name ?? '';
    if (name === '') {
      setFormValue(this.internals, null);
      return;
    }
    const data = new FormData();
    this.thumbs.forEach(({ value }) => data.append(name, value.toString()));
    setFormValue(this.internals, data);
  }

  /** Reads the children again: the label, the values and their names, the children that came and went. */
  private syncChildren = (): void => {
    if (!this.loaded) return;
    this.label = this.readLabel();
    const thumbs = this.readThumbs();
    // a value brought inside the range goes back on its child, even when its thumb stays put
    this.writeChildValues(thumbs);
    if (this.sameThumbs(thumbs)) return;
    if (thumbs.length === 0 && this.thumbs.length > 0) this.singlePending = true;
    thumbs.forEach(({ element, value }) => {
      if (!this.childLoadValues.has(element)) this.childLoadValues.set(element, value);
    });
    this.updateThumbs(thumbs);
  };

  /** The values a thumb can take: from the one before it to the one after it, both included. */
  private bounds(index: number): [number, number] {
    const low = index > 0 ? this.thumbs[index - 1].value : this.min;
    const high = index < this.thumbs.length - 1 ? this.thumbs[index + 1].value : this.max;
    return [low, high];
  }

  private thumbInputs(): HTMLInputElement[] {
    return Array.from(this.element.shadowRoot?.querySelectorAll<HTMLInputElement>('.field') ?? []);
  }

  /** Moves a thumb to a value on the step, which stops at its neighbours: it reaches them, never passes them. */
  private moveThumb(index: number, value: number): void {
    const [low, high] = this.bounds(index);
    const next = Math.min(Math.max(this.normalize(value), low), high);
    const input = this.thumbInputs()[index];
    if (input && Number(input.value) !== next) input.value = String(next);
    if (next === this.thumbs[index].value) return;
    this.updateThumbs(
      this.thumbs.map((thumb, position) =>
        position === index ? { ...thumb, value: next } : thumb,
      ),
    );
  }

  // the drag of the pointer: the native input knows only min and max, the neighbours stop it here
  private onThumbInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const index = this.thumbInputs().indexOf(input);
    if (index < 0) return;
    this.moveThumb(index, Number(input.value));
  };

  private onThumbKeyDown = (event: KeyboardEvent): void => {
    const index = this.thumbInputs().indexOf(event.target as HTMLInputElement);
    if (index < 0 || this.isDisabled()) return;
    const { value } = this.thumbs[index];
    const [low, high] = this.bounds(index);
    const step = this.allowedStep();
    // a page is a tenth of the range, at least a step, as on a native range input
    const page = Math.max((this.max - this.min) / 10, step);
    const targets: Record<string, number> = {
      ArrowDown: value - step,
      ArrowLeft: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      End: high,
      Home: low,
      PageDown: value - page,
      PageUp: value + page,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    this.moveThumb(index, target);
  };

  /**
   * A press on the track between several thumbs moves the nearest one there, as a press on the
   * track of a native range input moves its thumb. Of two thumbs as near, the one with room
   * toward the pointer moves. The thumbs themselves catch the pointer, which the inputs let
   * through to the track.
   */
  private onTrackPointerDown = (event: PointerEvent): void => {
    if (this.thumbs.length < 2 || this.isDisabled() || event.button !== 0) return;
    if ((event.target as Element).tagName === 'INPUT') return;
    const range = event.currentTarget as HTMLElement;
    const track = range.querySelector<HTMLElement>('.track-total');
    if (!track) return;
    const box = range.getBoundingClientRect();
    // the thumb is as large as the track is tall, and its centre travels the track less one thumb
    const thumb = track.getBoundingClientRect().height;
    const ratio = Math.min(
      Math.max((event.clientX - box.left - thumb / 2) / (box.width - thumb), 0),
      1,
    );
    const value = this.normalize(this.min + ratio * (this.max - this.min));
    let index = 0;
    this.thumbs.forEach((candidate, position) => {
      const distance = Math.abs(candidate.value - value);
      const nearest = Math.abs(this.thumbs[index].value - value);
      if (distance < nearest || (distance === nearest && value > candidate.value)) index = position;
    });
    // no mousedown after this: it would take the focus back from the thumb
    event.preventDefault();
    this.thumbInputs()[index]?.focus();
    this.moveThumb(index, value);
  };

  /**
   * The accessible name of a thumb: the text of its child, as each thumb of the multi-thumb
   * slider of the WAI-ARIA APG; without text, the label of the range and the position of the
   * thumb ("Prezzo, 1 di 2").
   */
  private thumbName(index: number): string {
    const { name } = this.thumbs[index];
    if (name !== '') return name;
    const position = this.t.get('position', { position: index + 1, count: this.thumbs.length });
    return this.label === '' ? position : `${this.label}, ${position}`;
  }

  /**
   * The values in the header, in order and formatted as the one value: two are an interval,
   * joined by an en dash (U+2013) between spaces, more are a list, joined by a middle dot (U+00B7)
   * between spaces.
   */
  private displayValues(): string {
    const texts = this.thumbs.map(({ value }) =>
      this.formatValue ? this.formatValue(value) : String(value),
    );
    return texts.join(texts.length === 2 ? ' \u2013 ' : ' \u00b7 ');
  }

  @Watch('disabled')
  protected disabledChanged(newValue: boolean): void {
    /**
     * This is related to ALL disabled attributes set on Magma input components
     * if solved, please check mds-button, mds-input, mds-input-*
     * https://github.com/ionic-team/stencil/issues/5461
     */
    if (newValue) {
      setFormValue(this.internals, null);
      return;
    }
    // enabled again, the range reports its values again
    this.updateFormValue();
  }

  @Watch('name')
  protected nameChanged(): void {
    this.updateFormValue();
  }

  @Watch('value')
  valueChanged(newValue: string, oldValue: string): void {
    if (newValue === oldValue) return;
    // with mds-input-range-value children the values are theirs, and `value` is left out
    if (this.thumbs.length > 0 || this.inputElement == null) return;
    this.inputElement.value = this.value.toString();
    this.calculateProgress();
    this.changeEvent.emit(this.value);
  }

  /** New limits bring the values inside them and onto the new step. */
  private limitsChanged(): void {
    if (this.thumbs.length > 0) {
      this.updateThumbs(this.readThumbs());
      return;
    }
    this.calculateProgress();
  }

  @Watch('min')
  minChanged(): void {
    this.limitsChanged();
  }

  @Watch('max')
  maxChanged(): void {
    this.limitsChanged();
  }

  @Watch('step')
  stepChanged(): void {
    this.limitsChanged();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  private isDisabled = (): boolean => !!this.disabled || this.formDisabled;

  /**
   * Like a native input, a form reset brings back the value of load, thumb included; with
   * children, each child gets back its value of load.
   */
  formResetCallback(): void {
    if (this.thumbs.length > 0) {
      this.thumbs.forEach(({ element }) => {
        const value = this.childLoadValues.get(element);
        if (value !== undefined) this.writeChildValue(element, value);
      });
      this.updateThumbs(this.readThumbs());
      return;
    }
    if (this.inputElement == null) return;
    // an empty value makes the native input take its default, the middle of the range
    this.inputElement.value = this.loadValue === undefined ? '' : String(this.loadValue);
    this.onInput();
  }

  connectedCallback(): void {
    this.childObserver?.disconnect();
    if (!Build.isBrowser) return;
    // adding or removing a value is adding or removing a child, and a child's value or text
    // can change from code: the range follows them all
    this.childObserver = new MutationObserver(this.syncChildren);
    this.childObserver.observe(this.element, {
      attributeFilter: ['value'],
      characterData: true,
      childList: true,
      subtree: true,
    });
    // what changed while the range was out of the page
    this.syncChildren();
  }

  disconnectedCallback(): void {
    this.childObserver?.disconnect();
    this.childObserver = undefined;
  }

  componentWillLoad(): void {
    const value = Number(this.value ?? NaN);
    this.loadValue = Number.isNaN(value) ? undefined : value;
    this.label = this.readLabel();
    this.thumbs = this.readThumbs();
    this.thumbs.forEach(({ element, value: childValue }) => {
      this.childLoadValues.set(element, childValue);
    });
  }

  componentDidLoad(): void {
    if (this.thumbs.length > 0) {
      // the values of the children, brought inside the range, go back on them and to the form
      this.updateThumbs(this.thumbs);
    } else {
      this.onInput(); // define value
      this.calculateProgress();
    }
    // the values of load, recorded without an event
    this.emitValues();
    this.loaded = true;
    // the children that came while the range was loading
    this.syncChildren();
  }

  componentDidRender(): void {
    if (!this.singlePending || this.inputElement == null) return;
    this.singlePending = false;
    this.onInput();
    this.calculateProgress();
  }

  private renderThumbs() {
    return this.thumbs.map((thumb, index) => {
      const [low, high] = this.bounds(index);
      return (
        <input
          key={thumb.key}
          class={{ field: true, 'field--held': low === high }}
          type="range"
          aria-label={this.thumbName(index)}
          aria-valuetext={this.formatValue ? this.formatValue(thumb.value) : undefined}
          disabled={this.isDisabled()}
          max={this.max}
          min={this.min}
          onInput={this.onThumbInput}
          onKeyDown={this.onThumbKeyDown}
          step={this.allowedStep()}
          value={thumb.value}
        />
      );
    });
  }

  render() {
    const children = this.thumbs.length > 0;
    const several = this.thumbs.length > 1;
    const first = this.thumbs[0];
    const last = this.thumbs[this.thumbs.length - 1];
    // the fill runs from the start to the one thumb, or from the first thumb to the last
    const progress: Record<string, string> = {
      '--mds-input-range-progress': `${children ? this.percent(last.value) : (this.progress ?? 0)}`,
    };
    if (several) progress['--private-input-range-progress-start'] = `${this.percent(first.value)}`;

    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <header class="header" part="header">
          <mds-text class="label" truncate="word" typography="label">
            <slot />
          </mds-text>
          <mds-text class="value" typography="label">
            {children
              ? this.displayValues()
              : this.formatValue
                ? this.formatValue(this.value)
                : this.value}
          </mds-text>
        </header>
        <div
          class={{ range: true, 'range--several': several }}
          role={children ? 'group' : undefined}
          aria-label={children && this.label !== '' ? this.label : undefined}
          onPointerDown={this.onTrackPointerDown}
        >
          <div class="track" part="track">
            <div class="contrast-area"></div>
            <div class="track-total">
              <div
                class={{ 'track-progress': true, 'track-progress--between': several }}
                style={progress}
              ></div>
            </div>
          </div>
          {children ? (
            this.renderThumbs()
          ) : (
            <input
              ref={(el) => (this.inputElement = el as HTMLInputElement)}
              class="field"
              aria-label={this.label}
              aria-valuetext={this.formatValue ? this.formatValue(this.value) : undefined}
              disabled={this.isDisabled()}
              max={this.max}
              min={this.min}
              onInput={this.onInput}
              step={this.step}
              type="range"
              value={this.value}
              name={this.name}
            />
          )}
        </div>
      </Host>
    );
  }
}
