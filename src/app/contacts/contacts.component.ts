import { Component, OnInit } from '@angular/core';
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
  navLinks = [];
  constructor( private http: HttpClient, ) { }

  ngOnInit() {
    this.navLinks.push('./view');
    this.navLinks.push('./lists');
  }
}
