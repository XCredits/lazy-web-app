import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;
  // Password related interface features
  currentPassword: string;
  passwordErrorMessage: string;
  passwordGuessesLog10 = 0;
  passwordProgressBarValue = 0;
  passwordSettings = { // note that these values may be overridden by the server response
    minLength: 10,
    minGuessesLog10: 8,
    goodGuessesLog10: 10,
  };

  constructor( private http: HttpClient,
    private userService: UserService) {
  }

  ngOnInit() {
    this.form = new FormGroup ({
      password: new FormControl(''),
    });
    this.form.valueChanges.subscribe(formData => this.checkPassword(formData));
  }

  checkPassword = function (formData)  {
    this.form.controls['password'].setErrors(null);

    // this.currentPassword - designed to prevent the form from reporting an
    // error if the password has been updated
    const initialPassword = formData.password;
    this.currentPassword = formData.password;
    console.log('initialPassword ' + initialPassword);
    if (initialPassword.length === 0) {
      console.log('Zero length');
      this.form.controls['password'].setErrors({'incorrect': true});
      this.passwordErrorMessage = 'Required.';
      return;
    }

    setTimeout(() => { // Wait half second before checking password
      if (initialPassword === this.currentPassword) {
        this.http.post('/api/user/check-password', {
              password: initialPassword,
            })
            .subscribe(data => {
              if (initialPassword === this.currentPassword) {
                // Update the password settings
                this.passwordSettings.minLength =
                    data.passwordSettings.minLength;
                this.passwordSettings.minGuessesLog10 =
                    data.passwordSettings.minGuessesLog10;
                this.passwordSettings.goodGuessesLog10 =
                    data.passwordSettings.goodGuessesLog10;
                this.passwordProgressBarValue = data.guessesLog10 > 12 ?
                    100 : 100 / 12 * data.guessesLog10;
                this.passwordGuessesLog10 = data.guessesLog10;
                if (initialPassword.length < data.passwordSettings.minLength ||
                    data.guessesLog10 < data.passwordSettings.minGuessesLog10) {
                  this.form.controls['password'].setErrors({'incorrect': true});
                  this.passwordErrorMessage =
                      'Password must be at least 10 characters and hard to guess.';
                } else {
                  this.form.controls['password'].setErrors(null);
                }
              }
            },
            errorResponse => {
              this.formErrorMessage = 'There may be a connection issue.';
            });
      } else {
        // console.log('Bailed');
      }
    }, 500);
  };

  updatePasswordProgressColor(progress) {
    if (this.passwordGuessesLog10 < this.passwordSettings.minGuessesLog10) {
      return 'simple-form-red-progress';
    } else if (this.passwordGuessesLog10 <
        this.passwordSettings.goodGuessesLog10) {
      return 'simple-form-yellow-progress';
    } else {
      return 'simple-form-green-progress';
    }
  }

  submit(formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;

    this.waiting = true;
    this.http.post('/api/user/change-password', {
          'password': formData.password,
        })
        .subscribe(data => {
          this.waiting = false;
          this.submitSuccess = true;
        },
        errorResponse => {
          this.waiting = false;
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  }
}
