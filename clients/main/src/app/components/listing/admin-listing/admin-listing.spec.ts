import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { User } from '../../../services/user/user';
import { AdminListing } from './admin-listing';

describe('AdminListing', () => {
  let component: AdminListing;
  let fixture: ComponentFixture<AdminListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListing],
      providers: [
        {
          provide: User,
          useValue: {
            listAdmins: () => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
