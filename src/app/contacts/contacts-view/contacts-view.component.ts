import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';


@Component({
  selector: 'app-contacts-view',
  templateUrl: './contacts-view.component.html',
  styleUrls: ['./contacts-view.component.scss']
})
export class ContactsViewComponent implements OnInit {
  form: FormGroup;
  contactId: string;
  contactsArr = [];
  isViewAll: boolean;
  deleteContactName: string;
  modalReference = null;

  constructor(
    private http: HttpClient,
    private dialogService: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar, ) { }

  ngOnInit() {
    this.isViewAll = true;
    // this.loadContacts();
    this.loadSample();
  }


  loadSample = function () {
    this.http.post('/api/contacts/sample', {})
      .subscribe((data: any) => {

        console.log(data);
      });
  };

  loadContacts = function () {
    this.dataSource = [];
    this.contactsArr = [];
    this.http.post('/api/contacts/view', { })
        .subscribe ((data: any) => {
            this.contactsArr = data;
            this.loadContactsGroups();
        });
  };


  loadContactsGroups = function () {
    this.http.post('/api/contacts/group/view', {})
      .subscribe((data: any) => {
          this.groups = data;
          this.loadContactsRelations();
      });
  };

  loadContactsRelations = function () {
    this.http.post('api/contacts/get-contacts-with-groups', {})
      .subscribe((data: any) => {
        this.groupsConnections = data;
        for (const index of this.contactsArr) {
          for (const relation of this.groupsConnections) {
            if (relation['groupId']) {
              if (relation['contactId'] === index['_id']) {
                const fm = this.groups.find(el => el._id === relation['groupId']);
                index.groupName = fm.groupName;
              }
            }
          }
        }
      });
  };

  openDeleteContact = function (contact) {
    this.contactId = contact._id;
    this.deleteContactName = contact.givenName + ' ' + contact.familyName;
  };

  deleteContact = function (contact) {
    this.http.post('/api/contacts/delete', {
      'contactId': this.contactId,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted.' ) {
            this.loadContacts();
            this.resetForm();
            this.snackBar.open('Contact deleted successfully', 'Dismiss', {
              duration: 2000,
            });
        }
      });
  };

  editContact = function (contact) {
    this.isViewAll = false;
    this.contactId = contact.contactId;
    this.router.navigate(['/contacts/i/' + contact._id + '/edit']);
  };

  resetForm = function() {
    this.groupAddMessage = undefined;
    this.isViewAll = true;
    this.modalReference.close();
  };

  contactDeleteDialog(modal) {
    this.modalReference = this.dialogService.open(modal);
  }

  onSelect(contact) {
    this.router.navigate(['/contacts/i/' + contact._id]);

  }
}
