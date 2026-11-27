import { h } from '@stencil/core';
import { keyboardKeyNameDictionary } from '@type/keyboard';
import { KeyboardKeyName } from '@type/keyboard';
import keyboardKeys from '@meta/keyboard/keys.json';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Tags / Keyboard',
  id: 'ui-keyboard',
  argTypes: {
    try: {
      type: { name: 'boolean' },
      description: 'Sets if the keyboard key combination test is enabled',
    },
  },
};

const TemplateSingleKey = (args) => (
  <mds-keyboard {...args}>
    <mds-keyboard-key name="f1"></mds-keyboard-key>
  </mds-keyboard>
);

const TemplateMultipleKeys = (args) => (
  <mds-table>
    <mds-table-header>
      <mds-table-header-cell label="combination"></mds-table-header-cell>
      <mds-table-header-cell label="description"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="command"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          <mds-text>
            There are no specific key position for this combination, you can use both command keys.
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="commandleft"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          <mds-text>
            You must use the <b>left</b> command key or the test will fail.
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="commandright"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          <mds-text>
            You must use the <b>right</b> command key or the test will fail.
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="windows"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          <mds-text>
            There are no specific key position for this combination, you can use both command keys.
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="windowsleft"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          <mds-text>
            You must use the <b>left</b> command key or the test will fail.
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="windowsright"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          <mds-text>
            You must use the <b>right</b> command key or the test will fail.
          </mds-text>
        </mds-table-cell>
      </mds-table-row>
    </mds-table-body>
  </mds-table>
);

const TemplateKeysDictionary = () => (
  <div class="grid gap-600">
    <div class="grid gap-0">
      <mds-text typography="h4">List of the available keys</mds-text>
      <mds-text>
        We've decided to keep only the more commond keys to avoid internationalization issues.
      </mds-text>
    </div>
    <mds-table interactive>
      <mds-table-header>
        <mds-table-header-cell label="key"></mds-table-header-cell>
        <mds-table-header-cell label="name" sortable></mds-table-header-cell>
        <mds-table-header-cell label="group" sortable></mds-table-header-cell>
      </mds-table-header>
      <mds-table-body>
        {keyboardKeyNameDictionary.map((code, index) => (
          <mds-table-row key={index}>
            <mds-table-cell class="align-middle" value={code}>
              <mds-keyboard try>
                <mds-keyboard-key name={code as KeyboardKeyName}></mds-keyboard-key>
              </mds-keyboard>
            </mds-table-cell>
            <mds-table-cell class="align-middle whitespace-nowrap">
              <mds-text typography="snippet">{code}</mds-text>
            </mds-table-cell>
            <mds-table-cell class="align-middle w-full" value={keyboardKeys[code].group}>
              <mds-text>{keyboardKeys[code].group}</mds-text>
            </mds-table-cell>
          </mds-table-row>
        ))}
      </mds-table-body>
    </mds-table>
  </div>
);

export const Default = {
  render: TemplateSingleKey,
};

export const MultipleKeys = {
  render: TemplateMultipleKeys,
};

export const TestMultipleKeys = {
  render: TemplateMultipleKeys,

  args: {
    try: true,
  },
};

export const KeysDictionary = {
  render: TemplateKeysDictionary,
};

/**
 * Every state of the keyboard once the story has opened (#1440, @fixture/states): one key, a
 * combination of two and of three with the `+` the keyboard writes between them, keys drawn as
 * icons, a key of one side, and the test of the combination (`try`) at rest, running with the
 * keys held, passed and failed. The states of a key of its own (each kind of key, the side,
 * pressed) are in the story of mds-keyboard-key. A state only an interaction reaches
 * (`play: true`) is brought there by the play function, which starts the test from its trigger
 * and types the keys on the area that listens to them, and checks `test`, the waiting of the
 * trigger and `pressed` of the keys, not their look. The test that runs holds the focus, so only
 * one runs, the last; the others end before it starts. The tooltip of the trigger opens under the
 * pointer or the focus of the trigger, which a running test takes away: its text (what to do,
 * passed, the error) is left closed, so it covers no other cell.
 */
interface KeyboardState {
  state: string;
  play?: boolean;
  try?: boolean;
  keys: string[];
}

const save = ['control', 's'];

const keyboardStates: KeyboardState[] = [
  { state: 'one key', keys: ['escape'] },
  { state: 'two keys', keys: save },
  { state: 'three keys', keys: ['control', 'shift', 'z'] },
  { state: 'keys drawn as icons', keys: ['command', 'shift', 'z'] },
  { state: 'a key of one side', keys: ['shiftleft', 'd'] },
  { state: 'test, at rest', try: true, keys: save },
  { state: 'test passed', play: true, try: true, keys: save },
  { state: 'test failed', play: true, try: true, keys: save },
  { state: 'test running, keys held', play: true, try: true, keys: save },
];

const TemplateStates = () => (
  <StatesGrid>
    {keyboardStates.map(({ state, play, try: tryCombination, keys }) => (
      <StateCell key={state} state={state} play={play}>
        <div class="flex">
          <mds-keyboard try={tryCombination}>
            {keys.map((name) => (
              <mds-keyboard-key key={name} name={name as KeyboardKeyName}></mds-keyboard-key>
            ))}
          </mds-keyboard>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/**
 * Starts the test of the keyboard of a cell from its trigger, once every Magma element of the cell
 * has loaded, and types the keys on the area that listens to them: each pressed, then the last one
 * released, which ends the test, unless `release` is false.
 */
const typeCombination = async (
  canvasElement: HTMLElement,
  state: string,
  codes: string[],
  release = true,
) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const keyboard = cell.querySelector('mds-keyboard') as HTMLMdsKeyboardElement;
  const trigger = keyboard.shadowRoot!.querySelector(
    '.combination-checker',
  ) as HTMLMdsButtonElement;
  // the keyboard listens to the click on the host of its trigger
  trigger.click();
  const shortcuts = keyboard.shadowRoot!.querySelector('.shortcuts') as HTMLElement;
  codes.forEach((code) =>
    shortcuts.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })),
  );
  if (release) {
    // held a moment, as a person does: the keyboard lets the keys go by removing the attribute
    // `pressed`, so a key released before Stencil reflected its press stays pressed
    await new Promise((resolve) => setTimeout(resolve, 150));
    shortcuts.dispatchEvent(
      new KeyboardEvent('keyup', { code: codes[codes.length - 1], bubbles: true }),
    );
  }
  return { keyboard, trigger };
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const passed = await typeCombination(canvasElement, 'test passed', ['ControlLeft', 'KeyS']);
  await waitFor(() => expect(passed.keyboard).toHaveProperty('test', 'pass'));
  const failed = await typeCombination(canvasElement, 'test failed', ['ControlLeft', 'KeyX']);
  await waitFor(() => expect(failed.keyboard).toHaveProperty('test', 'fail'));
  // the last: the test that runs holds the focus
  const running = await typeCombination(
    canvasElement,
    'test running, keys held',
    ['ControlLeft', 'KeyS'],
    false,
  );
  const held = Array.from(
    running.keyboard.querySelectorAll('mds-keyboard-key'),
  ) as HTMLMdsKeyboardKeyElement[];

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(running.trigger).toHaveProperty('await', true));
  await waitFor(() => held.forEach((key) => expect(key).toHaveProperty('pressed', true)));
  await waitFor(() => expect(running.keyboard.test).toBeUndefined());
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
