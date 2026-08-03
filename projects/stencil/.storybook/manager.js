import React, { useState } from 'react';
import { AddonPanel, Form } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';
import themeMaggioli from './theme';
import clsx from 'clsx';

import {
  LANGUAGE,
  PREF_CHANNEL_EVENTS,
  PREFERENCES,
  PREFS_ENABLED_KEY,
  storedValue,
} from './preferences';

/**
 * The panel never touches the preview DOM: every change is emitted on the
 * Storybook channel and applied to the preview `<html>` by preview.js, which
 * also re-applies the persisted preferences on every iframe (re)load.
 */
const PreferenceSelect = ({ preference, disabled }) => (
  <Form.Field label={preference.label}>
    <Form.Select
      name={`pref-${preference.name}`}
      disabled={disabled}
      className={clsx(disabled && 'opacity-30 pointer-events-none')}
      defaultValue={storedValue(preference)}
      onChange={(event) => {
        addons.getChannel().emit(PREF_CHANNEL_EVENTS.set, {
          name: preference.name,
          value: event.target.value,
        });
      }}
    >
      {preference.options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Form.Select>
  </Form.Field>
);

const AccessibilityPanel = () => {
  const [enabled, setEnabled] = useState(
    window.localStorage.getItem(PREFS_ENABLED_KEY) === 'enable',
  );

  return (
    <Form>
      <Form.Field label="Preferences">
        <Form.Select
          name="pref-toggle"
          defaultValue={enabled ? 'enable' : 'disable'}
          onChange={(event) => {
            const isEnabled = event.target.value === 'enable';
            setEnabled(isEnabled);
            addons.getChannel().emit(PREF_CHANNEL_EVENTS.toggle, isEnabled);
          }}
        >
          <option value="enable">Enabled</option>
          <option value="disable">Disabled</option>
        </Form.Select>
      </Form.Field>
      {[...PREFERENCES, LANGUAGE].map((preference) => (
        <PreferenceSelect key={preference.name} preference={preference} disabled={!enabled} />
      ))}
    </Form>
  );
};

addons.register('maggioli/panel', () => {
  addons.add('maggioli-addon/accessibility', {
    title: 'Magma accessibility',
    // 👇 Sets the type of UI element in Storybook
    type: types.PANEL,
    render: ({ active }) => {
      return (
        <AddonPanel active={active}>
          <AccessibilityPanel />
        </AddonPanel>
      );
    },
  });
});

addons.setConfig({
  /**
   * theme storybook, see link below
   */
  theme: themeMaggioli,
});
