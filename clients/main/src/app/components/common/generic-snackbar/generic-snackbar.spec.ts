import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { GenericSnackbar } from './generic-snackbar';

describe('GenericSnackbar', () => {
  const snackbarRef = { dismiss: vi.fn(), dismissWithAction: vi.fn() };

  const render = async (data: Partial<GenericSnackbarConfigData>) => {
    await TestBed.configureTestingModule({
      imports: [GenericSnackbar],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: new GenericSnackbarConfigData(data) },
        { provide: MatSnackBarRef, useValue: snackbarRef },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(GenericSnackbar);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => vi.clearAllMocks());

  it('shows the text without an action button by default', async () => {
    const element = await render({ text: 'Saved.', type: GenericSnackbarType.SUCCESS });

    expect(element.textContent).toContain('Saved.');
    expect(element.querySelector('.snackbar-action-button')).toBeNull();
  });

  it('runs the action and closes when the action button is pressed', async () => {
    const onAction = vi.fn();
    const element = await render({
      text: 'Room 101 is now Out of service.',
      actionLabel: 'Undo',
      onAction,
    });

    const actionButton = element.querySelector<HTMLButtonElement>('.snackbar-action-button')!;
    expect(actionButton.textContent?.trim()).toBe('Undo');
    actionButton.click();

    expect(onAction).toHaveBeenCalled();
    expect(snackbarRef.dismissWithAction).toHaveBeenCalled();
  });
});
