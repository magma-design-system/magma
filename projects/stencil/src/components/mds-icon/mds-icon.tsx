import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: true,
})
export class MdsIcon {
  @Prop() name: string = 'franco';

  @Event() myName: EventEmitter<string>;

  myNameHandler() {
    this.myName.emit(this.name);
  }

  render() {
    return (
      <Host>
        Mio nome essere {this.name}
        <slot></slot>
        <button onClick={this.myNameHandler}>Cliccami</button>
      </Host>
    );
  }

}
