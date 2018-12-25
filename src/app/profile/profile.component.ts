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

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
    this.userService.userObservable
        .subscribe(user => {
          this.form = new FormGroup ({
            givenName: new FormControl(user.givenName),
            familyName: new FormControl(user.familyName),
            username: new FormControl(user.username),
            email: new FormControl(user.email),
          });
        });
    } else {
      this.form = new FormGroup ({
        givenName: new FormControl(''),
        familyName: new FormControl(''),
        username: new FormControl(''),
        email: new FormControl(''),
      });
    }
  }
  something() {
    console.log('Hello');

  }
  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;
    this.waiting = true;
    this.http.post('/api/join-mailing-list', {
        'givenName': formData.givenName,
        'familyName': formData.familyName,
        'username': formData.username,
        'email': formData.email
        });
  };
}
