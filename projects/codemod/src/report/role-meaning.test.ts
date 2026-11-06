import { roleMeaning } from './role-meaning.js';

describe('roleMeaning', () => {
  it.each([
    [
      'bg-surface-overlay',
      'lifted above the page: modal, dropdown, popover, tooltip, chip, banner',
    ],
    ['bg-surface-muted', 'same-plane grouping inside a component: zebra rows, never a section'],
    ['hover:bg-surface-raised/80', 'raised: cards, panels, sticky headers'],
    ['bg-surface-inverse-muted', 'softer inverse fill: weak tone, hover of the inverse fill'],
    ['bg-wash-soft', 'faintest pill: zebra rows on a card, resting track'],
    ['bg-wash-base', 'default pill: paginator page, disabled fill'],
    ['bg-success-wash-base', 'success-tinted fill: banner, badge, alert background'],
    ['bg-warning-surface', 'warning-tinted fill: banner, badge, alert background'],
    ['bg-info-wash-strong', 'marked info-tinted fill'],
    ['text-fg-muted', 'secondary essential text'],
    ['text-danger-fg-subtle', 'danger non-essential text: captions, units, hints'],
    ['border-border-default', 'functional outline: inputs, controls'],
    ['border-t-warning-border-muted', 'warning decorative divider: grid, rows, cells'],
    ['bg-info-emphasis-hover', 'info solid fill, hovered'],
    ['text-success-on-emphasis', 'text on the success solid fill'],
    ['bg-accent-surface-hover/30', 'accent tinted background, hovered'],
    ['text-accent-ai-fg', 'AI accent text and icons'],
    ['bg-tone-neutral-09', 'raw palette step: a fixed colour, does not follow themes'],
  ])('%s -> %s', (value, meaning) => {
    expect(roleMeaning(value)).toBe(meaning);
  });

  it('knows nothing of a class that names no colour role', () => {
    expect(roleMeaning('bg-something-else')).toBeUndefined();
    expect(roleMeaning('bg-surface-floating')).toBeUndefined();
  });
});
