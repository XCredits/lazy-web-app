import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form: FormGroup;

  disableButton = true;
  waiting = false;
  submitSuccess = false;
  formErrorMessage: string;
  user: User;
  profileImage: string;
  usernameErrorMessage: string;
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.http.get<User>('/api/user/details', {})
        .subscribe((user) =>  {
          this.user = user;
        });
    this.userService.userObservable
        .subscribe(user => {
          this.profileImage = user.profileImage;
          this.form = new FormGroup ({
            givenName: new FormControl(user.givenName, [Validators.required]),
            familyName: new FormControl(user.familyName, [Validators.required]),
            email: new FormControl(user.email, [Validators.required, Validators.email]),
            username: new FormControl(user.displayUsername, [Validators.required,
              Validators.pattern(this.userService.displayUsernameRegexString)]),
          });
        });
    this.form.valueChanges.subscribe(changes => this.wasFormChanged(changes));
    this.form.valueChanges.subscribe(changes => this.checkUsername(changes));
  }

  checkUsername = function (formData)  {
    this.form.controls['username'].setErrors(null);
    const displayUsernameRegex =
        new RegExp(this.userService.displayUsernameRegexString);

    // this.currentUsername - designed to prevent the form from reporting an
    // error if the username has been updated
    const initialUsername = this.user.username;
    const displayUsername = this.user.displayUsername;
    this.currentUsername = this.normalizeUsername(formData.username);
    this.currentDisplayName = formData.username;
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
      if (initialUsername !== this.currentUsername) {
        this.http.post('/api/user/username-available', {
              username: this.currentUsername,
            })
            .subscribe(data => {
              if (initialUsername !== this.currentUsername || this.currentDisplayName !== displayUsername) {
                if (!data.available) {
                  this.disableButton = true;
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
      }
    }, 1000);
  };

  normalizeUsername(username) {
    return username
        .split('.').join('')
        .split('_').join('')
        .split('-').join('')
        .toLowerCase();
  }

  handleImageUpload(imageUrl: string) {
    this.userService.updateUserDetails();
    this.snackBar.open('Image Uploaded Successfully', 'Dismiss', {
             duration: 5000,
             verticalPosition: 'top',
             horizontalPosition: 'right',
           });
  }

  handleImageError() {
    this.user.profileImage = '';
  }

  private wasFormChanged(currentValue) {
    const fields = ['givenName', 'familyName', 'email'] ;
    this.disableButton = true;
    this.submitSuccess = false;
    this.formErrorMessage = undefined;
    const tempUsername = this.normalizeUsername(currentValue.username);
    const tempDisplayName = this.user.displayUsername;
    fields.forEach(element => {
      if (this.user[element] !== currentValue[element]
          || tempUsername !== this.user.username
          || tempDisplayName !== currentValue.username) {
        this.disableButton = false;
        return;
      }
    });
  }

  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.waiting = true;
    this.submitSuccess = false;
    this.formErrorMessage = undefined;
    this.http.post('/api/user/save-details', {
          'email': formData.email,
          'givenName': formData.givenName,
          'familyName': formData.familyName,
          'username': formData.username,
        })
        .subscribe(data => {
          this.waiting = false;
          this.submitSuccess = true;
          this.disableButton = true;
          this.userService.updateUserDetails();
        },
        errorResponse => {
          this.waiting = false;
          this.disableButton = true;
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  };
}
