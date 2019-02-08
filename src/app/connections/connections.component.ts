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
  ) { }

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
        });

    this.navLinks.push('./view');
    this.navLinks.push('./request');
    this.navLinks.push('./add');

    this.pages.push('View');
    this.pages.push('request');
    this.pages.push('add');

    this.loadPageCounters();
  }


  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }


  loadPageCounters = function () {
    this.http.post('/api/connection/get-pending-request-count', {})
        .subscribe((returnedResult: any) => {
          if (returnedResult.message === 0) {
            this.pendingConnectionsCounter = '';
          } else {
            this.pendingConnectionsCounter = returnedResult.message;
            }
        });

    this.http.post('/api/connection/get-connection-count', {})
        .subscribe((returnedResult: any) => {
          if (returnedResult.message === 0) {
            this.confirmedConnectionsCounter = '';
          } else {
            this.confirmedConnectionsCounter = returnedResult.message;
          }
        });
  };

}
