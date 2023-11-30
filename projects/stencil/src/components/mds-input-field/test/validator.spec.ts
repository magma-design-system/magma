/* eslint-disable quote-props */
import { MdsValidatorFn, Validator, isbnValidatorFn } from '../meta/validators'

let validator = new Validator()

const required: MdsValidatorFn = (input: string) => {
  return input.length !== 0 ? null : { required: 'string required' }
}

beforeEach(() => {
  validator = new Validator()
})

describe('validator', () => {
  describe('create new validator', () => {
    it('new validator should be valid', () => {
      expect(validator.isValid).toBeTruthy()
    })

    it('errors should be null', () => {
      expect(validator.errors).toBeNull()
    })
  })

  describe('validate empty validator with empty string', () => {
    validator.validate('')
    it('should be valid', () => {
      expect(validator.isValid).toBeTruthy()
    })
    it('errors should be null', () => {
      expect(validator.errors).toBeNull()
    })
  })

  describe('validate empty validator with string', () => {
    validator.validate('test')
    it('should be valid', () => {
      expect(validator.isValid).toBeTruthy()
    })
    it('errors should be null', () => {
      expect(validator.errors).toBeNull()
    })
  })

  describe('add validators', () => {
    it('has validator required', () => {
      validator.addValidator(required)
      expect(validator.hasValidator(required)).toBeTruthy()
    })
    it('has validator isbn', () => {
      validator.addValidator(isbnValidatorFn)
      expect(validator.hasValidator(isbnValidatorFn)).toBeTruthy()
    })
    it('hasn\'t validator', () => {
      expect(validator.hasValidator(required)).toBeFalsy()
      expect(validator.hasValidator(isbnValidatorFn)).toBeFalsy()
    })
  })

  describe('remove validator', () => {
    beforeEach(() => {
      validator.addValidator(required)
    })

    it('remove exist validator', () => {
      expect(validator.hasValidator(required)).toBeTruthy()
      validator.removeValidator(required)
      expect(validator.hasValidator(required)).toBeFalsy()
    })

    it('remove not exist validator', () => {
      expect(validator.hasValidator(required)).toBeTruthy()
      expect(validator.hasValidator(isbnValidatorFn)).toBeFalsy()

      validator.removeValidator(isbnValidatorFn)

      expect(validator.hasValidator(required)).toBeTruthy()
      expect(validator.hasValidator(isbnValidatorFn)).toBeFalsy()
    })
  })

  describe('isbn validator', () => {
    beforeEach(() => {
      validator.addValidator(isbnValidatorFn)
    })

    it('isbn-10 format correct', () => {
      validator.validate('885152159X')
      expect(validator.isValid).toBeTruthy()
      expect(validator.errors).toBeNull()
    })
    it('isbn-10 format correct', () => {
      validator.validate('8851521581')
      expect(validator.isValid).toBeTruthy()
      expect(validator.errors).toBeNull()
    })
    it('isbn-13 format correct', () => {
      validator.validate('9788843025343')
      expect(validator.isValid).toBeTruthy()
      expect(validator.errors).toBeNull()
    })
    it('isbn format incorrect', () => {
      validator.validate('test')
      expect(validator.isValid).toBeFalsy()
      expect(validator.errors).toEqual({
        'isbn-error': 'formato isbn non correto',
      })
    })

    it('isbn-10 not valid', () => {
      validator.validate('8851521599')
      expect(validator.isValid).toBeFalsy()
      expect(validator.errors).toEqual({
        'isbn-error': 'codice isbn non valido',
      })
    })
    it('isbn-13 not valid', () => {
      validator.validate('8851521599123')
      expect(validator.errors).toEqual({
        'isbn-error': 'codice isbn non valido',
      })
      expect(validator.isValid).toBeFalsy()

    })
  })
})
