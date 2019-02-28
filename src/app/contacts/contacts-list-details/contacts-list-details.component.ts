import {MatTableDataSource} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';

export interface ContactElements {
  givenName: string;
  familyName: string;
  email: string;
}

@Component({
  selector: 'app-contacts-list-details',
  templateUrl: './contacts-list-details.component.html',
  styleUrls: ['./contacts-list-details.component.scss']
})
export class ContactsListDetailsComponent implements OnInit {
  receiverUserId: string;
  link: string;
  displayedColumns: string[] = ['select', 'givenName', 'familyName', 'email'];
  selection = new SelectionModel<ContactElements>(true, []);
  listContact: { userId: string, givenName: string, familyName: string, email: string }[] = [];
  dataSource = new MatTableDataSource<ContactElements>(this.listContact);

  listIdURL: string;
  constructor(private http: HttpClient,
    private route: ActivatedRoute, ) { }

  ngOnInit() {
    this.listIdURL = this.route.snapshot.paramMap.get('listId');
    this.loadListContact();

  }

  loadListContact = function () {
    this.http.post('/api/contacts/view-list-contacts', {
      'listId': this.listIdURL,
    })
      .subscribe((result) => {
        this.listContact = result;
      });
  };

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }


}
