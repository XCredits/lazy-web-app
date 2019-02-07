import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  navLinks = [];
  pages = [];

  constructor() { }

  ngOnInit() {
    this.navLinks.push('./view');
    this.navLinks.push('./add');
    this.pages.push('view');
    this.pages.push('add');
  }

}
