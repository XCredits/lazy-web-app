import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { ContactsComponent } from '../contacts.component';

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
  private allContacts = [];
  displayedColumns: string[] = ['select', 'givenName', 'familyName', 'email', 'listName', 'Action'];
  selection = new SelectionModel<ContactElements>(true, []);
  dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
  listAddMessage: string;
  isEditMode: boolean;
  isViewAll: boolean;
  str: string;
  selected: string;
  isDelete: boolean;

  constructor(
    private http: HttpClient,
    private connectionRoute: ContactsComponent,
  ) { }

  ngOnInit() {
    this.listAddMessage = undefined;
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
    this.allContacts = [];
    this.http.post('/api/contacts/view', { })
        .subscribe ((data: any) => {
          this.allContacts = data;
          this.newContacts = data;
          this.dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
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
    this.http.post('/api/contacts/viewall', {})
    .subscribe((data: any) => {

      this.listsConnections = data;


      for (const index of this.newContacts) {
        for (const relation of this.listsConnections) {
          if ( relation['contactId'] === index ['contactId']) {
            const fm = this.lists.find(el => el.listId === relation['listId']);
            index.listName = fm.listName;
          }
        }
      }
    });

  };

  openDeleteList = function (contact) {
    console.log(contact.contactId);
    this.contactId = contact.contactId;

    this.isDelete = true;
    this.isViewAll = false;
  };

  deleteContact = function () {


    this.http.post('/api/contacts/remove', {
      'contactId': this.contactId,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted' ) {
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
    console.log(contact);
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
        console.log(result);
        if (result.message === 'Contact updated' ) {
          console.log('----');
          this.resetForm();
        }
      });
  };

  submit = function () { };

  addContact = function (newContact) {

    this.http.post('/api/contacts/add', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactListId': newContact.contactList.listId,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        switch (result.message) {
              case 'Success':
                this.listAddMessage = 'List created successfully.';
              break;
              case 'List already exist.':
                this.listAddMessage = 'List already exist, choose another name';
              break;
              case 'Problem finding a list.':
              case 'Problem creating a list.':
                this.listAddMessage = 'List cannot be created created.';
              break;
              default:
                this.listAddMessage = 'Something went wrong, please try again later.';
            }
        });
  };


  resetForm = function() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;
    this.isDelete = false;
    this.loadContacts();

  };

  ignoreSaveContact = function() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;
  };



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
