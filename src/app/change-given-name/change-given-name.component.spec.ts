import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeGivenNameComponent } from './change-given-name.component';

describe('ChangeGivenNameComponent', () => {
  let component: ChangeGivenNameComponent;
  let fixture: ComponentFixture<ChangeGivenNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeGivenNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeGivenNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
