import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatSnackBar, } from '@angular/material';
import { ConsoleReporter } from 'jasmine';

@Component({
  selector: 'app-contacts-edit',
  templateUrl: './contacts-edit.component.html',
  styleUrls: ['./contacts-edit.component.scss']
})
export class ContactsEditComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  waiting: boolean;
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];
  contactIdURL: string;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar) { }



  ngOnInit() {

    this.isEditMode = false;
    this.contactIdURL = this.route.snapshot.paramMap.get('contactId');
    this.loadContactsLists();
    this.loadContactDetails();


  }

  loadContactsLists = function () {
    this.http.post('/api/contacts/list/view', {})
      .subscribe((data: any) => {
          this.lists = data;
      });
  };


  loadContactDetails = function () {
    this.http.post('/api/contacts/details', {
      'contactId': this.contactIdURL,
    })
      .subscribe((data: any) => {

        this.isEditMode = true;
        this.form = new FormGroup({
          givenName: new FormControl(data.givenName),
          familyName: new FormControl(data.familyName),
          email: new FormControl(data.email, [Validators.required, Validators.email]),
          contactList: new FormControl(),
        });
      });
  };

  updateContact = function (newContact) {

    console.log(newContact);
    this.waiting = true;
    this.http.post('/api/contacts/edit', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactId': this.contactIdURL,
      'contactListId': newContact.contactList._id,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        this.waiting = false;
          if ( result.message === 'Contact updated.') {
            this.snackBar.open('Contact updated successfully', 'Dismiss', {
              duration: 2000,
            });
            this.router.navigate(['/contacts/i/' + this.contactIdURL]);
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
