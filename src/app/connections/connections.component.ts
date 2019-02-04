// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  ) { console.log('CONSTRUCTOR'); }

  ngOnInit() {
    console.log ( new Date().getTime());
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
    console.log('Getting counter here ....');
    this.link = 'https://xcredits.com/';
    this.http.post('/api/connection/get-pending-count', {})
    .subscribe((returnedResult: any) => {
      console.log('returnedResult ....' + returnedResult);
      this.pendingConnectionsCounter = returnedResult.message;
    });

  this.http.post('/api/connection/get-confirmed-count', {})
    .subscribe((returnedResult: any) => {
        this.ConfirmedConnectionsCounter = returnedResult.message;
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
