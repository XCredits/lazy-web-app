import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewConnectionsComponent } from './view-connections.component';

describe('ViewConnectionsComponent', () => {
  let component: ViewConnectionsComponent;
  let fixture: ComponentFixture<ViewConnectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewConnectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
