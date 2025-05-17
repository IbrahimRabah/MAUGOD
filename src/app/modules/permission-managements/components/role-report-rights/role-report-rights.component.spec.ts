import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleReportRightsComponent } from './role-report-rights.component';

describe('RoleReportRightsComponent', () => {
  let component: RoleReportRightsComponent;
  let fixture: ComponentFixture<RoleReportRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleReportRightsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleReportRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
