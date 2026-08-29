import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerListing } from './owner-listing';

describe('OwnerListing', () => {
  let component: OwnerListing;
  let fixture: ComponentFixture<OwnerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
