import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { User } from '../../../services/user/user';
import { ManagerListing } from './manager-listing';

describe('ManagerListing', () => {
  let component: ManagerListing;
  let fixture: ComponentFixture<ManagerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerListing],
      providers: [
        {
          provide: User,
          useValue: {
            listManagers: () => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
