import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../user.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-connections',
  templateUrl: './add-connections.component.html',
  styleUrls: ['./add-connections.component.scss']
})
export class AddConnectionComponent implements OnInit {
  form: FormGroup;
  user: User;
  receiverUserId: string;
  formErrorMessage: string;

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
      });


  }
  onSelect(friends) {
    console.log('you clicked on ' + friends);
  }

  // Add new connection
  requestUserConnection = function (formData) {
    this.IsAddUserRequest = true;
    this.http.post('/api/connection/add-request', {
      'userId': this.user.id,
      'username': formData.username,
    })
      .subscribe(returnedResult => {
        switch (returnedResult.message) {
          case 'success':
            this.formErrorMessage = 'Added successfully';
            break;
          case 'pending':
            this.formErrorMessage = 'You already sent a request';
            break;
          case 'user not found':
            this.formErrorMessage = 'Sorry, this user not found';
            break;
        }

      });
  };
}
