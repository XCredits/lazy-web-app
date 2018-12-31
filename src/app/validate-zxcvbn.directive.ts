import { Directive } from '@angular/core';
import * as zxcvbn from 'zxcvbn';
import { ValidatorFn,  ValidationErrors, AbstractControl } from '@angular/forms';

const minGuessesLog10 = 8;

@Directive({
  selector: '[appValidateZxcvbn]'
})
export class ValidateZxcvbnDirective {
  constructor() { }

  validate(): ValidatorFn {
    return function(control: AbstractControl) {
      if (zxcvbn(control.value).guesses_log10 > minGuessesLog10) { // sufficiently hard
        return null;
      } else {
        const a:  ValidationErrors = {
          'guesses_log10': {value: zxcvbn(control.value).guesses_log10}
        };
        return a;
      }
    }
  }
}
