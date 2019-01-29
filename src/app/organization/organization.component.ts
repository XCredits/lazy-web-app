import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class OrganizationComponent implements OnInit, OnDestroy {

  form: FormGroup;
  organization: Organization;
  view = false;
  examination = 'Hello';
  isAdmin: boolean;
  roles = [];
  constructor(private userService: UserService, private http: HttpClient,
      private router: Router, private organizationService: OrganizationService) {

  }

  ngOnInit() {
    this.http.get<Organization>('/api/organization/details', {})
        .subscribe(org =>  {
          this.organization = org;
        });
    this.http.get('/api/organization/get-roles', {})
        .subscribe(org => {
          const length = Object.keys(org).length;
          for ( let i = 0; i < length; i++) {
            if ( org[i][0] === 'POS') {
              this.isAdmin = false;
            } else if (org[i][0] === 'admin') {
              this.isAdmin = true;
            }
          }
        });
  }

  sendOrg(organization) {
    this.router.navigate(['/organization/' + organization.username + '/update']);
  }

  test(test) {
    this.organizationService.setData(test);
    this.router.navigate(['/organization/add-user']);
  }

  ngOnDestroy() {
    console.log('Destroyed');
  }
}

