import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Profile } from '../../../services/profile';
import { Room } from '../../../services/room/room';
import { RoomType } from '../../../services/room-type/room-type';
import { UserType } from '../../../types/enums/auth';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { CreateRoom } from './create-room';

describe('CreateRoom', () => {
  let fixture: ComponentFixture<CreateRoom>;
  let element: HTMLElement;
  const roomTypeService = { listOptions: vi.fn() };

  const render = async (role: UserType) => {
    await TestBed.configureTestingModule({
      imports: [CreateRoom],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: {}, queryParamMap: convertToParamMap({}) } },
        },
        { provide: RoomType, useValue: roomTypeService },
        { provide: Room, useValue: { create: vi.fn(), update: vi.fn(), getRoom: vi.fn() } },
        { provide: Profile, useValue: { userProfile: signal(new UserProfileModel({ role })) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CreateRoom);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  const input = (name: string) =>
    element.querySelector<HTMLInputElement>(`input[formcontrolname="${name}"]`)!;

  const typeInto = async (name: string, value: string) => {
    input(name).value = value;
    input(name).dispatchEvent(new Event('input'));
    input(name).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const errorText = () => element.querySelector('mat-error')?.textContent?.trim();

  beforeEach(() => {
    vi.clearAllMocks();
    roomTypeService.listOptions.mockReturnValue(of([{ guid: 'type-1', name: 'Deluxe double' }]));
  });

  it("loads the member's active organization room types right away", async () => {
    await render(UserType.OWNER);

    expect(roomTypeService.listOptions).toHaveBeenCalledWith(null);
    expect(element.querySelector('app-organization-selection-field')).toBeNull();
  });

  it('asks admins for an organization before loading room types', async () => {
    await render(UserType.ADMIN);

    expect(roomTypeService.listOptions).not.toHaveBeenCalled();
    expect(element.querySelector('app-organization-selection-field')).not.toBeNull();
  });

  it.each([
    ['-5', 'Shown as B5 (basement 5)'],
    ['0', 'Shown as Ground (ground floor)'],
    ['3', 'Shown as 3 (floor 3)'],
  ])('previews floor %s as "%s"', async (floor, preview) => {
    await render(UserType.OWNER);

    await typeInto('floor', floor);

    const hints = Array.from(element.querySelectorAll('mat-hint')).map((hint) => hint.textContent);
    expect(hints.join(' ')).toContain(preview);
  });

  it.each([
    ['501', 'Floor must be between −500 and 500'],
    ['-501', 'Floor must be between −500 and 500'],
    ['1.5', 'Floor must be a whole number'],
  ])('rejects floor %s', async (floor, message) => {
    await render(UserType.OWNER);

    await typeInto('floor', floor);

    expect(errorText()).toBe(message);
  });

  it.each(['A 12', 'A#12'])('rejects room number "%s"', async (roomNumber) => {
    await render(UserType.OWNER);

    await typeInto('roomNumber', roomNumber);

    expect(errorText()).toBe('Use letters, digits, - or / only');
  });

  it.each(['101', 'A-12', 'B2/04', ' 101 '])('accepts room number "%s"', async (roomNumber) => {
    await render(UserType.OWNER);

    await typeInto('roomNumber', roomNumber);

    expect(errorText()).toBeUndefined();
  });
});
