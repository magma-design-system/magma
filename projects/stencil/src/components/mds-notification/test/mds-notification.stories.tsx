import { strategyDictionary } from '../meta/dictionary';
import { themeStatusVariantDictionary } from '@type/variant';
import { h } from '@stencil/core';

export default {
  title: 'UI / Feedback / Notification',
  id: 'ui-notification',
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
    variant: {
      type: { name: 'string' },
      description: 'Specifies the colour of the dot and of the badge, a status',
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
    },
    pulse: {
      description: 'Specifies if the dot pulses when `value` grows: three beats and then still',
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

const TemplateVariants = (args) => (
  <div class="flex flex-wrap items-center gap-600">
    {themeStatusVariantDictionary.map((variant) => (
      <mds-notification key={variant} {...args} variant={variant} />
    ))}
  </div>
);

export const Variants = {
  render: TemplateVariants,

  args: {
    strategy: 'disabled',
    value: 7,
  },
};

// the line of the new items of a list (pattern list-with-filters, case show-new-items): the
// count grows with every click, and the dot pulses three times each time it does
const TemplatePulseInLine = (args) => {
  const add = () => {
    const notification = document.querySelector<HTMLMdsNotificationElement>('#new-items');
    if (notification) notification.value = notification.value + 1;
  };

  return (
    <div class="flex flex-wrap items-center gap-600">
      <div class="flex items-center gap-200">
        <p role="status" class="flex items-center gap-100">
          <mds-notification id="new-items" {...args} />
          <mds-text typography="detail">nuove pratiche</mds-text>
        </p>
        <mds-button variant="info" tone="outline" size="sm">
          Mostra
        </mds-button>
      </div>
      <mds-button variant="dark" tone="weak" size="sm" icon="mi/baseline/add" onClick={add}>
        Aggiungi una pratica
      </mds-button>
    </div>
  );
};

export const PulseInLine = {
  render: TemplatePulseInLine,

  args: {
    variant: 'info',
    pulse: true,
    value: 3,
  },
};
