import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  waiting = false;
  formErrorMessage: string;
  originalGiven: any;
  disableButton = true;
  submitSuccess = false;
  originalFamily: any;
  originalEmail: any;
  user: User;

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.http.get<User>('/api/user/details', {})
        .subscribe((user) =>  {
          this.user = user;
        });
    if (this.userService.isLoggedIn()) {
      this.userService.userObservable
        .subscribe(user => {
          this.form = new FormGroup ({
            givenName: new FormControl(user.givenName),
            familyName: new FormControl(user.familyName),
            email: new FormControl(user.email),
            username: new FormControl(user.username),
          });
        });
    } else {
      this.form = new FormGroup ({
        givenName: new FormControl(''),
        familyName: new FormControl(''),
        email: new FormControl(''),
        username: new FormControl(''),
      });
    }
    this.form.valueChanges.subscribe(changes => this.wasFormChanged(changes));
  }
  private wasFormChanged(currentValue) {
    const fields = ['givenName', 'familyName', 'email', 'username'];

    this.disableButton = true;
    fields.forEach(element => {
      if (this.user[element] !== currentValue[element]) {
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
    this.formErrorMessage = undefined;
    this.http.post('/api/user/save-details', {
      'email': formData.email,
      'givenName': formData.givenName,
      'familyName': formData.familyName,
      'username': formData.username,
    })
    .subscribe(data => {
      this.submitSuccess = true;
      this.disableButton = true;
      this.userService.updateUserDetails();
    },
    errorResponse => {
      this.disableButton = true;
      this.formErrorMessage = 'There was a problem submitting the form.';
    });
  };
}

interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}
