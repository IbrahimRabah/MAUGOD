import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendAppQrCodeComponent } from './send-app-qr-code.component';

describe('SendAppQrCodeComponent', () => {
  let component: SendAppQrCodeComponent;
  let fixture: ComponentFixture<SendAppQrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SendAppQrCodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendAppQrCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
