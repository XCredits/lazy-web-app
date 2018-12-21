import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';


@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.scss']
})
export class ChangeEmailComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;

  constructor(private http: HttpClient,
    private userService: UserService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  submit(formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;

    this.waiting = true;
    this.http.post('/api/user/change-email', {
          'email': formData.email,
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

  something() {
    location.reload();
  }
}
