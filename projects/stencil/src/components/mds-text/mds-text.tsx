import { Component, Element, Host, Prop, h, Watch } from '@stencil/core';
import { TextAnimationType } from './meta/types';
import { TypographyTagType } from '@type/text';
import { TypographyTruncateType } from '@type/text';
import { TypographyType, TypographyVariants } from '@type/typography';
import { typographyDefaultsVariant } from './meta/variants';
import RandomText from '@common/yugop';
import { preferenceStore, prefersReducedMotion } from '@common/preference';

// the defaults of --mds-text-animation-speed and --mds-text-animation-placeholder-char in
// mds-text.css, for when the custom properties give back nothing usable
const defaultAnimationSpeed = 0.5;
const defaultPlaceholderChar = ' ';

/**
 * @slot - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-text',
  styleUrl: 'mds-text.css',
  shadow: true,
})
export class MdsText {
  private randomTextOptions = {
    frameOffset: 10,
    charOffset: 20,
    charStep: 15,
  };

  private randomText: RandomText;

  @Element() host: HTMLMdsTextElement;

  /**
   * Specifies if the text is animated when it is rendered
   */
  @Prop({ reflect: true }) readonly animation?: TextAnimationType = 'none';

  /**
   * Specifies the HTML tag of the element
   */
  @Prop({ mutable: true, reflect: true }) tag: TypographyTagType;

  /**
   * Specifies the text string to the component instead of passing an HTML node
   */
  @Prop({ reflect: true }) readonly text?: string;

  /**
   * Specifies if the text shoud be truncated or should behave as a normal text
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType;

  /**
   * Specifies the font typography of the element
   */
  @Prop({ reflect: true }) readonly typography: TypographyType = 'detail';

  /**
   * Specifies the variant for `typography`
   */
  @Prop({ reflect: true }) readonly variant?: TypographyVariants;

  private animateText = (text: string): void => {
    const textElement = this.host.shadowRoot?.querySelector('.text') as HTMLElement;
    this.randomText = new RandomText({
      str: text,
      // text, never markup: the render prints `text` as a text node, and the last frame is
      // `text` itself, so innerHTML would turn a string holding a tag into live HTML
      onProgress: (str: string) => {
        textElement.textContent = str;
      },
      ...this.randomTextOptions,
      ...this.readAnimationCustomProps(),
    });
    this.randomText.start();
  };

  /**
   * Read when the animation starts, not once at load. A text that loads outside the flat tree
   * (in the light DOM of a host that has not rendered its `<slot>` yet) gets `""` for every
   * custom property, its own `:host` ones included: a speed of 0 never lets the loop reach the
   * text. By the time the text changes the host is rendered, and a value set after load (a
   * theme, a class, `animation="yugop"` itself) is picked up too.
   */
  private readAnimationCustomProps = (): { speed: number; placeholderChar: string } => {
    const styles = window.getComputedStyle(this.host);
    const speed = Number(styles.getPropertyValue('--mds-text-animation-speed'));
    // a <string> comes back quoted, and the placeholder stands for one character of the text:
    // anything longer would change the length the box holds while the text resolves
    const [placeholderChar] = Array.from(
      styles
        .getPropertyValue('--mds-text-animation-placeholder-char')
        .trim()
        .replace(/^(["'])(.*)\1$/, '$2'),
    );
    return {
      speed: Number.isFinite(speed) && speed > 0 ? speed : defaultAnimationSpeed,
      placeholderChar: placeholderChar ?? defaultPlaceholderChar,
    };
  };

  componentWillRender(): void {
    // Stencil sets a string @Prop to null when its attribute is removed, so `typography` can be
    // outside TypographyType at runtime and the lookup misses; fall back to the documented default
    // instead of throwing out of the lifecycle.
    const { tag } = typographyDefaultsVariant[this.typography] ?? typographyDefaultsVariant.detail;
    this.tag = this.tag ?? (tag as TypographyTagType);
  }

  @Watch('text')
  textHandler(newValue?: string): void {
    if (this.animation === 'none') {
      return;
    }
    if (this.randomText != null) {
      this.randomText.stop();
    }
    if (newValue === undefined || newValue === '') {
      return;
    }
    // The scramble is a rAF loop writing innerHTML: no stylesheet can hold it back, so it
    // asks. The text is written out here rather than left to the render, because the loop
    // may already have replaced the node the renderer holds.
    if (prefersReducedMotion()) {
      const painted = this.host.shadowRoot?.querySelector('.text');
      if (painted) {
        painted.textContent = newValue;
      }
      return;
    }
    this.animateText(newValue);
  }

  render() {
    return (
      <Host pref-animation={preferenceStore.state.animation}>
        <this.tag class="text">{(this.text ?? '') === '' ? <slot></slot> : this.text}</this.tag>
      </Host>
    );
  }
}
