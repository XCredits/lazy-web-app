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
private allData;

constructor(
  private http: HttpClient,
  private userService: UserService,
) { }

ngOnInit() {
  this.form = new FormGroup ({
    givenName: new FormControl(''),
    familyName: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  this.http.get<any>('/api/get-user-details')
  .subscribe((data) =>  {
    this.form = new FormGroup({
      givenName: new FormControl(data[0].givenName),
      familyName: new FormControl(data[0].familyName),
      email: new FormControl(data[0].email),
    });
    console.log(data);
    this.allData = data;
      });
 }

 submit = function (formData) {};

 previousContact = function () {
   console.log('Previous Contact');
   this.contactIndex -= 2;
  console.log(this.contactIndex);
  this.form = new FormGroup({
    givenName: new FormControl(this.allData[this.contactIndex].givenName),
    familyName: new FormControl(this.allData[this.contactIndex].familyName),
    email: new FormControl(this.allData[this.contactIndex].email),
  });
};

 nextContact = function () {
  console.log('Next Contact');
  this.contactIndex += 2;
  console.log(this.contactIndex);
  this.form = new FormGroup({
    givenName: new FormControl(this.allData[this.contactIndex].givenName),
    familyName: new FormControl(this.allData[this.contactIndex].familyName),
    email: new FormControl(this.allData[this.contactIndex].email),
  });
};

}
