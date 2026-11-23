import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
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
  const snackbarService = { open: vi.fn() };
  const dialogService = { openConfirmDialog: vi.fn(() => ({ afterClosed: () => of(true) })) };

  const render = async (role: UserType) => {
    await TestBed.configureTestingModule({
      imports: [RoomListing],
      providers: [
        provideRouter([]),
        { provide: Room, useValue: roomService },
        { provide: Snackbar, useValue: snackbarService },
        { provide: Dialog, useValue: dialogService },
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

  it('explains that a room with active bookings cannot be deleted', async () => {
    roomService.delete.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: {
              errorCode: ErrorCodes.ROOM_HAS_ACTIVE_BOOKINGS,
              message: "Room B2-04 has active bookings and can't be deleted.",
            },
          }),
      ),
    );
    await render(UserType.OWNER);

    fixture.componentInstance['deleteRoom'](basementRoom);

    const snackbar = (snackbarService.open.mock.lastCall?.[0] as GenericSnackbarConfig).data!;
    expect(snackbar.text).toBe("Room B2-04 has active bookings and can't be deleted.");
  });
});
