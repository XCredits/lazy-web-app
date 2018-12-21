import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';


@Component({
  selector: 'app-change-family-name',
  templateUrl: './change-family-name.component.html',
  styleUrls: ['./change-family-name.component.scss']
})
export class ChangeFamilyNameComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;

  constructor(private http: HttpClient,
    private userService: UserService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      familyName: new FormControl('', [Validators.required]),
    });
  }

  submit(formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;

    this.waiting = true;
    this.http.post('/api/user/change-family-name', {
          'familyName': formData.familyName,
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
