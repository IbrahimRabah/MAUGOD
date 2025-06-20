import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityLevelComponent } from './security-level.component';

describe('SecurityLevelComponent', () => {
  let component: SecurityLevelComponent;
  let fixture: ComponentFixture<SecurityLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecurityLevelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecurityLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
