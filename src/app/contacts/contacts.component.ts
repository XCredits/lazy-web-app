import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})


export class ContactsComponent implements OnInit {
  contacts: { id: string, givenName: string, lastName: string, email: string, listId: string }[] = [];
  contactsLists: { id: string, listName: string, numberOfContacts: number }[] = [];
  navLinks = [];

  constructor( private http: HttpClient, ) { }

  ngOnInit() {
    this.navLinks.push('./view');
    this.navLinks.push('./lists');
   }
}
