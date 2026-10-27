import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { localStorageKeys } from '../../data/localstorage-keys';
import { UserType } from '../../types/enums/auth';
import {
  OrganizationMembershipSummary,
  StoredActiveOrganization,
} from '../../types/interfaces/organization';
import { UserProfileModel } from '../../types/models/users/user-profile-model';
import { Auth } from '../auth';
import { Localstorage } from '../localstorage';
import { Profile } from '../profile';
import { Organization } from './organization';

const sunrise: OrganizationMembershipSummary = {
  guid: 'org-sunrise',
  name: 'Sunrise NGO',
  organizationTypeName: 'Guest house',
  city: 'Pune',
};
const hope: OrganizationMembershipSummary = {
  guid: 'org-hope',
  name: 'Hope Foundation',
  organizationTypeName: 'Hostel',
  city: 'Mumbai',
};

describe('Organization (active organization state)', () => {
  let service: Organization;
  let localstorageService: Localstorage;
  const userProfile = signal<UserProfileModel | null>(null);

  const storedValue = () =>
    localstorageService.getItem<StoredActiveOrganization>(localStorageKeys.activeOrganization);

  beforeEach(() => {
    localStorage.clear();
    userProfile.set(new UserProfileModel({ guid: 'user-a', role: UserType.OWNER }));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Profile, useValue: { userProfile } },
        { provide: Auth, useValue: { isLoggedOut: false } },
      ],
    });
    service = TestBed.inject(Organization);
    localstorageService = TestBed.inject(Localstorage);
  });

  it('persists the active organization together with the current user', () => {
    service.setActiveOrganization(sunrise);

    expect(service.activeOrganization()).toEqual(sunrise);
    expect(storedValue()).toEqual({ userGuid: 'user-a', organization: sunrise });
  });

  it('cannot change the active organization once it is set', () => {
    service.setActiveOrganization(sunrise);
    service.setActiveOrganization(hope);

    expect(service.activeOrganization()).toEqual(sunrise);
    expect(storedValue()?.organization).toEqual(sunrise);
  });

  it('restores an active organization stored for the same user', () => {
    localstorageService.setItem(localStorageKeys.activeOrganization, {
      userGuid: 'user-a',
      organization: sunrise,
    });

    service.restoreActiveOrganization();

    expect(service.activeOrganization()).toEqual(sunrise);
  });

  it('discards an active organization stored for a different user', () => {
    localstorageService.setItem(localStorageKeys.activeOrganization, {
      userGuid: 'user-b',
      organization: sunrise,
    });

    service.restoreActiveOrganization();

    expect(service.activeOrganization()).toBeNull();
    expect(storedValue()).toBeNull();
  });

  it('refreshes details only for the current active organization', () => {
    service.setActiveOrganization(sunrise);

    service.refreshActiveOrganization({ ...hope });
    expect(service.activeOrganization()).toEqual(sunrise);

    service.refreshActiveOrganization({ ...sunrise, name: 'Sunrise Trust' });
    expect(service.activeOrganization()?.name).toBe('Sunrise Trust');
    expect(storedValue()?.organization.name).toBe('Sunrise Trust');
  });

  it('clears the active organization from memory and storage', () => {
    service.setActiveOrganization(sunrise);

    service.clearActiveOrganization();

    expect(service.activeOrganization()).toBeNull();
    expect(storedValue()).toBeNull();
  });
});
