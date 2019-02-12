import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentConnectionComponent } from './sent-Connections.component';

describe('SentConnectionComponent', () => {
  let component: SentConnectionComponent;
  let fixture: ComponentFixture<SentConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
