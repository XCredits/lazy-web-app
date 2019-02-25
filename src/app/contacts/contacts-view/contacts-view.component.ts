import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';

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
  isEditMode: boolean;
  isViewAll: boolean;
  selected: string;
  isDelete: boolean;
  deleteContactName: string;
  modalReference = null;

  constructor(
    private http: HttpClient,
    private dialogService: MatDialog, ) { }

  ngOnInit() {
    this.isEditMode = false;
    this.isViewAll = true;
    this.isDelete = false;
    this.loadContacts();
  }


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  loadContacts = function () {
    this.dataSource = [];
    this.contactsArr = [];
    this.http.post('/api/contacts/view', { })
        .subscribe ((data: any) => {
            this.contactsArr = data;
            this.dataSource = new MatTableDataSource<ContactElements>(this.contactsArr);
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
    this.http.post('api/contacts/view-contacts-with-lists', {})
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
    console.log(contact);
  };

  deleteContact = function () {
    this.http.post('/api/contacts/remove', {
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
    this.isEditMode = true;
    this.isViewAll = false;
    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contactList: new FormControl(''),
    });
  };


  editContact = function (contact) {
    this.isEditMode = true;
    this.isViewAll = false;
    this.contactId = contact.contactId;
    this.form = new FormGroup({
      givenName: new FormControl(contact.listName),
      familyName: new FormControl(contact.familyName),
      email: new FormControl(contact.email, [Validators.required, Validators.email]),
      contactList: new FormControl([contact.listName]),
    });


  };

  updateContact = function (contact) {
    this.http.post('/api/contacts/update', {
      'contactId': this.contactId,
      'givenName': contact.givenName,
      'familyName': contact.familyName,
      'email': contact.email,
    })
      .subscribe((result) => {
        if (result.message === 'Contact updated' ) {
          this.listAddMessage = 'Contact updated';
          this.isViewAll = false;
          this.isEditMode = false;
        }
      });
  };

  submit = function () { };

  resetForm = function() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;
    this.isDelete = false;
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


}
