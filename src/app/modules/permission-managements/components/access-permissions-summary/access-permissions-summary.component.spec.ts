import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessPermissionsSummaryComponent } from './access-permissions-summary.component';

describe('AccessPermissionsSummaryComponent', () => {
  let component: AccessPermissionsSummaryComponent;
  let fixture: ComponentFixture<AccessPermissionsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessPermissionsSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccessPermissionsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
