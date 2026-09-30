import { strategyDictionary } from '../meta/dictionary';
import { h } from '@stencil/core';

export default {
  title: 'UI / Notification',
  argTypes: {
    strategy: {
      type: { name: 'string' },
      description: 'Specifies the position strategy of the notification',
      options: strategyDictionary,
      control: { type: 'select' },
    },
    value: {
      description: 'Specifies the number of notifications to display',
      type: { name: 'number' },
    },
    dismissed: {
      description: 'Specifies if the notification is dismissed',
      type: { name: 'boolean' },
    },
  },
};

const Template = (args) => (
  <div>
    <mds-notification target="#my-button" {...args} />
    <mds-button class="fixed bottom-2000 right-2000" id="my-button" icon="mdi/email">
      Incoming messages
    </mds-button>
  </div>
);

const TemplateStatic = (args) => (
  <div>
    <mds-button class="fixed bottom-2000 right-2000" id="my-button" icon="mdi/email">
      Incoming messages
      <mds-notification
        style={{ '--mds-notification-ring-size': '0' }}
        slot="notification"
        {...args}
      />
    </mds-button>
  </div>
);

const TemplateStaticPositioning = (args) => (
  <div>
    <mds-button class="fixed bottom-2000 right-2000" id="my-button" icon="mdi/email">
      Incoming messages
      <mds-notification
        class="absolute -top-300 -right-200 translate-1/2"
        slot="notification"
        {...args}
      />
    </mds-button>
  </div>
);

export const Default = {
  render: Template,
};

export const Value = {
  render: Template,

  args: {
    value: 7,
    dismissed: false,
  },
};

export const NoValue = {
  render: Template,

  args: {
    dismissed: false,
  },
};

export const Static = {
  render: TemplateStatic,

  args: {
    strategy: 'disabled',
    value: 7,
    dismissed: false,
  },
};

export const StaticPositioning = {
  render: TemplateStaticPositioning,

  args: {
    strategy: 'disabled',
    value: 31,
    dismissed: false,
  },
};

export const Max = {
  render: Template,

  args: {
    value: 15,
    max: 9,
    dismissed: false,
  },
};
