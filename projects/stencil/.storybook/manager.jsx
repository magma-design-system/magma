import React, { useState } from 'react';
import { Button, Form, PopoverProvider } from 'storybook/internal/components';
import { ControlsIcon } from '@storybook/icons';
import { addons, types } from 'storybook/manager-api';
import { styled } from 'storybook/theming';
import { themes } from './theme.mjs';

import {
  LANGUAGE,
  PREF_CHANNEL_EVENTS,
  PREFERENCES,
  PREFS_ENABLED_KEY,
  effectiveScheme,
  storedValue,
} from './preferences.mjs';

/**
 * The menu never touches the preview DOM: every change is emitted on the
 * Storybook channel and applied to the preview `<html>` by preview.jsx, which
 * also re-applies the persisted preferences on every iframe (re)load.
 */
const PreferenceSelect = ({ preference, disabled }) => (
  <Form.Field label={preference.label}>
    <Form.Select
      name={`pref-${preference.name}`}
      disabled={disabled}
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

// Form.Field is laid out for an addon panel: every field ends with a separator
// line and the last one reserves a 3rem gap, which would leave the popover with
// a stray line and an empty bottom.
const Menu = styled.div({
  width: 320,
  '& > label:last-child': { borderBottom: 'none', marginBottom: 0 },
});

const PreferencesMenu = ({ enabled, onToggle }) => (
  <Menu>
    <Form.Field label="Preferences">
      <Form.Select
        name="pref-toggle"
        defaultValue={enabled ? 'enable' : 'disable'}
        onChange={(event) => onToggle(event.target.value === 'enable')}
      >
        <option value="enable">Enabled</option>
        <option value="disable">Disabled</option>
      </Form.Select>
    </Form.Field>
    {[...PREFERENCES, LANGUAGE].map((preference) => (
      <PreferenceSelect key={preference.name} preference={preference} disabled={!enabled} />
    ))}
  </Menu>
);

/**
 * The toolbar button: a popover with the preferences, reachable from every story
 * and docs page (an addon panel is hidden on the docs pages and whenever the
 * panel area is collapsed). Highlighted while the emulation is enabled.
 */
const PreferencesTool = () => {
  const [enabled, setEnabled] = useState(
    () => window.localStorage.getItem(PREFS_ENABLED_KEY) === 'enable',
  );
  const [open, setOpen] = useState(false);

  const toggle = (isEnabled) => {
    setEnabled(isEnabled);
    addons.getChannel().emit(PREF_CHANNEL_EVENTS.toggle, isEnabled);
  };

  return (
    <PopoverProvider
      ariaLabel="Magma accessibility preferences"
      placement="bottom"
      onVisibleChange={setOpen}
      popover={() => <PreferencesMenu enabled={enabled} onToggle={toggle} />}
    >
      <Button
        padding="small"
        variant="ghost"
        active={enabled}
        ariaLabel="Magma accessibility"
        tooltip="Magma accessibility preferences"
        // the hover tooltip would stay on top of the open popover
        disableAllTooltips={open}
      >
        <ControlsIcon />
      </Button>
    </PopoverProvider>
  );
};

// The chrome follows the scheme the preview renders: `color-scheme` aligns the
// browser's own UI (scrollbars, form controls) and the theme repaints the rest.
const paintChrome = (api, scheme) => {
  document.documentElement.style.colorScheme = scheme;
  api?.setOptions({ theme: themes[scheme] });
};

addons.register('maggioli/preferences', (api) => {
  paintChrome(null, effectiveScheme());
  addons.getChannel().on(PREF_CHANNEL_EVENTS.scheme, (scheme) => paintChrome(api, scheme));

  addons.add('maggioli-addon/accessibility', {
    title: 'Magma accessibility',
    type: types.TOOL,
    // the same pages as the grid, background and outline tools
    match: ({ viewMode, tabId }) => !!viewMode?.match(/^(story|docs)$/) && !tabId,
    render: () => <PreferencesTool />,
  });
});

addons.setConfig({
  // the starting theme, repainted by paintChrome when the preview publishes its scheme
  theme: themes[effectiveScheme()],
});
