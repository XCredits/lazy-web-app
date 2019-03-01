import {MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-connections-request-details',
  templateUrl: './connections-request-details.component.html',
  styleUrls: ['./connections-request-details.component.scss']
})
export class ConnectionsRequestDetailsComponent implements OnInit {
  receiverUserId: string;
  link: string;
  displayedColumns: string[] = [ 'Given Name', 'Family Name', 'Action'];
  requestConnections: { userId: string, givenName: string, familyName: string, sendTimestamp: Date }[] = [];
  userIdURL: string;
  constructor(private http: HttpClient,
    private route: ActivatedRoute, ) { }

  ngOnInit() {
    this.userIdURL = this.route.snapshot.paramMap.get('requestUserId');
    this.loadConfirmedRequests();
  }

  loadConfirmedRequests = function () {
    this.requestConnections = [];
    this.http.post('/api/connection/get-connections-details', {
      'senderUserId': this.userIdURL,
    })
      .subscribe((data) => {
        console.log(data);
        this.requestConnections.push(
          {
            'userId': data.userId,
            'givenName': data.givenName,
            'familyName': data.familyName,
            'sendTimestamp': new Date(data.sendTimestamp),
          });
      });
  };

  deleteConnection = function (connection) {
    this.http.post('/api/connection/remove-connection', {
      'senderUserId': connection.userId,
    })
      .subscribe(() => {
        this.loadConfirmedRequests();
      });
  };

  confirmUserConnection = function() {
    console.log(this.userIdURL);
  };
}
