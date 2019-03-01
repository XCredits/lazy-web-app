import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ConsoleReporter } from 'jasmine';

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
  displayedColumns: string[] = ['select', 'givenName', 'familyName', 'email', 'listName', 'Action'];
  selection = new SelectionModel<ContactElements>(true, []);
  dataSource = new MatTableDataSource<ContactElements>(this.contactsArr);
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


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  loadContacts = function () {
    this.dataSource = [];
    this.contactsArr = [];
    this.http.post('/api/contacts/view-contacts', { })
        .subscribe ((data: any) => {
            console.log(data);
            this.contactsArr = data;
            this.dataSource = new MatTableDataSource<ContactElements>(this.contactsArr);
            this.loadContactsLists();
        });
  };


  loadContactsLists = function () {
    this.http.post('/api/contacts-list/view-lists', {})
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
                if ( relation['contactId'] === index ['contactId']) {
                    const fm = this.lists.find(el => el.listId === relation['listId']);
                    index.listName = fm.listName;
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
    this.http.post('/api/contacts/delete-contact', {
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
    this.http.post('/api/contacts/update-contact', {
      'contactId': this.contactId,
      'givenName': contact.givenName,
      'familyName': contact.familyName,
      'email': contact.email,
    })
      .subscribe((result) => {
        if (result.message === 'Contact updated.' ) {
          this.listAddMessage = 'Contact updated.';
          this.isViewAll = false;
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }


  onSelect(contact) {
    this.router.navigate(['/contacts/view/' + contact.contactId]);

  }

}
