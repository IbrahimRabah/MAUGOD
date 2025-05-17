import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsTextComponent } from './notifications-text.component';

describe('NotificationsTextComponent', () => {
  let component: NotificationsTextComponent;
  let fixture: ComponentFixture<NotificationsTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationsTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationsTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
