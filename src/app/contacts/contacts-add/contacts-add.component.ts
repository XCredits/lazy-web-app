import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {MatSnackBar, MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-contacts-add',
  templateUrl: './contacts-add.component.html',
  styleUrls: ['./contacts-add.component.scss']
})
export class ContactsAddComponent implements OnInit {
  form: FormGroup;
  formErrorMessage: string;
  isEditMode: boolean;
  waiting: boolean;
  groups: { groupId: string, groupName: string }[] = [];
  groupsSelection = [];

  // Chips code
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar, ) {
      this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
        startWith(null),
        map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
     }

  ngOnInit() {
    this.formErrorMessage = undefined;
    this.isEditMode = true;
    this.form = new FormGroup({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      contactGroup: new FormControl(''),
    });
    this.loadContactsGroups();
  }


  loadContactsGroups = function () {
    this.http.post('/api/contacts/group/get-groups', {})
        .subscribe((data: any) => {
          this.groups = data;
        });
  };

  addContact = function (newContact) {
    if ( newContact.givenName.length === 0 ||
        newContact.familyName.length === 0 ||
        newContact.email.length === 0 ) {
      this.formErrorMessage = 'Please type a valid inputs.';
      return;
    }

    this.waiting = true;
    this.http.post('/api/contacts/add', {
      'givenName': newContact.givenName,
      'familyName': newContact.familyName,
      'email': newContact.email,
      'contactGroupIds': this.groupsSelection,
    })
    .subscribe((result) => {
      this.waiting = false;
      this.isEditMode = false;
      switch (result.message) {
        case 'Success.':
          this.snackBar.open('Contact created successfully', 'Dismiss', {
            duration: 2000,
          });
          this.router.navigate(['/contacts/i/' + result.contactId]);
          break;
        case 'Problem finding a group.':
        case 'Problem creating a group.':
          this.formErrorMessage = 'Contact cannot be created.';
          break;
        default:
          this.formErrorMessage = 'Something went wrong, please try again later.';
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


  onSelection(selection) {
    this.groupsSelection.push(selection);
    console.log(this.groupsSelection);
  }

  unselectGroup(group) {
    this.groupsSelection.splice( this.groupsSelection.indexOf(group) , 1);
    console.log(this.groupsSelection);

  }





  // Chips code
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.fruits.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.fruitCtrl.setValue(null);
    }
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }
}
