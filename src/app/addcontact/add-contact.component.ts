import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { AnalyticsService } from '../analytics.service';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactsComponent implements OnInit {
  form: FormGroup;
  waiting = false;
  formErrorMessage: string;
  submitSuccess: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;
    this.submitSuccess = false;
    this.waiting = true;
    console.log('before function');
    this.http.post('/api/join-contact-list1', {
          'givenName': formData.givenName,
          'familyName': formData.familyName,
          'email': formData.email
        })
        .subscribe(data => {
          this.waiting = false;
          this.submitSuccess = true;
          console.log('subscribe...');
        },
        errorResponse => {
          this.waiting = false;
          console.log('error ... ');
          console.dir(errorResponse);
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  };
}
