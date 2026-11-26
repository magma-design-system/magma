import { loadingDictionary } from '@type/loading';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { useEffect, useState } from 'react';
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@type/icon';

const URLs = ['https://www.typeform.com/', 'http://azumbrunnen.me/'];

const urlPage = `${location.origin}/iframe.html?id=common-tests--example-page&viewMode=story`;

export default {
  title: 'UI / Content / URL View',
  id: 'ui-url-view',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    domain: {
      description: 'Specifies if domain is visible on header',
      type: { name: 'boolean' },
    },
    loading: {
      control: { type: 'select' },
      description:
        'Specifies whether a browser should load an iframe immediately or to defer loading of images until some conditions are met.',
      options: loadingDictionary,
      type: { name: 'string' },
    },
    src: {
      control: { type: 'select' },
      description: 'Specifies the URL to the web page',
      options: URLs,
      type: { name: 'string', required: true },
    },
  },
};

const Template = (args) => {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const actionElement = document.querySelector('#action');
    const modalElement = document.querySelector('#modal');
    const urlViewElement = document.querySelector('#url-view');

    if (actionElement === null || modalElement === null || urlViewElement === null) {
      alert('Element/s not found');
      return;
    }

    modalElement.addEventListener('mdsModalClose', () => {
      setOpened(false);
    });
    modalElement.addEventListener('mdsModalHide', () => {
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
      <mds-modal position="center" id="modal" opened={opened === true ? true : undefined}>
        <mds-url-view id="url-view" class="max-w-screen-tablet w-full" slot="window" {...args} />
      </mds-modal>
    </div>
  );
};

export const Default = {
  render: Template,

  args: {
    src: urlPage,
  },
};

export const Label = {
  render: Template,

  args: {
    src: urlPage,
    label: 'Fake landing page',
  },
};

export const Icon = {
  render: Template,

  args: {
    src: urlPage,
    icon: 'mgg/google-book-large',
  },
};

/**
 * Every state of a URL view once the story has opened (#1440, @fixture/states), each a view
 * 400 px tall (`h-10000`: on its own the view takes the height of the screen, as the window of
 * a modal): the page of the other stories, of this same Storybook, so the frame shows a page
 * that does not change and that axe can read; the header with the domain of the page, with a
 * label, with an icon of its own and with a label too long for it; without a source, the frame
 * empty. The close button emits `mdsUrlViewClose` and closes the modal around the view, which
 * the other stories open: no state of the view, no play function.
 */
interface UrlViewState {
  state: string;
  view: { src?: string; label?: string; icon?: string };
}

const urlViewStates: UrlViewState[] = [
  { state: 'rest, the domain', view: { src: urlPage } },
  { state: 'label', view: { src: urlPage, label: 'Pagina di esempio' } },
  { state: 'icon of its own', view: { src: urlPage, icon: 'mgg/google-book-large' } },
  {
    state: 'long label',
    view: {
      src: urlPage,
      label:
        'Regolamento per la concessione di contributi alle associazioni del territorio comunale',
    },
  },
  { state: 'without a source', view: {} },
];

const TemplateStates = () => (
  <StatesGrid>
    {urlViewStates.map(({ state, view }) => (
      <StateCell key={state} state={state}>
        {/* `src` is required: one state leaves it out on purpose */}
        <mds-url-view class="h-10000" {...(view as { src: string })}></mds-url-view>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
