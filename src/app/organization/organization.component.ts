import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, Organization } from '../user.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {

  form: FormGroup;
  organization: Organization;
  view = false;
  imageUploadRoute = 'api/organization/image-upload';

  constructor(private userService: UserService, private http: HttpClient) {

  }

  ngOnInit() {
    this.http.get<Organization>('/api/organization/details', {})
        .subscribe((org) =>  {
          this.organization = org;
        });
  }
}

