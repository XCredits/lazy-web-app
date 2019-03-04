import { Component, OnInit, Output, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-contacts-list-update',
  templateUrl: './contacts-list-update.component.html',
  styleUrls: ['./contacts-list-update.component.scss']
})
export class ContactsListUpdateComponent implements OnInit {
  form: FormGroup;
  formErrorMessage: string;
  listAddMessage: string;
  isEditMode: boolean;
  public firstname: string;
  public lastname: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute ) {
      this.route.queryParams.subscribe(params => {
        this.firstname = params['firstname'];
        this.lastname = params['lastname'];
    });

  }

  ngOnInit() {

    this.listAddMessage = undefined;
    this.isEditMode = true;

    this.form = new FormGroup({
      listName: new FormControl(''),
    });
  }

  addList = function (form) {

    if ( form.listName.length === 0 ) {
      this.formErrorMessage = 'Please type a valid list name.';
       return;
    }
    this.http.post('/api/contacts-list/add', {
      'listName': form.listName,
    })
      .subscribe((result) => {
        this.isEditMode = false;
        switch (result.message) {
              case 'Success.':
              this.router.navigate(['/contacts/lists']);
              break;
              case 'List already exist.':
                this.listAddMessage = 'List already exist, choose another name';
              break;
              case 'Problem finding a list.':
              case 'Problem creating a list.':
                this.listAddMessage = 'List cannot be created created.';
              break;
              default:
                this.listAddMessage = 'Something went wrong, please try again later.';
            }
        });
  };

  submit = function () {
  };
}
