import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

export interface ContactElements {
  id: string;
  userId: string;
  givenName: string;
  familyName: string;
  email: string;
}

@Component({
  selector: 'app-contacts-details',
  templateUrl: './contacts-details.component.html',
  styleUrls: ['./contacts-details.component.scss']
})
export class ContactDetailsComponent implements OnInit {
  receiverUserId: string;
  contactDetails: ContactElements;
  contactIdURL: string;
  modalReference = null;
  contactId: string;
  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private dialogService: MatDialog,
    private router: Router, ) { }


  ngOnInit() {
    this.contactDetails = {
      id: '',
      userId: '',
      givenName : '',
      familyName : '',
      email: '',
    };
    this.contactIdURL = this.route.snapshot.paramMap.get('contactId');
    this.loadContactDetails();
  }

  loadContactDetails = function () {
    this.http.post('/api/contacts/details', {
      'contactId': this.contactIdURL,
    })
      .subscribe((result) => {
        this.contactDetails = result;
      });
  };



  contactDeleteDialog(modal) {
    this.modalReference = this.dialogService.open(modal);
  }



  openDeleteContact = function () {
    this.contactId = this.contactDetails.contactId;
    this.deleteContactName = this.contactDetails.givenName + ' ' + this.contactDetails.familyName;
  };

  deleteContact = function () {
    this.http.post('/api/contacts/delete', {
      'contactId': this.contactDetails._id,
    })
      .subscribe((result) => {
        if (result.message === 'Contact deleted.' ) {
          this.modalReference.close();
          this.router.navigate(['/contacts/view']);

        }
      });
  };


  editContact = function () {
    this.contactId = this.contactDetails.contactId;
    this.router.navigate(['/contacts/edit/' + this.contactIdURL]);
  };

  resetForm = function() {
    this.modalReference.close();
  };


}
