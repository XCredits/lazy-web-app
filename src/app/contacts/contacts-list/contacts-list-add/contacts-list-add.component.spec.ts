import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsListAddComponent } from './contacts-list-add.component';

describe('ContactsListAddComponent', () => {
  let component: ContactsListAddComponent;
  let fixture: ComponentFixture<ContactsListAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsListAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsListAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
