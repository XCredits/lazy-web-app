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

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.userObservable
        .subscribe(user => {
          this.user = user;
          this.isLoggedIn = !!this.user;

          console.log('user logged in is --> ' + user.username);
        });
  }

  logout() {
    this.userService.logOut();
  }

}
