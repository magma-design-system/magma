import miBaselineCheckbox from '@icon/mi/baseline/check-box.svg'
import miBaselineIndeterminateCheckbox from '@icon/mi/baseline/indeterminate-check-box.svg'
import miBaselineCheckboxOutlineBlank from '@icon/mi/baseline/check-box-outline-blank.svg'
import miBaselineRadioButtonChecked from '@icon/mi/baseline/radio-button-checked.svg'
import miBaselineRadioButtonUnchecked from '@icon/mi/baseline/radio-button-unchecked.svg'

const inputSwitchIconVariant = {
  switch: {
    iconChecked: '',
    iconIndeterminate: '',
    iconUnchecked: '',
  },
  checkbox: {
    iconChecked: miBaselineCheckbox,
    iconIndeterminate: miBaselineIndeterminateCheckbox,
    iconUnchecked: miBaselineCheckboxOutlineBlank,
  },
  radio: {
    iconChecked: miBaselineRadioButtonChecked,
    iconIndeterminate: '',
    iconUnchecked: miBaselineRadioButtonUnchecked,
  },
}

export {
  inputSwitchIconVariant,
}
