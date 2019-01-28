import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, ReplaySubject, Observable} from 'rxjs';

@Injectable()
export class OrganizationService {
    private _data: BehaviorSubject<Organization> = new BehaviorSubject<Organization>(null);
    orgObservable: Subject<Organization> = new ReplaySubject<Organization>(1);

    public setData(data: Organization) {
        this._data.next(data);
    }

    public getData(): Observable<Organization> {
        return this._data.asObservable();
    }
}

export interface Organization {
  _id: string;
  organisationName: string;
  website: string;
  logo: string;
  phoneNumber: number;
  orgUsername: string;
}
