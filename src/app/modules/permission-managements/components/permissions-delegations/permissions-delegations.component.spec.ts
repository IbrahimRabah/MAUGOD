import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsDelegationsComponent } from './permissions-delegations.component';

describe('PermissionsDelegationsComponent', () => {
  let component: PermissionsDelegationsComponent;
  let fixture: ComponentFixture<PermissionsDelegationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionsDelegationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermissionsDelegationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
