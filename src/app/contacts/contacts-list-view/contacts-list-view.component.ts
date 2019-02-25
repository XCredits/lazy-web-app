import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface ListDetails {
  listId: string;
  listName: string;
  numberOfContacts: number;

}


@Component({
  selector: 'app-contacts-list-view',
  templateUrl: './contacts-list-view.component.html',
  styleUrls: ['./contacts-list-view.component.scss']
})
export class ContactsListViewComponent implements OnInit {
  form: FormGroup;
  disableButton = true;
  displayedColumns: string[] = ['select', 'listName', 'Action'];
  selection = new SelectionModel<string>(true, []);
  dataSource = new MatTableDataSource<string>();
  listAddMessage: string;
  isEditMode: boolean;
  isViewAll: boolean;
  isUpdateMode: boolean;
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];
  listDetails: ListDetails;

  constructor(
    private http: HttpClient,
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
          this.dataSource = new MatTableDataSource<string>(this.allContacts);
          this.loadContactsRelations();
        });
  };

  loadContactsRelations = function () {
    this.http.post('/api/contacts/view-contacts-with-lists', {})
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

  deleteList = function () {
    this.http.post('/api/contacts-list/remove', {
      'listId': this.listDetails.listId,
    })
      .subscribe((result) => {
        if (result.message === 'List deleted' ) {
            this.resetForm();
        }
      });
  };

  openDeleteList = function (list) {
    this.listDetails = list;
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



  editListForm = function (list) {
    this.isUpdateMode = true;
    this.isViewAll = false;
    this.listDetails = list;
    this.form = new FormGroup({
      listName: new FormControl(list.listName),
    });
  };

  updateList = function (contact) {
    this.http.post('/api/contacts-list/update', {
      'listId': this.listDetails.listId,
      'UpdatedListName': contact.listName,
    })
      .subscribe((result) => {
        if (result.message === 'List updated' ) {
          this.isViewAll = false;
          this.isEditMode = false;
          this.isUpdateMode = false;
          this.listAddMessage = 'List updated';
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
    this.isDelete = false;
    this.isUpdateMode = false;
    this.loadLists();
  };


  submit = function () {
  };


  onSelect(list) {
    this.router.navigate(['/contacts/lists/' + list.listId]);

  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.lists.length;
    return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
      this.selection.clear() :
      this.lists.forEach(row => this.selection.select(row));
  }



}
