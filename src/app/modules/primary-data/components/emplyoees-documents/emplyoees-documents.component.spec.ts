import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplyoeesDocumentsComponent } from './emplyoees-documents.component';

describe('EmplyoeesDocumentsComponent', () => {
  let component: EmplyoeesDocumentsComponent;
  let fixture: ComponentFixture<EmplyoeesDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmplyoeesDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmplyoeesDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
