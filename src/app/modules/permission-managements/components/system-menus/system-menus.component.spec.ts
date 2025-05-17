import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemMenusComponent } from './system-menus.component';

describe('SystemMenusComponent', () => {
  let component: SystemMenusComponent;
  let fixture: ComponentFixture<SystemMenusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemMenusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
