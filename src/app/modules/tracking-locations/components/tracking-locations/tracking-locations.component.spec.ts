import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingLocationsComponent } from './tracking-locations.component';

describe('TrackingLocationsComponent', () => {
  let component: TrackingLocationsComponent;
  let fixture: ComponentFixture<TrackingLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrackingLocationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackingLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
