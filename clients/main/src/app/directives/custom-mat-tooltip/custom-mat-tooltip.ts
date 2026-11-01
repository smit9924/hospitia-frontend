import { Directive, ElementRef, inject, input, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Material tooltip that, with `tooltipOnlyOnEllipsis`, only appears when the host's text is
 * cut off (e.g. a long name clamped with an ellipsis).
 *
 * The overflow is measured when the tooltip is about to show, not during change detection,
 * so layout changes (sidebar collapse, window resize) can never change a bound value between
 * Angular's check passes (NG0100).
 */
@Directive({
  selector: '[customMatTooltip]',
})
export class CustomMatTooltip extends MatTooltip implements OnInit {
  customMatTooltip = input<string | number | null | undefined>(null);
  tooltipOnlyOnEllipsis = input<boolean>(false);
  private elementRef = inject(ElementRef);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.message = this.customMatTooltip();
  }

  /** Shows the tooltip, unless it is ellipsis-only and the text currently fits. */
  override show(delay?: number, origin?: { x: number; y: number }): void {
    if (this.tooltipOnlyOnEllipsis() && !this.isEllipsisVisible()) {
      return;
    }
    super.show(delay, origin);
  }

  private isEllipsisVisible(): boolean {
    const element = this.elementRef?.nativeElement;

    // 2px tolerance added to fix the tooltip in firefox
    // (getting incorrect scrollHeight by 1px in firefox even if content is not overflowing)
    let tolerance = 2;
    const agent = window.navigator?.userAgent?.toLocaleLowerCase();
    if (agent && agent.indexOf('firefox') > -1) {
      tolerance = 4;
    }

    return (
      element?.scrollWidth > element?.clientWidth ||
      element?.scrollHeight > element?.clientHeight + tolerance
    );
  }
}
