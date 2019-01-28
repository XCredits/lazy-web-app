import { Component, OnInit, Input } from '@angular/core';
import { OrganizationService, Organization } from '../organization.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-organization',
  templateUrl: './update-organization.component.html',
  styleUrls: ['./update-organization.component.scss']
})
export class UpdateOrganizationComponent implements OnInit {
  form: FormGroup;
  organization: Organization;
  successMessage: string;
  submitSuccess = false;

  constructor(private organizationService: OrganizationService, private http: HttpClient,
              private router: Router) { }

  ngOnInit() {
    this.organizationService.getData()
      .subscribe(organization => {
        this.form = new FormGroup ({
          organisationName: new FormControl(organization.organisationName),
          website: new FormControl(organization.website),
          phoneNumber: new FormControl(organization.phoneNumber),
          orgUsername: new FormControl(organization.organisationName)
      });
      this.organization = organization;
      console.log(this.organization._id);
    });
  }

  submit = function(formData) {
    if (this.form.invalid) {
      return;
    }
    this.http.post('/api/organization/update-details', {
        'id': this.organization._id,
        'organisationName': formData.organisationName,
        'website': formData.website,
        'phoneNumber': formData.phoneNumber,
        'orgUsername': formData.orgUsername,
    })
    .subscribe(() => {
      this.submitSuccess = true;
      this.successMessage = 'Success';
      this.router.navigateByUrl('/organization');
    });
  };
}
