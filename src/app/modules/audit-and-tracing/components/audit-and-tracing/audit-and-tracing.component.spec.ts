import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditAndTracingComponent } from './audit-and-tracing.component';

describe('AuditAndTracingComponent', () => {
  let component: AuditAndTracingComponent;
  let fixture: ComponentFixture<AuditAndTracingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditAndTracingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditAndTracingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
