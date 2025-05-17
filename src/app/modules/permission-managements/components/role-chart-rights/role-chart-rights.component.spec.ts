import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleChartRightsComponent } from './role-chart-rights.component';

describe('RoleChartRightsComponent', () => {
  let component: RoleChartRightsComponent;
  let fixture: ComponentFixture<RoleChartRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleChartRightsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleChartRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
