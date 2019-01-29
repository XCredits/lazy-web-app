import { Component, OnInit } from '@angular/core';
import { OrganizationService } from '../organization.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  orgId: string;
  success: string;
  constructor(private organizationService: OrganizationService, private http: HttpClient) { }

  ngOnInit() {
    this.organizationService.getData()
      .subscribe(data => {
        this.orgId = data;
      });
    this.form = new FormGroup({
      username: new FormControl(''),
    });
  }

  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }

    this.http.post('/api/organization/add-user', {
      'orgId': this.orgId,
      'username': formData.username,
    })
    .subscribe(() => {
      this.success = 'Success';
    });
  };
}
