import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { useState, useEffect, useRef } from 'react';
import {
  modalPositionDictionary,
  modalOverflowDictionary,
  modalAnimationStyleDictionary,
  modalInteractionDictionary,
} from '../meta/dictionary';

export default {
  title: 'UI / Overlays / Modal',
  id: 'ui-modal',
  argTypes: {
    animation: {
      control: { type: 'select' },
      description: 'Specifies the animation style of the window',
      options: modalAnimationStyleDictionary,
      type: { name: 'string' },
    },
    'hide-backdrop': {
      description: 'Hides the modal backdrop',
      type: { name: 'boolean' },
    },
    interaction: {
      control: { type: 'select' },
      description: 'Specifies the animation style of the window',
      options: modalInteractionDictionary,
      type: { name: 'string' },
    },
    opened: {
      description: 'Specifies if the modal is opened or not',
      type: { name: 'boolean' },
    },
    overflow: {
      description:
        'Specifies if the component prevents the body from scrolling when modal window is opened',
      control: { type: 'select' },
      options: modalOverflowDictionary,
      type: { name: 'string' },
    },
    position: {
      control: { type: 'select' },
      description: 'Specifies the animation position of the modal window',
      options: modalPositionDictionary,
      type: { name: 'string' },
    },
    tallContent: {
      description: 'QA Matrix only: render tall content to exercise large-window sliding',
      type: { name: 'boolean' },
    },
  },
};

const firstName = 'Mary';
const lastName = 'Reds';
const fullName = `${firstName} ${lastName}`;
const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nintendo.com`;

const HeaderComponent = ({ slot = undefined }: { slot?: string } = {}) => {
  return (
    <header
      slot={slot}
      class="p-400 bg-surface-overlay/80 backdrop-blur-md shadow-ring-weak flex gap-400 items-center "
    >
      <mds-img class="w-800 h-800" src="./logo-gruppo-maggioli-512w.webp" />
      <div class="text-tone-neutral-02 grid grid-cols-full">
        <mds-text typography="h6" truncate="word">
          Maggioli Editore
        </mds-text>
        <mds-text typography="caption" truncate="word">
          Menu di servizio
        </mds-text>
      </div>
    </header>
  );
};

const FooterComponent = ({ slot = undefined }: { slot?: string } = {}) => {
  return (
    <footer
      slot={slot}
      class="flex gap-400 text-tone-neutral-02 p-400 bg-surface-overlay/80 backdrop-blur-md shadow-ring-weak"
    >
      <mds-author class="flex-grow">
        <mds-avatar slot="avatar" class="w-800 h-800" src="./avatar-01-200x200.jpeg" />
        <mds-text typography="h6" truncate="word">
          {fullName}
        </mds-text>
        <mds-text typography="caption" truncate="word">
          {email}
        </mds-text>
      </mds-author>
    </footer>
  );
};

const ContentComponent = () => {
  return (
    <div class="p-400 grid gap-400 grid-cols-full">
      <mds-text>
        As a multi-brand design syastem, our components need to be flexible enough for any one of
        our brands to use them for multiple use cases. To achieve this, we ensure that all of the
        brands are involved in the specification stage, giving us more confidence that we’re
        future-proofing our components as more brands adopt NewsKit.
      </mds-text>
      <mds-text>
        As a multi-brand design syastem, our components need to be flexible enough for any one of
        our brands to use them for multiple use cases. To achieve this, we ensure that all of the
        brands are involved in the specification stage, giving us more confidence that we’re
        future-proofing our components as more brands adopt NewsKit.
      </mds-text>
      <mds-text>
        As a multi-brand design syastem, our components need to be flexible enough for any one of
        our brands to use them for multiple use cases. To achieve this, we ensure that all of the
        brands are involved in the specification stage, giving us more confidence that we’re
        future-proofing our components as more brands adopt NewsKit.
      </mds-text>
    </div>
  );
};

const Template = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');

    if (actionElement === null || modalElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal id="modal" {...args} opened={opened === true ? true : undefined}>
        <HeaderComponent />
        <ContentComponent />
        <FooterComponent />
      </mds-modal>
    </div>
  );
};

const TemplateHeaderAndFooter = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');

    if (actionElement === null || modalElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal id="modal" {...args} opened={opened === true ? true : undefined}>
        <HeaderComponent slot="top" />
        <ContentComponent />
        <FooterComponent slot="bottom" />
      </mds-modal>
    </div>
  );
};

const TemplateSmallContent = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');

    if (actionElement === null || modalElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal id="modal" {...args} opened={opened === true ? true : undefined}>
        <div class="p-400 grid gap-400 grid-cols-full">
          <mds-text>
            As a multi-brand design syastem, our components need to be flexible enough for any one
            of our brands to use them for multiple use cases. To achieve this, we ensure that all of
            the brands are involved in the specification stage, giving us more confidence that we’re
            future-proofing our components as more brands adopt NewsKit.
          </mds-text>
        </div>
      </mds-modal>
    </div>
  );
};

const TemplateCustomWindow = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');

    if (actionElement === null || modalElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal
        id="modal"
        {...args}
        style={{
          '--mds-modal-window-overflow': 'hidden',
          '--mds-modal-window-distance': '1rem',
          '--mds-modal-window-radius': '1rem',
        }}
        opened={opened === true ? true : undefined}
      >
        <HeaderComponent />
        <ContentComponent />
        <FooterComponent />
      </mds-modal>
    </div>
  );
};

const TemplateCustomWindowHeaderAndFooter = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');

    if (actionElement === null || modalElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal
        id="modal"
        {...args}
        style={{
          '--mds-modal-window-overflow': 'hidden',
          '--mds-modal-window-distance': '1rem',
          '--mds-modal-window-radius': '1rem',
        }}
        opened={opened === true ? true : undefined}
      >
        <HeaderComponent slot="top" />
        <ContentComponent />
        <FooterComponent slot="bottom" />
      </mds-modal>
    </div>
  );
};

const TemplateOverflow = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');

    if (actionElement === null || modalElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div class="relative">
      <div class="grid">
        {Array(40)
          .fill(null)
          .map((_value, index) => (
            <div
              key={index}
              class="h-[100px] flex items-start justify-center text-center border-0 border-t border-solid border-t-tone-neutral-07"
            >
              <mds-text
                class="px-200 py-100 rounded-b-lg bg-tone-neutral-10 border-t-0 border border-solid border-tone-neutral-07"
                typography="snippet"
                tag="div"
              >
                {index === 0 ? '0px' : index + '00px'}
              </mds-text>
            </div>
          ))}
      </div>
      <mds-button class="fixed top-600 left-600" id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal id="modal" {...args} opened={opened === true ? true : undefined}>
        <HeaderComponent />
        <ContentComponent />
        <FooterComponent />
      </mds-modal>
    </div>
  );
};

const CustomTemplate = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');
    const windowElement = document.querySelector('#window');

    if (actionElement === null || modalElement === null || windowElement === null) {
      alert('Element/s not found');
      return;
    }

    windowElement.addEventListener('mdsBannerClose', () => {
      console.info('mdsBannerClose');
      setOpened(false);
    });

    modalElement.addEventListener('mdsModalClose', () => {
      console.info('mdsModalClose');
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
      console.info('mdsModalHide');
      setOpened(false);
    });
  }, []);

  if (args.opened !== null) {
    args.opened = null;
  }

  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal id="modal" {...args} opened={opened === true ? true : undefined}>
        <mds-banner
          id="window"
          slot="window"
          class="max-w-[400px] w-full mx-6"
          tone="box"
          deletable
          headline="Action required"
        >
          <mds-text typography="detail">
            As a multi-brand design system, our components need to be flexible enough for any one of
            our brands to use them for multiple use cases. To achieve this, we ensure that all of
            the brands are involved in the specification stage, giving us more confidence that we’re
            future-proofing our components as more brands adopt NewsKit.
          </mds-text>
          <mds-button slot="actions" variant="primary" tone="text">
            Cancel
          </mds-button>
          <mds-button slot="actions" variant="primary">
            Confirm
          </mds-button>
        </mds-banner>
      </mds-modal>
    </div>
  );
};

const NestedModalTemplate = () => {
  const [openedFirstModal, setFirstModalOpened] = useState(false);
  const [openedSecondModal, setSecondModalOpened] = useState(false);

  useEffect(() => {
    const firstModalElement = document.querySelector('#modal-01');
    const secondModalElement = document.querySelector('#modal-02');

    if (firstModalElement === null || secondModalElement === null) {
      alert('Element/s not found');
      return;
    }

    firstModalElement.addEventListener('mdsModalClose', () => {
      setFirstModalOpened(false);
    });
    secondModalElement.addEventListener('mdsModalClose', () => {
      setSecondModalOpened(false);
    });
  }, []);

  return (
    <div>
      <mds-button onClick={() => setFirstModalOpened(true)}>Open first modal</mds-button>
      <mds-modal
        id="modal-01"
        position="right"
        opened={openedFirstModal === true ? true : undefined}
        onMdsModalClose={() => setFirstModalOpened(false)}
        style={{ '--mds-modal-window-max-width': '66%' }}
      >
        <div class="p-600">
          <mds-button
            class="self-start justify-self-start"
            onClick={() => setSecondModalOpened(true)}
          >
            Open nested modal
          </mds-button>
        </div>
      </mds-modal>
      <mds-modal
        id="modal-02"
        position="right"
        opened={openedSecondModal === true ? true : undefined}
        onMdsModalClose={() => setSecondModalOpened(false)}
        style={{ '--mds-modal-window-max-width': '33%' }}
      >
        <div class="p-600">
          <mds-text>This is the nested modal</mds-text>
        </div>
      </mds-modal>
    </div>
  );
};

const ShowTemplate = () => {
  const [opened, setOpened] = useState(false);
  const input = useRef<HTMLMdsInputElement>(null);
  useEffect(() => {
    const modalEl = document.querySelector('#modal-focus');

    modalEl?.addEventListener('mdsModalShow', () => {
      input.current?.setFocus();
    });
    modalEl?.addEventListener('mdsModalClose', () => {
      setOpened(false);
    });
  }, []);
  return (
    <div>
      <mds-button id="action" onClick={() => setOpened(true)}>
        Open modal
      </mds-button>
      <mds-modal id="modal-focus" opened={opened === true ? true : undefined} position="right">
        <div class="p-400">
          <mds-input ref={input}></mds-input>
        </div>
      </mds-modal>
    </div>
  );
};

/**
 * QA Matrix: one trigger per position x animation, so the enter/exit animation
 * can be eyeballed across the whole grid in a single place. Use the Controls
 * panel to toggle `backdrop`, `interaction` (strict/relaxed) and `tallContent`
 * (small vs large window, which reveals percentage-based slide distances).
 */
const QAMatrixTemplate = (args) => {
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState('center');
  const [animation, setAnimation] = useState('slide');

  useEffect(() => {
    const modalElement = document.querySelector('#qa-modal');
    const reset = () => setOpened(false);
    modalElement?.addEventListener('mdsModalClose', reset);
    modalElement?.addEventListener('mdsModalHide', reset);
    return () => {
      modalElement?.removeEventListener('mdsModalClose', reset);
      modalElement?.removeEventListener('mdsModalHide', reset);
    };
  }, []);

  const open = (nextPosition: string, nextAnimation: string) => {
    setPosition(nextPosition);
    setAnimation(nextAnimation);
    setOpened(true);
  };

  return (
    <div class="p-400 grid gap-600">
      <mds-text typography="caption">
        Click a cell to open that position / animation. backdrop, interaction and tallContent are in
        the Controls panel.
      </mds-text>
      {modalAnimationStyleDictionary.map((anim) => (
        <div key={anim} class="grid gap-200">
          <mds-text typography="h6">{anim}</mds-text>
          <div class="grid grid-cols-3 gap-200 max-w-[480px]">
            {modalPositionDictionary.map((pos) => (
              <mds-button key={`${anim}-${pos}`} onClick={() => open(pos, anim)}>
                {pos}
              </mds-button>
            ))}
          </div>
        </div>
      ))}
      <mds-modal
        id="qa-modal"
        position={position}
        animation={animation}
        interaction={args.interaction}
        hideBackdrop={args['hide-backdrop'] ? true : undefined}
        opened={opened === true ? true : undefined}
      >
        <div class="p-400 grid gap-400 grid-cols-full">
          <mds-text typography="h5">
            {position} / {animation}
          </mds-text>
          {args.tallContent ? (
            Array(14)
              .fill(null)
              .map((_value, index) => (
                <mds-text key={index}>
                  Line {index + 1} - tall content to exercise large-window sliding.
                </mds-text>
              ))
          ) : (
            <mds-text>Small content.</mds-text>
          )}
        </div>
      </mds-modal>
    </div>
  );
};

export const QAMatrix = {
  render: QAMatrixTemplate,

  args: {
    backdrop: true,
    interaction: 'relaxed',
    tallContent: false,
  },
};

export const Default = {
  render: Template,

  args: {
    position: 'right',
    opened: true,
  },
};

export const BackdropClose = {
  render: Template,

  args: {
    position: 'right',
    'backdrop-close': true,
  },
};

export const HeaderAndFooterFixedPosition = {
  render: TemplateHeaderAndFooter,

  args: {
    position: 'right',
    opened: true,
  },
};

export const SmallContent = {
  render: TemplateSmallContent,

  args: {
    position: 'right',
    opened: true,
  },
};

export const Backdrop = {
  render: Template,

  args: {
    position: 'right',
    opened: true,
    'hide-backdrop': true,
  },
};

export const BodyOverflowDisabled = {
  render: TemplateOverflow,

  args: {
    overflow: 'auto',
    opened: true,
    position: 'right',
  },
};

export const DefaultWindowCustomized = {
  render: TemplateCustomWindow,

  args: {
    position: 'right',
    animation: 'slide',
    opened: true,
  },
};

export const DefaultWindowCustomizedHeaderAndFooter = {
  render: TemplateCustomWindowHeaderAndFooter,

  args: {
    position: 'right',
    animation: 'slide',
    opened: true,
  },
};

export const CustomWindowAnimation = {
  render: CustomTemplate,
  args: {
    animation: 'custom',
  },
};

export const CustomWindowElement = {
  render: CustomTemplate,

  args: {
    opened: true,
  },
};

export const ARIATest = {
  render: CustomTemplate,

  args: {
    opened: true,
  },
};

export const UseCaseNestedModal = {
  render: NestedModalTemplate,
};

export const EventModalShow = {
  render: ShowTemplate,
};

/**
 * Every state of the modal once the story has opened (#1440, @fixture/states), each on a screen
 * of its own: an open modal covers the page, so a cell holds a screen of the size of the viewport
 * scaled to a quarter, the size the window is laid out against (`vw`, `dvh`), which the scale
 * also makes the box its fixed dialog is placed in. So the window keeps its width, its height,
 * its margins and the place of the close button at each position, smaller.
 *
 * - The open screens are opened with `hide-backdrop`: the default opens the dialog with
 *   `showModal()`, in the top layer over the whole page and every cell, its backdrop dimming the
 *   page. That one is in the Default story; here the window is shown without its backdrop, as a
 *   modal with `hide-backdrop` is in a product.
 * - `overflow="manual"`: the default stops the body from scrolling while a modal is open, which
 *   would stop the page of the story.
 * - `animation` (slide, 3d, custom) is the motion of the entry and the exit, the open window being
 *   the same: the QAMatrix story plays them. `interaction` (strict, relaxed) changes what closes
 *   the modal, not what it shows.
 * - The window is named as a product names it (`aria-label`).
 *
 * A state only an interaction reaches (`play: true`) is brought there by the play function, which
 * checks `opened`, the native dialog and the focus, not the look: the close button, which closes
 * the modal whatever its interaction, and a modal the page opens once loaded, as a click on a
 * button does, which moves the focus to the first control of its window. Each window opened moves
 * the focus into it, so the last one opened holds it: that is this cell, opened last.
 */
interface ModalState {
  state: string;
  play?: boolean;
  modal?: Record<string, string | boolean>;
  // what the window holds: the built-in window with a header and a footer, its content alone, a
  // content taller than the screen, or a window of its own
  window?: 'parts' | 'content' | 'tall' | 'own';
}

const shown = {
  'aria-label': 'Nuova pratica',
  'hide-backdrop': true,
  overflow: 'manual',
  opened: true,
};

const modalStates: ModalState[] = [
  { state: 'closed', modal: { 'aria-label': 'Nuova pratica', overflow: 'manual' } },
  { state: 'open, center (default)', modal: shown },
  ...['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map(
    (position) => ({ state: `open, ${position}`, modal: { ...shown, position } }),
  ),
  { state: 'open, content alone', modal: shown, window: 'content' },
  { state: 'open, content taller than the screen', modal: shown, window: 'tall' },
  {
    state: 'open, a window of its own',
    modal: { ...shown, 'aria-label': 'Eliminare la pratica?' },
    window: 'own',
  },
  { state: 'closed by its close button', play: true, modal: shown },
  {
    state: 'opened by the page, the focus in its window',
    play: true,
    modal: { 'aria-label': 'Nuova pratica', 'hide-backdrop': true, overflow: 'manual' },
  },
];

const caseText =
  "Indica il richiedente e l'oggetto della pratica: il protocollo assegna il numero quando la invii.";

// what the window of a modal holds, by its parts
const modalWindow = (kind: ModalState['window'] = 'parts') => {
  if (kind === 'own') {
    return [
      <mds-banner key="own" slot="window" tone="box" headline="Eliminare la pratica?">
        <mds-text typography="detail">La pratica e i suoi allegati saranno eliminati.</mds-text>
        <mds-button slot="action" label="Annulla" variant="dark" tone="text"></mds-button>
        <mds-button slot="action" label="Elimina" variant="error"></mds-button>
      </mds-banner>,
    ];
  }
  const content = (
    <div key="content" class="p-600 grid gap-400">
      {(kind === 'tall' ? Array.from({ length: 16 }, (_value, index) => index) : [0]).map(
        (index) => (
          <mds-text key={index}>{caseText}</mds-text>
        ),
      )}
    </div>
  );
  if (kind !== 'parts') return [content];
  return [
    <header key="top" slot="top" class="p-600">
      <mds-text typography="h5">Nuova pratica</mds-text>
    </header>,
    content,
    <footer key="bottom" slot="bottom" class="p-600 flex justify-end gap-400">
      <mds-button label="Annulla" variant="dark" tone="text"></mds-button>
      <mds-button label="Invia"></mds-button>
    </footer>,
  ];
};

// A screen of the page at a quarter of its size: the size of the viewport, scaled down
const Screen = ({ children }: { children?: unknown }) => (
  <div class="w-[25vw] h-[25dvh] overflow-hidden rounded-sm ring ring-border-muted">
    <div class="w-screen h-dvh origin-top-left scale-25 bg-surface-default">{children}</div>
  </div>
);

const TemplateStates = () => (
  <StatesGrid>
    {modalStates.map(({ state, play, modal, window }) => (
      <StateCell key={state} state={state} play={play}>
        <Screen>
          <mds-modal {...modal}>{modalWindow(window)}</mds-modal>
        </Screen>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The modal of a cell and its native dialog, once every Magma element of the cell has loaded. */
const loadedModal = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const modal = cell.querySelector('mds-modal') as HTMLMdsModalElement;
  return { modal, dialog: modal.shadowRoot!.querySelector('dialog') as HTMLDialogElement };
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const closed = await loadedModal(canvasElement, 'closed by its close button');
  await waitFor(() => expect(closed.dialog).toHaveProperty('open', true));
  // the button listens on its host, in the shadow root of the modal
  (closed.modal.shadowRoot!.querySelector('.action-close') as HTMLElement).click();

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(closed.modal.opened).toBeFalsy());
  await waitFor(() => expect(closed.dialog).toHaveProperty('open', false));

  // last, so that no other window takes the focus from it
  const opened = await loadedModal(canvasElement, 'opened by the page, the focus in its window');
  opened.modal.opened = true;
  await waitFor(() => expect(opened.dialog).toHaveProperty('open', true));
  await waitFor(() =>
    expect(document.activeElement).toBe(opened.modal.querySelector('footer mds-button')),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
