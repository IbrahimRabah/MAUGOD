import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensorshipTourUnavailableComponent } from './censorship-tour-unavailable.component';

describe('CensorshipTourUnavailableComponent', () => {
  let component: CensorshipTourUnavailableComponent;
  let fixture: ComponentFixture<CensorshipTourUnavailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensorshipTourUnavailableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensorshipTourUnavailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
