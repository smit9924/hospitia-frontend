import { Pipe, PipeTransform } from '@angular/core';

/**
 * `short` gives the listing label ("B5"); `description` explains it ("basement 5");
 * `name` names it on its own, e.g. next to a room number ("Floor 2", "Ground", "B1").
 */
export type FloorLabelStyle = 'short' | 'description' | 'name';

/**
 * Short floor label used across the app: 0 is "Ground", a negative floor is
 * a basement shown as "B" plus its depth (-5 is "B5"), and a positive floor
 * is its number ("5").
 */
export function formatFloorLabel(floor: number): string {
  if (floor === 0) {
    return $localize`Ground`;
  }
  return floor < 0 ? $localize`B${Math.abs(floor)}` : String(floor);
}

/** A floor's name where a bare number would be unclear: "Floor 2", "Ground" or "B1". */
export function nameFloor(floor: number): string {
  return floor > 0 ? $localize`Floor ${floor}` : formatFloorLabel(floor);
}

/** Plain-language meaning of a floor, e.g. "basement 5", "ground floor" or "floor 5". */
export function describeFloor(floor: number): string {
  if (floor === 0) {
    return $localize`ground floor`;
  }
  return floor < 0 ? $localize`basement ${Math.abs(floor)}` : $localize`floor ${floor}`;
}

/**
 * Formats a room floor for display.
 *
 * Usage: `{{ room.floor | floorLabel }}` → "B5"; `{{ floor | floorLabel: 'description' }}` →
 * "basement 5"; `{{ floor | floorLabel: 'name' }}` → "Floor 2". Empty or non-integer values
 * render as an empty string.
 */
@Pipe({
  name: 'floorLabel',
})
export class FloorLabelPipe implements PipeTransform {
  transform(floor: number | null | undefined, style: FloorLabelStyle = 'short'): string {
    if (floor === null || floor === undefined || !Number.isInteger(floor)) {
      return '';
    }
    switch (style) {
      case 'description':
        return describeFloor(floor);
      case 'name':
        return nameFloor(floor);
      default:
        return formatFloorLabel(floor);
    }
  }
}
