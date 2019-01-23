import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {

  form: FormGroup;
  success = false;
  user: User;
  isLoggedIn: boolean;
  addOrg = false;

  constructor(private http: HttpClient, private userService: UserService) {
    userService.userObservable
    .subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
    });

  }

  ngOnInit() {
    this.form = new FormGroup ({
      organisationName: new FormControl(''),
      website: new FormControl(''),
      phoneNumber: new FormControl(''),
      orgUsername: new FormControl('')
    });
  }

  addNewOrg() {
    this.addOrg = true;
  }
  submit = function(formData) {
    if (this.form.invalid) {
      return;
    }
    this.http.post('/api/organisation/register', {
          'organisationName': formData.organisationName,
          'website': formData.website,
          'phoneNumber': formData.phoneNumber,
          'orgUsername': formData.orgUsername,
    })
    .subscribe(data => {
      this.success = true;
      this.addOrg = false;
    },
    errorResponse => {
      this.success = false;
    });
  };
}

