import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatSnackBar, } from '@angular/material';

@Component({
  selector: 'app-contacts-edit',
  templateUrl: './contacts-edit.component.html',
  styleUrls: ['./contacts-edit.component.scss']
})
export class ContactsEditComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  waiting: boolean;
  groups: { groupId: string, groupName: string, numberOfContacts: number }[] = [];
  contactIdURL: string;
  ContactGroupsArr = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar) { }



  ngOnInit() {

    this.isEditMode = false;
    this.contactIdURL = this.route.snapshot.paramMap.get('contactId');
    this.loadContactsGroups();


  }

  loadContactsGroups = function () {
    this.http.post('/api/contacts/group/view', {})
        .subscribe((data: any) => {
            this.groups = data;
            this.loadContactDetails();
        });
  };


  loadContactDetails = function () {
    this.http.post('/api/contacts/details', {
      'contactId': this.contactIdURL,
    })
    .subscribe((data: any) => {
      console.log(data);
      console.log(data.groups.length);
      if (this.groups != null) {
        for (const i of data.groups) {
          this.ContactGroupsArr.push(this.getGroupName(i.groupId));
        }
      }

      this.isEditMode = true;
      this.form = new FormGroup({
        givenName: new FormControl(data.givenName),
        familyName: new FormControl(data.familyName),
        email: new FormControl(data.email, [Validators.required, Validators.email]),
        contactGroup: new FormControl(this.ContactGroupsArr),
      });
    });
  };

  updateContact = function (newContact) {
    this.waiting = true;
    this.http.post('/api/contacts/edit', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactId': this.contactIdURL,
      'contactGroupId': newContact.contactGroup._id,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        this.waiting = false;
          if ( result.message === 'Contact updated.') {
            this.snackBar.open('Contact updated successfully', 'Dismiss', {
              duration: 2000,
            });
            this.router.navigate(['/contacts/i/' + this.contactIdURL]);
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



  getGroupName = function (groupId) {
    let groupName: string;
    for ( const s of this.groups) {
      if ( groupId === s._id ) {
        groupName = s.groupName;
        break;
      }
    }
    return groupName;
  };

}
