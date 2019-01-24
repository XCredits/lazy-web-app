// Use card
// Position:fixed, to the right below the menu bar
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { useAnimation } from '@angular/animations';
import { retry } from 'rxjs/operators';
import { stringify } from '@angular/core/src/render3/util';
import { resolve } from 'q';
import { async } from '@angular/core/testing';
import { promise } from 'selenium-webdriver';

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
  pendedConnections = [];
  pendingConnectionsCounter: number;
  confirmedConnectionsCounter: number;
  IsViewPending = false;
  IsViewConfirmed = true;
  IsAddUserRequest = true;
  receiverID: string;

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
          this.pendingConnectionsCounter = 0;
          this.confirmedConnectionsCounter = 0;
          console.log('user logged in is --> ' + user.id);
        });

  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

  reloadPage = function () {
    location.reload();
  };

  loadPendingRequests = function () {
    console.log('get pending req... API');

    this.IsViewPending = true;
    this.IsViewConfirmed = false;
    this.pendedConnections = [];
    console.log('the id for the sender is ' + this.user.id);
    this.http.post('/api/connection/get-pending-request', {
      'userID': this.user.id,
    })
    .subscribe((data) =>  {
      this.pendingConnectionsCounter = data.length;
      let num = 0;
      for (num = 0; num < data.length ; num++) {
        console.log('senderID ' + data[num].senderID);

        this.http.post('/api/user/get-username', {
          'userID': data[num].senderID,
        })
        .subscribe((returnObj) =>  {
         this.pendedConnections.push(returnObj[0].familyName + ' ' + returnObj[0].givenName);
        });

      }
      console.log('returned username is ' + data.length);
    });



  };

  loadConfirmedRequests = function () {
    console.log('getConfirmedRequests func');


    this.IsViewPending = false;
    this.IsViewConfirmed = true;


    this.confirmedConnections = [];
    console.log('the id for the sender is ' + this.user.id);
    this.http.post('/api/connection/get-confirmed-request', {
      'userID': this.user.id,
    })
    .subscribe((data) =>  {
      this.confirmedConnectionsCounter = data.length;
      let num = 0;
      for (num = 0; num < data.length ; num++) {
        console.log('receiverID ' + data[num].senderID);
        this.confirmedConnections.push(data[num].senderID);
      }
      console.log('returned username is ' + data.length);
    });


    /*this.http.get<any>('/api/user/get-pending-requests')
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log(data);
    });*/

  };

  // Send user connection request
  RequestUserConnection = function (formData) {
    console.log('Search about user...' + formData.username);

    // return the user ID on the search one
    this.http.post('/api/connection/get-user-request', {
      'username': formData.username,
    })
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      if (data[0] != null) {
        console.log('returned username is ' + data[0]._id);
        this.receiverID = data[0]._id;

        // check if already relation before
        this.http.post('/api/connection/check-user-status', {
          senderID : this.user.id,
          receiverID : this.receiverID,
        })
        .subscribe((dataOutput) =>  {

          // nul if no connections before
          console.log(dataOutput.length);

          if (dataOutput.length === 0) {

        // insert into connection table
        this.http.post('/api/connection/add-connection-request', {
          'senderID': this.user.id,
          'receiverID': this.receiverID,
          })
        .subscribe(returnedData => {
          this.waiting = false;
          this.submitSuccess = true;
          console.log('connection request sent...' );
        },
        errorResponse => {
          this.waiting = false;
          console.log('error ... ');
          console.dir(errorResponse);
          this.formErrorMessage = 'There was a problem into sending connection request .';
        });

          } else
          if ( dataOutput[0].status === 'Pending') {
            console.log('Request sent on ' + dataOutput[0].requestTimeStamp + ' and awaiting for confirmation ');
          }

        });


      } else {
        console.log('no user found!');
      }
    });

  };


}
