import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactsComponent } from './add-contact.component';

describe('MailingListComponent', () => {
  let component: AddContactsComponent;
  let fixture: ComponentFixture<AddContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
