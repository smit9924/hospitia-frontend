import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { User } from '../../../services/user/user';
import { OwnerListing } from './owner-listing';

describe('OwnerListing', () => {
  let component: OwnerListing;
  let fixture: ComponentFixture<OwnerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerListing],
      providers: [
        {
          provide: User,
          useValue: {
            listOwners: () => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
