// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  confirmedConnections = [];
  pendedConnections = [];
  pendingConnectionsCounter: number;
  confirmedConnectionsCounter: number;
  IsViewPending = false;
  IsViewConfirmed = true;
  IsAddUserRequest = true;
  isUserAfterFound = false;
  isRequestSent = false;
  isLoggedIn: boolean;

  constructor(
    private http: HttpClient,
    private userService: UserService,
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
        this.isLoggedIn = !!this.user;
        this.pendingConnectionsCounter = 0;
        this.confirmedConnectionsCounter = 0;
        console.log('user logged in is --> ' + user.id);
      });
    this.link = 'https://xcredits.com/';
    this.http.post('/api/connection/get-pending-request', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        this.pendingConnectionsCounter = Object.keys(data).length;
      });

  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

  reloadPage = function () {
    location.reload();
  };

  loadPendingRequests = function () {
    this.IsViewPending = true;
    this.IsViewConfirmed = false;
    this.IsAddUserRequest = false;
    this.pendedConnections = [];
    this.http.post('/api/connection/get-connection-request', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        this.pendingConnectionsCounter = Object.keys(data).length;
        let num = 0;
        for (num = 0; num < data.length; num++) {
          this.pendedConnections.push(data[0].familyName + ' ' + data[0].givenName);
        }
        console.log('returned username is ' + data.length);
      });



  };

  loadConfirmedRequests = function () {
    this.IsViewPending = false;
    this.IsViewConfirmed = true;
    this.IsAddUserRequest = false;

    this.confirmedConnections = [];
    this.http.post('/api/connection/get-connection-confirmed', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        this.confirmedConnectionsCounter = Object.keys(data).length;
        let num = 0;
        for (num = 0; num < data.length; num++) {
          this.confirmedConnections.push(Object[0].familyName + ' ' + Object[0].givenName);
        }
        console.log('returned username is ' + data.length);
      });
  };

  // Search on user
  SearchUserConnection = function (formData) {
    // return the user ID on the search one
    this.http.post('/api/connection/get-user-request', {
      'username': formData.username,
    })
      .subscribe((data) => {
        if (data[0] != null) {
          this.receiverUserId = data[0]._id;
          if (this.receiverUserId === this.user.id) {
            this.formErrorMessage = 'You cannot add yourself.';
            return;
          }

          // check if already relation before
          this.http.post('/api/connection/check-user-status', {
            senderUserId: this.user.id,
            receiverUserId: this.receiverUserId,
          })
            .subscribe((dataOutput) => {
              // nul if no connections before
              console.log(dataOutput.length);
              if (dataOutput.length === 0) {
                // new connection should be inserted .....
                console.log('just open a form box');
              } else {
                if (dataOutput[0].status === 'Pending') {
                  console.log('Request sent on ' + dataOutput[0].requestTimeStamp + ' and awaiting for confirmation');
                  this.formErrorMessage = 'Request already sent.';
                  this.isRequestSent = true;
                }
              }
              this.IsAddUserRequest = false;
              this.isUserAfterFound = true;
              this.form = new FormGroup({
                givenName: new FormControl(data[0].givenName),
                familyName: new FormControl(data[0].familyName),
                username: new FormControl(data[0].username),
              });
            });
        } else {
          console.log('no user found!');
          this.formErrorMessage = 'User not found.';
        }
      });
  };

  // Adda new connection
  RequestUserConnection = function (formData) {

    // return the user ID on the search one
    this.http.post('/api/connection/get-user-request', {
      'username': formData.username,
    })
      .subscribe((data) => {
        if (data[0] != null) {
          console.log('returned username is ' + data[0]._id);
          this.receiverUserId = data[0]._id;

          // can't add the same as logged user
          if (this.receiverUserId === this.user.id) {
            console.log('you cannot add your self!');
            this.formErrorMessage = 'You cannot add yourself.';
            return;
          }

          // check if already relation before
          this.http.post('/api/connection/check-user-status', {
            senderUserId: this.user.id,
            receiverUserId: this.receiverUserId,
          })
            .subscribe((dataOutput) => {

              // nul if no connections before
              console.log(dataOutput.length);
              if (dataOutput.length === 0) {
                this.IsAddUserRequest = false;
                this.isUserAfterFound = true;

                this.form = new FormGroup({
                  givenName: new FormControl(data[0].givenName),
                  familyName: new FormControl(data[0].familyName),
                  username: new FormControl(data[0].username),
                });
                // insert into connection table
                this.http.post('/api/connection/add-connection-request', {
                  'senderUserId': this.user.id,
                  'receiverUserId': this.receiverUserId,
                })
                  .subscribe(returnedData => {
                    this.waiting = false;
                    this.submitSuccess = true;
                    console.log('connection request sent...');
                    this.isRequestSent = true;
                  },
                    errorResponse => {
                      this.waiting = false;
                      console.log('error ... ');
                      console.dir(errorResponse);
                      this.formErrorMessage = 'There was a problem into sending connection request .';
                    });
              } else
                if (dataOutput[0].status === 'Pending') {
                  console.log('Request sent on22 ' + dataOutput[0].requestTimeStamp + ' and awaiting for confirmation ');
                  this.isRequestSent = true;
                  this.formErrorMessage = 'Request already sent.';
                }

            });
        } else {
          console.log('no user found!');
        }
      });

  };


  viewSearchForm = function () {
    this.IsViewPending = false;
    this.IsViewConfirmed = false;
    this.IsAddUserRequest = true;
    this.isUserAfterFound = false;
  };


  ApproveUserConnection = function () { };

  IgnoreUserConnection = function () { };

}
