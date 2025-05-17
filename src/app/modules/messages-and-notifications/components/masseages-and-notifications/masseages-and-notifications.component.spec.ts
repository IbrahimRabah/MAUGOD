import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasseagesAndNotificationsComponent } from './masseages-and-notifications.component';

describe('MasseagesAndNotificationsComponent', () => {
  let component: MasseagesAndNotificationsComponent;
  let fixture: ComponentFixture<MasseagesAndNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasseagesAndNotificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasseagesAndNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
