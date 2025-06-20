import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryModeComponent } from './delivery-mode.component';

describe('DeliveryModeComponent', () => {
  let component: DeliveryModeComponent;
  let fixture: ComponentFixture<DeliveryModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryModeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliveryModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
