import { Component, Host, h, Method, Prop, Element } from '@stencil/core'
import { gsap } from 'gsap'
import { cssRotationToNumber, cssDurationToSeconds } from '@common/unit'
import { randomNumber } from '@common/number'

export type EmojiNames = 'mia'

@Component({
  tag: 'mds-emoji',
  styleUrl: 'mds-emoji.css',
  shadow: true,
})
export class MdsEmoji {
  @Element() host: HTMLMdsEmojiElement
  @Prop({ reflect: true }) readonly name: EmojiNames = 'mia'

  // private hostSize: number = 24

  /*
    startReading()
    stopReading()
    startThinking()
    stopThinking()
    somethingWrong(cb)

    component.agree((el) => { el.startThinking() })
  */

  // private persistentAnimations = {
  //   followMouse: false,
  //   blink: false,
  // }

  private isFollowingMouse: boolean = false
  private isBlinking: boolean = false
  private isThinking: boolean = false
  private faceOffsetX: number = 0
  private faceOffsetY: number = 0

  private mouseX: number = 0
  private mouseY: number = 0
  private blinkTimeout: NodeJS.Timeout

  private currentRotateX: number = 0
  private currentRotateY: number = 0
  private expressionAngleMax: number = 16 // massimo angolo di rotazione della emoji
  private expressionFollowMouseHeadDuration: number = 0.3 // durata dell'animazione di rotazione della testa quando segue il mouse
  private expressionFollowMouseTraitsDuration: number = 0.2 // durata dell'animazione di rotazione degli occhi e della bocca quando segue il mouse

  private emojiEl: SVGElement
  private eyeLeftEl: SVGElement
  private eyeRightEl: SVGElement
  private mouthEl: SVGElement
  private headEl: SVGElement
  private handLeftEl: SVGElement

  private handLeftGeometry = {
    think: 'M6 15C6.55228 15 7 15.4477 7 16V17H13C13.5523 17 14 17.4477 14 18C14 18.5523 13.5523 19 13 19H10.3818C11.1252 19 11.6088 19.7824 11.2764 20.4473L10.2764 22.4473C10.107 22.786 9.76059 23 9.38184 23H6V22.9541L5.85742 23H4V19L5 17V15H6Z',
  }

  private eyeLeftGeometry = {
    open: 'M8 8H10V11H8V8Z',
    close: 'M7 10H10V11H7V10Z',
  }

  private eyeRightGeometry = {
    open: 'M14 8H16V11H14V8Z',
    close: 'M14 10H17V11H14V10Z',
  }

  private headGeometry = {
    hexagon: 'M7 3L1.5 12L7 21H17L22.5 12L17 3H7Z',
    hexagonRounded: 'M6.12266 4.43565L2.45599 10.4356C1.86912 11.396 1.86912 12.604 2.45599 13.5643L6.12266 19.5644C6.66763 20.4561 7.6374 21 8.6825 21H15.3175C16.3626 21 17.3324 20.4561 17.8773 19.5644L21.544 13.5644C22.1309 12.604 22.1309 11.396 21.544 10.4357L17.8773 4.43565C17.3324 3.54389 16.3626 3 15.3175 3H8.6825C7.6374 3 6.66763 3.54389 6.12266 4.43565Z',
  }

  private mouthGeometry = {
    open: 'M12 18C10.8954 18 10 16.8807 10 15.5C10 14.1193 10.8954 13 12 13C13.1046 13 14 14.1193 14 15.5C14 16.8807 13.1046 18 12 18Z',
    quiet: 'M16 15H8C8 17 7.5 17 12 17C16.5 17 16 17 16 15Z',
    sad: 'M8 17C8 15.3431 9.79086 14 12 14C14.1402 14 15.8881 15.2605 15.9951 16.8457L16 17L8 17Z',
    serious: 'M9 15H15V17H9V15Z',
    think: 'M8 14H16V16H8V14Z',
    happy: 'M16 14H8C8.33333 15.3333 9 18 12 18C15 18 15.6667 15.3333 16 14Z',
    smile: 'M16.707 15.707C15.4771 16.937 13.6985 17.5 12 17.5C10.3015 17.5 8.52294 16.937 7.29297 15.707L8.70703 14.293C9.47706 15.063 10.6985 15.5 12 15.5C13.3015 15.5 14.5229 15.063 15.293 14.293L16.707 15.707Z',
    smileLeft: 'M10 14C10 15.1046 10.8954 16 12 16H14V18H12C9.79086 18 8 16.2091 8 14H10Z',
    smileRight: 'M14 14C14 15.1046 13.1046 16 12 16H10V18H12C14.2091 18 16 16.2091 16 14H14Z',
  }

  private getEmojiCenter = (): { centerX: number, centerY: number } => {
    const rect = this.host.getBoundingClientRect()
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    }
  }

  private stopConcurrentAnimations = (): void => {
    if (this.isThinking) {
      this.stopThinking()
    }
  }

  /**
   * @returns Promise<void>
   * Emoji agrees, useful for confirm actions.
   */

  @Method()
  async agree (): Promise<void> {
    this.stopConcurrentAnimations()
    await this.setAgreeAnimation()
    return Promise.resolve()
  }

  private setAgreeAnimation = (): Promise<void> => {
    // Interrompi temporaneamente le rotazioni automatiche
    const duration = 1000
    const wasFollowingMouse = this.isFollowingMouse
    if (wasFollowingMouse) {
      this.isFollowingMouse = false
    }
    gsap.killTweensOf(this.emojiEl)

    const baseX = this.currentRotateX

    const tl = gsap.timeline({
      onComplete: () => {
      // Torna alla posizione seguita dal mouse
        gsap.to(this.emojiEl, {
          rotateX: this.currentRotateX,
          rotateY: this.currentRotateY,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            if (wasFollowingMouse) {
              this.isFollowingMouse = true
            }
          },
        })
      },
    })

    tl.to(this.emojiEl, { rotateX: baseX - 40, duration: 0.15, ease: 'power2.out' })
      .to(this.emojiEl, { rotateX: baseX + 20, duration: 0.2, ease: 'power1.inOut' })
      .to(this.emojiEl, { rotateX: baseX - 20, duration: 0.15, ease: 'power2.inOut' })
      .to(this.emojiEl, { rotateX: baseX + 5, duration: 0.2, ease: 'power1.out' })
      .to(this.emojiEl, { rotateX: baseX, duration: 0.3, ease: 'power3.out' })

    gsap.fromTo(this.mouthEl,
      {
        attr: { d: this.mouthGeometry.happy },
      }, {
        scaleY: 0.5, transformOrigin: '50% 50%',
        onComplete: () => {
          gsap.fromTo(this.mouthEl,
            {
              attr: { d: this.mouthGeometry.smile },
            }, {
              scaleY: 1, transformOrigin: '50% 50%',
              duration: 0.2,
              ease: 'expo.inOut',
            },
          )
        },
        duration: 0.75,
        ease: 'expo.inOut',
      },
    )

    return new Promise(resolve => setTimeout(resolve, duration))
  }

  /**
   * @returns Promise<void>
   * Emoji smiles, useful for confirm actions.
   */

  @Method()
  async smile (): Promise<void> {
    this.stopConcurrentAnimations()
    await this.setSmileAnimation()
    return Promise.resolve()
  }

  private setSmileAnimation = (): Promise<void> => {
    // Interrompi temporaneamente le rotazioni automatiche
    const duration = 1700
    const wasFollowingMouse = this.isFollowingMouse
    if (wasFollowingMouse) {
      this.isFollowingMouse = false
    }
    gsap.killTweensOf(this.emojiEl)
    gsap.fromTo(this.mouthEl,
      {
        attr: { d: this.mouthGeometry.happy },
        transformOrigin: '50% 50%',
      }, {
        scaleY: 0.75,
        duration: 0.15,
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.to(this.mouthEl, { scaleY: 1, duration: 0.15 })
          gsap.to(this.mouthEl, { scaleY: 0.75, duration: 0.15, delay:0.30 })
          gsap.to(this.mouthEl, { scaleY: 1, duration: 0.15, delay:0.45 })
          gsap.to(this.mouthEl, { scaleY: 0.75, duration: 0.15, delay:0.60 })
          gsap.to(this.mouthEl, { scaleY: 1, duration: 0.15, delay:0.75 })
          gsap.delayedCall(1.2, () => {
            gsap.fromTo(this.mouthEl,
              {
                attr: { d: this.mouthGeometry.smile },
                transformOrigin: '50% 50%',
                scaleY: 1.5,
              }, {
                attr: { d: this.mouthGeometry.smile },
                scaleY: 1,
                duration: 0.5,
                ease: 'expo.out',
              },
            )
          })
        },
      },
    )

    const eyeRightTween = gsap.fromTo(this.eyeRightEl,
      {
        attr: { d: this.eyeRightGeometry.open },
      }, {
        attr: { d: this.eyeRightGeometry.close },
        translateY: -2.5,
        scaleY: 1.5,
        onComplete: () => {
          gsap.delayedCall(0.25, () => eyeRightTween.reverse())
        },
        duration: 0.75,
        ease: 'expo.inOut',
      },
    )

    const eyeLeftTween = gsap.fromTo(this.eyeLeftEl,
      {
        attr: { d: this.eyeLeftGeometry.open },
      }, {
        attr: { d: this.eyeLeftGeometry.close },
        translateY: -2.5,
        scaleY: 1.5,
        onComplete: () => {
          gsap.delayedCall(0.25, () => eyeLeftTween.reverse())
        },
        duration: 0.75,
        ease: 'expo.inOut',
      },
    )

    const emojiTween = gsap.to(this.emojiEl,
      {
        translateY: `-=${this.emojiEl.getBoundingClientRect().height / 10}`,
        scaleX: 0.9,
        duration: 0.5,
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.delayedCall(0.5, () => {
            emojiTween.reverse()
          })
        },
      },
    )

    return new Promise(resolve => setTimeout(resolve, duration))
  }

  /**
   * @returns Promise<void>
   * Emoji disagrees, useful for errors or unwanted results.
   */

  @Method()
  async disagree (turnHappyDelay: number = 0): Promise<void> {
    this.stopConcurrentAnimations()
    this.setDisagreeAnimation(turnHappyDelay)
    return Promise.resolve()
  }

  private setDisagreeAnimation = (turnHappyDelay: number = 0): void => {
  // Interrompi temporaneamente le rotazioni automatiche
    gsap.killTweensOf(this.emojiEl)
    const wasFollowingMouse = this.isFollowingMouse
    if (wasFollowingMouse) {
      this.isFollowingMouse = false
    }

    const tl = gsap.timeline({
      onComplete: () => {
      // Torna alla posizione seguita dal mouse
        gsap.to(this.emojiEl, {
          rotateX: this.currentRotateX,
          rotateY: this.currentRotateY,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            if (wasFollowingMouse) {
              this.isFollowingMouse = true
            }
          },
        })
      },
    })

    const rotationEase = 'power2.inOut'

    tl.to(this.emojiEl, { rotateY: this.currentRotateY - 40, duration: 0.25, ease: rotationEase })
      .to(this.emojiEl, { rotateY: this.currentRotateY + 30, duration: 0.2, ease: rotationEase })
      .to(this.emojiEl, { rotateY: this.currentRotateY - 20, duration: 0.15, ease: rotationEase })
      .to(this.emojiEl, { rotateY: this.currentRotateY + 10, duration: 0.1, ease: rotationEase })
      .to(this.emojiEl, { rotateY: this.currentRotateY, duration: 0.3, ease: rotationEase })

    gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.serious }, duration: 0, ease: 'none', onComplete: () => {
      setTimeout(() => {
        gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.serious }, duration: 0, ease: 'none', onComplete: () => {
          if (turnHappyDelay > 0) {
            setTimeout(() => {
              gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.smile }, duration: 0, ease: 'none' })
            }, turnHappyDelay)
          }
        } })
      }, 1000)
    } })
  }

  /**
   * @returns Promise<void>
   * Emoji start thinking, useful for pending requests.
   */

  @Method()
  async startThinking (duration: number = 0.5): Promise<void> {
    this.isThinking = true
    await this.setStartThinkingAnimation(duration)
    return Promise.resolve()
  }

  @Method()
  async stopThinking (duration: number = 0.5): Promise<void> {
    this.isThinking = false
    await this.setStopThinkingAnimation(duration)
    return Promise.resolve()
  }

  private moveEyesThinkAnimation = (): void => {
    const duration = randomNumber(0.25, 0.75) // Random duration between 0.5 and 1
    const ease = 'expo.Out'

    const maxJitter = 1 // max +-2 px jitter
    const randomOffsetX = randomNumber(-1, 1, true) * maxJitter
    // const randomOffsetY = randomNumber(-0.5, 1) * maxJitter

    const finalX = (this.faceOffsetX ?? 0) + randomOffsetX
    // const finalY = (this.faceOffsetY ?? 0) + randomOffsetY

    gsap.to(this.eyeLeftEl, { x: finalX, ease, duration })
    gsap.to(this.eyeRightEl, { x: finalX, ease, duration, onComplete: () => {
      if (this.isThinking) {
        this.moveEyesThinkAnimation()
      } else {
        // Reset eyes position when not thinking
        gsap.to(this.eyeLeftEl, { x: 0, ease: 'expo.inOut', duration: 0.5 })
        gsap.to(this.eyeRightEl, { x: 0, ease: 'expo.inOut', duration: 0.5 })
      }
    } })
  }

  private setStartThinkingAnimation = (duration: number = 0.5): Promise<void> => {
    const ease = 'expo.inOut'
    this.handLeftEl.style.visibility = 'visible'
    gsap.fromTo(this.handLeftEl, { scale: 0, rotateZ: 45 }, { scale: 1, rotateZ: 0, ease, duration })
    this.moveEyesThinkAnimation()
    gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.think }, duration: 0, ease: 'none' })
    return new Promise(resolve => setTimeout(resolve, duration * 1000))
  }

  private setStopThinkingAnimation = (duration: number): Promise<void> => {
    const ease = 'expo.inOut'
    gsap.to(this.handLeftEl, { scale: 0, y: 0, rotateZ: 45, ease, duration })
    gsap.to(this.eyeLeftEl, { x: 0, ease: 'expo.inOut', duration })
    gsap.to(this.eyeRightEl, { x: 0, ease: 'expo.inOut', duration })
    gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.smile }, duration: 0, ease: 'none' })
    return new Promise(resolve => setTimeout(resolve, duration * 1000))
  }

  /**
   * @returns Promise<void>
   * Eyes start blinking.
   */

  @Method()
  async startBlinking (): Promise<void> {
    if (this.isBlinking) return
    this.isBlinking = true
    this.queueNextBlink()
    return Promise.resolve()
  }

  /**
   * @returns Promise<void>
   * Eyes stop blinking.
   */

  @Method()
  async stopBlinking (): Promise<void> {
    this.isBlinking = false
    clearTimeout(this.blinkTimeout)
    return Promise.resolve()
  }

  private loopBlink = (): void => {
    this.blinkOnce()
    this.queueNextBlink()
  }

  private queueNextBlink = (): void => {
    if (!this.isBlinking) return
    this.blinkTimeout = setTimeout(this.loopBlink.bind(this), randomNumber(2000, 5000))
  }

  private blinkOnce = (): void => {
    const durationClose = 0.15
    const durationOpen = 0.15
    gsap.to(this.eyeLeftEl, { attr: { d: this.eyeLeftGeometry.close }, duration: durationClose, onComplete: () => { gsap.to(this.eyeLeftEl, { attr: { d: this.eyeLeftGeometry.open }, duration: durationOpen }) } })
    gsap.to(this.eyeRightEl, { attr: { d: this.eyeRightGeometry.close }, duration: durationClose, onComplete: () => { gsap.to(this.eyeRightEl, { attr: { d: this.eyeRightGeometry.open }, duration: durationOpen }) } })
  }

  /**
   * @returns Promise<void>
   * Stops following mouse with CSS 3D transform.
   */

  @Method()
  async stopFollowMouse (): Promise<void> {
    this.isFollowingMouse = false
    this.followMouse()
    return new Promise(resolve => setTimeout(resolve, this.expressionFollowMouseTraitsDuration * 1000))
  }

  /**
   * @returns Promise<void>
   * Starts following mouse with CSS 3D transform.
   */
  @Method()
  async startFollowMouse (): Promise<void> {
    this.isFollowingMouse = true
    this.followMouse()
    return Promise.resolve()
  }

  private handleFollowMouse = (e: MouseEvent): void => {
    if (!this.isFollowingMouse) return
    this.mouseX = e.clientX
    this.mouseY = e.clientY
    this.followMouse()
  }

  private followMouse = (): void => {

    const { centerX } = this.getEmojiCenter()
    const { centerY } = this.getEmojiCenter()
    let currentMouseX = this.getEmojiCenter().centerX
    let currentMouseY = this.getEmojiCenter().centerY
    const ease = 'power1.out'

    if (this.isFollowingMouse) {
      currentMouseX = this.mouseX
      currentMouseY = this.mouseY
    }

    const rect = this.host.getBoundingClientRect()

    const deltaX = currentMouseX - centerX
    const deltaY = currentMouseY - centerY

    const percentX = deltaX / (rect.width / 2)
    const percentY = deltaY / (rect.height / 2)

    this.currentRotateY = gsap.utils.clamp(- this.expressionAngleMax, this.expressionAngleMax, percentX * this.expressionAngleMax)
    this.currentRotateX = gsap.utils.clamp(- this.expressionAngleMax, this.expressionAngleMax, - percentY * this.expressionAngleMax) // Y invertito

    gsap.to(this.emojiEl, {
      rotateX: this.currentRotateX,
      rotateY: this.currentRotateY,
      duration: this.expressionFollowMouseHeadDuration,
      ease,
    })

    const maxOffset = 1

    this.faceOffsetX = gsap.utils.clamp(-maxOffset, maxOffset, percentX * maxOffset)
    this.faceOffsetY = gsap.utils.clamp(-maxOffset, maxOffset, percentY * maxOffset)

    gsap.to(this.eyeLeftEl, {
      x: this.faceOffsetX,
      y: this.faceOffsetY,
      duration: this.expressionFollowMouseTraitsDuration,
      ease,
    })
    gsap.to(this.eyeRightEl, {
      x: this.faceOffsetX,
      y: this.faceOffsetY,
      duration: this.expressionFollowMouseTraitsDuration,
      ease,
    })
    gsap.to(this.handLeftEl, {
      x: this.faceOffsetX,
      y: this.faceOffsetY,
      duration: this.expressionFollowMouseTraitsDuration,
      ease,
    })

    const mouthOffsetX = gsap.utils.clamp(-maxOffset, maxOffset, percentX * maxOffset)
    const mouthOffsetY = gsap.utils.clamp(-maxOffset, maxOffset, percentY * maxOffset)

    gsap.to(this.mouthEl, {
      x: mouthOffsetX,
      y: mouthOffsetY,
      duration: this.expressionFollowMouseTraitsDuration,
      ease,
    })
  }

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.host)
    this.expressionAngleMax = cssRotationToNumber(elementStyles.getPropertyValue('--mds-emoji-expression-max-rotation'))
    this.expressionFollowMouseHeadDuration = cssDurationToSeconds(elementStyles.getPropertyValue('--mds-emoji-expression-follow-mouse-head-duration'))
    this.expressionFollowMouseTraitsDuration = cssDurationToSeconds(elementStyles.getPropertyValue('--mds-emoji-expression-follow-mouse-traits-duration'))
  }

  componentDidLoad (): void {
    if (!window) return
    this.updateCSSCustomProps()
    window.addEventListener('mousemove', this.handleFollowMouse)
    // useless
    this.headEl.setAttribute('d', this.headGeometry.hexagonRounded)
  }

  disconnectedCallback (): void {
    if (!window) return
    window.removeEventListener('mousemove', this.handleFollowMouse)
  }

  render () {
    return <Host>
      { this.name === 'mia' && (
        <svg ref={el => (this.emojiEl = el as SVGElement)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="head" ref={el => (this.headEl = el as SVGElement)} d={this.headGeometry.hexagonRounded} fill="black"/>
          <path class="eye" ref={el => (this.eyeLeftEl = el as SVGElement)} d={this.eyeLeftGeometry.open} fill="white"/>
          <path class="eye" ref={el => (this.eyeRightEl = el as SVGElement)} d={this.eyeRightGeometry.open} fill="white"/>
          <path class="mouth" ref={el => (this.mouthEl = el as SVGElement)} d={this.mouthGeometry.smile} fill="white"/>
          <path class="hand" ref={el => (this.handLeftEl = el as SVGElement)} d={this.handLeftGeometry.think} fill="white"/>
        </svg>)
      }
    </Host>
  }
}
