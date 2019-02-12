// Use card
// Position:fixed, to the right below the menu bar
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionComponent } from '../connections/connections.component';


export interface ConnectionRequestElements {
  givenName: string;
  familyName: number;
}


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
  formErrorMessage: string;
  userErrorId: string;
  pendingConnections: { userId: string, givenName: string, familyName: string }[] = [];
  displayedColumns: string[] = [ 'Given Name', 'Family Name', 'Action'];
  dataSource = new MatTableDataSource<ConnectionRequestElements>();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private connectionRoute: ConnectionComponent,
    ) { }

  ngOnInit() {
    this.formErrorMessage = undefined;
    this.userErrorId = undefined;
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
    this.loadPendingRequests();
  }

  ignoreUserConnection = function (friend) {
    this.formErrorMessage = undefined;
    this.userErrorId = undefined;

    this.http.post('/api/connection/action-request', {
      'action': 'reject',
      'senderUserId': friend.userId,
    })
      .subscribe((returnedResult) => {
        if (returnedResult.message === 'Request rejected') {
          // Remove the request from the pendingConnections array
          for ( let i = 0 ; i <= this.pendingConnections.length - 1; i++) {
            if ( this.pendingConnections[i].userId === friend.userId) {
              this.pendingConnections.splice(this.pendingConnections.indexOf(this.pendingConnections[i]), 1);
            }
          }
          this.dataSource = [];
          this.dataSource = new MatTableDataSource<ConnectionRequestElements>(this.pendingConnections);
          this.connectionRoute.loadPageCounters();
        }
        },
          errorResponse => {
            this.formErrorMessage = 'There was a problem ignoring this request.';
            this.userErrorId = friend.userId;
          });
  };


  loadPendingRequests = function () {
    this.formErrorMessage = undefined;
    this.userErrorId = undefined;
    this.pendingConnections = [];
    this.http.post('/api/connection/get-pending-requests', {
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
          this.dataSource = new MatTableDataSource<ConnectionRequestElements>(this.pendingConnections);
      });
  };



  approveUserConnection = function (friend) {
    this.formErrorMessage = undefined;
    this.userErrorId = undefined;
    this.http.post('/api/connection/action-request', {
      'action': 'accept',
      'senderUserId': friend.userId,
    })
      .subscribe((returnedResult) => {
        if (returnedResult.message === 'request accepted') {
           // Remove the request from the pendingConnections array
           for ( let i = 0 ; i <= this.pendingConnections.length - 1; i++) {
            if ( this.pendingConnections[i].userId === friend.userId) {
              this.pendingConnections.splice(this.pendingConnections.indexOf(this.pendingConnections[i]), 1);
            }
          }
          this.dataSource = [];
          this.dataSource = new MatTableDataSource<ConnectionRequestElements>(this.pendingConnections);
          }
        },
        errorResponse => {
          this.formErrorMessage = 'There was a problem accepting this request.';
          this.userErrorId = friend.userId;
        });
        // Update notification counter in parent.
        this.connectionRoute.loadPageCounters();
  };
}
