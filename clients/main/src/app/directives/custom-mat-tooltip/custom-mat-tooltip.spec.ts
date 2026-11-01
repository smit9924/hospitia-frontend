import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { CustomMatTooltip } from './custom-mat-tooltip';

@Component({
  imports: [CustomMatTooltip],
  template: `<span customMatTooltip="Sunrise Guest House" [tooltipOnlyOnEllipsis]="true"
    >Sunrise</span
  >`,
})
class TooltipHost {
  readonly tooltip = viewChild.required(CustomMatTooltip);
}

describe('CustomMatTooltip', () => {
  const setup = async (textOverflows: boolean) => {
    await TestBed.configureTestingModule({ imports: [TooltipHost] }).compileComponents();
    const fixture = TestBed.createComponent(TooltipHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('span') as HTMLElement;
    // jsdom has no layout; simulate text that is (or is not) cut off.
    Object.defineProperty(host, 'clientWidth', { configurable: true, value: 100 });
    Object.defineProperty(host, 'scrollWidth', {
      configurable: true,
      value: textOverflows ? 180 : 100,
    });
    return { fixture, tooltip: fixture.componentInstance.tooltip() };
  };

  it('uses its input as the tooltip message', async () => {
    const { tooltip } = await setup(true);

    expect(tooltip.message).toBe('Sunrise Guest House');
  });

  it('shows the tooltip when the text is cut off', async () => {
    const { tooltip } = await setup(true);
    const materialShow = vi.spyOn(MatTooltip.prototype, 'show');

    tooltip.show(0);

    expect(materialShow).toHaveBeenCalled();
    materialShow.mockRestore();
  });

  it('does not show the tooltip when the text fits', async () => {
    const { tooltip } = await setup(false);
    const materialShow = vi.spyOn(MatTooltip.prototype, 'show');

    tooltip.show(0);

    expect(materialShow).not.toHaveBeenCalled();
    materialShow.mockRestore();
  });

  it('never toggles the disabled state, so layout changes cannot cause NG0100', async () => {
    const { tooltip } = await setup(false);

    tooltip.show(0);
    window.dispatchEvent(new Event('resize'));

    expect(tooltip.disabled).toBe(false);
  });
});
