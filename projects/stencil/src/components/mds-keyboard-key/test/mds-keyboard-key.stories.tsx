import { h } from '@stencil/core';
import { KeyboardKeyName, keyboardKeyNameDictionary } from '@type/keyboard';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Tags / Keyboard / Key',
  id: 'ui-keyboard-key',
  argTypes: {
    name: {
      type: { name: 'string' },
      description:
        'Sets the name of the keyboard key for combination tests if `try` attribute is set from `mds-keyboard` parent component',
      options: keyboardKeyNameDictionary,
      control: { type: 'select' },
    },
  },
};

const TemplateSingleKey = (args) => (
  <mds-keyboard>
    <mds-keyboard-key {...args}></mds-keyboard-key>
  </mds-keyboard>
);

export const Default = {
  render: TemplateSingleKey,

  args: {
    name: 'control',
  },
};

/**
 * Every state a key has of its own once the story has opened (#1440, @fixture/states), each key
 * in a keyboard of its own, as a key is never used outside one: the key written with its alias
 * (a character, a number, a function key, a modifier, a special key), the key drawn as an icon,
 * the space twice as wide, the key of one side with its `l` or `r`, the key without a name and
 * the pressed key. The states that come from the keyboard (the `+` between the keys, the test of
 * the combination and its result) are in the story of mds-keyboard. `pressed` belongs to the
 * keyboard, which sets it during its test, so the play function starts the test of the last cell
 * and holds its keys, and checks `pressed`, not its look. The key pressed under the pointer
 * (`:active`) needs a real pointer, which a play does not move.
 */
interface KeyState {
  state: string;
  play?: boolean;
  keys: string[];
}

const keyStates: KeyState[] = [
  { state: 'character and number', keys: ['a', '1'] },
  { state: 'function key', keys: ['f1', 'f12'] },
  { state: 'modifier, written', keys: ['control', 'alt'] },
  { state: 'modifier, drawn', keys: ['command', 'option', 'shift', 'windows'] },
  { state: 'special key, written', keys: ['escape'] },
  { state: 'special key, drawn', keys: ['enter', 'tab', 'backspace', 'delete', 'capslock'] },
  { state: 'arrow', keys: ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'] },
  { state: 'navigation', keys: ['home', 'end', 'pageup', 'pagedown'] },
  { state: 'space, twice as wide', keys: ['space'] },
  { state: 'left side, written', keys: ['controlleft', 'altleft'] },
  { state: 'right side, written', keys: ['controlright', 'altright'] },
  { state: 'left side, drawn', keys: ['shiftleft', 'commandleft', 'optionleft', 'windowsleft'] },
  {
    state: 'right side, drawn',
    keys: ['shiftright', 'commandright', 'optionright', 'windowsright'],
  },
  { state: 'without a name', keys: [''] },
];

const pressedState = 'pressed, in the test of its keyboard';

const TemplateStates = () => (
  <StatesGrid>
    {keyStates.map(({ state, keys }) => (
      <StateCell key={state} state={state}>
        <div class="flex flex-wrap gap-200">
          {keys.map((name) => (
            <mds-keyboard key={name}>
              <mds-keyboard-key name={name as KeyboardKeyName}></mds-keyboard-key>
            </mds-keyboard>
          ))}
        </div>
      </StateCell>
    ))}
    <StateCell key={pressedState} state={pressedState} play>
      <div class="flex">
        <mds-keyboard try>
          <mds-keyboard-key name="shift"></mds-keyboard-key>
          <mds-keyboard-key name="s"></mds-keyboard-key>
        </mds-keyboard>
      </div>
    </StateCell>
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, pressedState);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const keyboard = cell.querySelector('mds-keyboard') as HTMLMdsKeyboardElement;
  // the keyboard starts its test on a click on the host of its trigger, and listens to the keys
  // on the area of its keys
  (keyboard.shadowRoot!.querySelector('.combination-checker') as HTMLElement).click();
  const shortcuts = keyboard.shadowRoot!.querySelector('.shortcuts') as HTMLElement;
  ['ShiftLeft', 'KeyS'].forEach((code) =>
    shortcuts.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })),
  );
  const keys = Array.from(cell.querySelectorAll('mds-keyboard-key')) as HTMLMdsKeyboardKeyElement[];

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => keys.forEach((key) => expect(key).toHaveProperty('pressed', true)));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
