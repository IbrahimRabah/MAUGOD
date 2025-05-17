import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackChangesComponent } from './track-changes.component';

describe('TrackChangesComponent', () => {
  let component: TrackChangesComponent;
  let fixture: ComponentFixture<TrackChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrackChangesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
