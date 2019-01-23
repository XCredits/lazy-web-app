// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { useAnimation } from '@angular/animations';

@Component({
  selector: 'app-user-connection',
  templateUrl: './user-connection.component.html',
  styleUrls: ['./user-connection.component.scss']
})
export class UserConnectionComponent implements OnInit {
  form: FormGroup;
  user: User;
  isLoggedIn: boolean;
  confirmedConnections = [];
  pendingConnections = [];
  pendingConnectionsCounter: number;
  confirmedConnectionsCounter: number;
  IsViewPending = false;
  IsViewConfirmed = true;
  IsAddUserRequest = true;

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    console.log('***************');
    this.form = new FormGroup ({
      username: new FormControl(''),
    });
    this.userService.userObservable
        .subscribe(user => {
          this.user = user;
          this.isLoggedIn = !!this.user;
          this.pendingConnectionsCounter = 99;
          this.confirmedConnectionsCounter = 99;
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
    console.log('get pending req... API');
    this.confirmedConnections.push('sample1');
    this.confirmedConnections.push('sample2');
    this.confirmedConnections.push('sample3');

   /* this.http.get<any>('/api/user/get-pending-requests')
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log(data);
    });*/
  };

  loadConfirmedRequests = function () {
    console.log('getConfirmedRequests func');
    /*this.http.get<any>('/api/user/get-pending-requests')
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log(data);
    });*/
  };

  RequestUserConnection = function (formData) {
    console.log('Search about user...' + formData.username);

    this.http.post('/api/user/get-user-request', {
      'username': formData.username,
    })
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log('returned username is ' + data[0]._id);
    });

    /*this.http.post('/api/user/add-connection-request', {
      'senderID': this.user.id,
      'receiverID': formData.username,
      })
    .subscribe(data => {
      this.waiting = false;
      this.submitSuccess = true;
      console.log('subscribe...' );
    },
    errorResponse => {
      this.waiting = false;
      console.log('error ... ');
      console.dir(errorResponse);
      this.formErrorMessage = 'There was a problem submitting the form.';
    });*/
  };
}
