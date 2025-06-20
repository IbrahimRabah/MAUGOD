import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasarApplicationComponent } from './masar-application.component';

describe('MasarApplicationComponent', () => {
  let component: MasarApplicationComponent;
  let fixture: ComponentFixture<MasarApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasarApplicationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasarApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
