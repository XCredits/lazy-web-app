import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Organization } from '../organization.service';
import { Router } from '@angular/router';
import { OrganizationService } from '../organization.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {

  organization: Organization;
  roles = [];

  constructor(private http: HttpClient,
      private router: Router, private organizationService: OrganizationService) {

  }

  ngOnInit() {
    this.http.get<Organization>('/api/organization/details', {}) // orgUsername: 'subway-sydney'
        .subscribe(org =>  {  // join roles on the backend
          this.organization = org['Org'];
          Object.keys(org['Org']).forEach(i => {
            this.roles[i] = org['userOrg'][i].roles[0];
          });
        });
  }

  sendOrg(organization) {
    this.router.navigate(['/organization/' + organization.username + '/update']);
  }

  addUser(organization) {
    this.organizationService.setData(organization);
    this.router.navigate(['/organization/add-user']);
  }

  ngOnDestroy() {
    console.log('Destroyed');
  }
}

