import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleModuleRightsComponent } from './role-module-rights.component';

describe('RoleModuleRightsComponent', () => {
  let component: RoleModuleRightsComponent;
  let fixture: ComponentFixture<RoleModuleRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleModuleRightsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleModuleRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
