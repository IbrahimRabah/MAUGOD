import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttantanceTimeChangeRequestComponent } from './attantance-time-change-request.component';

describe('AttantanceTimeChangeRequestComponent', () => {
  let component: AttantanceTimeChangeRequestComponent;
  let fixture: ComponentFixture<AttantanceTimeChangeRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttantanceTimeChangeRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttantanceTimeChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
