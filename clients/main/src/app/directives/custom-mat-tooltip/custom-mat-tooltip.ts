import { Directive, ElementRef, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { fromEvent, Subscription, tap, throttleTime } from 'rxjs';

@Directive({
  selector: '[customMatTooltip]',
})
export class CustomMatTooltip extends MatTooltip {
  customMatTooltip = input<string | number | null | undefined>(null);
  tooltipOnlyOnEllipsis = input<boolean>(false);
  private elementRef = inject(ElementRef);
  private resizeEvent: Subscription | null = null;

  constructor() {
    super();
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    this.message = this.customMatTooltip();
    this.setTooltipVisibility();
    this.attachResizeObserver();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeEvent?.unsubscribe();
  }

  private attachResizeObserver(): void {
    this.resizeEvent = fromEvent(window, 'resize')
      .pipe(
        throttleTime(300),
        tap(() => this.setTooltipVisibility()),
      )
      .subscribe();
  }

  private setTooltipVisibility(): void {
    if (this.tooltipOnlyOnEllipsis() && !this.isEllipsisVisible()) {
      this.disabled = true;
    } else {
      this.disabled = false;
    }
  }

  private isEllipsisVisible() {
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
