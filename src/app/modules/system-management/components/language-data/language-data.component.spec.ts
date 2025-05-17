import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageDataComponent } from './language-data.component';

describe('LanguageDataComponent', () => {
  let component: LanguageDataComponent;
  let fixture: ComponentFixture<LanguageDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LanguageDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LanguageDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
