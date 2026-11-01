import { Pipe, PipeTransform } from '@angular/core';

/** `short` gives the listing label ("B5"); `description` explains it ("basement 5"). */
export type FloorLabelStyle = 'short' | 'description';

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
 * "basement 5". Empty or non-integer values render as an empty string.
 */
@Pipe({
  name: 'floorLabel',
})
export class FloorLabelPipe implements PipeTransform {
  transform(floor: number | null | undefined, style: FloorLabelStyle = 'short'): string {
    if (floor === null || floor === undefined || !Number.isInteger(floor)) {
      return '';
    }
    return style === 'description' ? describeFloor(floor) : formatFloorLabel(floor);
  }
}
