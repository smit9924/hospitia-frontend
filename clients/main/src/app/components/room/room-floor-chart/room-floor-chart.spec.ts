import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Organization } from '../../../services/organization/organization';
import { Room } from '../../../services/room/room';
import { Snackbar } from '../../../services/snackbar';
import { RoomStatus } from '../../../types/enums/room';
import { RoomFloorOverviewItem } from '../../../types/interfaces/room';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { RoomFloorChart } from './room-floor-chart';

const deluxe = { guid: 'type-deluxe', name: 'Deluxe double' };
const dorm = { guid: 'type-dorm', name: 'Dormitory' };

/** API order: top floor first, then room number. */
const overviewRooms: RoomFloorOverviewItem[] = [
  {
    guid: 'r201',
    roomNumber: '201',
    floor: 2,
    status: RoomStatus.AVAILABLE,
    notes: null,
    roomType: deluxe,
  },
  {
    guid: 'r101',
    roomNumber: '101',
    floor: 1,
    status: RoomStatus.AVAILABLE,
    notes: null,
    roomType: deluxe,
  },
  {
    guid: 'r102',
    roomNumber: '102',
    floor: 1,
    status: RoomStatus.UNDER_MAINTENANCE,
    notes: null,
    roomType: dorm,
  },
  {
    guid: 'rg01',
    roomNumber: 'G-01',
    floor: 0,
    status: RoomStatus.AVAILABLE,
    notes: null,
    roomType: dorm,
  },
  {
    guid: 'rb01',
    roomNumber: 'B1-01',
    floor: -1,
    status: RoomStatus.OUT_OF_SERVICE,
    notes: null,
    roomType: dorm,
  },
];

describe('RoomFloorChart', () => {
  let fixture: ComponentFixture<RoomFloorChart>;
  let element: HTMLElement;
  const roomService = { getFloorOverview: vi.fn(), updateStatus: vi.fn() };
  const snackbarService = { open: vi.fn() };
  const dialogResult = signal<RoomStatus | null>(null);
  const matDialog = { open: vi.fn(() => ({ afterClosed: () => of(dialogResult()) })) };

  const render = async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFloorChart],
      providers: [
        provideRouter([]),
        { provide: Room, useValue: roomService },
        { provide: Snackbar, useValue: snackbarService },
        { provide: MatDialog, useValue: matDialog },
        { provide: Organization, useValue: { activeOrganization: signal({ guid: 'org-1' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RoomFloorChart);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  const floorLabels = () =>
    Array.from(element.querySelectorAll('.room-floor-label')).map((label) =>
      label.textContent?.trim(),
    );
  const tile = (roomNumber: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.room-tile')).find(
      (button) => button.querySelector('.room-tile-number')?.textContent?.trim() === roomNumber,
    )!;
  const countValues = () =>
    Array.from(element.querySelectorAll('.status-count-value')).map((value) =>
      value.textContent?.trim(),
    );
  const lastSnackbar = () =>
    (snackbarService.open.mock.lastCall?.[0] as GenericSnackbarConfig).data!;

  beforeEach(() => {
    vi.clearAllMocks();
    dialogResult.set(null);
    roomService.getFloorOverview.mockReturnValue(of({ rooms: structuredClone(overviewRooms) }));
  });

  it('draws one row per floor, top floor first, with ground and basement labels', async () => {
    await render();

    expect(floorLabels()).toEqual(['Floor 2', 'Floor 1', 'Ground', 'B1']);
    expect(element.querySelectorAll('.room-ground-line')).toHaveLength(1);
    expect(
      element.querySelector('.room-floor-row--basement .room-floor-label')?.textContent,
    ).toContain('B1');
  });

  it('counts the rooms per status', async () => {
    await render();

    expect(countValues()).toEqual(['5', '3', '1', '1']);
  });

  it('names each tile with its number, room type and status', async () => {
    await render();

    expect(tile('102').getAttribute('aria-label')).toBe('Room 102, Dormitory, Under maintenance');
    expect(tile('B1-01').classList).toContain('room-tile--out-of-service');
  });

  it('filters rooms and counts by room type', async () => {
    await render();

    fixture.componentInstance['onRoomTypeFilterChange'](deluxe.guid);
    await fixture.whenStable();

    expect(floorLabels()).toEqual(['Floor 2', 'Floor 1']);
    expect(countValues()).toEqual(['2', '2', '0', '0']);
  });

  it('saves a chosen status, updates the tile and offers Undo', async () => {
    roomService.updateStatus.mockImplementation(({ guid, status }) => of({ guid, status }));
    await render();
    dialogResult.set(RoomStatus.OUT_OF_SERVICE);

    tile('101').click();
    await fixture.whenStable();

    expect(roomService.updateStatus).toHaveBeenCalledWith({
      guid: 'r101',
      status: RoomStatus.OUT_OF_SERVICE,
    });
    expect(tile('101').classList).toContain('room-tile--out-of-service');
    expect(countValues()).toEqual(['5', '2', '1', '2']);
    expect(lastSnackbar().text).toBe('Room 101 is now Out of service.');
    expect(lastSnackbar().actionLabel).toBe('Undo');

    lastSnackbar().onAction!();
    await fixture.whenStable();

    expect(roomService.updateStatus).toHaveBeenLastCalledWith({
      guid: 'r101',
      status: RoomStatus.AVAILABLE,
    });
    expect(tile('101').classList).toContain('room-tile--available');
    expect(lastSnackbar().text).toBe('Room 101 is back to Available.');
    expect(lastSnackbar().actionLabel).toBe('');
  });

  it('keeps the old status and explains when saving fails', async () => {
    roomService.updateStatus.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    await render();
    dialogResult.set(RoomStatus.OUT_OF_SERVICE);

    tile('101').click();
    await fixture.whenStable();

    expect(tile('101').classList).toContain('room-tile--available');
    expect(lastSnackbar().text).toBe('Room 101 could not be updated. Please try again.');
  });

  it('reloads when the room no longer exists', async () => {
    roomService.updateStatus.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    await render();
    dialogResult.set(RoomStatus.OUT_OF_SERVICE);

    tile('101').click();
    await fixture.whenStable();

    expect(lastSnackbar().text).toBe('Room 101 no longer exists.');
    expect(roomService.getFloorOverview).toHaveBeenCalledTimes(2);
  });

  it('invites creating a room when there are none', async () => {
    roomService.getFloorOverview.mockReturnValue(of({ rooms: [] }));
    await render();

    expect(element.textContent).toContain('No rooms yet');
    expect(element.querySelector('a[href="/organization/room/create"]')).not.toBeNull();
  });

  it('offers Retry when loading fails', async () => {
    roomService.getFloorOverview.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    await render();

    expect(element.textContent).toContain('Rooms could not be loaded');
  });
});
