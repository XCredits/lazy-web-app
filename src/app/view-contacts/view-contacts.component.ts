import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService, User } from '../user.service';
import { HttpClient } from '@angular/common/http';

export interface ContactElements {
  isFavourite: Boolean;
  position: number;
  givenName: string;
  familyName: number;
  email: number;
}

@Component({
  selector: 'app-view-contacts',
  templateUrl: './view-contacts.component.html',
  styleUrls: ['./view-contacts.component.scss']
})
export class ViewContactsComponent implements OnInit {
  form: FormGroup;
  disableButton = true;
  submitSuccess = false;
  formErrorMessage: string;
  user: User;
  contactIndex: Number = 0;
  private allContacts = [];
  displayedColumns: string[] = ['select', 'Favourite', 'Given Name', 'Family Name', 'Email', 'Action'];
  selection = new SelectionModel<ContactElements>(true, []);
  dataSource = new MatTableDataSource<ContactElements>(this.allContacts);

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.userService.userObservable
      .subscribe(user => {
        this.user = user;
      });
    this.loadContacts();
  }


  loadContacts = function () {
    this.allContacts = [];
    this.http.post('/api/contacts/view', { })
        .subscribe ((data: any) => {
          this.allContacts = data;
          this.dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
          });
  };

  submit = function () { };

  deleteContact = function (contact) {
    this.http.post('/api/contacts/remove', {
      'userId': this.user.id,
      'contactUserId': contact.contactUserId,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted' ) {
            this.loadContacts();
        }
      });
  };


  removeContactFav = function (contact) {
    this.http.post('/api/contacts/add-remove-fav', {
      'userId': this.user.id,
      'contactUserId': contact.contactUserId,
      'action': 'remove',
    })
      .subscribe((result) => {
        if (result.message === 'Contact modified' ) {
            this.loadContacts();
        }
      });
  };

  addContactFav = function (contact) {
    this.http.post('/api/contacts/add-remove-fav', {
      'userId': this.user.id,
      'contactUserId': contact.contactUserId,
      'action': 'add',
    })
      .subscribe((result) => {
        if (result.message === 'Contact modified' ) {
            this.loadContacts();
        }
      });
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
