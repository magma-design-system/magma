import { render, vi } from '@stencil/vitest';
import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    // defined in vitest.config.mts, run in Node
    emulateReducedMotion: (motion: 'reduce' | 'no-preference' | null) => Promise<void>;
  }
}

const dot = (root: HTMLElement): HTMLElement => root.shadowRoot!.querySelector('.dot')!;

const dotText = (root: HTMLElement): string => dot(root).textContent ?? '';

describe('mds-notification', () => {
  it('renders', async () => {
    const { root } = await render(`<mds-notification target="#my-button"></mds-notification>
    <mds-button id="my-button">Incoming messages</mds-button>`);

    expect(root).toHaveAttribute('hydrated');
  });

  it('does not warn without a target, as in the notification slot of mds-button', async () => {
    const consoleWarn = vi.spyOn(console, 'warn');
    const { root, waitForChanges } = await render(
      '<mds-button>Inbox<mds-notification slot="notification" value="5"></mds-notification></mds-button>',
    );
    await waitForChanges();

    expect(root.querySelector('mds-notification')).toHaveAttribute('strategy', 'disabled');
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('hides a dismissed badge placed by its container', async () => {
    const { root, waitForChanges } = await render(
      '<mds-button>Inbox<mds-notification slot="notification" value="5" dismissed></mds-notification></mds-button>',
    );
    const notification = root.querySelector('mds-notification')!;
    await waitForChanges();
    expect(getComputedStyle(notification).display).toBe('none');

    notification.dismissed = false;
    await waitForChanges();
    expect(getComputedStyle(notification).display).not.toBe('none');
  });

  it('shows the value again once the max attribute is removed', async () => {
    const { root, waitForChanges } = await render(
      '<mds-notification value="15" max="9" strategy="disabled"></mds-notification>',
    );
    expect(dotText(root)).toBe('+9');

    root.removeAttribute('max');
    await waitForChanges();

    expect(dotText(root)).toBe('15');
  });

  it('shows nothing once the value attribute is removed', async () => {
    const { root, waitForChanges } = await render(
      '<mds-notification value="5" strategy="disabled"></mds-notification>',
    );

    root.removeAttribute('value');
    await waitForChanges();

    expect(dotText(root)).toBe('');
  });

  // the host had a CSS selector in aria-labelledby and an aria-label on no role: nothing reached
  // a screen reader through the element the badge sits on (#821)
  describe('the count', () => {
    const stage = (attributes: string, callerAttributes = '') =>
      render(
        `<div><button id="inbox" ${callerAttributes}>Inbox</button><mds-notification target="#inbox" ${attributes}></mds-notification></div>`,
      );

    it('describes the element it sits on, and leaves the page reading of the badge out', async () => {
      const { root } = await stage('value="3"');
      const badge = root.querySelector('mds-notification')!;
      const inbox = root.querySelector('#inbox')!;

      await vi.waitFor(() => expect(inbox).toHaveAttribute('aria-describedby'));

      expect(inbox.getAttribute('aria-describedby')).toBe(badge.id);
      expect(badge).toEqualAttribute('aria-hidden', 'true');
      expect(badge).not.toHaveAttribute('aria-label');
      expect(badge).not.toHaveAttribute('aria-labelledby');
      expect(dotText(badge)).toBe('3');
    });

    it('keeps the descriptions the element already had', async () => {
      const { root } = await stage('value="3"', 'aria-describedby="hint"');
      const badge = root.querySelector('mds-notification')!;
      const inbox = root.querySelector('#inbox')!;

      await vi.waitFor(() =>
        expect(inbox.getAttribute('aria-describedby')).toBe(`hint ${badge.id}`),
      );
    });

    it('describes nothing while dismissed or a plain dot, and again once it counts', async () => {
      const { root, waitForChanges } = await stage('value="3"');
      const badge = root.querySelector('mds-notification')!;
      const inbox = root.querySelector('#inbox')!;
      await vi.waitFor(() => expect(inbox).toHaveAttribute('aria-describedby'));

      badge.dismissed = true;
      await waitForChanges();
      expect(inbox).not.toHaveAttribute('aria-describedby');

      badge.dismissed = false;
      badge.value = 0;
      await waitForChanges();
      expect(inbox).not.toHaveAttribute('aria-describedby');
      expect(badge).not.toHaveAttribute('aria-hidden');

      badge.value = 7;
      await waitForChanges();
      expect(inbox.getAttribute('aria-describedby')).toBe(badge.id);
    });

    it('takes its description back when it leaves the page', async () => {
      const { root } = await stage('value="3"');
      const inbox = root.querySelector('#inbox')!;
      await vi.waitFor(() => expect(inbox).toHaveAttribute('aria-describedby'));

      root.querySelector('mds-notification')!.remove();

      expect(inbox).not.toHaveAttribute('aria-describedby');
    });

    it('is plain text without a target, read with what contains it', async () => {
      const { root, waitForChanges } = await render(
        '<mds-notification value="5" strategy="disabled"></mds-notification>',
      );
      await waitForChanges();

      expect(root).not.toHaveAttribute('aria-hidden');
      expect(root.shadowRoot!.querySelector('.dot')).not.toHaveAttribute('aria-hidden');
    });
  });
});

// floating-ui's cleanup was replaced by an empty function instead of being called: every
// badge ever removed kept its scroll listeners on the page (#823)
describe('mds-notification leaving the page', () => {
  it('stops following its target', async () => {
    const { root } = await render(
      '<div><button id="bell">Bell</button><mds-notification target="#bell" value="2"></mds-notification></div>',
    );
    const badge = root.querySelector('mds-notification')!;
    // floating-ui starts after a short wait for the layout of the target
    await new Promise((resolve) => setTimeout(resolve, 200));
    const remove = vi.spyOn(window, 'removeEventListener');

    badge.remove();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});

// the line of the new items of a list wants a dot in the info colour that pulses three times
// when the count grows: the dot had the danger colour only, and no pulse (#1216)
describe('mds-notification variant', () => {
  const html = document.documentElement;

  afterEach(() => {
    html.removeAttribute('style');
  });

  it.each([
    { variant: 'error', hue: 'danger' },
    { variant: 'info', hue: 'info' },
    { variant: 'success', hue: 'success' },
    { variant: 'warning', hue: 'warning' },
  ])(
    'paints the $variant dot with the fill of the $hue status and its ink',
    async ({ variant, hue }) => {
      html.style.setProperty(`--magma-${hue}-emphasis`, '1 2 3');
      html.style.setProperty(`--magma-${hue}-on-emphasis`, '4 5 6');
      const { root } = await render(
        `<mds-notification variant="${variant}" value="3" strategy="disabled"></mds-notification>`,
      );

      expect(getComputedStyle(dot(root)).backgroundColor).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(dot(root)).color).toBe('rgb(4, 5, 6)');
    },
  );

  it('is the danger colour it always had by default', async () => {
    html.style.setProperty('--magma-danger-emphasis', '1 2 3');
    const { root } = await render(
      '<mds-notification value="3" strategy="disabled"></mds-notification>',
    );

    expect(root).toEqualAttribute('variant', 'error');
    expect(getComputedStyle(dot(root)).backgroundColor).toBe('rgb(1, 2, 3)');
  });
});

describe('mds-notification pulse', () => {
  const html = document.documentElement;

  const pulses = (root: HTMLElement): CSSAnimation[] =>
    dot(root)
      .getAnimations()
      .filter(
        (animation): animation is CSSAnimation =>
          (animation as CSSAnimation).animationName === 'notification-pulse',
      );

  const pulsing = (root: HTMLElement): boolean => dot(root).classList.contains('pulse');

  // in a line of text, where the line of the new items puts it: no target
  const stage = (attributes = 'pulse') =>
    render<HTMLMdsNotificationElement>(
      `<mds-notification variant="info" value="1" ${attributes}></mds-notification>`,
    );

  it('does not pulse on the first render', async () => {
    const { root, waitForChanges } = await stage();
    await waitForChanges();

    expect(root).toEqualAttribute('strategy', 'disabled');
    expect(pulsing(root)).toBe(false);
    expect(pulses(root)).toHaveLength(0);
  });

  it('pulses when the value grows, three beats and then still', async () => {
    const { root, waitForChanges } = await stage();

    root.value = 2;
    await waitForChanges();

    const [pulse] = pulses(root);
    expect(pulses(root)).toHaveLength(1);
    const timing = pulse.effect!.getComputedTiming();
    expect(timing.iterations).toBe(3);
    // the three beats end under the 5 seconds after which WCAG 2.2.2 wants a way to stop them
    expect(Number(timing.activeDuration)).toBeGreaterThan(0);
    expect(Number(timing.activeDuration)).toBeLessThanOrEqual(5000);

    // to the end of the third beat: finish() would not fire the animationend that ends it
    pulse.currentTime = Number(timing.activeDuration) - 10;
    await vi.waitFor(() => expect(pulsing(root)).toBe(false));
    expect(pulses(root)).toHaveLength(0);

    // still, until the count grows again
    root.value = 3;
    await waitForChanges();
    expect(pulses(root)).toHaveLength(1);
  });

  it('does not start over when the value grows while it pulses', async () => {
    const { root, waitForChanges } = await stage();
    root.value = 2;
    await waitForChanges();
    const [pulse] = pulses(root);
    pulse.currentTime = 1500;

    root.value = 3;
    await waitForChanges();

    expect(pulses(root)).toEqual([pulse]);
    expect(Number(pulse.currentTime)).toBeGreaterThanOrEqual(1500);
  });

  it('stays still when the value goes down', async () => {
    const { root, waitForChanges } = await stage('pulse value="3"');

    root.value = 0;
    await waitForChanges();

    expect(pulsing(root)).toBe(false);
    expect(pulses(root)).toHaveLength(0);
  });

  it('stays still without pulse', async () => {
    const { root, waitForChanges } = await stage('');

    root.value = 2;
    await waitForChanges();

    expect(pulsing(root)).toBe(false);
    expect(pulses(root)).toHaveLength(0);
  });

  it('stops once pulse is taken off, and keeps still when it comes back', async () => {
    const { root, waitForChanges } = await stage();
    root.value = 2;
    await waitForChanges();
    expect(pulses(root)).toHaveLength(1);

    root.removeAttribute('pulse');
    await waitForChanges();
    await vi.waitFor(() => expect(pulsing(root)).toBe(false));

    root.setAttribute('pulse', '');
    await waitForChanges();
    expect(pulses(root)).toHaveLength(0);
  });

  describe('with a reduced animation', () => {
    // the class and the emulated media live on the page, so they would outlive this file
    afterEach(async () => {
      html.classList.remove('pref-animation-reduce');
      await commands.emulateReducedMotion(null);
    });

    it('does not pulse with the animation preference set to reduce', async () => {
      html.classList.add('pref-animation-reduce');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { root, waitForChanges } = await stage();
      expect(root).toEqualAttribute('pref-animation', 'reduce');

      root.value = 2;
      await waitForChanges();

      expect(pulsing(root)).toBe(false);
      expect(pulses(root)).toHaveLength(0);
    });

    it('does not pulse with a reduced motion of the system', async () => {
      await commands.emulateReducedMotion('reduce');
      const { root, waitForChanges } = await stage();

      root.value = 2;
      await waitForChanges();

      expect(pulsing(root)).toBe(false);
      expect(pulses(root)).toHaveLength(0);
    });

    it('ends a pulse that is playing when the preference turns to reduce', async () => {
      const { root, waitForChanges } = await stage();
      root.value = 2;
      await waitForChanges();
      expect(pulses(root)).toHaveLength(1);

      html.classList.add('pref-animation-reduce');

      await vi.waitFor(() => expect(pulsing(root)).toBe(false));
      expect(pulses(root)).toHaveLength(0);
    });
  });
});
