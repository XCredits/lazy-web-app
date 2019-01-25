import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, Organisation } from '../user.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {

  form: FormGroup;
  organisation: Organisation;
  view = false;

  constructor(private userService: UserService, private http: HttpClient) {

  }

  ngOnInit() {
    this.http.get<Organisation>('/api/organisation/details', {})
        .subscribe((org) =>  {
          this.organisation = org;
        });
  }

  addNewOrg() {
    this.view = true;
  }

}

