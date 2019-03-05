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

  loadContacts = function () {
    this.contactsArr = [];
    this.http.post('/api/contacts/view', { })
        .subscribe ((data: any) => {
            this.contactsArr = data;
            this.contacts = data;
            console.log(this.contacts);

           this.loadContactsLists();
        });
  };


  loadContactsLists = function () {
    this.http.post('/api/contacts-list/view', {})
      .subscribe((data: any) => {
          this.lists = data;
          this.loadContactsRelations();
      });
  };

  loadContactsRelations = function () {
    this.http.post('api/contacts/get-contacts-with-lists', {})
      .subscribe((data: any) => {
        this.listsConnections = data;
        for (const index of this.contactsArr) {
          for (const relation of this.listsConnections) {
            if (relation['listId']) {
              if (relation['contactId'] === index['_id']) {
                const fm = this.lists.find(el => el._id === relation['listId']);
                index.listName = fm.listName;
              }
            }
          }
        }

        console.log(this.listsConnections);
        console.log(this.lists);
        console.log(this.contactsArr);
        console.log('---------');
        console.log(this.contacts);
      });
  };

}
