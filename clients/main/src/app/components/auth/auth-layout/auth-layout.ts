import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { getRoomStatusOption } from '../../../data/room-status-options';
import { RoomStatus } from '../../../types/enums/room';

/** One selling point shown on the brand panel. */
interface AuthBrandBenefit {
  icon: string;
  text: string;
}

const { AVAILABLE, UNDER_MAINTENANCE, OUT_OF_SERVICE } = RoomStatus;

/**
 * Decorative building on the brand panel: a few floors of room tiles colored
 * like the dashboard's "Rooms by floor" chart (top floor first).
 */
const ILLUSTRATION_FLOORS: RoomStatus[][] = [
  [AVAILABLE, AVAILABLE, UNDER_MAINTENANCE, AVAILABLE],
  [AVAILABLE, OUT_OF_SERVICE, AVAILABLE, AVAILABLE],
  [AVAILABLE, AVAILABLE, AVAILABLE, UNDER_MAINTENANCE],
];

/**
 * Branded frame for the sign-in and sign-up pages.
 *
 * Wide screens show a split screen: a brand panel (logo, value statement,
 * product illustration and benefits) beside the projected form. Tablets and
 * phones hide the panel and show a compact logo above the form instead.
 * Usage: `<app-auth-layout>` around the page's heading and form.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  /** Status color classes per illustration floor (`room-status--*`). */
  protected readonly illustrationFloors = ILLUSTRATION_FLOORS.map((floor) =>
    floor.map((status) => getRoomStatusOption(status).statusClass),
  );

  protected readonly benefits: AuthBrandBenefit[] = [
    { icon: 'meetingRoom', text: $localize`See every room's status, floor by floor` },
    { icon: 'groups', text: $localize`Work together with owners and managers` },
    { icon: 'privacyTip', text: $localize`Secure, accessible and simple to use` },
  ];
}
