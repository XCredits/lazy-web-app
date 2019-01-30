import { Component, OnInit } from '@angular/core';
import { OrganizationService } from '../organization.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  orgId: string;
  success: string;
  constructor(private router: Router, private organizationService: OrganizationService,
              private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.organizationService.getData()
      .subscribe(data => {
        this.orgId = data;
      });
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
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
      this.router.navigate(['/organization']);
      this.success = 'Success';
      this.snackBar.open('User added successfully', 'Dismiss', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
    });
  };
}
