import { Component, Host, h, Method, Prop, Element, Watch } from '@stencil/core'
import { cssRotationToNumber, cssDurationToSeconds, cssSizeToNumber } from '@common/unit'
import type { EmojiNames, SvgDictionary, SvgPart } from './meta/types'
import { gsap } from 'gsap'

import miaSvg from './asset/mia.svg'
import simiSvg from './asset/simi.svg'

@Component({
  tag: 'mds-emoji',
  styleUrl: 'mds-emoji.css',
  shadow: true,
})
export class MdsEmoji {
  @Element() host: HTMLMdsEmojiElement
  @Prop({ reflect: true }) readonly name: EmojiNames = 'mia'

  private emojiOriginalSize: number = 0
  private isFollowingMouse: boolean = false
  private isThinking: boolean = false
  private headOffsetX: number = 0
  private headOffsetY: number = 0
  private headOffset: number = 0
  private eyesOffsetX: number = 0
  private eyesOffsetY: number = 0
  private eyesOffset: number = 1
  private mouthOffsetX: number = 0
  private mouthOffsetY: number = 0
  private mouthOffset: number = 1
  private handOffsetX: number = 0
  private handOffsetY: number = 0
  private handOffset: number = 2
  private gadgetOffsetX: number = 0
  private gadgetOffsetY: number = 0
  private gadgetOffset: number = 2
  private eyebrowsOffsetX: number = 0
  private eyebrowsOffsetY: number = 0
  private eyebrowsOffset: number = 2
  private earsOffsetX: number = 0
  private earsOffsetY: number = 0
  private earsOffset: number = 2

  private mouseX: number = 0
  private mouseY: number = 0

  private currentRotateX: number = 0
  private currentRotateY: number = 0
  private expressionAngleMax: number = 24 // massimo angolo di rotazione della emoji
  private expressionFollowMouseHeadDuration: number = 0.3 // durata dell'animazione di rotazione della testa quando segue il mouse
  private expressionFollowMouseTraitsDuration: number = 0.2 // durata dell'animazione di rotazione degli occhi e della bocca quando segue il mouse

  private eyesEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null
  private gadgetEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null
  private handEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null
  private eyebrowsEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null
  private headEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null
  private earsEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null
  private mouthEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null

  private eyesTimeline: gsap.core.Timeline

  private svgLibrary = {
    mia: miaSvg,
    simi: simiSvg,
  }

  private svgRootEl: SVGElement

  componentDidLoad (): void {
    if (typeof window === 'undefined') return
    this.updateCSSCustomProps()
    window.addEventListener('mousemove', this.handleFollowMouse)
    this.checkNameChanged(this.name)

  }

  disconnectedCallback (): void {
    if (!window) return
    window.removeEventListener('mousemove', this.handleFollowMouse)
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

  // /**
  //  * @returns Promise<void>
  //  * Emoji smiles, useful for confirm actions.
  //  */

  // @Method()
  // async smile (): Promise<void> {
  //   this.stopConcurrentAnimations()
  //   await this.setSmileAnimation()
  //   return Promise.resolve()
  // }

  // /**
  //  * @returns Promise<void>
  //  * Emoji disagrees, useful for errors or unwanted results.
  //  */

  // @Method()
  // async disagree (turnHappyDelay: number = 0): Promise<void> {
  //   this.stopConcurrentAnimations()
  //   this.setDisagreeAnimation(turnHappyDelay)
  //   return Promise.resolve()
  // }

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

  /**
   * @returns Promise<void>
   * Eyes start blinking.
   */

  @Method()
  async startBlinking (): Promise<void> {
    if (!this.eyesTimeline) {
      const eyesClosed = this.svgPartState('eyes', 'closed') as SVGElement
      const eyesOpened = this.svgPartState('eyes', 'default') as SVGElement
      this.eyesTimeline = this.randomBlink(eyesOpened, eyesClosed)
    }
    this.eyesTimeline.play()
    return Promise.resolve()
  }

  /**
   * @returns Promise<void>
   * Eyes stop blinking.
   */
  @Method()
  async stopBlinking (): Promise<void> {
    this.eyesTimeline.pause()
    return Promise.resolve()
  }

  /**
   * @returns Promise<void>
   * Stops following mouse with CSS 3D transform.
   */
  @Method()
  async stopFollowMouse (): Promise<void> {
    this.followMouse()
    this.isFollowingMouse = false
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

  @Watch('name')
  checkNameChanged (emojiName: EmojiNames): void {
    this.updateSvgDictionary(emojiName)
  }

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.host)
    this.expressionAngleMax = cssRotationToNumber(elementStyles.getPropertyValue('--mds-emoji-expression-max-rotation'))
    this.expressionFollowMouseHeadDuration = cssDurationToSeconds(elementStyles.getPropertyValue('--mds-emoji-expression-follow-mouse-head-duration'))
    this.expressionFollowMouseTraitsDuration = cssDurationToSeconds(elementStyles.getPropertyValue('--mds-emoji-expression-follow-mouse-traits-duration'))
    this.headOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-head'), 1)
    this.eyesOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-eyes'), 1)
    this.mouthOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-mouth'), 1)
    this.handOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-hand'), 1)
    this.gadgetOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-gadget'), 1)
    this.eyebrowsOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-eyebrows'), 1)
    this.earsOffset = cssSizeToNumber(elementStyles.getPropertyValue('--mds-emoji-offset-ears'), 1)
  }

  // private getSvgElement = (idSelector: string): SvgNode | null =>
  //   this.svgRootEl.querySelector(`#${idSelector}`) as SvgNode | null

  private updateSvgDictionary = (emoji: EmojiNames) => {
    if (typeof window === 'undefined') return
    const tpl = document.createElement('template')
    tpl.innerHTML = this.svgLibrary[emoji].trim()
    this.emojiOriginalSize = Number(tpl.content.firstElementChild?.getAttribute('width'))
    this.svgRootEl = tpl.content.firstElementChild as SVGElement
    this.updateCSSCustomProps()
    if (this.host.shadowRoot) this.host.shadowRoot.innerHTML = this.svgRootEl.outerHTML
  }

  private svgPartState<K extends keyof SvgDictionary> (part: K, state?: keyof SvgPart): SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> | null {
    const group = this.host.shadowRoot?.firstElementChild?.querySelectorAll(`[id^='${part}-']`) as NodeListOf<SVGElement | SVGGElement>
    if (group.length === 0) return null
    if (!state && group) {
      group?.forEach((el: SVGElement | SVGGElement) => {
        // const currentState = el.id.split('-')[1]
        el.style.visibility = 'hidden'
        if (el.id.split('-')[1] === 'default') el.style.visibility = 'visible'
      })
      return group
    }
    let element: SVGElement | SVGGElement = this.host.shadowRoot?.firstElementChild?.querySelector(`[id='${part}-default']`) as SVGElement | SVGGElement
    group?.forEach((el: SVGElement | SVGGElement) => {
      el.style.visibility = 'hidden'
      if (el.id.split('-')[1] === state) {
        element = el
      }
    })
    element.style.visibility = 'visible'
    return element as SVGElement | SVGGElement
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


  private setAgreeAnimation = (): Promise<void> => {
    const duration = 1000
    const wasFollowingMouse = this.isFollowingMouse
    if (wasFollowingMouse) {
      this.isFollowingMouse = false
    }
    // gsap.killTweensOf(this.host)

    const ease = 'expo.out'
    const overwrite = 'auto'

    const state = { value: 0 }

    gsap.timeline({
      defaults: { ease, overwrite },
      onComplete: () => {
        if (wasFollowingMouse) {
          // console.log('stop')
          this.isFollowingMouse = true
          this.moveHead(this.mouseX, this.mouseY)
          return
        }
        this.moveHead(this.getEmojiCenter().centerX, this.getEmojiCenter().centerY)
      },
    })
      .to(state, { value: 0, duration: 0.08, onUpdate: () => { this.rotate(0, state.value) } })
      .to(state, { value: -100, duration: 0.24, onUpdate: () => { this.rotate(0, state.value) } })
      .to(state, { value: 50, duration: 0.18, onUpdate: () => { this.rotate(0, state.value) } })
      .to(state, { value: -25, duration: 0.12, onUpdate: () => { this.rotate(0, state.value) } })
      .to(state, { value: 0, duration: 0.16, onUpdate: () => { this.rotate(0, state.value) } })


    // tl.to(this.host, { rotateX: this.currentRotateX - 40, duration: 0.15, ease, overwrite })
    //   .to(this.host, { rotateX: this.currentRotateX + 20, duration: 0.2, ease, overwrite })
    //   .to(this.host, { rotateX: this.currentRotateX - 20, duration: 0.15, ease, overwrite })
    //   .to(this.host, { rotateX: this.currentRotateX + 5, duration: 0.2, ease, overwrite })
    //   .to(this.host, { rotateX: this.currentRotateX, duration: 0.3, ease, overwrite })
    // this.agreePart(this.headEl, this.headOffsetY)
    // this.agreePart(this.eyesEl, this.eyesOffsetY)
    // this.agreePart(this.mouthEl, this.mouthOffsetY)
    // this.agreePart(this.gadgetEl, this.gadgetOffsetY)
    // this.agreePart(this.handEl, this.handOffsetY)
    // this.agreePart(this.eyebrowsEl, this.eyebrowsOffsetY)
    // this.agreePart(this.earsEl, this.earsOffsetY)

    // this.svgPartState('mouth', 'default')
    // gsap.to(this.mouthEl,
    //   {
    //     scaleY: 0.5, transformOrigin: '50% 50%',
    //     onComplete: () => {
    //       // this.svgPartState('mouth', 'default')
    //       this.svgPartState('mouth', 'smile')
    //       gsap.to(this.mouthEl,
    //         {
    //           scaleY: 1, transformOrigin: '50% 50%',
    //           duration: 0.2,
    //           ease: 'expo.inOut',
    //         },
    //       )
    //     },
    //     duration: 0.75,
    //     ease: 'expo.inOut',
    //   },
    // )

    return new Promise(resolve => setTimeout(resolve, duration))
  }



  // private setSmileAnimation = (): Promise<void> => {
  //   // Interrompi temporaneamente le rotazioni automatiche
  //   const duration = 1700
  //   const wasFollowingMouse = this.isFollowingMouse
  //   if (wasFollowingMouse) {
  //     this.isFollowingMouse = false
  //   }
  //   gsap.killTweensOf(this.svgRootEl)
  //   gsap.fromTo(this.mouthEl,
  //     {
  //       attr: { d: this.mouthGeometry.happy },
  //       transformOrigin: '50% 50%',
  //     }, {
  //       scaleY: 0.75,
  //       duration: 0.15,
  //       ease: 'expo.inOut',
  //       onComplete: () => {
  //         gsap.to(this.mouthEl, { scaleY: 1, duration: 0.15 })
  //         gsap.to(this.mouthEl, { scaleY: 0.75, duration: 0.15, delay:0.30 })
  //         gsap.to(this.mouthEl, { scaleY: 1, duration: 0.15, delay:0.45 })
  //         gsap.to(this.mouthEl, { scaleY: 0.75, duration: 0.15, delay:0.60 })
  //         gsap.to(this.mouthEl, { scaleY: 1, duration: 0.15, delay:0.75 })
  //         gsap.delayedCall(1.2, () => {
  //           gsap.fromTo(this.mouthEl,
  //             {
  //               attr: { d: this.mouthGeometry.smile },
  //               transformOrigin: '50% 50%',
  //               scaleY: 1.5,
  //             }, {
  //               attr: { d: this.mouthGeometry.smile },
  //               scaleY: 1,
  //               duration: 0.5,
  //               ease: 'expo.out',
  //             },
  //           )
  //         })
  //       },
  //     },
  //   )

  //   const eyeRightTween = gsap.fromTo(this.eyeRightEl,
  //     {
  //       attr: { d: this.eyeRightGeometry.open },
  //     }, {
  //       attr: { d: this.eyeRightGeometry.close },
  //       translateY: -2.5,
  //       scaleY: 1.5,
  //       onComplete: () => {
  //         gsap.delayedCall(0.25, () => eyeRightTween.reverse())
  //       },
  //       duration: 0.75,
  //       ease: 'expo.inOut',
  //     },
  //   )

  //   const eyeLeftTween = gsap.fromTo(this.eyeLeftEl,
  //     {
  //       attr: { d: this.eyeLeftGeometry.open },
  //     }, {
  //       attr: { d: this.eyeLeftGeometry.close },
  //       translateY: -2.5,
  //       scaleY: 1.5,
  //       onComplete: () => {
  //         gsap.delayedCall(0.25, () => eyeLeftTween.reverse())
  //       },
  //       duration: 0.75,
  //       ease: 'expo.inOut',
  //     },
  //   )

  //   const emojiTween = gsap.to(this.svgRootEl,
  //     {
  //       translateY: `-=${this.svgRootEl.getBoundingClientRect().height / 10}`,
  //       scaleX: 0.9,
  //       duration: 0.5,
  //       ease: 'expo.inOut',
  //       onComplete: () => {
  //         gsap.delayedCall(0.5, () => {
  //           emojiTween.reverse()
  //         })
  //       },
  //     },
  //   )

  //   return new Promise(resolve => setTimeout(resolve, duration))
  // }



  // private setDisagreeAnimation = (turnHappyDelay: number = 0): void => {
  // // Interrompi temporaneamente le rotazioni automatiche
  //   gsap.killTweensOf(this.svgRootEl)
  //   const wasFollowingMouse = this.isFollowingMouse
  //   if (wasFollowingMouse) {
  //     this.isFollowingMouse = false
  //   }

  //   const tl = gsap.timeline({
  //     onComplete: () => {
  //     // Torna alla posizione seguita dal mouse
  //       gsap.to(this.svgRootEl, {
  //         rotateX: this.currentRotateX,
  //         rotateY: this.currentRotateY,
  //         duration: 0.3,
  //         ease: 'power2.out',
  //         onComplete: () => {
  //           if (wasFollowingMouse) {
  //             this.isFollowingMouse = true
  //           }
  //         },
  //       })
  //     },
  //   })

  //   const rotationEase = 'power2.inOut'

  //   tl.to(this.svgRootEl, { rotateY: this.currentRotateY - 40, duration: 0.25, ease: rotationEase })
  //     .to(this.svgRootEl, { rotateY: this.currentRotateY + 30, duration: 0.2, ease: rotationEase })
  //     .to(this.svgRootEl, { rotateY: this.currentRotateY - 20, duration: 0.15, ease: rotationEase })
  //     .to(this.svgRootEl, { rotateY: this.currentRotateY + 10, duration: 0.1, ease: rotationEase })
  //     .to(this.svgRootEl, { rotateY: this.currentRotateY, duration: 0.3, ease: rotationEase })

  //   gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.serious }, duration: 0, ease: 'none', onComplete: () => {
  //     setTimeout(() => {
  //       gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.serious }, duration: 0, ease: 'none', onComplete: () => {
  //         if (turnHappyDelay > 0) {
  //           setTimeout(() => {
  //             gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.smile }, duration: 0, ease: 'none' })
  //           }, turnHappyDelay)
  //         }
  //       } })
  //     }, 1000)
  //   } })
  // }

  private size = (value: number): number => {
    return value * this.emojiOriginalSize / 24
  }

  private setStartThinkingAnimation = (duration: number = 0.5): Promise<void> => {
    if (!this.handEl || this.handEl instanceof NodeList) return new Promise(() => {})

    const ease = 'expo.inOut'
    this.handEl.style.visibility = 'visible'
    gsap.fromTo(this.handEl, {
      scale: 0,
      rotateZ: 45,
      translateX: this.size(-4),
      translateY: this.size(4),
      overwrite: true,
    }, {
      x: this.handOffsetX,
      y: this.handOffsetY,
      scale: 1,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      overwrite: true,
      ease,
      duration,
    })
    this.moveEyesThinkAnimation()
    this.svgPartState('mouth', 'serious')
    this.svgPartState('eyes', 'focused')
    return new Promise(resolve => setTimeout(resolve, duration * 1000))
  }

  private moveEyesThinkAnimation = (): void => {
    const duration = gsap.utils.random(0.15, 0.3, 0.01, true)()
    const ease = 'expo.out'

    const animation = { duration, ease, overwrite: true }
    const maxJitter = this.size(1) // 24px is the base scale of an icon to calculate jitter
    const randomOffsetX = gsap.utils.random(-1, 1, 1) * maxJitter
    const randomOffsetY = gsap.utils.random(-0.5, 1, 0.5) * maxJitter

    gsap.to(this.eyesEl, {
      translateX: randomOffsetX,
      translateY: randomOffsetY,
      ...animation,
      onComplete: () => {
        if (this.isThinking) {
          const nextDelay = gsap.utils.random(0.2, 0.7, 0.1)
          gsap.delayedCall(nextDelay, this.moveEyesThinkAnimation)
        } else {
        // Reset eyes position when not thinking
          gsap.to(this.eyesEl, { x: 0, y:0, ease: 'expo.out', duration: 0.5 })
        }
      } })
  }

  private setStopThinkingAnimation = (duration: number = 0.5): Promise<void> => {
    const ease = 'expo.inOut'
    // this.handEl.style.transformOrigin = '0 100%'
    gsap.to(this.handEl, { scale: 0, rotateZ: 45, translateX: this.size(-4), translateY: this.size(4), ease, duration, overwrite: true })
    gsap.to(this.eyesEl, { translateX: 0, translateY: 0, ease: 'expo.out', duration, overwrite: true })
    this.svgPartState('mouth', 'default')
    this.svgPartState('eyes', 'default')
    return new Promise(resolve => setTimeout(resolve, duration * 1000))
  }

  private randomBlink = (eyesOpened: SVGElement, eyesClosed: SVGElement): gsap.core.Timeline => {
    const blinkDuration = 0.2
    const delay = gsap.utils.random(1, 3, 0.1, true)()
    const animateIn = { ease: 'power2.in', duration: blinkDuration, overwrite: true }
    const animateOut = { ease: 'power2.out', duration: blinkDuration, overwrite: true }

    return gsap.timeline({ delay })
      .to(eyesOpened,
        {
          scaleY: 0.5,
          ...animateIn,
          onComplete: () => {
            eyesOpened.style.visibility = 'hidden'
            gsap.fromTo(eyesClosed,
              { scaleY: 1.5, visibility: 'visible' },
              { scaleY: 1, ...animateOut,
                onComplete: () => {
                  eyesClosed.style.visibility = 'hidden'
                  gsap.fromTo(eyesOpened,
                    { scaleY: 0.75, visibility: 'visible', ...animateIn },
                    { scaleY: 1, ...animateOut },
                  )
                },
              },
            )
          },
        },
        delay,
      )
      .eventCallback('onComplete', () => { this.randomBlink(eyesOpened, eyesClosed) })
  }

  private handleFollowMouse = (e: MouseEvent): void => {
    if (!this.isFollowingMouse) return
    this.mouseX = e.clientX
    this.mouseY = e.clientY
    this.followMouse()
  }

  private followMouse = (): void => {

    const { centerX, centerY } = this.getEmojiCenter()
    let currentMouseX = centerX
    let currentMouseY = centerY

    if (this.isFollowingMouse) {
      currentMouseX = this.mouseX
      currentMouseY = this.mouseY
    }

    const rect = this.host.getBoundingClientRect()

    const deltaX = currentMouseX - centerX
    const deltaY = currentMouseY - centerY

    const percentX = deltaX / (rect.width / 2)
    const percentY = deltaY / (rect.height / 2)

    this.rotate(percentX, percentY)
  }

  private moveHead = (x: number, y: number): void => {

    const { centerX, centerY } = this.getEmojiCenter()
    const rect = this.host.getBoundingClientRect()

    const deltaX = x - centerX
    const deltaY = y - centerY

    const percentX = deltaX / (rect.width / 2)
    const percentY = deltaY / (rect.height / 2)

    this.rotate(percentX, percentY)
  }

  private rotate = (percentX: number, percentY: number): void => {
    const ease = 'power1.out'

    this.currentRotateX = gsap.utils.clamp(- this.expressionAngleMax, this.expressionAngleMax, - percentY * this.expressionAngleMax) // Y invertito
    this.currentRotateY = gsap.utils.clamp(- this.expressionAngleMax, this.expressionAngleMax, percentX * this.expressionAngleMax)
    this.headOffsetX = gsap.utils.clamp(-this.headOffset, this.headOffset, percentX * this.headOffset)
    this.headOffsetY = gsap.utils.clamp(-this.headOffset, this.headOffset, percentY * this.headOffset)
    this.eyesOffsetX = gsap.utils.clamp(-this.eyesOffset, this.eyesOffset, percentX * this.eyesOffset)
    this.eyesOffsetY = gsap.utils.clamp(-this.eyesOffset, this.eyesOffset, percentY * this.eyesOffset)
    this.mouthOffsetX = gsap.utils.clamp(-this.mouthOffset, this.mouthOffset, percentX * this.mouthOffset)
    this.mouthOffsetY = gsap.utils.clamp(-this.mouthOffset, this.mouthOffset, percentY * this.mouthOffset)
    this.handOffsetX = gsap.utils.clamp(-this.handOffset, this.handOffset, percentX * this.handOffset)
    this.handOffsetY = gsap.utils.clamp(-this.handOffset, this.handOffset, percentY * this.handOffset)
    this.headOffsetX = gsap.utils.clamp(-this.headOffset, this.headOffset, percentX * this.headOffset)
    this.headOffsetY = gsap.utils.clamp(-this.headOffset, this.headOffset, percentY * this.headOffset)
    this.gadgetOffsetX = gsap.utils.clamp(-this.gadgetOffset, this.gadgetOffset, percentX * this.gadgetOffset)
    this.gadgetOffsetY = gsap.utils.clamp(-this.gadgetOffset, this.gadgetOffset, percentY * this.gadgetOffset)
    this.eyebrowsOffsetX = gsap.utils.clamp(-this.eyebrowsOffset, this.eyebrowsOffset, percentX * this.eyebrowsOffset)
    this.eyebrowsOffsetY = gsap.utils.clamp(-this.eyebrowsOffset, this.eyebrowsOffset, percentY * this.eyebrowsOffset)
    this.earsOffsetX = gsap.utils.clamp(-this.earsOffset, this.earsOffset, percentX * this.earsOffset)
    this.earsOffsetY = gsap.utils.clamp(-this.earsOffset, this.earsOffset, percentY * this.earsOffset)

    if (!this.headEl) {
      this.headEl = this.svgPartState('head')
      this.eyebrowsEl = this.svgPartState('eyebrows')
      this.earsEl = this.svgPartState('ears')
      this.eyesEl = this.svgPartState('eyes')
      this.handEl = this.svgPartState('hand', 'think')
      if (this.handEl) (this.handEl as SVGElement).style.visibility = 'hidden'
      this.mouthEl = this.svgPartState('mouth')
      this.gadgetEl = this.svgPartState('gadget')
    }

    gsap.to(this.host, {
      rotateX: this.currentRotateX,
      rotateY: this.currentRotateY,
      transformOrigin: '50% 50%',
      duration: this.expressionFollowMouseHeadDuration,
      ease,
    })

    if (this.eyesEl) {
      gsap.to(this.eyesEl, {
        x: this.eyesOffsetX,
        y: this.eyesOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }

    if (this.handEl) {
      gsap.to(this.handEl, {
        x: this.handOffsetX,
        y: this.handOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }

    if (this.headEl) {
      gsap.to(this.headEl, {
        x: this.headOffsetX,
        y: this.headOffsetY,
        transformOrigin: '0% 100%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }

    if (this.mouthEl) {
      gsap.to(this.mouthEl, {
        x: this.mouthOffsetX,
        y: this.mouthOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }

    if (this.gadgetEl) {
      gsap.to(this.gadgetEl, {
        x: this.gadgetOffsetX,
        y: this.gadgetOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }

    if (this.eyebrowsEl) {
      gsap.to(this.eyebrowsEl, {
        x: this.eyebrowsOffsetX,
        y: this.eyebrowsOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }

    if (this.earsEl) {
      gsap.to(this.earsEl, {
        x: this.earsOffsetX,
        y: this.earsOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
        overwrite: false,
      })
    }
  }

  render () {
    return <Host></Host>
  }
}
