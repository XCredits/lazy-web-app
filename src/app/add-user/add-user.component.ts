import { Component, OnInit } from '@angular/core';
import { Organization } from '../organization.service';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  orgId: string;
  success: string;
  sub: any;
  authorized = false;

  constructor(private router: Router,
              private http: HttpClient, private route: ActivatedRoute, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.http.get<Organization>('/api/organization/get-details', {
        params: {
          username: params.orgUsername
        }
      })
      .subscribe(organization => {
        this.authorized = true;
        this.orgId = organization['_id'];
      },
      (errorespone) => {
        this.authorized = false;
      });
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
