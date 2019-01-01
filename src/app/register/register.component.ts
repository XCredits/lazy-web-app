import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService, passwordLength } from '../user.service';
import { AnalyticsService } from '../analytics.service';
// import { ValidateZxcvbnDirective } from './../validate-zxcvbn.directive';

import * as zxcvbn from 'zxcvbn';

const minGuessesLog10 = 9;
// const zxcvbnValidate: ValidatorFn = function (control: FormGroup): ValidationErrors | null {
//   console.log('Ay ' + control);
//   const password = control.get('password');
//   if (zxcvbn(password.value).guesses_log10 > minGuessesLog10) { // sufficiently hard
//     return null;
//   } else {
//     const a:  ValidationErrors = {
//       'guesses_log10': {value: zxcvbn(password.value).guesses_log10}
//     };
//     return a;
//   }
// };

const zxcvbnValidate: ValidatorFn = function (control: AbstractControl): ValidationErrors | null {
  console.log('Ay ' + control);
  const password = control.value;
  if (zxcvbn(password).guesses_log10 > minGuessesLog10) { // sufficiently hard
    return null;
  } else {
    const a:  ValidationErrors = {
      'guesses_log10': {value: zxcvbn(password).guesses_log10}
    };
    return a;
  }
};


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;
  loginRegisterSwitchQueryParams: Params;
  redirectUrl: string;
  currentUsername: string;
  usernameErrorMessage: string;
  currentPassword: string;

  constructor( private http: HttpClient,
      private userService: UserService,
      private activatedRoute: ActivatedRoute,
      private analytics: AnalyticsService,
      // private zxcvbnValidator:  ValidateZxcvbnDirective
      ) {

        // The following is to ensure that when a user is redirected for the
        // purposes of logging in that they are still redirected to the correct
        // on register success.
        this.activatedRoute.queryParams.subscribe((params: Params) => {
          this.loginRegisterSwitchQueryParams = params;
          this.redirectUrl = params.redirect;
        });
      }

  ngOnInit() {
    this.form = new FormGroup ({
      givenName: new FormControl('', [Validators.required]),
      familyName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl(''),
      password: new FormControl('', [Validators.required,
          Validators.minLength(passwordLength),
          zxcvbnValidate,
        ]),
    });
    this.form.valueChanges.subscribe(formData => this.checkUsername(formData));
    // this.form.valueChanges.subscribe(formData => this.checkPassword(formData));
  }

  checkUsername = function (formData)  {
    this.form.controls['username'].setErrors(null);
    const displayUsernameRegex =
        new RegExp(this.userService.displayUsernameRegexString);

    // this.currentUsername - designed to prevent the form from reporting an
    // error if the username has been updated
    const initialUsername = formData.username;
    this.currentUsername = formData.username;
    if (initialUsername.length === 0) {
      this.form.controls['username'].setErrors({'incorrect': true});
      this.usernameErrorMessage = 'Required.';
      return;
    }
    if (!displayUsernameRegex.test(initialUsername)) {
      this.form.controls['username'].setErrors({'incorrect': true});
      this.usernameErrorMessage = 'Not a valid username. Use only a-z, 0-9 and "_", "." or "-".';
      return;
    }
    setTimeout(() => { // Wait 1 second before checking username
      if (initialUsername === this.currentUsername) {
        this.http.post('/api/user/username-available', {
              username: initialUsername,
            })
            .subscribe(data => {
              if (initialUsername === this.currentUsername) {
                if (!data.available) {
                  this.form.controls['username'].setErrors({'incorrect': true});
                  this.usernameErrorMessage =
                      'Username is not available. Please choose another.';
                } else {
                  this.form.controls['username'].setErrors(null);
                }
              }
            },
            errorResponse => {
              this.formErrorMessage = 'There may be a connection issue.';
            });
      } else {
        // console.log('Bailed');
      }
    }, 1000);
  };

  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;

    this.waiting = true;
    this.http.post('/api/user/register', {
          'givenName': formData.givenName,
          'familyName': formData.familyName,
          'email': formData.email,
          'username': formData.username,
          'password': formData.password,
        })
        .subscribe(data => {
          this.waiting = false;
          this.userService.authenticationResult(data);
          this.userService.successNavigate(this.redirectUrl);
          this.analytics.register();
        },
        errorResponse => {
          this.waiting = false;
          if (errorResponse.status === 409) {
            this.formErrorMessage = errorResponse.error.message;
            this.form.controls['username'].setErrors({'incorrect': true});
          } else {
            this.formErrorMessage = 'There was a problem submitting the form.';
          }
        });
  };
}
