import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFavContactsComponent } from './view-contacts.component';

describe('ContactsComponent', () => {
  let component: ViewFavContactsComponent;
  let fixture: ComponentFixture<ViewFavContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFavContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFavContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
