import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParallelDocumentComponent } from './parallel-document.component';

describe('ParallelDocumentComponent', () => {
  let component: ParallelDocumentComponent;
  let fixture: ComponentFixture<ParallelDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParallelDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParallelDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
