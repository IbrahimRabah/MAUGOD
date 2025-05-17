import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionOnDataComponent } from './permission-on-data.component';

describe('PermissionOnDataComponent', () => {
  let component: PermissionOnDataComponent;
  let fixture: ComponentFixture<PermissionOnDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionOnDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermissionOnDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
