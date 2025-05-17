import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorsorshipComponent } from './corsorship.component';

describe('CorsorshipComponent', () => {
  let component: CorsorshipComponent;
  let fixture: ComponentFixture<CorsorshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorsorshipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CorsorshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
