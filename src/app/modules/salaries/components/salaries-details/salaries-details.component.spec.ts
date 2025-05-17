import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalariesDetailsComponent } from './salaries-details.component';

describe('SalariesDetailsComponent', () => {
  let component: SalariesDetailsComponent;
  let fixture: ComponentFixture<SalariesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalariesDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalariesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
