import { render } from '@stencil/vitest';

describe('mds-input-otp', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-otp></mds-input-otp>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('accessible name', () => {
    it('announces each digit as a position inside the code', async () => {
      const { root } = await render('<mds-input-otp length="3"></mds-input-otp>');
      const digits = Array.from(root.shadowRoot!.querySelectorAll('mds-input'));

      expect(digits.map((digit) => digit.getAttribute('aria-label'))).toEqual([
        'Digit 1 of 3',
        'Digit 2 of 3',
        'Digit 3 of 3',
      ]);
    });

    it('puts the name of the code in front of each digit', async () => {
      const { root } = await render(
        '<mds-input-otp length="2" aria-label="Codice di verifica"></mds-input-otp>',
      );
      const [first] = Array.from(root.shadowRoot!.querySelectorAll('mds-input'));

      expect(first).toEqualAttribute('aria-label', 'Codice di verifica, Digit 1 of 2');
    });
  });
});
