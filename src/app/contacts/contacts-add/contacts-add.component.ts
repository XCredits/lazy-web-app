import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-contacts-add',
  templateUrl: './contacts-add.component.html',
  styleUrls: ['./contacts-add.component.scss']
})
export class ContactsAddComponent implements OnInit {
  form: FormGroup;
  formErrorMessage: string;
  isEditMode: boolean;
  waiting: boolean;

  groups: { groupId: string, groupName: string, numberOfContacts: number }[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar, ) { }

  ngOnInit() {
    this.formErrorMessage = undefined;
    this.isEditMode = true;
    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contactGroup: new FormControl(''),
    });
    this.loadContactsGroups();
  }


  loadContactsGroups = function () {
    this.http.post('/api/contacts/group/view', {})
        .subscribe((data: any) => {
          this.groups = data;
        });
  };

  addContact = function (newContact) {
    if ( newContact.givenName.length === 0 ||
        newContact.familyName.length === 0 ||
        newContact.email.length === 0 ) {
      this.formErrorMessage = 'Please type a valid inputs.';
      return;
    }

    this.waiting = true;
    this.http.post('/api/contacts/add', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactGroupId': newContact.contactGroup._id,
    })
    .subscribe((result) => {
      this.waiting = false;
      this.isEditMode = false;
      switch (result.message) {
        case 'Success.':
          this.snackBar.open('Contact created successfully', 'Dismiss', {
            duration: 2000,
          });
          this.router.navigate(['/contacts/i/' + result.contactId]);
          break;
        case 'Problem finding a group.':
        case 'Problem creating a group.':
          this.formErrorMessage = 'Contact cannot be created.';
          break;
        default:
          this.formErrorMessage = 'Something went wrong, please try again later.';
      }
      },
      errorResponse => {
        this.waiting = false;
        // 422 or 500
        this.formErrorMessage = 'Something went wrong, please try again later.';
      });
  };

  submit = function () {
  };


}
