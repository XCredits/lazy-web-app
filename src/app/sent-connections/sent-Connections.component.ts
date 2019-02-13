import {MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';


export interface ConnectionRequestElements {
  givenName: string;
  familyName: number;
}

@Component({
  selector: 'app-sent-connections',
  templateUrl: './sent-connections.component.html',
  styleUrls: ['./sent-connections.component.scss']
})
export class SentConnectionComponent implements OnInit {
  user: User;
  receiverUserId: string;
  link: string;
  confirmedConnections: { userId: string, givenName: string, familyName: string }[] = [];
  displayedColumns: string[] = [ 'Given Name', 'Family Name', 'Action'];
  dataSource = new MatTableDataSource<ConnectionRequestElements>();

  constructor(private http: HttpClient, private userService: UserService) { }

  ngOnInit() {
    this.userService.userObservable
      .subscribe(user => {
        this.user = user;
      });
    this.loadSentRequests();
  }

  loadSentRequests = function () {
    this.confirmedConnections = [];
    this.http.post('/api/connection/get-sent-request', {
      'userId': this.user.id,
    })
      .subscribe((data) => {
        let num = 0;
        for (num = 0; num < data.length; num++) {
          this.confirmedConnections.push(
            {
              'userId': data[num].userId,
              'givenName': data[num].givenName,
              'familyName': data[num].familyName
            });
        }
        this.dataSource = new MatTableDataSource<ConnectionRequestElements>(this.confirmedConnections);
      });
  };

  deleteConnection = function (friend) {
    this.http.post('/api/connection/action-request', {
      'userId': this.user.id,
      'senderUserId': friend.userId,
      'action': 'cancel',
    })
      .subscribe((result) => {
        if (result.message === 'Request cancelled' ) {
            this.loadSentRequests();
        }
      });
  };
}
