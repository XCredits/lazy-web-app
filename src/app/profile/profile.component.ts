import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  constructor(
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
            username: new FormControl(user.username, [Validators.required,
              Validators.pattern(this.userService.displayUsernameRegexString)]),
          });
        });
    this.form.valueChanges.subscribe(changes => this.wasFormChanged(changes));
  }

  handleImageUpload(imageUrl: string) {
    this.userService.updateUserDetails();
  }

  handleImageError() {
    this.user.profileImage = '';
  }

  private wasFormChanged(currentValue) {
    const fields = ['givenName', 'familyName', 'email', 'username'];
    this.disableButton = true;
    this.submitSuccess = false;
    this.formErrorMessage = undefined;
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
