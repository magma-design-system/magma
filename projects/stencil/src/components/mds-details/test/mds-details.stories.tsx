import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Structure / Details',
  id: 'ui-details',
  argTypes: {
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is opened',
    },
  },
};

const Template = (args) => (
  <mds-details {...args}>
    <mds-icon slot="icon" name="mi/baseline/check-circle" />
    <mds-text typography="h6" slot="title">
      Vision
    </mds-text>
    <mds-text typography="detail">
      Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo
      prodotto.
    </mds-text>
    <mds-button slot="action" size="sm">
      Vai al contenuto
    </mds-button>
  </mds-details>
);

export const Default = {
  render: Template,
};

export const Opened = {
  render: Template,

  args: {
    opened: true,
  },
};

/**
 * Every state of the details once the story has opened (#1440, @fixture/states): closed and open,
 * with and without the icon before the title, open with its content alone or with an action, the
 * long title that wraps, a details open inside an open one, and the focus of its header. A state
 * only an interaction reaches (`play: true`) is brought there by the play function, which clicks
 * the header or the icon, or sends Enter and Space to the header, and checks `opened` or the
 * focus, not the look.
 */
interface DetailsState {
  state: string;
  play?: boolean;
  opened?: boolean;
  icon?: boolean;
  action?: boolean;
  title?: string;
  /** a details inside this one, open */
  nested?: boolean;
}

const detailsStates: DetailsState[] = [
  { state: 'closed' },
  { state: 'open', opened: true },
  { state: 'closed, with an icon', icon: true },
  { state: 'open, with an icon', icon: true, opened: true },
  { state: 'open, with an action', opened: true, action: true },
  { state: 'open, with an icon and an action', icon: true, opened: true, action: true },
  {
    state: 'long title',
    icon: true,
    title: "Requisiti di reddito e di residenza per l'accesso al contributo per l'affitto",
  },
  {
    state: 'long title, open',
    icon: true,
    opened: true,
    title: "Requisiti di reddito e di residenza per l'accesso al contributo per l'affitto",
  },
  { state: 'a details open inside an open one', opened: true, nested: true },
  { state: 'opened by a click on the title', play: true, icon: true },
  { state: 'opened by a click on the icon', play: true, icon: true },
  { state: 'opened with Enter', play: true, icon: true },
  { state: 'opened with Space', play: true, icon: true },
  { state: 'closed by a click', play: true, icon: true, opened: true },
  { state: 'focused', play: true, icon: true },
];

const TemplateStates = () => (
  <StatesGrid>
    {detailsStates.map(({ state, play, opened, icon, action, title, nested }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-details opened={opened}>
          {icon && <mds-icon slot="icon" name="mi/baseline/check-circle"></mds-icon>}
          <mds-text typography="h6" slot="title">
            {title ?? 'Chi ha diritto al contributo'}
          </mds-text>
          <mds-text typography="detail">
            I residenti nel Comune da almeno un anno, con un ISEE non superiore a 20.000 euro.
          </mds-text>
          {nested && (
            <mds-details opened>
              <mds-text typography="h6" slot="title">
                Casi particolari
              </mds-text>
              <mds-text typography="detail">
                Per i nuclei con un componente disabile la soglia sale a 25.000 euro.
              </mds-text>
            </mds-details>
          )}
          {action && (
            <mds-button slot="action" size="sm">
              Presenta la domanda
            </mds-button>
          )}
        </mds-details>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The details of a cell and its header, once every Magma element of the cell has loaded. */
const loadedDetails = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const details = cell.querySelector('mds-details') as HTMLMdsDetailsElement;
  // the header in the shadow root listens to the click and the keys, not the host
  const header = details.shadowRoot!.querySelector('.header') as HTMLElement;
  return { details, header };
};

/** A key sent to the header: Enter clicks it on the press, Space on the release. */
const key = (header: HTMLElement, type: 'keydown' | 'keyup', code: string) =>
  header.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code === 'Space' ? ' ' : code,
      bubbles: true,
      cancelable: true,
    }),
  );

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const title = await loadedDetails(canvasElement, 'opened by a click on the title');
  title.header.click();
  const icon = await loadedDetails(canvasElement, 'opened by a click on the icon');
  (icon.details.shadowRoot!.querySelector('.icon') as HTMLElement).click();
  const enter = await loadedDetails(canvasElement, 'opened with Enter');
  key(enter.header, 'keydown', 'Enter');
  const space = await loadedDetails(canvasElement, 'opened with Space');
  key(space.header, 'keydown', 'Space');
  key(space.header, 'keyup', 'Space');
  const closed = await loadedDetails(canvasElement, 'closed by a click');
  closed.header.click();
  const focused = await loadedDetails(canvasElement, 'focused');
  focused.header.focus();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(title.details).toHaveProperty('opened', true));
  await waitFor(() => expect(icon.details).toHaveProperty('opened', true));
  await waitFor(() => expect(enter.details).toHaveProperty('opened', true));
  await waitFor(() => expect(space.details).toHaveProperty('opened', true));
  await waitFor(() => expect(closed.details).toHaveProperty('opened', false));
  await waitFor(() => expect(focused.details.shadowRoot!.activeElement).toBe(focused.header));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
