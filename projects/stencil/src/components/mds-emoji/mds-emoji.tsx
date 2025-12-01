import { Component, Host, h, Method, Prop, Element, Watch } from '@stencil/core'
import { cssRotationToNumber, cssDurationToSeconds, cssSizeToNumber } from '@common/unit'
import type { EmojiNames, SvgDictionary, SvgNode, SvgPart } from './meta/types'
import { gsap } from 'gsap'
import { randomNumber } from '@common/number'

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

  private isFollowingMouse: boolean = false
  private isBlinking: boolean = false
  // private isThinking: boolean = false
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
  private blinkTimeout: NodeJS.Timeout

  private currentRotateX: number = 0
  private currentRotateY: number = 0
  private expressionAngleMax: number = 16 // massimo angolo di rotazione della emoji
  private expressionFollowMouseHeadDuration: number = 0.3 // durata dell'animazione di rotazione della testa quando segue il mouse
  private expressionFollowMouseTraitsDuration: number = 0.2 // durata dell'animazione di rotazione degli occhi e della bocca quando segue il mouse

  private eyesEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>
  private gadgetEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>
  private handEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>
  private eyebrowsEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>
  private headEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>
  private earsEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>
  private mouthEl: SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement>

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

  // /**
  //  * @returns Promise<void>
  //  * Emoji agrees, useful for confirm actions.
  //  */

  // @Method()
  // async agree (): Promise<void> {
  //   this.stopConcurrentAnimations()
  //   await this.setAgreeAnimation()
  //   return Promise.resolve()
  // }

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

  // /**
  //  * @returns Promise<void>
  //  * Emoji start thinking, useful for pending requests.
  //  */

  // @Method()
  // async startThinking (duration: number = 0.5): Promise<void> {
  //   this.isThinking = true
  //   await this.setStartThinkingAnimation(duration)
  //   return Promise.resolve()
  // }

  // @Method()
  // async stopThinking (duration: number = 0.5): Promise<void> {
  //   this.isThinking = false
  //   await this.setStopThinkingAnimation(duration)
  //   return Promise.resolve()
  // }

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

  private getSvgElement = (idSelector: string): SvgNode | null =>
    this.svgRootEl.querySelector(`#${idSelector}`) as SvgNode | null

  private updateSvgDictionary = (emoji: EmojiNames) => {
    if (typeof window === 'undefined') return
    const tpl = document.createElement('template')
    tpl.innerHTML = this.svgLibrary[emoji].trim()
    this.svgRootEl = tpl.content.firstElementChild as SVGElement
    // this.populateSvgDictionary()
    // this.initializeVisibility()
    this.updateCSSCustomProps()
    if (this.host.shadowRoot) this.host.shadowRoot.innerHTML = this.svgRootEl.outerHTML
  }

  private svgPartState<K extends keyof SvgDictionary> (part: K, state?: keyof SvgPart): SVGElement | SVGGElement | NodeListOf<SVGElement | SVGGElement> {
    const group = this.host.shadowRoot?.firstElementChild?.querySelectorAll(`[id^='${part}-']`) as NodeListOf<SVGElement | SVGGElement>
    if (!state && group) return group
    let element: SVGElement | SVGGElement = this.host.shadowRoot?.firstElementChild?.querySelector(`[id='${part}-default']`) as SVGElement | SVGGElement
    group?.forEach((el: SVGElement | SVGGElement) => {
      if (el.id.split('-')[1] === state) {
        element = el
      }
    })
    return element
  }

  private getEmojiCenter = (): { centerX: number, centerY: number } => {
    const rect = this.host.getBoundingClientRect()
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    }
  }

  // private stopConcurrentAnimations = (): void => {
  //   if (this.isThinking) {
  //     this.stopThinking()
  //   }
  // }



  // private setAgreeAnimation = (): Promise<void> => {
  //   // Interrompi temporaneamente le rotazioni automatiche
  //   const duration = 1000
  //   const wasFollowingMouse = this.isFollowingMouse
  //   if (wasFollowingMouse) {
  //     this.isFollowingMouse = false
  //   }
  //   gsap.killTweensOf(this.svgRootEl)

  //   const baseX = this.currentRotateX

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

  //   tl.to(this.svgRootEl, { rotateX: baseX - 40, duration: 0.15, ease: 'power2.out' })
  //     .to(this.svgRootEl, { rotateX: baseX + 20, duration: 0.2, ease: 'power1.inOut' })
  //     .to(this.svgRootEl, { rotateX: baseX - 20, duration: 0.15, ease: 'power2.inOut' })
  //     .to(this.svgRootEl, { rotateX: baseX + 5, duration: 0.2, ease: 'power1.out' })
  //     .to(this.svgRootEl, { rotateX: baseX, duration: 0.3, ease: 'power3.out' })

  //   this.svgPartState('mouth', 'default')
  //   this.mouthEl = this.svgElementsDictionary.mouth.default as SVGElement
  //   gsap.fromTo(this.mouthEl,
  //     {
  //       scaleY: 0.5, transformOrigin: '50% 50%',
  //       onComplete: () => {
  //         this.svgPartState('mouth', 'default')
  //         this.mouthEl = this.svgElementsDictionary.mouth.smile as SVGElement
  //         gsap.fromTo(this.mouthEl,
  //           {
  //             scaleY: 1, transformOrigin: '50% 50%',
  //             duration: 0.2,
  //             ease: 'expo.inOut',
  //           },
  //         )
  //       },
  //       duration: 0.75,
  //       ease: 'expo.inOut',
  //     },
  //   )

  //   return new Promise(resolve => setTimeout(resolve, duration))
  // }



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



  // private moveEyesThinkAnimation = (): void => {
  //   const duration = randomNumber(0.25, 0.75) // Random duration between 0.5 and 1
  //   const ease = 'expo.Out'

  //   const maxJitter = 1 // max +-2 px jitter
  //   const randomOffsetX = randomNumber(-1, 1, true) * maxJitter
  //   // const randomOffsetY = randomNumber(-0.5, 1) * maxJitter

  //   const finalX = (this.faceOffsetX ?? 0) + randomOffsetX
  //   // const finalY = (this.faceOffsetY ?? 0) + randomOffsetY

  //   gsap.to(this.eyeLeftEl, { x: finalX, ease, duration })
  //   gsap.to(this.eyeRightEl, { x: finalX, ease, duration, onComplete: () => {
  //     if (this.isThinking) {
  //       this.moveEyesThinkAnimation()
  //     } else {
  //       // Reset eyes position when not thinking
  //       gsap.to(this.eyeLeftEl, { x: 0, ease: 'expo.inOut', duration: 0.5 })
  //       gsap.to(this.eyeRightEl, { x: 0, ease: 'expo.inOut', duration: 0.5 })
  //     }
  //   } })
  // }

  // private setStartThinkingAnimation = (duration: number = 0.5): Promise<void> => {
  //   const ease = 'expo.inOut'
  //   this.handLeftEl.style.visibility = 'visible'
  //   gsap.fromTo(this.handLeftEl, { scale: 0, rotateZ: 45 }, { scale: 1, rotateZ: 0, ease, duration })
  //   this.moveEyesThinkAnimation()
  //   gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.think }, duration: 0, ease: 'none' })
  //   return new Promise(resolve => setTimeout(resolve, duration * 1000))
  // }

  // private setStopThinkingAnimation = (duration: number): Promise<void> => {
  //   const ease = 'expo.inOut'
  //   gsap.to(this.handLeftEl, { scale: 0, y: 0, rotateZ: 45, ease, duration })
  //   gsap.to(this.eyeLeftEl, { x: 0, ease: 'expo.inOut', duration })
  //   gsap.to(this.eyeRightEl, { x: 0, ease: 'expo.inOut', duration })
  //   gsap.to(this.mouthEl, { attr: { d: this.mouthGeometry.smile }, duration: 0, ease: 'none' })
  //   return new Promise(resolve => setTimeout(resolve, duration * 1000))
  // }

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

    const eyesOpened = this.svgPartState('eyes', 'default') as SVGElement
    const eyesClosed = this.svgPartState('eyes', 'closed') as SVGElement

    gsap.to(eyesOpened,
      {
        duration: durationClose,
        ease: 'expo.in',
        scaleY: 0.5,
        // transformOrigin: '50% 50%',
        onComplete: () => {
          eyesOpened.style.visibility = 'hidden'
          eyesClosed.style.visibility = 'visible'
          gsap.fromTo(eyesClosed,
            {
              scaleY: 0.75,
              // transformOrigin: '50% 50%',
            }, {
              duration: durationOpen,
              ease: 'expo.out',
              scaleY: 1,
              // transformOrigin: '50% 50%',
              onComplete: () => {
                eyesOpened.style.visibility = 'visible'
                eyesClosed.style.visibility = 'hidden'
                gsap.fromTo(eyesOpened,
                  {
                    scaleY: 0.75,
                    // transformOrigin: '50% 50%',
                  }, {
                    scaleY: 1,
                    ease: 'expo.out',
                    // transformOrigin: '50% 50%',
                    duration: durationOpen,
                  },
                )
              },
            },
          )
        },
      },
    )
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

    this.headEl = this.svgPartState('head')
    this.eyebrowsEl = this.svgPartState('eyebrows')
    this.earsEl = this.svgPartState('ears')
    this.eyesEl = this.svgPartState('eyes')
    this.handEl = this.svgPartState('hand', 'think')
    this.mouthEl = this.svgPartState('mouth')
    this.gadgetEl = this.svgPartState('gadget')

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
      })
    }

    if (this.handEl) {
      gsap.to(this.handEl, {
        x: this.handOffsetX,
        y: this.handOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
      })
    }

    if (this.headEl) {
      gsap.to(this.headEl, {
        x: this.headOffsetX,
        y: this.headOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
      })
    }

    if (this.mouthEl) {
      gsap.to(this.mouthEl, {
        x: this.mouthOffsetX,
        y: this.mouthOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
      })
    }

    if (this.gadgetEl) {
      gsap.to(this.gadgetEl, {
        x: this.gadgetOffsetX,
        y: this.gadgetOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
      })
    }

    if (this.eyebrowsEl) {
      gsap.to(this.eyebrowsEl, {
        x: this.eyebrowsOffsetX,
        y: this.eyebrowsOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
      })
    }

    if (this.earsEl) {
      gsap.to(this.earsEl, {
        x: this.earsOffsetX,
        y: this.earsOffsetY,
        transformOrigin: '50% 50%',
        duration: this.expressionFollowMouseTraitsDuration,
        ease,
      })
    }
  }

  render () {
    return <Host></Host>
  }
}
