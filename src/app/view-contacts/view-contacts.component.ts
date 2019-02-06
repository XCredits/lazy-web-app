import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService, User } from '../user.service';
import { HttpClient } from '@angular/common/http';


export interface ContactElements {
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
  displayedColumns: string[] = ['select', 'No', 'Given Name', 'Family Name', 'Email'];
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
    this.http.get<any>('/api/contacts/view')
      .subscribe((data) => {
        this.allContacts = data;
        this.dataSource = new MatTableDataSource<ContactElements>(this.allContacts);

        for (let entry = 0; entry < this.allContacts.length; entry++) {
            this.allContacts[entry].position = entry + 1;
        }

          this.form = new FormGroup({
            givenName: new FormControl(this.allContacts[0].givenName),
            familyName: new FormControl(this.allContacts[0].familyName),
            email: new FormControl(this.allContacts[0].email),
          });
        });
    }


  submit = function () { };

  previousContact = function () {
    if (this.contactIndex > 0) {
        this.contactIndex --;
    }
          this.form = new FormGroup({
            givenName: new FormControl(this.allContacts[this.contactIndex].givenName),
            familyName: new FormControl(this.allContacts[this.contactIndex].familyName),
            email: new FormControl(this.allContacts[this.contactIndex].email),
       });
  };

  nextContact = function () {
    if (this.contactIndex < this.allContacts.length - 1 ) {
        this.contactIndex++;
    }
        this.form = new FormGroup({
          givenName: new FormControl(this.allContacts[this.contactIndex].givenName),
          familyName: new FormControl(this.allContacts[this.contactIndex].familyName),
          email: new FormControl(this.allContacts[this.contactIndex].email),
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
