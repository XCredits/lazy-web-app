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
   waiting: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar, ) { }

  ngOnInit() {
    this.form = new FormGroup({
      listName: new FormControl(''),
    });
  }

  addList = function (form) {
    if ( form.listName.length === 0 ) {
      this.formErrorMessage = 'Please type a valid list name.';
       return;
    }
    this.waiting = true;
    this.http.post('/api/contacts-list/add', {
      'listName': form.listName,
    })
      .subscribe((result) => {
        this.waiting = false;
        switch (result.message) {
              case 'Success.':
                this.snackBar.open('List created successfully', 'Dismiss', {
                  duration: 2000,
                });
                this.router.navigate(['/contacts/lists']);
              break;
              case 'List already exist.':
                this.formErrorMessage = 'List already exist, choose another name';
              break;
              case 'Problem finding a list.':
              case 'Problem creating a list.':
                this.formErrorMessage = 'List cannot be created created.';
              break;
              default:
                this.formErrorMessage = 'Something went wrong, please try again later.';
            }
      },
      errorResponse => {
        this.waiting = false;
        // 422 or 500
        this.formErrorMessage = 'Something went wrong, please try again later.';
      });
  };

  submit = function () {
  };
}
