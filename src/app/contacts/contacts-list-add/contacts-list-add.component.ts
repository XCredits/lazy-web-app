import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
    private router: Router, ) { }

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
    this.http.post('/api/contacts-list/add-list', {
      'listName': form.listName,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        switch (result.message) {
              case 'Success.':
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
