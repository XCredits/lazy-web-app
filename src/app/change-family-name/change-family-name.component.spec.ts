import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeFamilyNameComponent } from './change-family-name.component';

describe('ChangeFamilyNameComponent', () => {
  let component: ChangeFamilyNameComponent;
  let fixture: ComponentFixture<ChangeFamilyNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeFamilyNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeFamilyNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
