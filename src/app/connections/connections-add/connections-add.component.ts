import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../user.service';
import { FormGroup, FormControl } from '@angular/forms';
import {MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connections-add',
  templateUrl: './connections-add.component.html',
  styleUrls: ['./connections-add.component.scss']
})
export class ConnectionsAddComponent implements OnInit {
  form: FormGroup;
  user: User;
  receiverUserId: string;
  requestFromMessage: string;
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.userService.userObservable
    .subscribe(user => {
      this.user = user;
    });
    this.form = new FormGroup({
      username: new FormControl(''),
    });

    this.userService.userObservable
      .subscribe(user => {
        this.user = user;
      });

  }

  resetForm = function() {
    this.requestFromMessage = undefined;
    this.form = new FormGroup({
      username: new FormControl(''),
    });


  };
  // Add new connection
  requestUserConnection = function (formData) {
    this.IsAddUserRequest = true;
    this.http.post('/api/connection/add-request', {
      'username': formData.username,
    })
      .subscribe(returnedResult => {
        switch (returnedResult.message) {
          case 'Success':
            this.requestFromMessage = 'Request sent successfully';
            break;
          case 'Already connected':
            this.requestFromMessage = 'You are already connected';
            break;
          default:
            this.requestFromMessage = 'Cannot process add users now';
            break;
        }
        this.snackBar.open(this.requestFromMessage, 'Dismiss', {
          duration: 2000,
        });
        this.requestFromMessage = undefined;
        this.resetForm();
      },
      errorResponse => {
        this.waiting = false;
        // 422 or 500
        this.snackBar.open(errorResponse.error.message, 'Dismiss', {
          duration: 2000,
        });
        this.resetForm();
      });

  };
}
