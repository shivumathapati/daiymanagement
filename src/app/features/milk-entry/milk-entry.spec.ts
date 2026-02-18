import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilkEntry } from './milk-entry';

describe('MilkEntry', () => {
  let component: MilkEntry;
  let fixture: ComponentFixture<MilkEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilkEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilkEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
