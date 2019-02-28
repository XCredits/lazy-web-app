import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-contacts-add',
  templateUrl: './contacts-add.component.html',
  styleUrls: ['./contacts-add.component.scss']
})
export class ContactsAddComponent implements OnInit {
  form: FormGroup;
  displayedColumns: string[] = ['select', 'listName', 'Action'];
  contactAddMessage: string;
  isEditMode: boolean;
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];

  constructor(
    private http: HttpClient,
    private router: Router, ) { }

  ngOnInit() {
    this.contactAddMessage = undefined;
    this.isEditMode = true;
    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contactList: new FormControl(''),
    });

    this.loadContactsLists();

  }


  loadContactsLists = function () {
    this.http.post('/api/contacts-list/view-lists', {})
      .subscribe((data: any) => {
        this.lists = data;
      });
  };

  addContact = function (newContact) {

    this.http.post('/api/contacts/add-contact', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactListId': newContact.contactList.listId,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        switch (result.message) {
              case 'Success.':
                this.router.navigate(['/contacts/view/' + result.contactId]);
              break;
              case 'Problem finding a list.':
              case 'Problem creating a list.':
                this.contactAddMessage = 'Contact cannot be created.';
              break;
              default:
                this.contactAddMessage = 'Something went wrong, please try again later.';
            }
        });
  };


  submit = function () {
  };


}
