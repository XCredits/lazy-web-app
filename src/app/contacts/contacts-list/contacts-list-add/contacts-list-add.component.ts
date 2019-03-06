import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material';


@Component({
  selector: 'app-contacts-list-view',
  templateUrl: './contacts-list-add.component.html',
  styleUrls: ['./contacts-list-add.component.scss']
})
export class ContactsListAddComponent implements OnInit {
  form: FormGroup;
  formErrorMessage: string;
  listAddMessage: string;
  isEditMode: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar, ) { }

  ngOnInit() {
    this.listAddMessage = undefined;
    this.isEditMode = true;

    this.form = new FormGroup({
      listName: new FormControl(''),
    });
  }

  addList = function (form) {
    if ( form.listName.length === 0 ) {
      this.formErrorMessage = 'Please type a valid list name.';
       return;
    }
    this.http.post('/api/contacts-list/add', {
      'listName': form.listName,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        switch (result.message) {
              case 'Success.':
                this.snackBar.open('List created successfully', 'Dismiss', {
                  duration: 2000,
                });
                this.router.navigate(['/contacts/lists']);
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
}
