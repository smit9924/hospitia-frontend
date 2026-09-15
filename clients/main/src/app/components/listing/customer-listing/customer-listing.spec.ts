import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { User } from '../../../services/user/user';
import { CustomerListing } from './customer-listing';

describe('CustomerListing', () => {
  let component: CustomerListing;
  let fixture: ComponentFixture<CustomerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerListing],
      providers: [
        {
          provide: User,
          useValue: {
            listCustomers: () => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
