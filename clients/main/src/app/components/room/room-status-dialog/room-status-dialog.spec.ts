import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { BookingStatus } from '../../../types/enums/booking';
import { RoomStatus } from '../../../types/enums/room';
import { RoomFloorOverviewItem } from '../../../types/interfaces/room';
import { RoomStatusDialog } from './room-status-dialog';

const room: RoomFloorOverviewItem = {
  guid: 'room-1',
  roomNumber: 'B1-02',
  floor: -1,
  status: RoomStatus.AVAILABLE,
  notes: 'Near the stairs',
  roomType: { guid: 'type-1', name: 'Dormitory' },
  occupancy: null,
};

const occupiedRoom: RoomFloorOverviewItem = {
  ...room,
  occupancy: {
    bookingGuid: 'booking-1',
    reference: 'BK-2026-000042',
    status: BookingStatus.CHECKED_IN,
    primaryGuestName: 'Asha Rao',
    checkInDate: '2026-11-20',
    checkOutDate: '2026-11-25',
    isArriving: false,
    isDeparting: false,
  },
};

describe('RoomStatusDialog', () => {
  const dialogRef = { close: vi.fn() };
  let element: HTMLElement;

  const render = async (dialogRoom: RoomFloorOverviewItem) => {
    await TestBed.configureTestingModule({
      imports: [RoomStatusDialog],
      providers: [
        provideRouter([]),
        { provide: MAT_DIALOG_DATA, useValue: { room: dialogRoom } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RoomStatusDialog);
    await fixture.whenStable();
    element = fixture.nativeElement;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await render(room);
  });

  const option = (label: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.room-status-option')).find((button) =>
      button.textContent?.includes(label),
    )!;

  it('shows the room details with the floor label and notes', () => {
    expect(element.textContent).toContain('Room B1-02');
    expect(element.textContent).toContain('B1');
    expect(element.textContent).toContain('basement 1');
    expect(element.textContent).toContain('Dormitory');
    expect(element.textContent).toContain('Near the stairs');
  });

  it('marks the current status as checked', () => {
    expect(option('Available').getAttribute('aria-checked')).toBe('true');
    expect(option('Out of service').getAttribute('aria-checked')).toBe('false');
  });

  it('closes with the chosen status', () => {
    option('Out of service').click();

    expect(dialogRef.close).toHaveBeenCalledWith(RoomStatus.OUT_OF_SERVICE);
  });

  it('ignores choosing the current status', () => {
    option('Available').click();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('shows no booking for a free room', () => {
    expect(element.querySelector('.room-status-dialog-booking')).toBeNull();
    expect(element.textContent).not.toContain('This room has a guest booking today.');
  });

  describe('for a room with a guest booking today', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      await render(occupiedRoom);
    });

    it('shows the current booking with a link to it', () => {
      const booking = element.querySelector('.room-status-dialog-booking')!;
      expect(booking.textContent).toContain('BK-2026-000042');
      expect(booking.textContent).toContain('Asha Rao');
      expect(booking.textContent).toContain('Checked in');
      expect(booking.querySelector('a')?.getAttribute('href')).toContain('guid=booking-1');
    });

    it('warns before the status is changed', () => {
      expect(element.textContent).toContain('This room has a guest booking today.');
    });
  });
});
