import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-view-connections',
  templateUrl: './view-connections.component.html',
  styleUrls: ['./view-connections.component.scss']
})
export class ViewConnectionsComponent implements OnInit {
  form: FormGroup;
  user: User;
  receiverUserId: string;
  link: string;
  confirmedConnections = [];
  constructor(private http: HttpClient, private userService: UserService) { }

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
    this.loadConfirmedRequests();
  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

  loadConfirmedRequests = function () {
    this.confirmedConnections = [];
    this.http.post('/api/connection/get-confirmed-connections', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        let num = 0;
        for (num = 0; num < data.length; num++) {
          this.confirmedConnections.push(Object[num].familyName + ' ' + Object[num].givenName);
        }
        console.log('returned username is ' + data.length);
      });
  };
}

