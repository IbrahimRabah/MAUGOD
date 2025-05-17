import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HijriDataComponent } from './hijri-data.component';

describe('HijriDataComponent', () => {
  let component: HijriDataComponent;
  let fixture: ComponentFixture<HijriDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HijriDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HijriDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
