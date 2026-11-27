import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { TextTypographyType } from '@component/mds-text/meta/types';
import { TypographyTruncateType } from '@type/text';

export default {
  title: 'UI / Data / Author',
  id: 'ui-author',
};

const Template = (args) => (
  <mds-author {...args}>
    <mds-avatar
      initials="fb"
      src="./fred-brooks-zoom.webp"
      slot="avatar"
      class="w-2000 bg-brand-maggioli-06"
    />
    <mds-text typography="h6">Fred Brooks</mds-text>
    <mds-text typography="caption">Software engineer</mds-text>
    <mds-text typography="caption">IT</mds-text>
  </mds-author>
);

const TemplateNoAvatar = (args) => (
  <mds-author {...args}>
    <mds-text typography="h6">Fred Brooks</mds-text>
    <mds-text typography="caption">Software engineer</mds-text>
    <mds-text typography="caption">IT</mds-text>
  </mds-author>
);

export const Default = {
  render: Template,
};
export const NoAvatar = {
  render: TemplateNoAvatar,
};

/**
 * Every state of the author once the story has opened (#1440, @fixture/states). The author has no
 * props: its states come from what its slots hold and from its width. With an avatar (an image,
 * initials) and without one, one line or three, the long text that wraps and the line cut by
 * `truncate`, and the box narrower than 200px, where the avatar stacks above the text and both
 * center. The avatar added after load (`play: true`) is appended to its slot by the play function,
 * which checks that the author opened the column of the avatar: the author has no property for
 * it, so the check reads the class of that column. The sources and colours of the avatar itself
 * are in the story of mds-avatar.
 */
interface AuthorState {
  state: string;
  play?: boolean;
  /** the attributes of the avatar in the `avatar` slot, none without one */
  avatar?: Record<string, string>;
  lines: { text: string; typography: TextTypographyType; truncate?: TypographyTruncateType }[];
  /** the author sits in a box narrower than 200px */
  narrow?: boolean;
}

const fred = { initials: 'FB', src: './fred-brooks-zoom.webp' };
const maria = { initials: 'MB' };
const nameAndRole: AuthorState['lines'] = [
  { text: 'Fred Brooks', typography: 'h6' },
  { text: 'Ingegnere del software', typography: 'caption' },
];
const longRole =
  'Responsabile del procedimento per le autorizzazioni paesaggistiche e i permessi di costruire';

const authorStates: AuthorState[] = [
  { state: 'avatar, image', avatar: fred, lines: nameAndRole },
  {
    state: 'avatar, initials',
    avatar: maria,
    lines: [
      { text: 'Maria Bianchi', typography: 'h6' },
      { text: 'Ufficio tecnico', typography: 'caption' },
    ],
  },
  { state: 'without avatar', lines: nameAndRole },
  { state: 'name only', avatar: fred, lines: [{ text: 'Fred Brooks', typography: 'h6' }] },
  {
    state: 'three lines',
    avatar: fred,
    lines: [...nameAndRole, { text: 'Sistemi informativi', typography: 'caption' }],
  },
  {
    state: 'long text, wrapped',
    avatar: maria,
    lines: [
      { text: 'Maria Bianchi Fontana Dell Acqua', typography: 'h6' },
      { text: longRole, typography: 'caption' },
    ],
  },
  {
    state: 'long text, truncated',
    avatar: maria,
    lines: [
      { text: 'Maria Bianchi Fontana Dell Acqua', typography: 'h6', truncate: 'word' },
      { text: longRole, typography: 'caption', truncate: 'word' },
    ],
  },
  { state: 'narrow (under 200px)', avatar: fred, lines: nameAndRole, narrow: true },
  {
    state: 'without avatar, narrow',
    lines: [
      { text: 'Maria Bianchi', typography: 'h6' },
      { text: 'Ufficio tecnico', typography: 'caption' },
    ],
    narrow: true,
  },
  { state: 'avatar added after load', play: true, lines: nameAndRole },
];

const TemplateStates = () => (
  <StatesGrid>
    {authorStates.map(({ state, play, avatar, lines, narrow }) => (
      <StateCell key={state} state={state} play={play}>
        <div class={narrow ? 'w-4400' : undefined}>
          <mds-author>
            {avatar && <mds-avatar {...avatar} slot="avatar"></mds-avatar>}
            {lines.map(({ text, typography, truncate }) => (
              <mds-text key={text} typography={typography} truncate={truncate}>
                {text}
              </mds-text>
            ))}
          </mds-author>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, 'avatar added after load');
  const author = cell.querySelector('mds-author') as HTMLMdsAuthorElement;
  await waitFor(() => expect(author).toHaveAttribute('hydrated'));
  const avatar = document.createElement('mds-avatar');
  avatar.setAttribute('slot', 'avatar');
  avatar.setAttribute('initials', 'FB');
  avatar.setAttribute('src', './fred-brooks-zoom.webp');
  author.prepend(avatar);
  // the author has no property for its avatar: the column it opens is the state
  await waitFor(() =>
    expect(author.shadowRoot!.querySelector('.avatar')).not.toHaveClass('avatar--hidden'),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
