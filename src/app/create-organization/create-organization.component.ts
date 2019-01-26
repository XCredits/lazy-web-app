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
      organisationName: new FormControl('', [Validators.required]),
      website: new FormControl(''),
      phoneNumber: new FormControl(''),
      orgUsername: new FormControl('', [Validators.required])
    });
  }

  submit = function(formData) {
    if (this.form.invalid) {
      return;
    }
    this.disableButton = false;
    this.http.post('/api/organization/create', {
          'organisationName': formData.organisationName,
          'website': formData.website,
          'phoneNumber': formData.phoneNumber,
          'orgUsername': formData.orgUsername,
    })
    .subscribe(data => {
      this.disableButton = false;
      this.router.navigateByUrl('/organization');
    },
    errorResponse => {
      this.formErrorMessage = 'Error submitting the form';
    });
  };
}


