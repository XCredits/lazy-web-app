import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-contacts-edit',
  templateUrl: './contacts-edit.component.html',
  styleUrls: ['./contacts-edit.component.scss']
})
export class ContactsEditComponent implements OnInit {
  form: FormGroup;
  displayedColumns: string[] = ['select', 'listName', 'Action'];
  contactAddMessage: string;
  isEditMode: boolean;
  lists: { listId: string, listName: string, numberOfContacts: number }[] = [];
  contactIdURL: string;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router, ) { }



  ngOnInit() {

    this.contactAddMessage = undefined;
    this.isEditMode = false;
    this.contactIdURL = this.route.snapshot.paramMap.get('contactId');
    this.loadContactsLists();
    this.loadContactDetails();


  }

  loadContactsLists = function () {
    this.http.post('/api/contacts-list/view', {})
      .subscribe((data: any) => {
          this.lists = data;
      });
  };


  loadContactDetails = function () {
    this.http.post('/api/contacts/details', {
      'contactId': this.contactIdURL,
    })
      .subscribe((data: any) => {

        this.isEditMode = true;
        this.form = new FormGroup({
          givenName: new FormControl(data.givenName),
          familyName: new FormControl(data.familyName),
          email: new FormControl(data.email, [Validators.required, Validators.email]),
          contactList: new FormControl(),
        });
      });
  };

  updateContact = function (newContact) {

    this.http.post('/api/contacts/edit', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactId': this.contactIdURL,
      'contactListId': newContact.contactList.id,
    })
      .subscribe((result) => {
        this.isEditMode = false;
          if ( result.message === 'Contact updated.') {
            this.router.navigate(['/contacts/view/']);
          }
        });
  };


  submit = function () {
  };


}
