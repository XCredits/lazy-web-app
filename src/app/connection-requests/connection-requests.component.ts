// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connection-requests',
  templateUrl: './connection-requests.component.html',
  styleUrls: ['./connection-requests.component.scss']
})
export class ConnectionRequestsComponent implements OnInit {
  form: FormGroup;
  user: User;
  receiverUserId: string;
  link: string;
  pendedConnections = [];

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private route: Router
  ) { }

  ngOnInit() {

    this.form = new FormGroup({
      username: new FormControl(''),
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl(''),
    });

    this.userService.userObservable
      .subscribe(user => {
        this.user = user;
      });
    this.link = 'https://xcredits.com/';
    this.loadPendingRequests();
  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

  loadPendingRequests = function () {
    this.IsViewPending = true;
    this.IsViewConfirmed = false;
    this.IsAddUserRequest = false;
    this.pendedConnections = [];
    this.http.post('/api/connection/get-pending-connections', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        let num = 0;
        for (num = 0; num < data.length; num++) {
          this.pendedConnections.push(data[num].familyName + ' ' + data[num].givenName);
        }
        console.log('returned username is ' + data.length);
      });
  };
  ApproveUserConnection = function () {
    this.http.post('/api/connection/action-connection-request', {
      'userId': this.user.id,
      'actionNeeded': 'accept',
      'receiverUsername': this.friends,
    })
      .subscribe((returnedResult) => {
        console.log( returnedResult.message);
      });
  };

  IgnoreUserConnection = function () {
    this.http.post('/api/connection/action-connection-request', {
      'userId': this.user.id,
      'actionNeeded': 'rejected',
      'receiverUsername': this.friends,
    })
      .subscribe((returnedResult) => {
        console.log( returnedResult.message);
      });
  };
}
