import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService, User } from '../user.service';
import { HttpClient } from '@angular/common/http';

export interface ContactElements {
  isFavorite: Boolean;
  isEditMode: Boolean;
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
  contactEditId: string;
  private allContacts = [];
  displayedColumns: string[] = ['select', 'Given Name', 'Family Name', 'Email', 'Action'];
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
      'contactUserId': contact.contactUserId,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted' ) {
            this.loadContacts();
        }
      });
  };

  editContact = function (contact) {
    this.isEditMode = true;
    this.contactEditId = contact.contactUserId;
    this.form = new FormGroup({
      givenName: new FormControl(contact.givenName),
      familyName: new FormControl(contact.familyName),
      email: new FormControl(contact.email, [Validators.required, Validators.email]),
    });

  };

  updateContact = function (contact) {
    this.http.post('/api/contacts/update', {
      'contactUserId': this.contactEditId,
      'givenName': contact.givenName,
      'familyName': contact.familyName,
      'email': contact.email,
    })
      .subscribe((result) => {
        if (result.message === 'Contact updated' ) {
          this.isEditMode = false;
          this.loadContacts();
        }
      });
  };



  removeContactFav = function (contact) {
    this.http.post('/api/contacts/add-remove-fav', {
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
