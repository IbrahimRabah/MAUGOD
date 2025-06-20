import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeRouteComponent } from './committee-route.component';

describe('CommitteeRouteComponent', () => {
  let component: CommitteeRouteComponent;
  let fixture: ComponentFixture<CommitteeRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitteeRouteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommitteeRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
