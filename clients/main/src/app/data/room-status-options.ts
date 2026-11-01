import { RoomStatus } from '../types/enums/room';

/** How a room status is labeled and drawn. */
export interface RoomStatusOption {
  value: RoomStatus;
  label: string;
  /** Global status chip modifier (see styles/_utils.scss). */
  chipClass: string;
  /** Registered svg icon shown with the status (see data/icon-list.ts). */
  icon: string;
  /** Floor chart tile modifier (see styles/_page-patterns.scss). */
  tileClass: string;
}

/** Room statuses in the order offered in the room form and the floor chart. */
export const roomStatusOptions: readonly RoomStatusOption[] = [
  {
    value: RoomStatus.AVAILABLE,
    label: $localize`Available`,
    chipClass: 'status-chip--active',
    icon: 'checkCircle',
    tileClass: 'room-tile--available',
  },
  {
    value: RoomStatus.UNDER_MAINTENANCE,
    label: $localize`Under maintenance`,
    chipClass: 'status-chip--warning',
    icon: 'build',
    tileClass: 'room-tile--under-maintenance',
  },
  {
    value: RoomStatus.OUT_OF_SERVICE,
    label: $localize`Out of service`,
    chipClass: 'status-chip--inactive',
    icon: 'block',
    tileClass: 'room-tile--out-of-service',
  },
];

/** Looks up the label, icon and classes of a status. */
export function getRoomStatusOption(status: RoomStatus): RoomStatusOption {
  return roomStatusOptions.find((option) => option.value === status) ?? roomStatusOptions[0];
}
