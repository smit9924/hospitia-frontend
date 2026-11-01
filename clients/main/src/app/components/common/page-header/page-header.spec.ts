import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

@Component({
  imports: [PageHeader],
  template: `
    <app-page-header
      titleText="Room types"
      description="Kinds of rooms you offer."
      [backButton]="true"
    >
      <button pageHeaderActions type="button">Create room type</button>
    </app-page-header>
  `,
})
class PageHeaderHost {}

describe('PageHeader', () => {
  const location = { back: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [PageHeaderHost],
      providers: [{ provide: Location, useValue: location }],
    }).compileComponents();
  });

  const render = async () => {
    const fixture = TestBed.createComponent(PageHeaderHost);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('renders the title as the page heading with its description', async () => {
    const element = await render();

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Room types');
    expect(element.querySelector('.page-header-description')?.textContent?.trim()).toBe(
      'Kinds of rooms you offer.',
    );
  });

  it('projects the page actions', async () => {
    const element = await render();

    expect(element.querySelector('.page-header-actions button')?.textContent).toContain(
      'Create room type',
    );
  });

  it('goes back when the back button is pressed', async () => {
    const element = await render();

    element.querySelector<HTMLButtonElement>('button[aria-label="Back"]')!.click();

    expect(location.back).toHaveBeenCalled();
  });
});
