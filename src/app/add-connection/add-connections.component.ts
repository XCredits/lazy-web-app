// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-connections',
  templateUrl: './add-connections.component.html',
  styleUrls: ['./add-connections.component.scss']
})
export class AddConnectionComponent implements OnInit {
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
      });
  };

  // Add new connection
  RequestUserConnection = function (formData) {
    this.IsAddUserRequest = true;
     this.http.post('/api/connection/add-connection-request', {
      'userId': this.user.id,
      'username': formData.username,
    })
      .subscribe(returnedResult => {
        switch (returnedResult.message) {
          case 'Success':
            this.formErrorMessage = 'Added successfully';
            break;
          case 'Pending':
            this.formErrorMessage = 'You already sent a request';
            break;
          case 'User not found':
            this.formErrorMessage = 'Sorry, this user not found';
            break;
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
