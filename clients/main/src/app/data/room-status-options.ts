import { RoomStatus } from '../types/enums/room';

/** How a room status is labeled and which status chip shows it. */
export interface RoomStatusOption {
  value: RoomStatus;
  label: string;
  /** Global status chip modifier (see styles/_utils.scss). */
  chipClass: string;
}

/** Room statuses in the order offered in the room form. */
export const roomStatusOptions: readonly RoomStatusOption[] = [
  { value: RoomStatus.AVAILABLE, label: $localize`Available`, chipClass: 'status-chip--active' },
  {
    value: RoomStatus.UNDER_MAINTENANCE,
    label: $localize`Under maintenance`,
    chipClass: 'status-chip--warning',
  },
  {
    value: RoomStatus.OUT_OF_SERVICE,
    label: $localize`Out of service`,
    chipClass: 'status-chip--inactive',
  },
];

/** Looks up the label and chip class of a status. */
export function getRoomStatusOption(status: RoomStatus): RoomStatusOption {
  return roomStatusOptions.find((option) => option.value === status) ?? roomStatusOptions[0];
}
