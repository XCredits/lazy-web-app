import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsListEditComponent } from './contacts-list-edit.component';

describe('ContactsListEditComponent', () => {
  let component: ContactsListEditComponent;
  let fixture: ComponentFixture<ContactsListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
