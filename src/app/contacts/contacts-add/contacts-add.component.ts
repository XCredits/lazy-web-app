import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ContactsComponent } from '../contacts.component';
import { Router } from '@angular/router';

export interface ListDetails {
  listId: string;
  listName: string;
  numberOfContacts: number;

}
export interface ContactElements {
  listName: string;
}

export interface List {
  value: string;
}
@Component({
  selector: 'app-contacts-add',
  templateUrl: './contacts-add.component.html',
  styleUrls: ['./contacts-add.component.scss']
})
export class ContactsAddComponent implements OnInit {
  form: FormGroup;
  disableButton = true;
  submitSuccess = false;
  formErrorMessage: string;
  listId: string;
  private allContacts = [];
  displayedColumns: string[] = ['select', 'listName', 'Action'];
  selection = new SelectionModel<ContactElements>(true, []);
  dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
  listAddMessage: string;
  isEditMode: boolean;
  isViewAll: boolean;
  isUpdateMode: boolean;
  list: List[] = [
    {value: 'Steak'},
    {value: 'Pizza'},
    {value: 'Tacos'}
  ];
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];
  listDetail: ListDetails;

  constructor(
    private http: HttpClient,
    private connectionRoute: ContactsComponent,
    private router: Router,
  ) { }

  ngOnInit() {
    this.listAddMessage = undefined;
    this.isEditMode = true;
    this.isViewAll = true;

    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contactList: new FormControl(''),
    });

    this.loadContactsLists();

  }


  loadContactsLists = function () {
    this.http.post('/api/contacts-list/view', {})
      .subscribe((data: any) => {
        this.lists = data;
      });
  };

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


  submit = function () {
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
