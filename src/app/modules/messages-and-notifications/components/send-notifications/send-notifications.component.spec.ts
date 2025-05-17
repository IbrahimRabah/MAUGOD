import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendNotificationsComponent } from './send-notifications.component';

describe('SendNotificationsComponent', () => {
  let component: SendNotificationsComponent;
  let fixture: ComponentFixture<SendNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SendNotificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
