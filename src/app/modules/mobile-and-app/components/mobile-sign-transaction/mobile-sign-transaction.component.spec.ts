import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSignTransactionComponent } from './mobile-sign-transaction.component';

describe('MobileSignTransactionComponent', () => {
  let component: MobileSignTransactionComponent;
  let fixture: ComponentFixture<MobileSignTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileSignTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobileSignTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
