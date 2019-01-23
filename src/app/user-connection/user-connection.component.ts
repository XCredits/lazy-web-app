// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  getPendingRequests = function () {
    console.log('get pending req... API');
    this.confirmedConnections.push('sample1');
    this.confirmedConnections.push('sample2');
    this.confirmedConnections.push('sample3');



    this.http.get<any>('/api/user/get-pending-requests')
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log(data);
    });
  };

  getConfirmedRequests = function () {
    console.log('getConfirmedRequests func');
    this.http.get<any>('/api/user/get-pending-requests')
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log(data);
    });
  };

  searchForUser = function (formData) {
    console.log('Search about user...' + formData.username);
  };
 
}
