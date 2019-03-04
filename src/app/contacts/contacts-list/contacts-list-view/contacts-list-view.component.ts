import {MatTableDataSource} from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

export interface ListDetails {
  id: string;
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
  displayedColumns: string[] = ['select', 'listName', 'NoOfContacts', 'Action'];
  dataSource = new MatTableDataSource<string>();
  listAddMessage: string;
  isEditMode: boolean;
  isViewAll: boolean;
  isUpdateMode: boolean;
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];
  listDetails: ListDetails;
  modalReference = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialogService: MatDialog,
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
    this.http.post('/api/contacts/get-contacts-with-lists', {})
    .subscribe((data: any) => {

      this.listsConnections = data;

      for (let i = 0 ; i < this.lists.length ; i++) {
        for (const j of this.listsConnections) {
          if ( j.listId === this.lists[i].id ) {
             this.lists[i].numberOfContacts ++;
          }
        }
      }
    });

  };

  deleteList = function () {
    for (let i = 0 ; i < this.lists.length ; i++) {
        if ( this.listDetails.id === this.lists[i].listId ) {
          this.lists.splice(i, 1);
        }
      }

      this.http.post('/api/contacts-list/delete', {
            'listId': this.listDetails.id,
          })
          .subscribe((result) => {
              if (result.message === 'List deleted.' ) {
                  this.resetForm();
            }
        });
  };

  openDeleteList = function (list) {
    this.listDetails = list;
    this.listId = list.contactId;
    // this.isDelete = true;
    // this.isViewAll = false;
  };


  openAddListForm = function () {
    this.isEditMode = true;
    this.isViewAll = false;
    this.form = new FormGroup({
      listName: new FormControl('', ),
    });
  };



  editListForm = function (list) {
    this.isUpdateMode = true;
    this.isViewAll = false;
    this.listDetails = list;
    this.form = new FormGroup({
      listName: new FormControl(list.listName, ),
    });
  };

  updateList = function (contact) {
    this.http.post('/api/contacts-list/edit', {
      'listId': this.listDetails.id,
      'updatedListName': contact.listName,
    })
      .subscribe((result) => {
        if (result.message === 'List updated.' ) {
          this.isViewAll = true;
          this.isEditMode = false;
          this.isUpdateMode = false;
          this.listAddMessage = 'List updated.';
          this.loadLists();
          this.router.navigate(['/contacts/lists']);


        }
      });
  };


  resetForm = function() {
    this.listAddMessage = undefined;
    this.isEditMode = false;
    this.isViewAll = true;
    this.isDelete = false;
    this.isUpdateMode = false;
    this.modalReference.close();
  };


  submit = function () {
  };


  onSelect(list) {
    this.router.navigate(['/contacts/lists/' + list.id]);

  }

  listDeleteDialog(modal) {
    this.modalReference = this.dialogService.open(modal);
  }


}
