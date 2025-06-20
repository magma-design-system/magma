import { Component, Host, h, Method, Prop, Element } from '@stencil/core'
import { gsap } from 'gsap'

@Component({
  tag: 'mds-emoji',
  styleUrl: 'mds-emoji.css',
  shadow: true,
})
export class MdsEmoji {
  @Element() host: HTMLMdsEmojiElement
  @Prop({ reflect: true }) readonly name: string = 'hexabot'

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

  private mouseX: number = 0
  private mouseY: number = 0
  private blinkTimeout: NodeJS.Timeout

  private currentRotateX: number = 0
  private currentRotateY: number = 0

  private emojiEl: SVGElement
  private eyeLeftEl: SVGElement
  private eyeRightEl: SVGElement
  private mouth: SVGElement
  private head: SVGElement

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

  @Method()
  async agree (): Promise<void> { // eslint-disable-line @typescript-eslint/ban-types
    this.setAgreeAnimation()
    return Promise.resolve()
  }

  private setAgreeAnimation = (): void => {
  // Interrompi temporaneamente le rotazioni automatiche
    this.isFollowingMouse = false
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
            this.isFollowingMouse = true
          },
        })
      },
    })

    tl.to(this.emojiEl, { rotateX: baseX - 40, duration: 0.15, ease: 'power2.out' })
      .to(this.emojiEl, { rotateX: baseX + 20, duration: 0.2, ease: 'power1.inOut' })
      .to(this.emojiEl, { rotateX: baseX - 20, duration: 0.15, ease: 'power2.inOut' })
      .to(this.emojiEl, { rotateX: baseX + 5, duration: 0.2, ease: 'power1.out' })
      .to(this.emojiEl, { rotateX: baseX, duration: 0.3, ease: 'power3.out' })

    gsap.fromTo(this.mouth,
      {
        attr: { d: this.mouthGeometry.happy },
      }, {
        scaleY: 0.5, transformOrigin: '50% 50%',
        onComplete: () => {
          gsap.fromTo(this.mouth,
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
  }

  @Method()
  async startThinking (): Promise<void> { // eslint-disable-line @typescript-eslint/ban-types
    if (this.isFollowingMouse) await this.stopFollowMouse()
    if (this.isBlinking) await this.stopBlinking()
    this.setThinkingAnimation()
    return Promise.resolve()
  }

  private setThinkingAnimation = (): void => {
    const duration = 0.5
    const margin = 2
    const ease = 'expo.inOut'
    gsap.to(this.eyeLeftEl, { attr: { d: this.eyeLeftGeometry.close }, y: `+=${margin}`, onComplete: () => { gsap.to(this.eyeLeftEl, { attr: { d: this.eyeLeftGeometry.open }, y: `-=${margin}` }) }, ease, duration })
    gsap.to(this.eyeRightEl, { attr: { d: this.eyeRightGeometry.close }, y: `+=${margin}`, onComplete: () => { gsap.to(this.eyeRightEl, { attr: { d: this.eyeRightGeometry.open }, y: `-=${margin}` }) }, ease, duration })
    gsap.to(this.head, {
      scaleY: 0.75, transformOrigin: '50% 50%',
      onComplete: () => { gsap.to(this.head, { scaleY: 1, transformOrigin: '50% 50%' }) },
      duration,
      ease,
    })
    gsap.fromTo(this.mouth,
      {
        attr: { d: this.mouthGeometry.happy },
      }, {
        scaleY: 0.5, transformOrigin: '50% 50%',
        onComplete: () => {
          gsap.fromTo(this.mouth,
            {
              attr: { d: this.mouthGeometry.smile },
            }, {
              scaleY: 1, transformOrigin: '50% 50%',
            },
          )
        },
        duration,
        ease,
      },
    )
  }

  @Method()
  async startBlinking (): Promise<void> {
    if (this.isBlinking) return
    this.isBlinking = true
    this.queueNextBlink()
    return Promise.resolve()
  }

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
    const nextDelay = 2000 + Math.random() * 3000 // 2-5s
    this.blinkTimeout = setTimeout(this.loopBlink.bind(this), nextDelay)
  }

  private blinkOnce = (): void => {
    const durationClose = 0.15
    const durationOpen = 0.15
    gsap.to(this.eyeLeftEl, { attr: { d: this.eyeLeftGeometry.close }, duration: durationClose, onComplete: () => { gsap.to(this.eyeLeftEl, { attr: { d: this.eyeLeftGeometry.open }, duration: durationOpen }) } })
    gsap.to(this.eyeRightEl, { attr: { d: this.eyeRightGeometry.close }, duration: durationClose, onComplete: () => { gsap.to(this.eyeRightEl, { attr: { d: this.eyeRightGeometry.open }, duration: durationOpen }) } })
  }

  @Method()
  async stopFollowMouse (): Promise<void> {
    this.isFollowingMouse = false
    this.followMouse()
    return Promise.resolve()
  }

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

    const maxAngle = 12 // massimo angolo di rotazione in gradi

    const deltaX = currentMouseX - centerX
    const deltaY = currentMouseY - centerY

    const percentX = deltaX / (rect.width / 2)
    const percentY = deltaY / (rect.height / 2)

    this.currentRotateY = gsap.utils.clamp(-maxAngle, maxAngle, percentX * maxAngle)
    this.currentRotateX = gsap.utils.clamp(-maxAngle, maxAngle, -percentY * maxAngle) // Y invertito

    gsap.to(this.emojiEl, {
      rotateX: this.currentRotateX,
      rotateY: this.currentRotateY,
      duration: 0.2,
      ease,
    })

    const maxEyeOffset = 1
    const eyeOffsetX = gsap.utils.clamp(-maxEyeOffset, maxEyeOffset, percentX * maxEyeOffset)
    const eyeOffsetY = gsap.utils.clamp(-maxEyeOffset, maxEyeOffset, percentY * maxEyeOffset)

    gsap.to(this.eyeLeftEl, {
      x: eyeOffsetX,
      y: eyeOffsetY,
      duration: 0.16,
      ease,
    })
    gsap.to(this.eyeRightEl, {
      x: eyeOffsetX,
      y: eyeOffsetY,
      duration: 0.16,
      ease,
    })

    const maxMouthOffset = 1
    const mouthOffsetX = gsap.utils.clamp(-maxMouthOffset, maxMouthOffset, percentX * maxMouthOffset)
    const mouthOffsetY = gsap.utils.clamp(-maxMouthOffset, maxMouthOffset, percentY * maxMouthOffset)

    gsap.to(this.mouth, {
      x: mouthOffsetX,
      y: mouthOffsetY,
      duration: 0.15,
      ease,
    })
  }

  componentDidLoad (): void {
    if (!window) return
    window.addEventListener('mousemove', this.handleFollowMouse)
  }

  disconnectedCallback (): void {
    if (!window) return
    window.removeEventListener('mousemove', this.handleFollowMouse)
  }

  render () {
    return <Host>
      { this.name === 'hexabot' && (
        <svg ref={el => (this.emojiEl = el as SVGElement)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="head" ref={el => (this.head = el as SVGElement)} d={this.headGeometry.hexagonRounded} fill="black"/>
          <path class="eye" ref={el => (this.eyeLeftEl = el as SVGElement)} d={this.eyeLeftGeometry.open} fill="white"/>
          <path class="eye" ref={el => (this.eyeRightEl = el as SVGElement)} d={this.eyeRightGeometry.open} fill="white"/>
          <path class="mouth" ref={el => (this.mouth = el as SVGElement)} d={this.mouthGeometry.smile} fill="white"/>
        </svg>)
      }
    </Host>
  }
}
