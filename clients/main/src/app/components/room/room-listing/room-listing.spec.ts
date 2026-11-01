import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Profile } from '../../../services/profile';
import { Room } from '../../../services/room/room';
import { UserType } from '../../../types/enums/auth';
import { RoomStatus } from '../../../types/enums/room';
import { RoomListItem } from '../../../types/interfaces/room';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { RoomListing } from './room-listing';

const basementRoom: RoomListItem = {
  guid: 'room-1',
  roomNumber: 'B2-04',
  floor: -2,
  status: RoomStatus.UNDER_MAINTENANCE,
  notes: null,
  roomType: { guid: 'type-1', name: 'Dormitory' },
  organization: { guid: 'org-1', name: 'Sunrise Guest House' },
  createdAt: '2026-11-01T10:00:00',
  updatedAt: '2026-11-01T10:00:00',
};

describe('RoomListing', () => {
  let fixture: ComponentFixture<RoomListing>;
  let element: HTMLElement;
  const roomService = { list: vi.fn(), delete: vi.fn() };

  const render = async (role: UserType) => {
    await TestBed.configureTestingModule({
      imports: [RoomListing],
      providers: [
        provideRouter([]),
        { provide: Room, useValue: roomService },
        { provide: Profile, useValue: { userProfile: signal(new UserProfileModel({ role })) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RoomListing);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    roomService.list.mockReturnValue(
      of({ items: [basementRoom], totalCount: 1, pageNumber: 1, pageSize: 10 }),
    );
  });

  it('shows the floor label, room type and status of each room', async () => {
    await render(UserType.OWNER);
    const cells = Array.from(element.querySelectorAll('td')).map((cell) =>
      cell.textContent?.trim(),
    );

    expect(cells).toContain('B2-04');
    expect(cells).toContain('B2');
    expect(cells).toContain('Dormitory');
    expect(element.querySelector('.status-chip--warning')?.textContent?.trim()).toBe(
      'Under maintenance',
    );
  });

  it('shows the organization column only to admins', async () => {
    await render(UserType.ADMIN);

    expect(element.querySelector('td[data-label="Organization"]')?.textContent).toContain(
      'Sunrise Guest House',
    );
  });

  it('hides the organization column from owners', async () => {
    await render(UserType.OWNER);

    expect(element.querySelector('td[data-label="Organization"]')).toBeNull();
  });

  it('loads the first page sorted by room number', async () => {
    await render(UserType.MANAGER);

    expect(roomService.list).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'roomNumber', sortDirection: 'asc', pageNumber: 1 }),
    );
  });
});
