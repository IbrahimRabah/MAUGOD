import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MawjoodAppComponent } from './mawjood-app.component';

describe('MawjoodAppComponent', () => {
  let component: MawjoodAppComponent;
  let fixture: ComponentFixture<MawjoodAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MawjoodAppComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MawjoodAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
