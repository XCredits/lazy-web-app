import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsListDetailsComponent } from './contacts-list-details.component';

describe('ContactsListDetailsComponent', () => {
  let component: ContactsListDetailsComponent;
  let fixture: ComponentFixture<ContactsListDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsListDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
