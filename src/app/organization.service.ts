import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, ReplaySubject, Observable} from 'rxjs';

@Injectable()
export class OrganizationService implements OnDestroy {
    private _data: BehaviorSubject<Organization> = new BehaviorSubject<Organization>(null);
    orgObservable: Subject<Organization> = new ReplaySubject<Organization>(1);

    public setData(data: Organization) {
        this._data.next(data);
    }

    public getData(): Observable<any> {
        return this._data.asObservable();
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
}
