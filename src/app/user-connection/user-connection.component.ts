// Use card
// Position:fixed, to the right below the menu bar

import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-user-connection',
  templateUrl: './user-connection.component.html',
  styleUrls: ['./user-connection.component.scss']
})
export class UserConnectionComponent implements OnInit {
  user: User;
  isLoggedIn: boolean;
  confirmedConnections = [];

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.userObservable
        .subscribe(user => {
          this.user = user;
          this.isLoggedIn = !!this.user;
          this.getPendingRequests();
          this.confirmedConnections.push('sample1');
          this.confirmedConnections.push('sample2');
          this.confirmedConnections.push('sample3');

          console.log('user logged in is --> ' + user.id);
        });
  }

  logout() {
   // this.userService.logOut();
  }

  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

  getPendingRequests = function () {
    console.log('get pending req... API');
  };

}
