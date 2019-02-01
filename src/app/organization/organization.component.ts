import { Component, OnInit, OnDestroy } from '@angular/core';
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
  orgId: Array<string> = [];


  constructor(private http: HttpClient,
      private router: Router, private organizationService: OrganizationService) {
  }

  ngOnInit() {
    this.http.get<Organization>('/api/organization/all-user-org-details-summary', {})
        .subscribe((response: any)  =>  {
          this.organization = response['orgDetails'];
          Object.keys(response.orgDetails).forEach(i => {
            this.orgId.push(response['orgDetails'][i]._id);
            this.roles[i] = response['userOrg'][i].roles[0];
          });
        });
  }


  sendOrg(organization) {
    this.router.navigate(['/organization/' + organization.username + '/update']);
  }

  addUser(organization) {
    console.log(organization._id);
    this.organizationService.setData(organization._id);
    this.router.navigate(['/organization/' + organization.username + '/add-user']);
  }

  ngOnDestroy() {
    console.log('Destroyed');
  }
}

