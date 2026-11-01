import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
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
};

describe('RoomStatusDialog', () => {
  const dialogRef = { close: vi.fn() };
  let element: HTMLElement;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RoomStatusDialog],
      providers: [
        provideRouter([]),
        { provide: MAT_DIALOG_DATA, useValue: { room } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RoomStatusDialog);
    await fixture.whenStable();
    element = fixture.nativeElement;
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
});
