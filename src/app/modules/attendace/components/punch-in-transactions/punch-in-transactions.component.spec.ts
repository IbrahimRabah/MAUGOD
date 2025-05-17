import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchInTransactionsComponent } from './punch-in-transactions.component';

describe('PunchInTransactionsComponent', () => {
  let component: PunchInTransactionsComponent;
  let fixture: ComponentFixture<PunchInTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PunchInTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PunchInTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
