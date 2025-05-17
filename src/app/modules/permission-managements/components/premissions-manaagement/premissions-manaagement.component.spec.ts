import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsManaagementComponent } from './premissions-manaagement.component';

describe('PremissionsManaagementComponent', () => {
  let component: PremissionsManaagementComponent;
  let fixture: ComponentFixture<PremissionsManaagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PremissionsManaagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PremissionsManaagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
