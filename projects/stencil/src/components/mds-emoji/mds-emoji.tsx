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

  private isFollowingMouse: boolean = false
  private mouseX: number = 0
  private mouseY: number = 0

  private blinking: boolean = false
  private blinkTimeout: NodeJS.Timeout

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

  private monthGeometry = {
    open: 'M12 18C10.8954 18 10 16.8807 10 15.5C10 14.1193 10.8954 13 12 13C13.1046 13 14 14.1193 14 15.5C14 16.8807 13.1046 18 12 18Z',
    sad: 'M8 17C8 15.3431 9.79086 14 12 14C14.1402 14 15.8881 15.2605 15.9951 16.8457L16 17L8 17Z',
    serious: 'M9 15H15V17H9V15Z',
    smile: 'M16.707 15.707C15.4771 16.937 13.6985 17.5 12 17.5C10.3015 17.5 8.52294 16.937 7.29297 15.707L8.70703 14.293C9.47706 15.063 10.6985 15.5 12 15.5C13.3015 15.5 14.5229 15.063 15.293 14.293L16.707 15.707Z',
    smileLeft: 'M10 14C10 15.1046 10.8954 16 12 16H14V18H12C9.79086 18 8 16.2091 8 14H10Z',
    smileRight: 'M14 14C14 15.1046 13.1046 16 12 16H10V18H12C14.2091 18 16 16.2091 16 14H14Z',
  }

  @Method()
  async startBlinking (): Promise<void> {
    if (this.blinking) return
    this.blinking = true
    this.queueNextBlink()
  }

  @Method()
  async stopBlinking (): Promise<void> {
    this.blinking = false
    clearTimeout(this.blinkTimeout)
  }

  private loopBlink = (): void => {
    this.blinkOnce()
    this.queueNextBlink()
  }

  private queueNextBlink = (): void => {
    if (!this.blinking) return
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
  }

  @Method()
  async startFollowMouse (): Promise<void> {
    this.isFollowingMouse = true
    this.followMouse()
  }

  private handleFollowMouse = (e: MouseEvent): void => {
    this.mouseX = e.clientX
    this.mouseY = e.clientY
    this.followMouse()
  }

  private followMouse = (): void => {
    const duration = 0.2
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    let currentMouseX = window.innerWidth / 2
    let currentMouseY = window.innerHeight / 2

    // Normalizza la distanza dal centro (range -1 a 1)
    if (this.isFollowingMouse) {
      currentMouseX = this.mouseX
      currentMouseY = this.mouseY
    }
    const normX = (currentMouseX - centerX) / centerX
    const normY = (currentMouseY - centerY) / centerY
    const clampMargin = 2
    const maxOffset = 3
    const clampedX = Math.max(clampMargin * -1, Math.min(clampMargin, normX))
    const clampedY = Math.max(clampMargin * -1, Math.min(clampMargin, normY))
    const stretchX = 1 - Math.abs(clampedX) * 0.15 // da 1 → 0.95
    const stretchY = 1 - Math.abs(clampedY) * 0.15 // da 1 → 0.95

    // eye
    const eyeOffsetY = clampedY * maxOffset
    const eyeOffsetLeftX = this.getParallaxOffsetX('left', clampedX, maxOffset)
    const eyeOffsetRightX = this.getParallaxOffsetX('right', clampedX, maxOffset)
    gsap.to(this.eyeLeftEl, { x: eyeOffsetLeftX, y: eyeOffsetY, duration })
    gsap.to(this.eyeRightEl, { x: eyeOffsetRightX, y: eyeOffsetY, duration })

    // head
    const headOffsetX = Math.max(-0.5, Math.min(0.5, normX)) * 2
    const headOffsetY = Math.max(-0.5, Math.min(0.5, normY)) * 2
    gsap.to(this.head, {
      x: headOffsetX, y: headOffsetY,
      scaleX: stretchX,
      scaleY: stretchY,
      transformOrigin: '50% 50%',
      duration,
    })

    // mouth
    const mouthOffsetX = Math.max(-1, Math.min(1, normX)) * 2
    const mouthOffsetY = Math.max(-1, Math.min(1, normY)) * 2
    gsap.to(this.mouth, {
      x: mouthOffsetX, y: mouthOffsetY,
      scaleX: stretchX, scaleY: stretchY,
      transformOrigin: '50% 50%',
      duration,
    })
  }

  private getParallaxOffsetX = (eye: 'left' | 'right', eyeClampedX: number, maxOffset: number): number => {
    const eyeOffsetX = eyeClampedX * maxOffset
    const distanceMin = 0.6
    const distanceMax = 1.2
    let factor: number
    if (eye === 'right') {
      factor = eyeClampedX >= 0 ? distanceMin : distanceMax // se il mouse è a destra, sinistro si muove poco
    } else {
      factor = eyeClampedX >= 0 ? distanceMax : distanceMin // se il mouse è a destra, destro si muove tanto
    }
    return eyeOffsetX * factor
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
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="head" ref={el => (this.head = el as SVGElement)} d={this.headGeometry.hexagonRounded} fill="black"/>
          <path class="eye" ref={el => (this.eyeLeftEl = el as SVGElement)} d={this.eyeLeftGeometry.open} fill="white"/>
          <path class="eye" ref={el => (this.eyeRightEl = el as SVGElement)} d={this.eyeRightGeometry.open} fill="white"/>
          <path class="mouth" ref={el => (this.mouth = el as SVGElement)} d={this.monthGeometry.smile} fill="white"/>
        </svg>
      )
      }
    </Host>
  }
}
