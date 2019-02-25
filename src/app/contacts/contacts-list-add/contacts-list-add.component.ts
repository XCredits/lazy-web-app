import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient, ) { }

  ngOnInit() {
    this.listAddMessage = undefined;
    this.isEditMode = true;

    this.form = new FormGroup({
      listName: new FormControl(''),
    });
  }


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

  submit = function () {
  };

}
