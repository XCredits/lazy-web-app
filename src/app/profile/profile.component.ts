import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Button } from 'protractor';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User;
  show = false;
  open = false;
  given = false;
  family = false;
  buttonName = 'Change Email';
  userName = 'Change Username';
  givenName = 'Change Given Name';
  familyName = 'Change Family Name';
  email = 'Email:';
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<User>('/api/user/details', {})
        .subscribe((user) =>  {
          this.user = user;
        });
  }
  toggle() {
    this.show = !this.show;
    if (this.show) {
      this.userName = 'Revert';
    } else {
      this.userName = 'Change Username';
    }
  }

  opening() {
    this.open = !this.open;
    if (this.open) {
      this.buttonName = 'Revert';
      this.email = 'New Emal:';
    } else {
      this.buttonName = 'Change Email';
    }
  }

  toggleGiven() {
    this.given = !this.given;
    if (this.given) {
      this.givenName = 'Revert';
    } else {
      this.givenName = 'Change Given Name';
    }
  }

  toggleFamily() {
    this.family = !this.family;
    if (this.family) {
      this.familyName = 'Revert';
    } else {
      this.familyName = 'Change Family Name';
    }
  }



}

interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}
