import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsListViewComponent } from './contacts-list-view.component';

describe('MailingListComponent', () => {
  let component: ContactsListViewComponent;
  let fixture: ComponentFixture<ContactsListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
