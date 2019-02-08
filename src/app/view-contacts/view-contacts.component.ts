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
  displayedColumns: string[] = ['select', 'Given Name', 'Family Name', 'Email'];
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

    this.http.post('/api/contacts/view', { })
      .subscribe ((data: any) => {
           this.allContacts = data;
           this.dataSource = new MatTableDataSource<ContactElements>(this.allContacts);
          });
    }


  submit = function () { };

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
