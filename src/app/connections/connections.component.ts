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
  isLoggedIn: boolean;
  confirmedConnections = [];
  pendedConnections = [];
  pendingConnectionsCounter: number;
  confirmedConnectionsCounter: number;
  IsViewPending = false;
  IsViewConfirmed = true;
  IsAddUserRequest = true;
  isUserAfterFound = false;
  isRequestSent = false;
  receiverUserId: string;
  link: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    console.log('***************');
    this.form = new FormGroup ({
      username: new FormControl(''),
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl(''),
    });

    this.userService.userObservable
        .subscribe(user => {
          this.user = user;
          this.isLoggedIn = !!this.user;
          this.pendingConnectionsCounter = 0;
          this.confirmedConnectionsCounter = 0;
          console.log('user logged in is --> ' + user.id);
        });

        this.link = 'https://xcredits.com/';

        this.loadConfirmedRequests();
  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }


  loadPendingRequests = function () {
    console.log('get pending req... API');

    this.IsViewPending = true;
    this.IsViewConfirmed = false;
    this.IsAddUserRequest = false;
    this.pendedConnections = [];
    console.log('the id for the sender is ' + this.user.id);
    this.http.post('/api/connection/get-pending-request', {
      'userId': this.user.id,
    })
    .subscribe((data) =>  {
      this.pendingConnectionsCounter = data.length;
      let num = 0;
      for (num = 0; num < data.length ; num++) {
        console.log('senderUserId ' + data[num].senderUserId);

        this.http.post('/api/user/get-username', {
          'userId': data[num].senderUserId,
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


    this.http.post('/api/connection/get-pending-request', {
      'userId': this.user.id,
    })
    .subscribe((data) =>  {
      // this.pendingConnectionsCounter = data.count;
      this.pendingConnectionsCounter = data.length;
    });
    this.IsViewPending = false;
    this.IsViewConfirmed = true;
    this.IsAddUserRequest = false;

    this.confirmedConnections = [];
    console.log('the id for the sender is ' + this.user.id);
    this.http.post('/api/connection/get-confirmed-request', {
      'userId': this.user.id,
    })
    .subscribe((data) =>  {
      this.confirmedConnectionsCounter = data.length;
      let num = 0;
      for (num = 0; num < data.length ; num++) {
        console.log('receiverUserId ' + data[num].senderUserId);
        this.http.post('/api/user/get-username', {
          'userId': data[num].senderUserId,
        })
        .subscribe((returnObj) =>  {
         this.confirmedConnections.push(returnObj[0].familyName + ' ' + returnObj[0].givenName);
        });

      }
      console.log('returned username is ' + data.length);
    });


    /*this.http.get<any>('/api/user/get-pending-requests')
    .subscribe((data) =>  {
      this.confirmedConnections.push('sample3');
      console.log(data);
    });*/

  };


  // Search on user
  SearchUserConnection = function (formData) {
    console.log('===========search on user ...' + formData.username);

    // return the user ID on the search one
    this.http.post('/api/connection/get-user-request', {
      'username': formData.username,
    })
    .subscribe((data) =>  {
      if (data[0] != null ) {
        console.log('returned username is ' + data[0]._id);
        this.receiverUserId = data[0]._id;

        // can't add the same as logged user
        if (this.receiverUserId === this.user.id) {
          console.log('you cannot add your self!');
          return;
        }


       // check if already relation before
       this.http.post('/api/connection/check-user-status', {
        senderUserId : this.user.id,
        receiverUserId : this.receiverUserId,
      })
      .subscribe((dataOutput) =>  {

          // nul if no connections before
          console.log(dataOutput.length);

          if (dataOutput.length === 0) {
            // new connection should be inserted .....
            console.log('just open a form box');

          } else {
          if ( dataOutput[0].status === 'Pending') {
            console.log('Request sent on ' + dataOutput[0].requestTimeStamp + ' and awaiting for confirmation2 ');
            this.isRequestSent = true;

          }
        }

        this.IsAddUserRequest = false;
        this.isUserAfterFound = true;

        this.form = new FormGroup({
          givenName: new FormControl(data[0].givenName),
          familyName: new FormControl(data[0].familyName),
          username: new FormControl(data[0].username),
        });

        });
      } else {
        console.log('no user found!');
      }
    });

  };


  // Adda new connection
  RequestUserConnection = function (formData) {
    console.log('===========search on user ...' + formData.username);

    // return the user ID on the search one
    this.http.post('/api/connection/get-user-request', {
      'username': formData.username,
    })
    .subscribe((data) =>  {
      if (data[0] != null ) {
        console.log('returned username is ' + data[0]._id);
        this.receiverUserId = data[0]._id;

        // can't add the same as logged user
        if (this.receiverUserId === this.user.id) {
          console.log('you cannot add your self!');
          return;
        }


       // check if already relation before
        this.http.post('/api/connection/check-user-status', {
          senderUserId : this.user.id,
          receiverUserId : this.receiverUserId,
        })
        .subscribe((dataOutput) =>  {

          // nul if no connections before
          console.log(dataOutput.length);

          if (dataOutput.length === 0) {
            this.IsAddUserRequest = false;
            this.isUserAfterFound = true;

            this.form = new FormGroup({
              givenName: new FormControl(data[0].givenName),
              familyName: new FormControl(data[0].familyName),
              username: new FormControl(data[0].username),
            });
             // insert into connection table
        this.http.post('/api/connection/add-connection-request', {
          'senderUserId': this.user.id,
          'receiverUserId': this.receiverUserId,
          })
        .subscribe(returnedData => {
          this.waiting = false;
          this.submitSuccess = true;
          console.log('connection request sent...' );
          this.isRequestSent = true;
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
            this.isRequestSent = true;
          }

        });
      } else {
        console.log('no user found!');
      }
    });

  };


  viewSearchForm = function () {

    console.log('eeeeeeeeeeeee');
    this.IsViewPending = false;
    this.IsViewConfirmed = false;
    this.IsAddUserRequest = true;
    this.isUserAfterFound = false;
  };


  ApproveUserConnection = function() {

    
  };

  IgnoreUserConnection = function() {

  };

}
