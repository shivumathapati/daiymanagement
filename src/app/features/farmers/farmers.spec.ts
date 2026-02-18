import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Farmers } from './farmers';

describe('Farmers', () => {
  let component: Farmers;
  let fixture: ComponentFixture<Farmers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Farmers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Farmers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
