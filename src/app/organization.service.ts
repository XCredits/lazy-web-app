import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, ReplaySubject, Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OrganizationService implements OnDestroy {
    organization: Organization;

    private _data: BehaviorSubject<Organization> = new BehaviorSubject<Organization>(null);
    orgObservable: Subject<Organization> = new ReplaySubject<Organization>(1);

    constructor (private http: HttpClient) {}

    public setData(data: Organization) {
        this._data.next(data);
    }

    public getData(): Observable<any> {
        return this._data.asObservable();
    }

    private _setOrganization(organization) {
        this.organization = organization;
        console.log(this.organization);
        this.orgObservable.next(this.organization);
    }

    updateOrgDetails(org) {
        this.http.get<Organization>('/api/organization/updated-details', {
            params: {
                'orgId': org._id,
            }
        })
        .subscribe((organization) => {
            this._setOrganization(organization);
        });
      }

    ngOnDestroy() {
        console.log('Destroyed');
    }

}

export interface Organization {
  _id: string;
  name: string;
  website: string;
  logo: string;
  phoneNumber: number;
  username: string;
  userCount: number;
}
