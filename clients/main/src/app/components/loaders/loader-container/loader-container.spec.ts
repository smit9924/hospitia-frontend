import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderContainer } from './loader-container';

describe('LoaderContainer', () => {
  let component: LoaderContainer;
  let fixture: ComponentFixture<LoaderContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
