import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsListUpdateComponent } from './contacts-list-update.component';

describe('ContactsListUpdateComponent', () => {
  let component: ContactsListUpdateComponent;
  let fixture: ComponentFixture<ContactsListUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsListUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsListUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
