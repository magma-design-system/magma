import { typographyReadDictionary } from '@type/typography';
import { typographyHeadingTagDictionary } from '@type/text';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { typographyTitleDictionary } from '@type/typography';

export default {
  title: 'UI / Content / Quote',
  id: 'ui-quote',
  argTypes: {
    tag: {
      description: 'Specifies the font typography of the element',
      options: typographyHeadingTagDictionary,
      control: { type: 'select' },
    },
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyReadDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-quote {...args}>
    What one programmer can do in one month, two programmers can do in two months
    <mds-author class="text-tone-neutral-04" slot="author">
      <mds-avatar
        initials="fb"
        slot="avatar"
        class="w-1200 bg-brand-maggioli-12"
        src="./fred-brooks-zoom.webp"
      />
      <mds-text typography="h6" class="text-tone-neutral-02">
        Fred Brooks
      </mds-text>
      <mds-text typography="caption">Software engineer</mds-text>
    </mds-author>
  </mds-quote>
);

export const Default = {
  render: Template,

  args: {
    tag: 'h5',
    typography: 'h5',
  },
};

export const Typography = {
  render: Template,

  args: {
    tag: 'h5',
    typography: 'h5',
  },
};

/**
 * Every state of a quote once the story has opened (#1440, @fixture/states): each `typography`
 * of the quote with its author, the quote without an author, an author with an avatar and a
 * quote long enough to wrap. Each quote is an h3 of the outline whatever its typography, as a
 * page of quotes sets it (`tag` changes the outline, not the look), and the name of an author is
 * a paragraph, not a heading. A quote has no interaction: no play function.
 */
interface QuoteState {
  state: string;
  quote?: Record<string, string>;
  text: string;
  author?: 'name' | 'avatar';
}

const short = 'Chi smette di migliorare, smette di essere buono.';

const quoteStates: QuoteState[] = [
  { state: 'rest, h3', text: short, author: 'name' },
  ...typographyTitleDictionary
    .filter((typography) => typography !== 'h3')
    .map((typography) => ({
      state: `typography ${typography}`,
      quote: { typography },
      text: short,
      author: 'name' as const,
    })),
  { state: 'without an author', text: 'La semplicità è la massima sofisticazione.' },
  {
    state: 'author with an avatar',
    quote: { typography: 'h5' },
    text: 'Quello che un programmatore fa in un mese, due programmatori lo fanno in due mesi.',
    author: 'avatar',
  },
  {
    state: 'long quote',
    quote: { typography: 'h4' },
    text: 'La pubblica amministrazione che ascolta i cittadini prima di decidere spende meno tempo a correggere le decisioni dopo averle prese, e guadagna una fiducia che nessun regolamento può imporre.',
    author: 'name',
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {quoteStates.map(({ state, quote, text, author }) => (
      <StateCell key={state} state={state}>
        <mds-quote tag="h3" {...quote}>
          {text}
          {author && (
            <mds-author slot="author">
              {author === 'avatar' && (
                <mds-avatar
                  initials="FB"
                  slot="avatar"
                  class="w-1200"
                  src="./fred-brooks-zoom.webp"
                ></mds-avatar>
              )}
              <mds-text typography="h6" tag="p">
                {author === 'avatar' ? 'Fred Brooks' : 'Philip Rosenthal'}
              </mds-text>
              <mds-text typography="caption" class="text-fg-muted">
                {author === 'avatar' ? 'Ingegnere del software' : 'Imprenditore'}
              </mds-text>
            </mds-author>
          )}
        </mds-quote>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
