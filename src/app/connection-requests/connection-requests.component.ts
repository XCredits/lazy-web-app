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
    this.http.post('/api/connection/action-connection-request', {
      'actionNeeded': 'reject',
      'senderUserId': friend.userId,
    })
      .subscribe((returnedResult) => {
        console.log(' returnedResult ' + returnedResult);
        if (returnedResult.message === 'Request rejected') {
            // Remove the request from the pendingConnections array
            for ( let i = 0 ; i <= this.pendingConnections.length - 1; i++) {
              if ( this.pendingConnections[i].userId === friend.userId) {
                this.pendingConnections.splice(this.pendingConnections.indexOf(this.pendingConnections[i]), 1);
              }
            }
            this.dataSource = [];
            this.dataSource = new MatTableDataSource<ConnectionRequestElements>(this.pendingConnections);

        }
      });

    // Update notification counter in parent.
    this.connectionRoute.loadPageCounters();
  };


  loadPendingRequests = function () {
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
          this.dataSource = new MatTableDataSource<ConnectionRequestElements>(this.pendingConnections);
      });
  };



  approveUserConnection = function (friend) {
    this.http.post('/api/connection/action-connection-request', {
      'actionNeeded': 'accept',
      'senderUserId': friend.userId,
    })
      .subscribe((returnedResult) => {
        if (returnedResult.message === 'Request accepted') {
          // Reload pending connection requests
          this.loadPendingRequests();

          // Navigate to parent if there is no more connection requests
          if (this.pendingConnections.length === 0) {
                this.router.navigateByUrl('/connections');
            }
          }
        });
        // Update notification counter in parent.
        this.connectionRoute.loadPageCounters();
  };
}
