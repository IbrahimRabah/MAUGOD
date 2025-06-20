import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeInvitationsComponent } from './committee-invitations.component';

describe('CommitteeInvitationsComponent', () => {
  let component: CommitteeInvitationsComponent;
  let fixture: ComponentFixture<CommitteeInvitationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitteeInvitationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommitteeInvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
