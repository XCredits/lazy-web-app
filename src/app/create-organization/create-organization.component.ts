import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss']
})
export class CreateOrganizationComponent implements OnInit {
  disableButton = false;
  form: FormGroup;
  formErrorMessage: string;
  usernameErrorMessage: string;

  constructor(private http: HttpClient,
              private router: Router,
              private userService: UserService) {
  }

  ngOnInit() {
    this.form = new FormGroup ({
      name: new FormControl('', [Validators.required]),
      website: new FormControl(''),
      phoneNumber: new FormControl(''),
      username: new FormControl('', [Validators.required])
    });
    this.form.valueChanges.subscribe(changes => this.checkUsername(changes));
  }

  checkUsername = function (formData)  {
    this.form.controls['username'].setErrors(null);
    // this.currentUsername - designed to prevent the form from reporting an
    // error if the username has been updated
    const initialUsername = formData.username;
    this.currentUsername = formData.username;
    if (initialUsername.length === 0) {
      this.form.controls['username'].setErrors({'incorrect': true});
      this.usernameErrorMessage = 'Required.';
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

  normalizeUsername(username) {
    return username
        .split('.').join('')
        .split('_').join('')
        .split('-').join('')
        .toLowerCase();
  }

  submit = function(formData) {
    if (this.form.invalid) {
      return;
    }
    this.formErrorMessage = undefined;
    this.disableButton = false;
    this.http.post('/api/organization/create', {
          'name': formData.name,
          'website': formData.website,
          'phoneNumber': formData.phoneNumber,
          'username': formData.username,
    })
    .subscribe(() => {
      this.disableButton = false;
      this.router.navigateByUrl('/organization');
    },
    (errorResponse) => {
      this.formErrorMessage = errorResponse.error.message;
    });
  };
}


