import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimtranLockComponent } from './timtran-lock.component';

describe('TimtranLockComponent', () => {
  let component: TimtranLockComponent;
  let fixture: ComponentFixture<TimtranLockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimtranLockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimtranLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
