import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService} from '../user.service';
import { Organization } from '../organization.service';
import { Router } from '@angular/router';
import { OrganizationService } from '../organization.service';

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
  examination = 'Hello';

  constructor(private userService: UserService, private http: HttpClient,
      private router: Router, private organizationService: OrganizationService) {

  }

  ngOnInit() {
    this.http.get<Organization>('/api/organization/details', {})
        .subscribe((org) =>  {
          this.organization = org;
        });
  }

  test(testing) {
    this.organizationService.setData(testing);
    this.router.navigateByUrl('/update-organization');
  }
}

