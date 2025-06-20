import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingTypesComponent } from './voting-types.component';

describe('VotingTypesComponent', () => {
  let component: VotingTypesComponent;
  let fixture: ComponentFixture<VotingTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VotingTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VotingTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
