import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, User } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss']
})
export class CreateOrganizationComponent implements OnInit {
  disableButton = false;
  form: FormGroup;
  success = false;
  user: User;
  isLoggedIn: boolean;
  formErrorMessage: string;

  constructor(private http: HttpClient, private userService: UserService, private router: Router) {
    userService.userObservable
    .subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
    });

  }

  ngOnInit() {
    this.form = new FormGroup ({
      organisationName: new FormControl('', [Validators.required]),
      website: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required]),
      orgUsername: new FormControl('', [Validators.required])
    });
  }

  submit = function(formData) {
    if (this.form.invalid) {
      console.log('Inside');
      return;
    }
    this.disableButton = false;
    this.http.post('/api/organisation/create', {
          'organisationName': formData.organisationName,
          'website': formData.website,
          'phoneNumber': formData.phoneNumber,
          'orgUsername': formData.orgUsername,
    })
    .subscribe(data => {
      this.disableButton = false;
      this.success = true;
      this.router.navigateByUrl('/organization');
    },
    errorResponse => {
      this.success = false;
    });
  };
}


