import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemModulesComponent } from './system-modules.component';

describe('SystemModulesComponent', () => {
  let component: SystemModulesComponent;
  let fixture: ComponentFixture<SystemModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemModulesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
