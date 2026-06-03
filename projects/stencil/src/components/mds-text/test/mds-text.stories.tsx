import { typographyDictionary, typographyVariationsDictionary } from '@type/typography';
import { h } from '@stencil/core';
import { useState } from 'react';
import { tagsDictionary, textAnimateDictionary } from '../meta/dictionary';
import { truncateDictionary } from '@type/text';

export default {
  title: 'Design / Typography',
  argTypes: {
    animation: {
      control: { type: 'select' },
      description: 'Specifies if the text is animated when it is rendered',
      options: textAnimateDictionary,
    },
    tag: {
      control: { type: 'select' },
      description: 'Specifies the HTML tag of the element',
      options: tagsDictionary,
    },
    text: {
      type: { name: 'string' },
      description: 'Specifies the text string to the component instead of passing an HTML node',
    },
    truncate: {
      control: { type: 'select' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
      options: truncateDictionary,
    },
    typography: {
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyDictionary,
    },
    variant: {
      control: { type: 'select' },
      description: 'Specifies the variant for `typography`',
      options: typographyVariationsDictionary,
    },
  },
};
const Template = (args) => (
  <mds-text {...args}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dictum nec eros vitae dictum.
    Nunc lobortis pharetra lectus. Mauris egestas velit et mattis molestie. Sed risus purus, laoreet
    a massa in, tincidunt iaculis sem. Nam congue, ipsum viverra condimentum dignissim, mauris mi
    lacinia tortor, eu sodales magna augue a dui.
  </mds-text>
);

const TemplateTextBox = (args) => (
  <div class="inline-flex items-center justify-center">
    <mds-text {...args} class="bg-tone-neutral-01 text-status-error-06">
      Lorem ipsum dolor sit amet.
    </mds-text>
  </div>
);

const AnimateTemplate = () => {
  const [text, setText] = useState('Choose a song...');

  const setValue = (event: Event): void | undefined => {
    const selectEl = event.target as HTMLSelectElement;
    setText(selectEl.value);
  };

  return (
    <div class="grid gap-400">
      <div class="bg-tone-neutral-09 p-600 rounded-lg">
        <mds-text animation="yugop" text={text}></mds-text>
      </div>
      <div class="grid gap-200">
        <label htmlFor="song">Selected song:</label>
        <div>
          <select id="song" onChange={(e: Event) => setValue(e)}>
            <option>Choose a song...</option>
            <option value="One">One</option>
            <option value="Zoo Station">Zoo Station</option>
            <option value="With or Without You">With or Without You</option>
            <option value="Where The Streets Have No Name">Where The Streets Have No Name</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const Default = {
  render: Template,
};

export const Animation = {
  render: AnimateTemplate,
};

export const Text = {
  render: Template,

  args: {
    text: 'This is a text string passed by text attribute',
  },
};

export const Truncate = {
  render: Template,

  args: {
    truncate: 'word',
  },
};

export const VariantTitleAction = {
  render: Template,

  args: {
    typography: 'action',
  },
};

export const VariantTitleH1 = {
  render: Template,

  args: {
    typography: 'h1',
  },
};

export const VariantTitleH2 = {
  render: Template,

  args: {
    typography: 'h2',
  },
};

export const VariantTitleH3 = {
  render: Template,

  args: {
    typography: 'h3',
  },
};

export const VariantTitleH4 = {
  render: Template,

  args: {
    typography: 'h4',
  },
};

export const VariantTitleH5 = {
  render: Template,

  args: {
    typography: 'h5',
  },
};

export const VariantTitleH6 = {
  render: Template,

  args: {
    typography: 'h6',
  },
};

export const VariantInfoCaption = {
  render: Template,

  args: {
    typography: 'caption',
  },
};

export const VariantInfoDetail = {
  render: Template,

  args: {
    typography: 'detail',
  },
};

export const VariantInfoLabel = {
  render: Template,

  args: {
    typography: 'label',
  },
};

export const VariantInfoOption = {
  render: Template,

  args: {
    typography: 'option',
  },
};

export const VariantInfoParagraph = {
  render: Template,

  args: {
    typography: 'paragraph',
  },
};

export const VariantInfoTip = {
  render: Template,

  args: {
    typography: 'tip',
  },
};

export const VariantReadCaption = {
  render: Template,

  args: {
    typography: 'caption',
    variant: 'read',
  },
};

export const VariantReadDetail = {
  render: Template,

  args: {
    typography: 'detail',
    variant: 'read',
  },
};

export const VariantReadParagraph = {
  render: Template,

  args: {
    typography: 'paragraph',
    variant: 'read',
  },
};

export const VariantCodeSnippet = {
  render: Template,

  args: {
    tag: 'div',
    typography: 'snippet',
  },
};

export const VariantCodeHack = {
  render: Template,

  args: {
    tag: 'div',
    typography: 'hack',
  },
};

export const TextBox = {
  render: TemplateTextBox,
};
