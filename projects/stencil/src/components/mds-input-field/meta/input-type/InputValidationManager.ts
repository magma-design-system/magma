import { InputFieldType } from '../types'
import { Validator, isbnValidatorFn } from '../validators'
import { InputMaskPattern } from './InputMaskPattern'

// TODO use input mask when it will be supported by shadow dom
// https://github.com/RobinHerbots/Inputmask/pull/2753
// import InputMask from 'inputmask'

export class InputValidationManager {

  pattern: string | undefined
  validator: Validator = new Validator()

  // private _inputMask: InputMask.Instance

  constructor (pattern?: string) {
    this.pattern = pattern
    // this._inputMask = new InputMask()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mask (_nativeInput: HTMLInputElement | null | undefined): void {
    if (!this.pattern){
      throw new Error('no pattern found, set pattern before mask')
    }

    // const inputMaskOptions : InputMask.Options = {
    //   mask: this.pattern,
    // }
    // this._inputMask = new InputMask(inputMaskOptions)

    // if (!nativeInput) throw new Error('input undefined or null')
    // this._inputMask.mask(nativeInput)
  }

  isValid (value: string): boolean {
    this.validator.validate(value)
    // if (this.pattern) {
    //   return this._inputMask.isValid() && this.validator.isValid
    // }
    return this.validator.isValid
  }
}

export function createInputValidationManager (type: InputFieldType) : InputValidationManager {

  let inputManager: InputValidationManager
  switch (type) {
  case 'tel':
    inputManager = new InputValidationManager('')
    break
  case 'url':
    inputManager = new InputValidationManager('')
    break
  case 'cc':
    inputManager = new InputValidationManager(InputMaskPattern.CC_MASK)
    break
  case 'cf':
    inputManager = new InputValidationManager(InputMaskPattern.CF_MASK)
    inputManager.validator.addValidator((input: string) => {
      return InputMaskPattern.CF_Regex.test(input) ? null : { 'cf-regex': 'Codice fiscale inserito non corretto' }
    })
    inputManager.validator.addValidator((input: string) => {
      return input.length === 16 ? null : { 'cf-length': 'Codice fiscale deve essere lungo 16 caratteri' }
    })
    break
  case 'isbn':
    inputManager = new InputValidationManager()
    inputManager.validator.addValidator(isbnValidatorFn)
    break
  case 'piva':
    inputManager = new InputValidationManager('')
    break
  default:
    inputManager = new InputValidationManager('')
  }

  return inputManager
}
