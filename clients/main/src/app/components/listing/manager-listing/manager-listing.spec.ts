import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerListing } from './manager-listing';

describe('ManagerListing', () => {
  let component: ManagerListing;
  let fixture: ComponentFixture<ManagerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
