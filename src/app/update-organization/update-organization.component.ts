import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationService, Organization } from '../organization.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-update-organization',
  templateUrl: './update-organization.component.html',
  styleUrls: ['./update-organization.component.scss']
})
export class UpdateOrganizationComponent implements OnInit, OnDestroy {
  form: FormGroup;
  organization: Organization;
  successMessage: string;
  submitSuccess = false;
  imageUploadRoute = '/api/organization/image-upload';
  logo: string;
  sub: any;
  ready = false;

  constructor(private snackBar: MatSnackBar, private http: HttpClient,
              private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.http.get<Organization>('/api/organization/get-details', {
        params: {
          username: params.orgUsername
        }
      })
      .subscribe(organization => {
          this.organization = organization;
          this.logo = organization.logo;
          this.form = new FormGroup ({
            name: new FormControl(organization.name),
            website: new FormControl(organization.website),
            phoneNumber: new FormControl(organization.phoneNumber),
            username: new FormControl(organization.username)
        });
        this.ready = true;
      });
    });
  }
  handleImageUpload(imageUrl: string) {
    this.snackBar.open('Image Uploaded Successfully', 'Dismiss', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }

  handleImageError() {
    this.organization.logo = '';
  }

  submit = function(formData) {
    if (this.form.invalid) {
      return;
    }
    this.http.post('/api/organization/update-details', {
        'id': this.organization._id,
        'name': formData.name,
        'website': formData.website,
        'phoneNumber': formData.phoneNumber,
        'username': formData.username,
    })
    .subscribe(() => {
      this.submitSuccess = true;
      this.successMessage = 'Success';
      this.router.navigateByUrl('/organization');
    });
  };

    ngOnDestroy() {
      console.log('Test');
    }
}
