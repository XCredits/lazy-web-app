import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

export interface ContactElements {
  position: number;
  givenName: string;
  familyName: number;
  email: number;
  listName: string;
}

export interface List {
  value: string;
}
@Component({
  selector: 'app-contacts-view',
  templateUrl: './contacts-view.component.html',
  styleUrls: ['./contacts-view.component.scss']
})
export class ContactsViewComponent implements OnInit {
  form: FormGroup;
  disableButton = true;
  submitSuccess = false;
  formErrorMessage: string;
  contactId: string;
  contactsArr = [];
  isViewAll: boolean;
  isEditContact: boolean;
  selected: string;
  deleteContactName: string;
  modalReference = null;

  constructor(
    private http: HttpClient,
    private dialogService: MatDialog,
    private router: Router, ) { }

  ngOnInit() {
    this.isViewAll = true;
    this.loadContacts();
  }


  loadContacts = function () {
    this.dataSource = [];
    this.contactsArr = [];
    this.http.post('/api/contacts/view', { })
        .subscribe ((data: any) => {
            this.contactsArr = data;
            this.loadContactsLists();
        });
  };


  loadContactsLists = function () {
    this.http.post('/api/contacts-list/view', {})
      .subscribe((data: any) => {
          this.lists = data;
          this.loadContactsRelations();
      });
  };

  loadContactsRelations = function () {
    this.http.post('api/contacts/get-contacts-with-lists', {})
      .subscribe((data: any) => {
        this.listsConnections = data;
        for (const index of this.contactsArr) {
          for (const relation of this.listsConnections) {
            if (relation['listId']) {
              if (relation['contactId'] === index['contactId']) {
                const fm = this.lists.find(el => el.listId === relation['listId']);
                index.listName = fm.listName;
              }
            }
          }
        }
      });
  };

  openDeleteContact = function (contact) {
    this.contactId = contact.contactId;
    this.deleteContactName = contact.givenName + ' ' + contact.familyName;
  };

  deleteContact = function () {
    this.http.post('/api/contacts/delete', {
      'contactId': this.contactId,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted' ) {
            this.loadContacts();
            this.resetForm();
        }
      });
  };

  openAddContactForm = function () {
    this.isViewAll = false;
    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contactList: new FormControl(''),
    });
  };


  editContact = function (contact) {
    this.isViewAll = false;
    this.isEditContact = true;
    this.contactId = contact.contactId;
    this.form = new FormGroup({
      givenName: new FormControl(contact.givenName),
      familyName: new FormControl(contact.familyName),
      email: new FormControl(contact.email, [Validators.required, Validators.email]),
      contactList: new FormControl([contact.listName]),
    });
  };

  updateContact = function (contact) {
    this.http.post('/api/contacts/edit', {
      'contactId': this.contactId,
      'givenName': contact.givenName,
      'familyName': contact.familyName,
      'email': contact.email,
    })
      .subscribe((result) => {
        if (result.message === 'Contact updated.' ) {
          this.listAddMessage = 'Contact updated.';
          this.isViewAll = true;
          this.isEditContact = false;
          this.loadContacts();

        }
      });
  };

  submit = function () { };

  resetForm = function() {
    this.listAddMessage = undefined;
    this.isViewAll = true;
    this.isEditContact = false;
    this.modalReference.close();
  };

  contactDeleteDialog(modal) {
    this.modalReference = this.dialogService.open(modal);
  }

  onSelect(contact) {
    this.router.navigate(['/contacts/view/' + contact.contactId]);
  }
}
