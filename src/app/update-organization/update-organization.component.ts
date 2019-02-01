import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationService, Organization } from '../organization.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { MatDialog } from '@angular/material';

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
  modalReference = null;
  users: Array<string> = [];
  userToBeDeleted: any;

  constructor(private snackBar: MatSnackBar, private http: HttpClient,
              private router: Router, private route: ActivatedRoute, private dialogService: MatDialog) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.http.post<Organization>('/api/organization/get-details', {
          'username': params.orgUsername
      })
      .subscribe(organization => {
          this.organization = organization['orgDetail'];
          this.logo = organization.logo;
          this.users = organization['users'];
          this.form = new FormGroup ({
            name: new FormControl(organization['orgDetail'].name, Validators.required),
            website: new FormControl(organization['orgDetail'].website, Validators.required),
            phoneNumber: new FormControl(organization['orgDetail'].phoneNumber),
            username: new FormControl(organization['orgDetail'].username, Validators.required),
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
  openDialog(modal) {
    this.modalReference = this.dialogService.open(modal);
  }
  deleteOrg() {
    this.modalReference.close();
    this.http.post('api/organization/delete', {
      'id': this.organization._id,
    })
    .subscribe(() => {
      this.router.navigateByUrl('/organization');
      this.snackBar.open('Organization deleted Successfully', 'Dismiss', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
    });
  }

  cancel() {
    this.modalReference.close();
  }

  userDialog(user, modal) {
    this.userToBeDeleted = user;
    this.modalReference = this.dialogService.open(modal, user);
  }

  delUser() {
    this.http.post('/api/organization/delete-user', {
      'userId': this.userToBeDeleted,
      'orgId': this.organization._id,
    })
    .subscribe((data) => {
      const userIndex = this.users.findIndex((user) => user['_id'] === this.userToBeDeleted);
      this.users.splice(userIndex, 1);
    });
    this.modalReference.close();
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
