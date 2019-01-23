import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  success = false;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.form = new FormGroup ({
      organisationName: new FormControl(''),
      website: new FormControl(''),
      phoneNumber: new FormControl(''),
      orgUsername: new FormControl('')
    });
  }

  submit = function(formData) {
    if (this.form.invalid) {
      return;
    }
    this.http.post('/api/organisation/register', {
          'organisationName': formData.organisationName,
          'website': formData.website,
          'phoneNumber': formData.phoneNumber,
          'orgUsername': formData.orgUsername,
    })
    .subscribe(data => {
      this.success = true;
    },
    errorResponse => {
      this.success = false;
    });
  };
}
