import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticSignComponent } from './automatic-sign.component';

describe('AutomaticSignComponent', () => {
  let component: AutomaticSignComponent;
  let fixture: ComponentFixture<AutomaticSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutomaticSignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutomaticSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
