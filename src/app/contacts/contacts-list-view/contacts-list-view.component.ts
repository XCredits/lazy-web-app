import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ContactsComponent } from '../contacts.component';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Router } from '@angular/router';

export interface ContactElements {
  listName: string;
}

export interface List {
  value: string;
}
@Component({
  selector: 'app-contacts-list-view',
  templateUrl: './contacts-list-view.component.html',
  styleUrls: ['./contacts-list-view.component.scss']
})
export class ContactsListViewComponent implements OnInit {
  form: FormGroup;
  disableButton = true;
  submitSuccess = false;
  formErrorMessage: string;
  contactId: string;
  private allContacts = [];
  displayedColumns: string[] = ['select', 'listName', 'Action'];
  selection = new SelectionModel<ContactElements>(true, []);
  dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
  listAddMessage: string;
  isEditMode: boolean;
  isViewAll: boolean;
  list: List[] = [
    {value: 'Steak'},
    {value: 'Pizza'},
    {value: 'Tacos'}
  ];
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];

  constructor(
    private http: HttpClient,
    private connectionRoute: ContactsComponent,
    private router: Router,
  ) { }

  ngOnInit() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;

    this.loadLists();
  }


  loadLists = function () {
    this.dataSource = [];
    this.lists = [];
    this.http.post('/api/contacts-list/view', { })
        .subscribe ((data: any) => {
          this.lists = data;
          for (const counter of this.lists) {
              counter.numberOfContacts = 0;
          }
          this.dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
          this.loadContactsRelations();
        });
  };

  loadContactsRelations = function () {
    this.http.post('/api/contacts/viewall', {})
    .subscribe((data: any) => {

      this.listsConnections = data;
      for (let i = 0 ; i < this.lists.length ; i++) {
        for (const j of this.listsConnections) {
          if ( j.listId === this.lists[i].listId ) {
             this.lists[i].numberOfContacts ++;
          }
        }

      }
    });

  };

  deleteContact = function (contact) {
    this.http.post('/api/contacts/remove', {
      'contactId': contact.contactId,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted' ) {
            this.loadLists();
        }
      });
  };

  openAddListForm = function () {
    console.log('edit is true');
    this.isEditMode = true;
    this.isViewAll = false;
    this.form = new FormGroup({
      listName: new FormControl(''),
    });
  };



  editContact = function (contact) {
    this.isEditMode = true;
    this.isViewAll = false;
    this.contactId = contact.contactId;
    this.form = new FormGroup({
      givenName: new FormControl(contact.givenName),
      familyName: new FormControl(contact.familyName),
      email: new FormControl(contact.email, [Validators.required, Validators.email]),
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
          this.isEditMode = false;
          this.loadLists();
        }
      });
  };



  addList = function (form) {
    this.http.post('/api/contacts-list/add', {
      'listName': form.listName,
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
    this.loadLists();

  };


  ignoreSaveContact = function() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;
  };


  submit = function () {
  };


  onSelect(list) {
    this.router.navigate(['/contacts/lists/' + list.listId]);

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
