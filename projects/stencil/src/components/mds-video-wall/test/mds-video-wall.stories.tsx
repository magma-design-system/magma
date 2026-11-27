import { noiseDictionary, preloadDictionary } from '../meta/dictionary';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Content / Video wall',
  id: 'ui-video-wall',
  argTypes: {
    autoplay: {
      type: { name: 'boolean' },
      description: 'Specifies that the video will start playing as soon as it is ready',
    },
    loop: {
      type: { name: 'boolean' },
      description: 'Specifies that the video will start over again, every time it is finished',
    },
    muted: {
      type: { name: 'boolean' },
      description: 'Specifies that the audio output of the video should be muted',
    },
    noise: {
      type: { name: 'string' },
      description: 'Specifies if the video has a noise overlay effect',
      control: { type: 'select' },
      options: noiseDictionary,
    },
    poster: {
      type: { name: 'string' },
      description: 'Specifies an image to be shown while the video is downloading',
    },
    preload: {
      type: { name: 'string' },
      description:
        'Specifies if and how the author thinks the video should be loaded when the page loads',
      control: { type: 'select' },
      options: preloadDictionary,
    },
    src: {
      type: { name: 'string' },
      description: 'Specifies the URL of the video file',
    },
  },
};

const Template = (args) => (
  <mds-video-wall {...args} style={{ '--aspect-ratio': '16/9' }}>
    Your browser doesn't support videos.
  </mds-video-wall>
);

const TemplateContents = (args) => (
  <mds-video-wall {...args} style={{ '--aspect-ratio': '16/9' }}>
    <div slot="content" class="text-fg-on-emphasis text-center p-200">
      <mds-text typography="h1">This is a text</mds-text>
    </div>
  </mds-video-wall>
);

export const Default = {
  render: Template,

  args: {
    class: 'max-w-full',
    src: './video-nature.mp4',
  },
};

export const Autoplay = {
  render: Template,

  args: {
    class: 'max-w-full',
    autoplay: false,
    src: './video-nature.mp4',
  },
};

export const Loop = {
  render: Template,

  args: {
    class: 'max-w-full',
    loop: false,
    src: './video-nature.mp4',
  },
};

export const Muted = {
  render: Template,

  args: {
    class: 'max-w-full',
    muted: false,
    src: './video-nature.mp4',
  },
};

export const Noise = {
  render: Template,

  args: {
    class: 'max-w-full',
    noise: 'classic',
    src: './video-nature.mp4',
  },
};

export const Poster = {
  render: Template,

  args: {
    class: 'max-w-full',
    autoplay: false,
    poster: './video-nature-preview.webp',
    src: './video-nature.mp4',
  },
};

export const Preload = {
  render: Template,

  args: {
    class: 'max-w-full',
    preload: 'metadata',
    src: './video-nature.mp4',
  },
};

export const Content = {
  render: TemplateContents,

  args: {
    class: 'max-w-full',
    src: './video-nature.mp4',
  },
};

/**
 * Every state of a video wall once the story has opened (#1440, @fixture/states), on the local
 * video and poster of the other stories. One wall plays the video, as a page that opens with it;
 * the others stand still on the poster (`autoplay` off, `preload` none), so the page is not a
 * wall of moving pictures: each `noise` over the poster, the content over the poster, with and
 * without noise, and the wall without a source, which shows its ground. `loop` and `muted` have
 * no look of their own. With reduced motion the component hides the video, a preference of the
 * page (`&globals=animation:reduce`). A wall has no interaction: no play function.
 */
interface WallState {
  state: string;
  wall: Record<string, string | boolean>;
  content?: string;
}

const still = {
  autoplay: false,
  poster: './video-nature-preview.webp',
  preload: 'none',
  src: './video-nature.mp4',
};

const wallStates: WallState[] = [
  { state: 'rest, playing', wall: { src: './video-nature.mp4' } },
  { state: 'poster, not playing', wall: still },
  ...noiseDictionary
    .filter((noise) => noise !== 'none')
    .map((noise) => ({ state: `noise ${noise}`, wall: { ...still, noise } })),
  { state: 'content', wall: still, content: 'Benvenuti in Valfiorita' },
  {
    state: 'content and noise',
    wall: { ...still, noise: 'soft' },
    content: 'Benvenuti in Valfiorita',
  },
  { state: 'without a source', wall: {} },
  { state: 'without a source, content', wall: {}, content: 'Il video arriverà presto' },
];

const TemplateStates = () => (
  <StatesGrid>
    {wallStates.map(({ state, wall, content }) => (
      <StateCell key={state} state={state}>
        <mds-video-wall {...wall}>
          Il browser non riproduce questo video.
          {content && (
            <div slot="content" class="text-fg-on-emphasis text-center p-400">
              <mds-text typography="h4" tag="p">
                {content}
              </mds-text>
            </div>
          )}
        </mds-video-wall>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
