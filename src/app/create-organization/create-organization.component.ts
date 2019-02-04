import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss']
})
export class CreateOrganizationComponent implements OnInit {
  disableButton = false;
  form: FormGroup;
  formErrorMessage: string;

  constructor(private http: HttpClient, private router: Router) {
  }

  ngOnInit() {
    this.form = new FormGroup ({
      name: new FormControl('', [Validators.required]),
      website: new FormControl(''),
      phoneNumber: new FormControl(''),
      username: new FormControl('', [Validators.required])
    });
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


