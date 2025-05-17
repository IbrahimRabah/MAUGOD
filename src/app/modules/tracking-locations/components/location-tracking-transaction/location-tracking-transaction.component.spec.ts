import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationTrackingTransactionComponent } from './location-tracking-transaction.component';

describe('LocationTrackingTransactionComponent', () => {
  let component: LocationTrackingTransactionComponent;
  let fixture: ComponentFixture<LocationTrackingTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationTrackingTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocationTrackingTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
