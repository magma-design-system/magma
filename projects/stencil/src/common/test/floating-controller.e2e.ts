import { FloatingController, HTMLFloatingElement } from '@common/floating-controller';
import { onTestFinished } from 'vitest';

// native callers: the wiring waits only for an mds-* caller to load, so here it runs on the spot
const stage = (): { box: HTMLElement; host: HTMLFloatingElement } => {
  const box = document.createElement('div');
  box.innerHTML =
    '<button id="first">First</button><button id="second">Second</button><div id="panel"></div>';
  document.body.append(box);
  onTestFinished(() => box.remove());
  const host = box.querySelector('#panel') as unknown as HTMLFloatingElement;
  host.visible = false;
  return { box, host };
};

describe('FloatingController.updateCaller', () => {
  // #527: it threw "Target not found", which stopped the lifecycle of the component that asked
  it('answers null for a target that names nothing, and does not throw', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { host } = stage();
    const controller = new FloatingController(host);
    let caller: HTMLElement | null | undefined;

    expect(() => {
      caller = controller.updateCaller('#nope');
    }).not.toThrow();

    expect(caller).toBeNull();
    // the target may be absent for good reasons (a server render holds only the component)
    expect(warn).toHaveBeenCalledWith('FloatingController: target not found: #nope');
    // a popup without a caller is left as it was
    expect(host).not.toHaveAttribute('role');
  });

  it('wires the caller once the target names one', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { box, host } = stage();
    const controller = new FloatingController(host);

    controller.updateCaller('#nope');
    const caller = controller.updateCaller('#first');

    expect(caller).toBe(box.querySelector('#first'));
    expect(caller).toHaveAttribute('aria-controls', 'panel');
    expect(host).toHaveAttribute('aria-labelledby', 'first');
  });

  it('takes back the label of a caller wired twice when the target moves on', () => {
    const { host } = stage();
    const controller = new FloatingController(host);

    // the same caller again: what a dropdown moved in the page does when it comes back
    controller.updateCaller('#first');
    controller.updateCaller('#first');
    controller.updateCaller('#second');

    expect(host).toHaveAttribute('aria-labelledby', 'second');
  });
});
