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
  pendingConnections: { userId: string, givenName: string, familyName: string }[] = [];


  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
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

  loadPendingRequests = function () {
    this.IsViewPending = true;
    this.IsViewConfirmed = false;
    this.IsAddUserRequest = false;
    this.pendingConnections = [];
    this.http.post('/api/connection/get-pending-connections', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        let num = 0;
        for (num = 0; num < data.length; num++) {
          this.pendingConnections.push(
            {
              'userId': data[num].userId,
              'givenName': data[num].givenName,
              'familyName': data[num].familyName
            });
        }
        console.log('returned username is ' + data.length);
        console.log(this.pendingConnections[0]);
      });
  };
  ApproveUserConnection = function (friends) {


    this.router.navigateByUrl('/connections');
    return;
    this.http.post('/api/connection/action-connection-request', {
      'userId': this.user.id,
      'actionNeeded': 'Accept',
      'senderUserId': friends.userId,
    })
      .subscribe((returnedResult) => {
        if (returnedResult.message === 'Request accepted') {
          this.router.navigateByUrl('/connections');
        }
      });
  };

  IgnoreUserConnection = function (friends) {
    this.http.post('/api/connection/action-connection-request', {
      'userId': this.user.id,
      'actionNeeded': 'Reject',
      'senderUserId': friends.userId,
    })
      .subscribe((returnedResult) => {
        if (returnedResult.message === 'Request rejected') {
          this.router.navigateByUrl('/connections');
        }
      });
  };
}
