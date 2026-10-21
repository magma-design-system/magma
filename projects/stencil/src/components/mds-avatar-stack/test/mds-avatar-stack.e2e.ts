import { render, vi } from '@stencil/vitest';

const overflow = (stack: HTMLElement): string | null | undefined =>
  stack.shadowRoot!.querySelector('mds-avatar-stack-item')?.getAttribute('count');

describe('mds-avatar-stack', () => {
  it('renders', async () => {
    const { root } = await render('<mds-avatar-stack></mds-avatar-stack>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #826: the avatars were counted once, on load, so the overflow kept counting the ones added
  // later
  it('counts the avatars added and removed after load in the overflow', async () => {
    const { root } = await render(`
      <mds-avatar-stack total="5">
        <mds-avatar-stack-item initials="AB"></mds-avatar-stack-item>
        <mds-avatar-stack-item initials="CD"></mds-avatar-stack-item>
      </mds-avatar-stack>
    `);
    expect(overflow(root)).toBe('3');

    const avatar = document.createElement('mds-avatar-stack-item');
    avatar.setAttribute('initials', 'EF');
    root.appendChild(avatar);
    await vi.waitFor(() => expect(overflow(root)).toBe('2'));

    avatar.remove();
    await vi.waitFor(() => expect(overflow(root)).toBe('3'));
  });
});
