import { Component, Host, h, Method, Prop, Element, Watch } from '@stencil/core';
import { cssRotationToNumber, cssDurationToSeconds, cssSizeToNumber } from '@common/unit';
import type { EmojiNames, SvgDictionary, SvgPart } from './meta/types';
import { gsap } from 'gsap';

import miaSvg from './asset/mia.svg';
import simiSvg from './asset/simi.svg';

@Component({
  tag: 'mds-emoji',
  styleUrl: 'mds-emoji.css',
  shadow: true,
})
export class MdsEmoji {
  @Element() host: HTMLMdsEmojiElement;
  /**
   * Specifies which emoji to display.
   */
  @Prop({ reflect: true }) readonly name: EmojiNames = 'mia';

  private isFollowingMouse: boolean = false;
  private isBusy: boolean = false;

  private isSmiling: boolean = false;
  private isAgreeing: boolean = false;
  private isThinking: boolean = false;
  private isBlinking: boolean = false;
  private isDisagreeing: boolean = false;

  // An expression owns the whole face, so only one of them can play at a time.
  // Every take-over bumps this token: the callbacks left behind by the animation
  // that was interrupted compare their own token against it and give up, instead
  // of handing the face back to a state that is no longer theirs.
  private expressionToken: number = 0;
  // Every tween, timeline and delayed call an expression starts is collected here,
  // so a take-over can stop all of them at once. Killing by target would not do:
  // the same nodes also carry the pointer tracking tweens of rotate(), and those
  // have to survive.
  private expressionAnimations: gsap.core.Animation[] = [];
  // How far the thinking hand slides in and out, as a share of its own size: a
  // viewBox independent value, so the gesture reads the same on Mia (24 units) and
  // on Simi (440 units).
  private handEntryOffset: number = 25;

  private wasFollowingMouse: boolean = false;
  private wasBlinking: boolean = false;
  private headOffsetX: number = 0;
  private headOffsetY: number = 0;
  private headOffset: number = 0;
  private eyesOffsetX: number = 0;
  private eyesOffsetY: number = 0;
  private eyesOffset: number = 1;
  private mouthOffsetX: number = 0;
  private mouthOffsetY: number = 0;
  private mouthOffset: number = 1;
  private handOffsetX: number = 0;
  private handOffsetY: number = 0;
  private handOffset: number = 2;
  private gadgetOffsetX: number = 0;
  private gadgetOffsetY: number = 0;
  private gadgetOffset: number = 2;
  private eyebrowsOffsetX: number = 0;
  private eyebrowsOffsetY: number = 0;
  private eyebrowsOffset: number = 2;
  private earsOffsetX: number = 0;
  private earsOffsetY: number = 0;
  private earsOffset: number = 2;

  private mouseX: number = 0;
  private mouseY: number = 0;

  private currentRotateX: number = 0;
  private currentRotateY: number = 0;
  private expressionAngleMax: number = 16; // massimo angolo di rotazione della emoji
  private expressionFollowMouseHeadDuration: number = 0.3; // durata dell'animazione di rotazione della testa quando segue il mouse
  private expressionFollowMouseTraitsDuration: number = 0.2; // durata dell'animazione di rotazione degli occhi e della bocca quando segue il mouse

  private eyesEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;
  private gadgetEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;
  private handEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;
  private eyebrowsEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;
  private headEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;
  private earsEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;
  private mouthEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null;

  private blinkTimeline: gsap.core.Timeline | null = null;
  private blinkDelay: gsap.core.Tween | null = null;

  private svgLibrary = {
    mia: miaSvg,
    simi: simiSvg,
  };

  private svgRootEl: SVGElement;

  componentDidLoad(): void {
    if (typeof window === 'undefined') return;
    this.updateCSSCustomProps();
    window.addEventListener('mousemove', this.handleFollowMouse);
    this.checkNameChanged(this.name);
  }

  disconnectedCallback(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('mousemove', this.handleFollowMouse);
    this.isThinking = false;
    this.isBlinking = false;
    this.isFollowingMouse = false;
    this.killExpressionAnimations();
    this.blinkDelay?.kill();
    this.blinkTimeline?.kill();
    [
      this.host,
      this.eyesEl,
      this.handEl,
      this.headEl,
      this.mouthEl,
      this.gadgetEl,
      this.eyebrowsEl,
      this.earsEl,
    ].forEach((target) => target && gsap.killTweensOf(target));
  }

  /**
   * @returns Promise<void>
   * Emoji agrees, useful for confirm actions.
   */

  @Method()
  async agree(): Promise<void> {
    const token = this.beginExpression();
    await this.setAgreeAnimation(token);
    return Promise.resolve();
  }

  /**
   * @returns Promise<void>
   * Emoji smiles, useful for confirm actions.
   */

  @Method()
  async smile(): Promise<void> {
    const token = this.beginExpression();
    await this.setSmileAnimation(token);
    return Promise.resolve();
  }

  /**
   * @returns Promise<void>
   * Emoji disagrees, useful for errors or unwanted results.
   */

  @Method()
  async disagree(turnHappyDelay: number = 0): Promise<void> {
    const token = this.beginExpression();
    await this.setDisagreeAnimation(turnHappyDelay, token);
    return Promise.resolve();
  }

  /**
   * @returns Promise<void>
   * Emoji start thinking, useful for pending requests.
   */

  @Method()
  async startThinking(duration: number = 0.5): Promise<void> {
    // Thinking is a state, not a one shot expression: asking for it again while it
    // is already running must not replay the entrance, or the second call leaves
    // the hand wherever the tween it interrupted had got to.
    if (this.isThinking) return Promise.resolve();
    this.beginExpression();
    this.isThinking = true;
    await this.setStartThinkingAnimation(duration);
    return Promise.resolve();
  }

  /**
   * Stops the "thinking" animation after the given duration.
   * @param duration the animation duration, in seconds
   */
  @Method()
  async stopThinking(duration: number = 0.5): Promise<void> {
    // Guarded on the thinking state and not on isBusy: another expression may have
    // taken the face over in the meantime, and retracting a hand that is no longer
    // on screen would hand the face back in the middle of that animation.
    if (!this.isThinking) return Promise.resolve();
    const token = this.expressionToken;
    this.isThinking = false;
    // The wandering eyes and the entrance of the hand stop here, before the exit
    // animation starts, so the two never fight over the same properties.
    this.killExpressionAnimations();
    this.isBusy = false;
    this.restoreFollowMouse();
    await this.setStopThinkingAnimation(duration);
    if (this.isCurrentExpression(token)) this.scheduleBlink();
    return Promise.resolve();
  }

  /**
   * @returns Promise<void>
   * Eyes start blinking.
   */

  @Method()
  async startBlinking(): Promise<void> {
    this.isBlinking = true;
    if (!this.blinkTimeline) this.blinkTimeline = this.buildBlinkTimeline();
    // scheduleBlink is gated on isBusy, so blinking will start now if idle, or
    // automatically resume once the current animation (think, smile, ...) ends.
    this.scheduleBlink();
    return Promise.resolve();
  }

  /**
   * @returns Promise<void>
   * Eyes stop blinking.
   */
  @Method()
  async stopBlinking(): Promise<void> {
    this.isBlinking = false;
    this.blinkDelay?.kill();
    this.blinkDelay = null;
    this.blinkTimeline?.pause(0);
    this.resetEyesToDefault();
    return Promise.resolve();
  }

  /**
   * @returns Promise<void>
   * Stops following mouse with CSS 3D transform.
   */
  @Method()
  async stopFollowMouse(): Promise<void> {
    if (!this.isFollowingMouse) return Promise.resolve();
    this.isFollowingMouse = false;
    this.rotate(0, 0);
    return new Promise((resolve) =>
      setTimeout(resolve, this.expressionFollowMouseTraitsDuration * 1000),
    );
  }

  /**
   * @returns Promise<void>
   * Starts following mouse with CSS 3D transform.
   */
  @Method()
  async startFollowMouse(): Promise<void> {
    if (this.isFollowingMouse) return Promise.resolve();
    this.isFollowingMouse = true;
    this.wasFollowingMouse = true;
    this.followMouse();
    return Promise.resolve();
  }

  @Watch('name')
  checkNameChanged(emojiName: EmojiNames): void {
    // Stencil reflects a prop onto its attribute during the next render, but this
    // watcher runs synchronously, before that render. Every per-emoji value lives in
    // a :host([name='...']) rule, so updateSvgDictionary -> updateCSSCustomProps would
    // read the offsets of the emoji we are leaving and cache them for good: set the
    // prop instead of the attribute and the new face animates with the old offsets.
    // Putting the attribute in place first fixes the order; Stencil's own reflection
    // lands on the same value later, so this stays idempotent, and the re-entrant
    // attributeChangedCallback is a no-op because the value did not change.
    if (this.host.getAttribute('name') !== emojiName) this.host.setAttribute('name', emojiName);
    this.updateSvgDictionary(emojiName);
  }

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.host);
    this.expressionAngleMax = cssRotationToNumber(
      elementStyles.getPropertyValue('--mds-emoji-expression-max-rotation'),
      16,
    );
    this.expressionFollowMouseHeadDuration = cssDurationToSeconds(
      elementStyles.getPropertyValue('--mds-emoji-expression-follow-mouse-head-duration'),
    );
    this.expressionFollowMouseTraitsDuration = cssDurationToSeconds(
      elementStyles.getPropertyValue('--mds-emoji-expression-follow-mouse-traits-duration'),
    );
    this.headOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-head'), 1);
    this.eyesOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-eyes'), 1);
    this.mouthOffset = cssSizeToNumber(
      elementStyles.getPropertyValue('--mds-emoji-offset-mouth'),
      1,
    );
    this.handOffset = cssSizeToNumber(
      elementStyles.getPropertyValue('--mds-emoji-offset-hands'),
      1,
    );
    this.gadgetOffset = cssSizeToNumber(
      elementStyles.getPropertyValue('--mds-emoji-offset-gadget'),
      1,
    );
    this.eyebrowsOffset = cssSizeToNumber(
      elementStyles.getPropertyValue('--mds-emoji-offset-eyebrows'),
      1,
    );
    this.earsOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-ears'), 1);
  };

  private updateSvgDictionary = (emoji: EmojiNames) => {
    if (typeof window === 'undefined') return;
    const tpl = document.createElement('template');
    tpl.innerHTML = this.svgLibrary[emoji].trim();
    this.svgRootEl = tpl.content.firstElementChild as SVGElement;
    this.updateCSSCustomProps();
    // The shadow DOM is fully replaced, so every cached node/setter/timeline now
    // points at detached elements: drop them so they rebuild against the new SVG.
    this.resetAnimationState();
    if (this.host.shadowRoot) this.host.shadowRoot.innerHTML = this.svgRootEl.outerHTML;
    if (this.isBlinking) {
      this.blinkTimeline = this.buildBlinkTimeline();
      this.scheduleBlink();
    }
    // The face that just arrived must not inherit the pose of the one it replaces.
    // Two distinct leftovers, both visible on the open eyes after a name switch:
    // 1. the trait offsets still held the values computed with the PREVIOUS emoji's
    //    --mds-emoji-offset-*, and the two faces do not move by the same amount -
    //    simi shifts its eyes 7px where mia shifts them 1px, which showed up as the
    //    new eyes sitting far too low (a translateY of 110 in viewBox units);
    // 2. buildBlinkTimeline uses fromTo, and GSAP renders a fromTo's start values
    //    immediately even on a paused timeline, so the open eyes were left squashed
    //    at scaleY 0.75 until the first blink ran to completion.
    this.resetEyesToDefault();
    if (this.isFollowingMouse) {
      this.moveHead(this.mouseX, this.mouseY);
    } else {
      const { centerX, centerY } = this.getEmojiCenter();
      this.moveHead(centerX, centerY);
    }
    // A face swapped while the emoji is thinking has to arrive already thinking:
    // the hand and the focused eyes belong to the state, not to the SVG that is
    // leaving, so they are put back in place at once, without replaying the
    // entrance on a face that is only now appearing.
    if (this.isThinking) this.setStartThinkingAnimation(0);
  };

  private resetAnimationState = (): void => {
    this.killExpressionAnimations();
    this.blinkDelay?.kill();
    this.blinkDelay = null;
    this.blinkTimeline?.kill();
    this.blinkTimeline = null;
    this.headEl = null;
    this.eyesEl = null;
    this.handEl = null;
    this.mouthEl = null;
    this.gadgetEl = null;
    this.eyebrowsEl = null;
    this.earsEl = null;
  };

  private queryPart = (id: string): SVGElement | null =>
    (this.host.shadowRoot?.firstElementChild?.querySelector(`[id='${id}']`) as SVGElement) ?? null;

  private resetEyesToDefault = (): void => {
    this.svgPartState('eyes', 'default');
    const eyesDefaultEl = this.queryPart('eyes-default');
    if (eyesDefaultEl) gsap.set(eyesDefaultEl, { scaleY: 1 });
  };

  private svgPartState<K extends keyof SvgDictionary>(
    part: K,
    state?: keyof SvgPart,
  ): SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null {
    const group = this.host.shadowRoot?.firstElementChild?.querySelectorAll(
      `[id^='${part}-']`,
    ) as NodeListOf<SVGElement | SVGGElement>;
    if (!group || group.length === 0) return null;
    if ((state === undefined || state === '') && group) {
      group?.forEach((el: SVGElement | SVGGElement) => {
        // const currentState = el.id.split('-')[1]
        el.style.visibility = 'hidden';
        if (el.id.split('-')[1] === 'default') el.style.visibility = 'visible';
      });
      return group;
    }
    let element: SVGElement | SVGGElement = this.host.shadowRoot?.firstElementChild?.querySelector(
      `[id='${part}-default']`,
    ) as SVGElement | SVGGElement;
    group?.forEach((el: SVGElement | SVGGElement) => {
      el.style.visibility = 'hidden';
      if (el.id.split('-')[1] === state) {
        element = el;
      }
    });
    if (!element) return null;
    element.style.visibility = 'visible';
    return element as SVGElement | SVGGElement;
  }

  private getEmojiCenter = (): { centerX: number; centerY: number } => {
    const rect = this.host.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };
  };

  // Takes the face over for a new expression: whatever was playing is stopped, the
  // traits go back to their rest pose and the token that identifies the new owner
  // is returned.
  private beginExpression = (): number => {
    this.expressionToken += 1;
    this.stopConcurrentAnimations();
    this.isBusy = true;
    return this.expressionToken;
  };

  private isCurrentExpression = (token: number): boolean => token === this.expressionToken;

  private trackExpression = (animation: gsap.core.Animation): void => {
    // Drop what has already finished, so a long thinking session does not pile up
    // one entry per eye movement.
    this.expressionAnimations = this.expressionAnimations.filter(
      (tracked) => tracked.totalProgress() < 1,
    );
    this.expressionAnimations.push(animation);
  };

  private killExpressionAnimations = (): void => {
    this.expressionAnimations.forEach((animation) => animation.kill());
    this.expressionAnimations = [];
  };

  // Puts back to rest every property an expression is allowed to touch. Expressions
  // animate the percentage, scale and rotation channel, while rotate() owns the
  // translation one, so the pointer tracking pose goes through this untouched.
  private resetFaceToNeutral = (): void => {
    gsap.set(this.host, { yPercent: 0, scaleX: 1, scaleY: 1 });
    if (this.eyesEl) gsap.set(this.eyesEl, { xPercent: 0, yPercent: 0 });
    if (this.mouthEl) gsap.set(this.mouthEl, { scaleY: 1 });
    if (this.eyebrowsEl) gsap.set(this.eyebrowsEl, { yPercent: 0 });
    this.svgPartState('mouth', 'default');
    this.resetEyesToDefault();
  };

  // Pulls the thinking hand out of the frame along the percentage channel its
  // entrance comes in on, so the two are exact mirrors of each other. A duration of
  // zero snaps it, which is what a face rebuilt from another SVG needs.
  private hideThinkingHand = (duration: number): void => {
    const handEl = this.handEl instanceof NodeList ? null : this.handEl;
    if (!handEl) return;
    // No overwrite is needed on either branch: every caller kills the tracked
    // expression animations first, and rotate() drives the hand on the translation
    // channel, which neither of these values touches.
    const out = {
      scale: 0,
      rotateZ: 45,
      xPercent: -this.handEntryOffset,
      yPercent: this.handEntryOffset,
    };
    if (!duration) {
      gsap.set(handEl, out);
      handEl.style.visibility = 'hidden';
      return;
    }
    this.trackExpression(
      gsap.to(handEl, {
        ...out,
        ease: 'expo.inOut',
        duration,
        onComplete: () => {
          handEl.style.visibility = 'hidden';
        },
      }),
    );
  };

  private restoreReadyState = (token: number): void => {
    // A superseded expression never hands the face back: its timeline may still be
    // running when another one has already taken ownership.
    if (!this.isCurrentExpression(token)) return;
    this.isBusy = false;
    this.restoreFollowMouse();
    this.scheduleBlink();
  };

  private restoreFollowMouse = (): void => {
    if (this.wasFollowingMouse) {
      this.moveHead(this.mouseX, this.mouseY);
      this.startFollowMouse();
      return;
    }
    // Never followed the pointer: stay centred on the viewer. This used to run
    // unconditionally, right after startFollowMouse, so it immediately undid the
    // restore and snapped the head back to centre until the next mouse move.
    const { centerX, centerY } = this.getEmojiCenter();
    this.moveHead(centerX, centerY);
  };

  private stopConcurrentAnimations = (): void => {
    // An expression owns the whole face: smile, agree, disagree and think must not
    // play while the traits are still offset toward the last pointer position, so
    // stop tracking and bring the emoji back to centre, where it looks straight at
    // whoever is watching. stopFollowMouse self-guards on isFollowingMouse and
    // already re-centres through rotate(0, 0), but it is a no-op when the pointer
    // was never followed, hence the explicit moveHead.
    // The centring used to be scattered: disagree and startThinking did it in the
    // public method, smile inside setSmileAnimation, and agree not at all. Doing it
    // here is the single place every expression goes through.
    this.stopFollowMouse();
    // Thinking is torn down here rather than through stopThinking(): that method
    // hands the face back and schedules the blinking again, both of which would
    // land in the middle of the expression that is starting right now.
    const wasThinking = this.isThinking;
    this.isThinking = false;
    this.pauseBlinking();
    this.killExpressionAnimations();
    this.resetFaceToNeutral();
    // The traits snap to centre instead of easing there: the new expression owns
    // them from this very frame, and a tween still on its way would be killed
    // halfway through, which is what left the eyes and the hand offset toward the
    // pointer for as long as the expression lasted. The head keeps its eased
    // rotation, the only part of the re-centring big enough to be seen.
    const { centerX, centerY } = this.getEmojiCenter();
    this.moveHead(centerX, centerY, true);
    // The hand does not blink out of existence when an expression interrupts the
    // thinking: it is pulled away over the opening of the animation taking over.
    this.hideThinkingHand(wasThinking ? 0.25 : 0);
  };

  private setAgreeAnimation = (token: number): Promise<void> => {
    const duration = 1780;
    const ease = 'expo.out';
    const overwrite = 'auto';
    const state = { value: 0 };

    // head movement
    const headTimeline = gsap
      .timeline({
        defaults: { ease, overwrite },
        onComplete: () => {
          this.restoreReadyState(token);
        },
      })
      .to(state, {
        value: 0,
        duration: 0.08,
        onUpdate: () => {
          this.rotate(0, state.value);
        },
      })
      .to(state, {
        value: -100,
        duration: 0.24,
        onUpdate: () => {
          this.rotate(0, state.value);
        },
      })
      .to(state, {
        value: 50,
        duration: 0.18,
        onUpdate: () => {
          this.rotate(0, state.value);
        },
      })
      .to(state, {
        value: -25,
        duration: 0.12,
        onUpdate: () => {
          this.rotate(0, state.value);
        },
      })
      .to(state, {
        value: 0,
        duration: 0.16,
        onUpdate: () => {
          this.rotate(0, state.value);
        },
      });
    this.trackExpression(headTimeline);

    // eyebrows
    if (this.eyebrowsEl) {
      const eyebrowsTween = gsap
        .timeline({
          defaults: { ease: 'expo.out', overwrite: 'auto' },
          onComplete: () => {
            eyebrowsTween.reverse();
          },
        })
        .to(this.eyebrowsEl, { yPercent: -40, duration: 0.4 });
      this.trackExpression(eyebrowsTween);
    }

    // mouth
    this.svgPartState('mouth', 'smile');
    this.trackExpression(
      gsap
        .timeline({
          defaults: { ease, overwrite },
          onComplete: () => {
            this.svgPartState('mouth', 'default');
          },
        })
        .to(this.mouthEl, { scaleY: 1.2, duration: 0.2 })
        .to(this.mouthEl, { scaleY: 1, duration: 0.2 }),
    );

    return new Promise((resolve) => setTimeout(resolve, duration));
  };

  private setSmileAnimation = (token: number): Promise<void> => {
    const duration = 750;
    const ease = 'expo.out';
    const overwrite = 'auto';

    // mouth
    this.svgPartState('mouth', 'smile');
    this.trackExpression(
      gsap
        .timeline({
          defaults: { ease, overwrite },
          onComplete: () => {
            this.svgPartState('mouth', 'default');
          },
        })
        .to(this.mouthEl, { scaleY: 1, duration: 0.15 })
        .to(this.mouthEl, { scaleY: 0.75, duration: 0.15 })
        .to(this.mouthEl, { scaleY: 1, duration: 0.15 })
        .to(this.mouthEl, { scaleY: 0.75, duration: 0.15 })
        .to(this.mouthEl, { scaleY: 1, duration: 0.15 }),
    );

    // eyes
    this.svgPartState('eyes', 'closed');
    const eyesSmileTween = gsap
      .timeline({
        defaults: { ease, duration: 0.25, overwrite },
        onComplete: () => {
          eyesSmileTween.to(this.eyesEl, {
            yPercent: 0,
            onComplete: () => {
              this.svgPartState('eyes');
            },
          });
        },
      })
      .to(this.eyesEl, { yPercent: -20 })
      .to(this.eyesEl, { yPercent: 10 });
    this.trackExpression(eyesSmileTween);

    // eyebrows
    if (this.eyebrowsEl) {
      this.trackExpression(
        gsap
          .timeline({
            defaults: { ease, overwrite },
          })
          .to(this.eyebrowsEl, { yPercent: '-=15', duration: 0.15 })
          .to(this.eyebrowsEl, { yPercent: '+=10', duration: 0.15 }),
      );
    }

    // emoji
    const bounceTimeline = gsap
      .timeline({
        defaults: { overwrite },
        onComplete: () => {
          this.svgPartState('mouth', 'default');
          this.restoreReadyState(token);
        },
      })
      .to(this.host, {
        yPercent: `-=${this.host.getBoundingClientRect().height / 10}`,
        scaleX: 0.95,
        duration: 1,
        ease: 'elastic.out',
      })
      .to(this.host, {
        yPercent: `+=${this.host.getBoundingClientRect().height / 10}`,
        scaleX: 1,
        duration: 0.75,
        ease: 'expo.out',
      });
    this.trackExpression(bounceTimeline);
    return new Promise((resolve) => setTimeout(resolve, duration));
  };

  private setDisagreeAnimation = (turnHappyDelay: number = 0, token: number): Promise<void> => {
    const state = { value: 0 };

    const headTimeline = gsap
      .timeline({
        ease: 'power2.inOut',
        onStart: () => {
          this.svgPartState('mouth', 'serious');
        },
        onComplete: () => {
          if (turnHappyDelay > 0) {
            // Tracked like every other step: an expression asked for while the
            // emoji is still frowning has to cancel the pending smile too.
            this.trackExpression(
              gsap.delayedCall(turnHappyDelay / 1000, () => {
                this.svgPartState('mouth', 'default');
                this.restoreReadyState(token);
              }),
            );
            return;
          }
          this.svgPartState('mouth', 'default');
          this.restoreReadyState(token);
        },
      })
      .to(state, {
        value: 0,
        duration: 0.08,
        onUpdate: () => {
          this.rotate(state.value, 0);
        },
      })
      .to(state, {
        value: -100,
        duration: 0.24,
        onUpdate: () => {
          this.rotate(state.value, 0);
        },
      })
      .to(state, {
        value: 50,
        duration: 0.18,
        onUpdate: () => {
          this.rotate(state.value, 0);
        },
      })
      .to(state, {
        value: -25,
        duration: 0.12,
        onUpdate: () => {
          this.rotate(state.value, 0);
        },
      })
      .to(state, {
        value: 0,
        duration: 0.16,
        onUpdate: () => {
          this.rotate(state.value, 0);
        },
      });
    this.trackExpression(headTimeline);

    return new Promise((resolve) => setTimeout(resolve, 780 + turnHappyDelay));
  };

  private setStartThinkingAnimation = (duration: number = 0.5): Promise<void> => {
    const ease = 'expo.inOut';
    const handEl = this.handEl instanceof NodeList ? null : this.handEl;

    if (handEl) {
      handEl.style.visibility = 'visible';
      // Only the percentage channel is animated, because rotate() owns the
      // translation one. The hand therefore lands exactly where the SVG draws it,
      // instead of keeping the offset it was carrying toward the pointer, and its
      // entrance mirrors its exit: the two used to move it on different channels,
      // with an amount scaled by the viewBox, so the leftover of one showed up as a
      // displaced hand at the beginning of the next.
      this.trackExpression(
        gsap.fromTo(
          handEl,
          {
            scale: 0,
            rotateZ: 45,
            xPercent: -this.handEntryOffset,
            yPercent: this.handEntryOffset,
          },
          {
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            rotateZ: 0,
            ease,
            duration,
            overwrite: 'auto',
          },
        ),
      );
    }

    this.moveEyesThinkAnimation();
    this.svgPartState('mouth', 'serious');
    this.svgPartState('eyes', 'focused');
    // Settles even when there is no hand to show: an unresolved promise used to
    // leave every caller awaiting startThinking hanging for good.
    return new Promise((resolve) => setTimeout(resolve, duration * 1000));
  };

  private moveEyesThinkAnimation = (): void => {
    if (!this.eyesEl || !this.isThinking) return;
    const duration = gsap.utils.random(0.15, 0.3, 0.01, true)();
    const ease = 'expo.out';
    // 'auto' and not true: the eyes also carry the translation tween of rotate(),
    // and killing that one outright is what left them looking toward the pointer,
    // off centre, for the whole time the emoji was thinking.
    const animation = { duration, ease, overwrite: 'auto' as const };
    const eyesMargin = 5;
    const randomEyesOffsetX = gsap.utils.random(eyesMargin * -1, eyesMargin, 0.1);
    const randomEyesOffsetY = gsap.utils.random(eyesMargin * -1, eyesMargin, 0.1);

    this.trackExpression(
      gsap.to(this.eyesEl, {
        xPercent: randomEyesOffsetX,
        yPercent: randomEyesOffsetY,
        ...animation,
        onComplete: () => {
          // Nothing to reset when the state is over: the exit animation, or the
          // take-over of another expression, has already put the eyes back.
          if (!this.isThinking) return;
          const nextDelay = gsap.utils.random(0.2, 0.7, 0.1);
          this.trackExpression(gsap.delayedCall(nextDelay, this.moveEyesThinkAnimation));
        },
      }),
    );
  };

  private setStopThinkingAnimation = (duration: number = 0.5): Promise<void> => {
    this.hideThinkingHand(duration);

    if (this.eyesEl) {
      this.trackExpression(
        gsap.to(this.eyesEl, {
          xPercent: 0,
          yPercent: 0,
          ease: 'expo.out',
          duration,
          overwrite: 'auto',
        }),
      );
    }
    this.svgPartState('mouth', 'default');
    this.svgPartState('eyes', 'default');
    return new Promise((resolve) => setTimeout(resolve, duration * 1000));
  };

  // A single, reusable blink sequence. Built once and replayed via restart(),
  // it never grows over time and is fully controlled by play/pause, unlike the
  // previous recursive chain that died permanently the moment isBusy was set.
  private buildBlinkTimeline = (): gsap.core.Timeline | null => {
    const eyesDefaultEl = this.queryPart('eyes-default');
    const eyesClosedEl = this.queryPart('eyes-closed');
    if (!eyesDefaultEl || !eyesClosedEl) return null;

    const animateIn = { ease: 'expo.in', duration: 0.2 };
    const animateOut = { ease: 'expo.out', duration: 0.2 };

    return gsap
      .timeline({ paused: true, onComplete: this.scheduleBlink })
      .to(eyesDefaultEl, { scaleY: 0.5, ...animateIn })
      .add(() => {
        this.svgPartState('eyes', 'closed');
      })
      .fromTo(eyesClosedEl, { scaleY: 0.5 }, { scaleY: 1, ...animateOut })
      .add(() => {
        this.svgPartState('eyes', 'default');
      })
      .fromTo(eyesDefaultEl, { scaleY: 0.75 }, { scaleY: 1, ...animateOut });
  };

  // Queues the next blink after a random idle delay. Gated on the blinking
  // intent and isBusy, so it is a no-op while another animation owns the eyes
  // and is simply called again once that animation finishes.
  private scheduleBlink = (): void => {
    if (!this.isBlinking || this.isBusy || !this.blinkTimeline) return;
    this.blinkDelay?.kill();
    this.blinkDelay = gsap.delayedCall(gsap.utils.random(1, 3, 0.1), () => {
      if (!this.isBlinking || this.isBusy || !this.blinkTimeline) return;
      this.resetEyesToDefault();
      this.blinkTimeline.restart();
    });
  };

  private pauseBlinking = (): void => {
    this.blinkDelay?.kill();
    this.blinkDelay = null;
    if (!this.blinkTimeline) return;
    this.blinkTimeline.pause(0);
    // pause(0) rewinds the tweens, but the visibility swaps are forward-only
    // callbacks, so make sure the open eyes are the visible state again.
    this.resetEyesToDefault();
  };

  private handleFollowMouse = (e: MouseEvent): void => {
    // Record the pointer even while an expression owns the face. Bailing out before
    // storing it left mouseX/mouseY frozen at wherever the pointer was when the
    // expression started, so restoreFollowMouse resumed on a stale pose and the
    // emoji snapped to a position the pointer had already left, until the next move.
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    if (!this.isFollowingMouse) return;
    this.followMouse();
  };

  private followMouse = (): void => {
    const { centerX, centerY } = this.getEmojiCenter();
    let currentMouseX = centerX;
    let currentMouseY = centerY;

    if (this.isFollowingMouse) {
      currentMouseX = this.mouseX;
      currentMouseY = this.mouseY;
    }

    const rect = this.host.getBoundingClientRect();

    const deltaX = currentMouseX - centerX;
    const deltaY = currentMouseY - centerY;

    const percentX = deltaX / (rect.width / 2);
    const percentY = deltaY / (rect.height / 2);

    this.rotate(percentX, percentY);
  };

  private moveHead = (x: number, y: number, immediate: boolean = false): void => {
    const { centerX, centerY } = this.getEmojiCenter();
    const rect = this.host.getBoundingClientRect();

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    const percentX = deltaX / (rect.width / 2);
    const percentY = deltaY / (rect.height / 2);

    this.rotate(percentX, percentY, immediate);
  };

  private rotate = (percentX: number, percentY: number, immediate: boolean = false): void => {
    const ease = 'power1.out';
    // The traits can be put in place at once instead of eased there: an expression
    // about to take the face over owns them from this very frame, and a tween still
    // on its way would be killed halfway through, leaving them offset toward the
    // pointer for as long as that expression lasts.
    const traitsDuration = immediate ? 0 : this.expressionFollowMouseTraitsDuration;
    const clampOffset = (offset: number, percent: number): number =>
      gsap.utils.clamp(-offset, offset, percent * offset);

    this.currentRotateX = clampOffset(this.expressionAngleMax, -percentY); // Y invertito
    this.currentRotateY = clampOffset(this.expressionAngleMax, percentX);
    this.headOffsetX = clampOffset(this.headOffset, percentX);
    this.headOffsetY = clampOffset(this.headOffset, percentY);
    this.eyesOffsetX = clampOffset(this.eyesOffset, percentX);
    this.eyesOffsetY = clampOffset(this.eyesOffset, percentY);
    this.mouthOffsetX = clampOffset(this.mouthOffset, percentX);
    this.mouthOffsetY = clampOffset(this.mouthOffset, percentY);
    this.handOffsetX = clampOffset(this.handOffset, percentX);
    this.handOffsetY = clampOffset(this.handOffset, percentY);
    this.gadgetOffsetX = clampOffset(this.gadgetOffset, percentX);
    this.gadgetOffsetY = clampOffset(this.gadgetOffset, percentY);
    this.eyebrowsOffsetX = clampOffset(this.eyebrowsOffset, percentX);
    this.eyebrowsOffsetY = clampOffset(this.eyebrowsOffset, percentY);
    this.earsOffsetX = clampOffset(this.earsOffset, percentX);
    this.earsOffsetY = clampOffset(this.earsOffset, percentY);

    if (!this.headEl) {
      this.headEl = this.svgPartState('head');
      this.eyebrowsEl = this.svgPartState('eyebrows');
      this.earsEl = this.svgPartState('ears');
      this.eyesEl = this.svgPartState('eyes');
      this.handEl = this.svgPartState('hand', 'think');
      if (this.handEl) (this.handEl as SVGElement).style.visibility = 'hidden';
      this.mouthEl = this.svgPartState('mouth');
      this.gadgetEl = this.svgPartState('gadget');
    }

    const traitVars = {
      duration: traitsDuration,
      ease,
      // 'auto' overwrite drops only the x and y left over from the previous pointer
      // update, and leaves alone the percentage channel the expressions animate.
      overwrite: 'auto' as const,
    };

    // Each facial element is tweened independently with its own offset so they
    // move by different amounts, giving the emoji a layered, parallax-like depth.
    gsap.to(this.host, {
      rotateX: this.currentRotateX,
      rotateY: this.currentRotateY,
      transformOrigin: '50% 50%',
      duration: this.expressionFollowMouseHeadDuration,
      ease,
    });

    if (this.eyesEl) {
      gsap.to(this.eyesEl, {
        translateX: this.eyesOffsetX,
        translateY: this.eyesOffsetY,
        transformOrigin: '50% 50%',
        ...traitVars,
      });
    }

    if (this.handEl) {
      gsap.to(this.handEl, {
        translateX: this.handOffsetX,
        translateY: this.handOffsetY,
        transformOrigin: '50% 50%',
        ...traitVars,
      });
    }

    if (this.headEl) {
      gsap.to(this.headEl, {
        translateX: this.headOffsetX,
        translateY: this.headOffsetY,
        transformOrigin: '0% 100%',
        ...traitVars,
      });
    }

    if (this.mouthEl) {
      gsap.to(this.mouthEl, {
        translateX: this.mouthOffsetX,
        translateY: this.mouthOffsetY,
        transformOrigin: '50% 50%',
        ...traitVars,
      });
    }

    if (this.gadgetEl) {
      gsap.to(this.gadgetEl, {
        translateX: this.gadgetOffsetX,
        translateY: this.gadgetOffsetY,
        transformOrigin: '50% 50%',
        ...traitVars,
      });
    }

    if (this.eyebrowsEl) {
      gsap.to(this.eyebrowsEl, {
        translateX: this.eyebrowsOffsetX,
        translateY: this.eyebrowsOffsetY,
        transformOrigin: '50% 50%',
        ...traitVars,
      });
    }

    if (this.earsEl) {
      gsap.to(this.earsEl, {
        translateX: this.earsOffsetX,
        translateY: this.earsOffsetY,
        transformOrigin: '50% 50%',
        ...traitVars,
      });
    }
  };

  render() {
    return <Host></Host>;
  }
}
