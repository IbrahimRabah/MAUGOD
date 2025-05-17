import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensorshipTourAvaibaleComponent } from './censorship-tour-avaibale.component';

describe('CensorshipTourAvaibaleComponent', () => {
  let component: CensorshipTourAvaibaleComponent;
  let fixture: ComponentFixture<CensorshipTourAvaibaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensorshipTourAvaibaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CensorshipTourAvaibaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
