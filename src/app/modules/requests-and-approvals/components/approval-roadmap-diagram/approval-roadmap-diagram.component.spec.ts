import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalRoadmapDiagramComponent } from './approval-roadmap-diagram.component';

describe('ApprovalRoadmapDiagramComponent', () => {
  let component: ApprovalRoadmapDiagramComponent;
  let fixture: ComponentFixture<ApprovalRoadmapDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovalRoadmapDiagramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovalRoadmapDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
