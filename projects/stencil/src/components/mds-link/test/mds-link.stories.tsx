import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { buttonIconPositionDictionary, buttonTargetDictionary } from '@type/button';
import { toneMinimalVariantDictionary } from '@type/tone';
import { TypographyType, TypographyVariants } from '@type/typography';
import { expect, fn, waitFor } from 'storybook/test';
import { linkUnderlineDictionary, linkVariantDictionary } from '../meta/dictionary';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Actions / Link',
  id: 'ui-link',
  argTypes: {
    href: {
      type: { name: 'string' },
      description:
        'The URL of the link; without it the link is an inline button that answers to click, Enter and Space',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the link',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'The text of the link; without it, the text of the default slot',
    },
    target: {
      type: { name: 'string' },
      description: 'Specifies the target of the URL, if self or blank',
      options: buttonTargetDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description:
        'Specifies the tone of the underline: the color of the link, or a tint of it with weak',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    underline: {
      type: { name: 'string' },
      description: 'Specifies the style of the underline, which is always visible',
      options: linkUnderlineDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color of the link',
      options: linkVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-text typography="paragraph">
    Leggi l'<mds-link {...args}>informativa sulla privacy</mds-link> prima di continuare.
  </mds-text>
);

const typographies: [TypographyType, TypographyVariants?][] = [
  ['h3', undefined],
  ['h4', undefined],
  ['paragraph', undefined],
  ['detail', undefined],
  ['caption', undefined],
  ['paragraph', 'read'],
  ['detail', 'read'],
];

const TypographyTemplate = (args) => (
  <div class="grid gap-400 max-w-[320px]">
    {typographies.map(([typography, variant]) => (
      <mds-text key={`${typography}-${variant}`} typography={typography} variant={variant}>
        {`${typography}${variant ? ` ${variant}` : ''}: `}leggi l'
        <mds-link {...args} href="#privacy">
          informativa sulla privacy
        </mds-link>{' '}
        prima di continuare, oppure{' '}
        <mds-link {...args} icon="mi/baseline/open-in-new" href="#report" target="blank">
          scarica il rapporto annuale
        </mds-link>
        .
      </mds-text>
    ))}
  </div>
);

// every style in both tones on the same samples, one row per tone: the wrap, the icon on both
// sides, a title, the variant on a colored surface and the inline button
const UnderlineTemplate = (args) => (
  <div class="grid gap-600">
    {toneMinimalVariantDictionary.map((tone) => (
      <div key={tone} class="grid gap-600 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
        {linkUnderlineDictionary.map((underline) => (
          <section
            key={`${underline}-${tone}`}
            class="grid gap-400 content-start rounded-lg border border-border-muted bg-surface-raised p-600"
          >
            <mds-text typography="h5">{`${underline} ${tone}`}</mds-text>
            <mds-text typography="paragraph">
              Leggi l'
              <mds-link {...args} underline={underline} tone={tone} href="#privacy">
                informativa sulla privacy
              </mds-link>{' '}
              prima di continuare, oppure{' '}
              <mds-link {...args} underline={underline} tone={tone}>
                chiedi aiuto
              </mds-link>{' '}
              al supporto.
            </mds-text>
            <mds-text typography="paragraph" class="max-w-[16rem]">
              Va a capo con il testo:{' '}
              <mds-link {...args} underline={underline} tone={tone} href="#lungo">
                un collegamento abbastanza lungo da occupare due righe
              </mds-link>{' '}
              e poi il testo prosegue.
            </mds-text>
            <mds-text typography="caption">
              Fonte:{' '}
              <mds-link
                {...args}
                underline={underline}
                tone={tone}
                href="#report"
                icon="mi/baseline/open-in-new"
                target="blank"
              >
                rapporto annuale 2025
              </mds-link>
            </mds-text>
            <mds-text typography="paragraph" class="max-w-[16rem]">
              L'icona resta sull'ultima parola:{' '}
              <mds-link
                {...args}
                underline={underline}
                tone={tone}
                href="#download"
                icon="mi/baseline/download"
              >
                scarica il rapporto completo
              </mds-link>
              .
            </mds-text>
            <mds-text typography="paragraph" variant="read">
              Testo editoriale:{' '}
              <mds-link
                {...args}
                underline={underline}
                tone={tone}
                href="#indice"
                icon="mi/baseline/arrow-back"
                icon-position="left"
              >
                torna all'indice
              </mds-link>{' '}
              per gli altri capitoli.
            </mds-text>
            <mds-text typography="h4">
              Un titolo con{' '}
              <mds-link {...args} underline={underline} tone={tone} href="#titolo">
                un link
              </mds-link>
            </mds-text>
            <mds-text typography="detail" class="rounded-md bg-danger-surface p-400 text-danger-fg">
              Pagamento rifiutato.{' '}
              <mds-link {...args} underline={underline} tone={tone} variant="inherit" href="#carta">
                Aggiorna la carta
              </mds-link>{' '}
              per riprovare.
            </mds-text>
          </section>
        ))}
      </div>
    ))}
  </div>
);

export const Default = {
  render: Template,

  args: {
    href: '#privacy',
  },
};

export const Underline = {
  render: UnderlineTemplate,
};

export const Typography = {
  render: TypographyTemplate,
};

export const Icon = {
  render: Template,

  args: {
    href: '#privacy',
    icon: 'mi/baseline/arrow-forward',
  },
};

export const IconPosition = {
  render: Template,

  args: {
    href: '#privacy',
    icon: 'mi/baseline/arrow-back',
    'icon-position': 'left',
  },
};

export const Target = {
  render: Template,

  args: {
    href: 'https://www.maggioli.it',
    icon: 'mi/baseline/open-in-new',
    target: 'blank',
  },
};

export const VariantInherit = {
  render: (args) => (
    <mds-text typography="detail" class="rounded-md bg-danger-surface p-400 text-danger-fg">
      Pagamento rifiutato. <mds-link {...args}>Aggiorna la carta</mds-link> per riprovare.
    </mds-text>
  ),

  args: {
    href: '#carta',
    variant: 'inherit',
  },
};

// without href the link is an inline button: the play checks the click, Enter and Space
export const WithoutHref = {
  render: (args) => (
    <mds-text typography="paragraph">
      Non trovi quello che cerchi? <mds-link {...args}>Chiedi aiuto</mds-link> al supporto.
    </mds-text>
  ),

  args: {
    onClick: fn(),
  },

  // the role lives on the element in the shadow root, where Testing Library does not look; the
  // play can start before the component has rendered it
  play: async ({ args, canvasElement, userEvent }) => {
    const link = canvasElement.querySelector('mds-link');
    await waitFor(() =>
      expect(link.shadowRoot?.querySelector('[part="link"]')).toHaveAttribute('role', 'button'),
    );

    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    link.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

/**
 * Every state of the link once the story has opened (#1440, @fixture/states), each a word of a
 * sentence, as a link sits in a product: every underline in both tones, the variant that takes the
 * colour of the text on a coloured surface, the icon after and before the text, a new tab, a
 * download, the inline button without `href`, the text that wraps (the icon on the line of its
 * word), and the link in a heading, a caption and editorial text. A state only an interaction
 * reaches (`play: true`) is brought there by the play function, which checks the focus, not the
 * look. The fill under the pointer needs a real pointer, which a play does not move.
 */
interface LinkState {
  state: string;
  play?: boolean;
  /** the text around the link, before and after it */
  text: [string, string];
  label: string;
  link: Record<string, string | boolean>;
  typography?: TypographyType;
  editorial?: boolean;
  /** a coloured surface, which the link takes the colour of with `variant="inherit"` */
  coloured?: boolean;
  /** a narrow text, where the link wraps onto two lines */
  narrow?: boolean;
}

const privacy: Pick<LinkState, 'text' | 'label'> = {
  text: ["Leggi l'", ' prima di continuare.'],
  label: 'informativa sulla privacy',
};
const focusedLink = 'focused';

const linkStates: LinkState[] = [
  { state: 'solid, strong (default)', ...privacy, link: { href: '#privacy' } },
  { state: 'solid, weak', ...privacy, link: { href: '#privacy', tone: 'weak' } },
  { state: 'dotted, strong', ...privacy, link: { href: '#privacy', underline: 'dotted' } },
  {
    state: 'dotted, weak',
    ...privacy,
    link: { href: '#privacy', underline: 'dotted', tone: 'weak' },
  },
  { state: 'marker, strong', ...privacy, link: { href: '#privacy', underline: 'marker' } },
  {
    state: 'marker, weak',
    ...privacy,
    link: { href: '#privacy', underline: 'marker', tone: 'weak' },
  },
  {
    state: 'variant inherit, on a coloured surface',
    text: ['Pagamento rifiutato. ', ' per riprovare.'],
    label: 'Aggiorna la carta',
    link: { href: '#carta', variant: 'inherit' },
    typography: 'detail',
    coloured: true,
  },
  {
    state: 'variant inherit, dotted, weak',
    text: ['Pagamento rifiutato. ', ' per riprovare.'],
    label: 'Aggiorna la carta',
    link: { href: '#carta', variant: 'inherit', underline: 'dotted', tone: 'weak' },
    typography: 'detail',
    coloured: true,
  },
  {
    state: 'variant inherit, marker',
    text: ['Pagamento rifiutato. ', ' per riprovare.'],
    label: 'Aggiorna la carta',
    link: { href: '#carta', variant: 'inherit', underline: 'marker' },
    typography: 'detail',
    coloured: true,
  },
  {
    state: 'icon right (default)',
    text: ['Domanda inviata: ', '.'],
    label: 'vai al riepilogo',
    link: { href: '#riepilogo', icon: 'mi/baseline/arrow-forward' },
  },
  {
    state: 'icon left',
    text: ['', ' per gli altri capitoli.'],
    label: "Torna all'indice",
    link: { href: '#indice', icon: 'mi/baseline/arrow-back', 'icon-position': 'left' },
  },
  {
    state: 'new tab',
    text: ['Fonte: ', '.'],
    label: 'sito del Gruppo Maggioli',
    link: { href: 'https://www.maggioli.it', target: 'blank', icon: 'mi/baseline/open-in-new' },
  },
  {
    state: 'download',
    text: ['', ' in PDF.'],
    label: 'Scarica il rapporto annuale',
    link: { href: '#rapporto', download: 'rapporto-annuale.pdf', icon: 'mi/baseline/download' },
  },
  {
    state: 'without href, an inline button',
    text: ['Non trovi quello che cerchi? ', ' al supporto.'],
    label: 'Chiedi aiuto',
    link: {},
  },
  {
    state: 'long text that wraps',
    text: ['Va a capo con il testo: ', ' e poi il testo prosegue.'],
    label: 'un collegamento abbastanza lungo da occupare due righe',
    link: { href: '#lungo' },
    narrow: true,
  },
  {
    state: 'icon on the last word, wrapping',
    text: ["L'icona resta sull'ultima parola: ", '.'],
    label: 'scarica il rapporto completo',
    link: { href: '#completo', icon: 'mi/baseline/download' },
    narrow: true,
  },
  {
    state: 'in a heading',
    text: ['Le pratiche di ', ''],
    label: 'Mario Rossi',
    link: { href: '#mario-rossi' },
    typography: 'h4',
  },
  {
    state: 'in a caption',
    text: ['Aggiornato il 12 marzo 2025. ', ''],
    label: 'Cronologia delle modifiche',
    link: { href: '#cronologia' },
    typography: 'caption',
  },
  {
    state: 'in editorial text',
    text: ['Il regolamento si applica dal 1 gennaio: ', ' per i dettagli.'],
    label: 'leggi il testo completo',
    link: { href: '#regolamento' },
    editorial: true,
  },
  { state: focusedLink, play: true, ...privacy, link: { href: '#privacy' } },
];

const TemplateStates = () => (
  <StatesGrid>
    {linkStates.map(
      ({ state, play, text, label, link, typography, editorial, coloured, narrow }) => {
        const classes = [
          coloured && 'rounded-md bg-danger-surface p-400 text-danger-fg',
          narrow && 'max-w-[16rem]',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <StateCell key={state} state={state} play={play}>
            <mds-text
              typography={typography ?? 'paragraph'}
              variant={editorial ? 'read' : undefined}
              class={classes || undefined}
            >
              {text[0]}
              <mds-link {...link}>{label}</mds-link>
              {text[1]}
            </mds-text>
          </StateCell>
        );
      },
    )}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, focusedLink);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const link = cell.querySelector('mds-link') as HTMLMdsLinkElement;
  // the shadow root delegates the focus to the anchor, which is what takes it
  link.focus();

  await waitFor(() =>
    expect(link.shadowRoot!.activeElement).toBe(link.shadowRoot!.querySelector('.link')),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
