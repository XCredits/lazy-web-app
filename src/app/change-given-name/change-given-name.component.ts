import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-change-given-name',
  templateUrl: './change-given-name.component.html',
  styleUrls: ['./change-given-name.component.scss']
})

export class ChangeGivenNameComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;

  constructor(private http: HttpClient,
    private userService: UserService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      givenName: new FormControl('', [Validators.required]),
    });
  }

  submit(formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;

    this.waiting = true;
    this.http.post('/api/user/change-given-name', {
          'givenName': formData.givenName,
        })
        .subscribe(data => {
          this.waiting = false;
          this.submitSuccess = true;
          location.reload(true);
        },
        errorResponse => {
          this.waiting = false;
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  }
}
