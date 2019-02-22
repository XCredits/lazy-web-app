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
  selector: 'app-contacts-list-view',
  templateUrl: './contacts-list-add.component.html',
  styleUrls: ['./contacts-list-add.component.scss']
})
export class ContactsListAddComponent implements OnInit {
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
      listName: new FormControl(''),
    });
  }


  loadContactsRelations = function () {
    this.http.post('/api/contacts-list/add', {})
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

  openDeleteList = function (list) {
    console.log(list);
    this.listDetail = list;
    this.listId = list.contactId;
    this.isDelete = true;
    this.isViewAll = false;
  };
  openAddListForm = function () {
    this.isEditMode = true;
    this.isViewAll = false;
    this.form = new FormGroup({
      listName: new FormControl(''),
    });
  };


  addList = function (form) {
    console.log(form.listName);
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
    this.isDelete = false;
    this.isUpdateMode = false;


  };


  ignoreSaveContact = function() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;
    this.isUpdateMode = false;

  };


  submit = function () {
  };


  onSelect(list) {
   // this.router.navigate(['/contacts/lists/' + list.listId]);

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
