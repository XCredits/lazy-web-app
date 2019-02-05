import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Organization } from '../organization.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {

  organization: Organization;
  userRoles: Array<string> =  [];

  constructor(private http: HttpClient,
              private router: Router) {}

  ngOnInit() {
    this.http.post<Organization>('/api/organization/user-org-summary', {})
        .subscribe((response: any)  =>  {
          this.organization = response['orgDetails'];
          Object.values(response.userOrg).forEach(org => {
            this.userRoles[org['orgId']] = org['roles'];
          });
        });
  }

  updateOrg(organization) {
    this.router.navigate(['/organization/' + organization.username + '/update']);
  }

  addUser(organization) {
    this.router.navigate(['/organization/' + organization.username + '/add-user']);
  }

  ngOnDestroy() {
    console.log('Destroyed');
  }
}

