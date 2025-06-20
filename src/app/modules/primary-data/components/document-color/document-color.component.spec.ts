import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentColorComponent } from './document-color.component';

describe('DocumentColorComponent', () => {
  let component: DocumentColorComponent;
  let fixture: ComponentFixture<DocumentColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentColorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
