import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService, User } from '../user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-contacts',
  templateUrl: './view-contacts.component.html',
  styleUrls: ['./view-contacts.component.scss']
})
export class ViewContactsComponent implements OnInit {

  form: FormGroup;

  disableButton = true;
  waiting = false;
  submitSuccess = false;
  formErrorMessage: string;
  user: User;
  contactIndex: Number = 0;
  private allContacts = [];

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
        givenName: new FormControl(''),
        familyName: new FormControl(''),
        email: new FormControl('', [Validators.required, Validators.email]),
    });
    this.http.get<any>('/api/get-user-details')
        .subscribe((data) => {
         this.allContacts = data;
        });

    this.form = new FormGroup({
        givenName: new FormControl(this.allContacts[0].givenName),
        familyName: new FormControl(this.allContacts[0].familyName),
        email: new FormControl(this.allContacts[0].email),
      });
  }

  submit = function () { };

  previousContact = function () {
    console.log('Previous Contact');
    if (this.contactIndex > 0) {
      this.contactIndex --;
    }
    console.log(this.contactIndex);
    this.form = new FormGroup({
          givenName: new FormControl(this.allContacts[this.contactIndex].givenName),
          familyName: new FormControl(this.allContacts[this.contactIndex].familyName),
          email: new FormControl(this.allContacts[this.contactIndex].email),
       });
  };

  nextContact = function () {
    console.log('Next Contact');
    if (this.contactIndex < this.allContacts.length) {
      this.contactIndex ++;
    }
    console.log(this.contactIndex);
    this.form = new FormGroup({
          givenName: new FormControl(this.allContacts[this.contactIndex].givenName),
          familyName: new FormControl(this.allContacts[this.contactIndex].familyName),
          email: new FormControl(this.allContacts[this.contactIndex].email),
        });
  };

}
