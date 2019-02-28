import {MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';

export interface ContactElements {
  givenName: string;
  familyName: string;
  email: string;
  userId: string;
}

@Component({
  selector: 'app-contacts-details',
  templateUrl: './contacts-details.component.html',
  styleUrls: ['./contacts-details.component.scss']
})
export class ContactDetailsComponent implements OnInit {
  receiverUserId: string;
  link: string;
  displayedColumns: string[] = ['select', 'givenName', 'familyName', 'email'];
  selection = new SelectionModel<ContactElements>(true, []);
  listContact: { userId: string, givenName: string, familyName: string, email: string }[] = [];
  dataSource = new MatTableDataSource<ContactElements>(this.listContact);
  contactDetails: ContactElements;
  contactIdURL: string;
  constructor(private http: HttpClient,
    private route: ActivatedRoute, ) { }

  ngOnInit() {
    this.contactDetails = {
      givenName : '',
      familyName : '',
      email: '',
      userId: '',
    };
    this.contactIdURL = this.route.snapshot.paramMap.get('contactId');
    this.loadContactDetails();
  }

  loadContactDetails = function () {
    this.http.post('/api/contacts/view-contact-details', {
      'contactId': this.contactIdURL,
    })
      .subscribe((result) => {
        this.contactDetails = result;
      });
  };


}
