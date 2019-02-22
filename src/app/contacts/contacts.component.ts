import { Component, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';



export interface ContactElements {
  position: number;
  givenName: string;
  familyName: number;
  email: number;
  listName: string;
}

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})


export class ContactsComponent implements OnInit {
  newContacts: { userId: string, givenName: string, familyName: string, email: string, listName: string }[] = [];
  lists: { listId: string, listName: string }[] = [];
  listsConnections: { contactId: string, listId: string }[] = [];
  allContacts = [];
  navLinks = [];
  constructor(
    private http: HttpClient,
    ) { }

  ngOnInit() {
    this.navLinks.push('./view');
    this.navLinks.push('./lists');

  }
}
