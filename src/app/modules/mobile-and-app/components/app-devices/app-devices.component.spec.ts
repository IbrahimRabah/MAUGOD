import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDevicesComponent } from './app-devices.component';

describe('AppDevicesComponent', () => {
  let component: AppDevicesComponent;
  let fixture: ComponentFixture<AppDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppDevicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
