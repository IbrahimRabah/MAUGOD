import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteesDataComponent } from './committees-data.component';

describe('CommitteesDataComponent', () => {
  let component: CommitteesDataComponent;
  let fixture: ComponentFixture<CommitteesDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitteesDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommitteesDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
