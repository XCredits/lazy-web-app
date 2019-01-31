// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValueTransformer } from '@angular/compiler/src/util';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionComponent implements OnInit {
  form: FormGroup;
  user: User;
  link: string;
  pendingConnectionsCounter: string;
  confirmedConnectionsCounter: string;
  ConfirmedConnectionsCounter: string;
  navLinks = [];
  pages = [];
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
        console.log('user logged in is --> ' + user.id);
      });
    this.link = 'https://xcredits.com/';
    this.http.post('/api/connection/get-pending-count', {
      'userId': this.user.id,
    })
      .subscribe((returnedResult) => {
          console.log('sss' + returnedResult);
          this.pendingConnectionsCounter = returnedResult.toString();
      });

    this.http.post('/api/connection/get-confirmed-count', {
      'userId': this.user.id,
    })
      .subscribe((returnedResult) => {
          console.log('sss' + returnedResult.toString());
          this.ConfirmedConnectionsCounter = returnedResult.toString();
      });
    console.log('This is main');

    this.navLinks.push('./view');
    this.navLinks.push('./request');
    this.navLinks.push('./add');

    this.pages.push('View');
    this.pages.push('request');
    this.pages.push('add');



  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

}
