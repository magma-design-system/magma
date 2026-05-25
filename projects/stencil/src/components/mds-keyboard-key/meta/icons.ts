import miBaselineKeyboardReturn from '@icon/mi/baseline/keyboard-return.svg'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import miBaselineKeyboardArrowLeft from '@icon/mi/baseline/keyboard-arrow-left.svg'
import miBaselineKeyboardArrowRight from '@icon/mi/baseline/keyboard-arrow-right.svg'
import miBaselineKeyboardTab from '@icon/mi/baseline/keyboard-tab.svg'
import miBaselineKeyboardCommandKey from '@icon/mi/baseline/keyboard-command-key.svg'
import miBaselineKeyboardOptionKey from '@icon/mi/baseline/keyboard-option-key.svg'
import miSharpWindow from '@icon/mi/sharp/window.svg'
import miOutlineBackspace from '@icon/mi/outline/backspace.svg'
import miBaselineKeyboardCapslock from '@icon/mi/baseline/keyboard-capslock.svg'
import mdiKeyboardSpace from '@icon/mdi/keyboard-space.svg'
import miBaselineNorth from '@icon/mi/baseline/north.svg'
import miBaselineSouth from '@icon/mi/baseline/south.svg'
import mdiKeyboardShift from '@icon/mdi/apple-keyboard-shift.svg'
import miBaselineVerticalAlignTop from '@icon/mi/baseline/vertical-align-top.svg'
import miBaselineVerticalAlignBottom from '@icon/mi/baseline/vertical-align-bottom.svg'
import { KeyboardKeyName } from 'src/components'

const icons = new Map<KeyboardKeyName, string>()
icons.set('arrowdown', miBaselineKeyboardArrowDown)
icons.set('arrowleft', miBaselineKeyboardArrowLeft)
icons.set('arrowright', miBaselineKeyboardArrowRight)
icons.set('arrowup', miBaselineKeyboardArrowUp)
icons.set('command', miBaselineKeyboardCommandKey)
icons.set('commandleft', miBaselineKeyboardCommandKey)
icons.set('commandright', miBaselineKeyboardCommandKey)
icons.set('delete', miOutlineBackspace)
icons.set('capslock', miBaselineKeyboardCapslock)
icons.set('backspace', miOutlineBackspace)
icons.set('enter', miBaselineKeyboardReturn)
icons.set('home', miBaselineVerticalAlignTop)
icons.set('end', miBaselineVerticalAlignBottom)
icons.set('option', miBaselineKeyboardOptionKey)
icons.set('optionleft', miBaselineKeyboardOptionKey)
icons.set('optionright', miBaselineKeyboardOptionKey)
icons.set('pagedown', miBaselineSouth)
icons.set('pageup', miBaselineNorth)
icons.set('shift', mdiKeyboardShift)
icons.set('shiftleft', mdiKeyboardShift)
icons.set('shiftright', mdiKeyboardShift)
icons.set('space', mdiKeyboardSpace)
icons.set('tab', miBaselineKeyboardTab)
icons.set('windows', miSharpWindow)
icons.set('windowsleft', miSharpWindow)
icons.set('windowsright', miSharpWindow)

export { icons }
