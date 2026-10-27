import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { CreateManager } from './create-manager';
import { Organization } from '../../../services/organization/organization';
import { Profile } from '../../../services/profile';
import { User } from '../../../services/user/user';
import { UserType } from '../../../types/enums/auth';
import { OrganizationListItem } from '../../../types/interfaces/organization';
import { UserProfileDto } from '../../../types/interfaces/users';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';

describe('CreateManager', () => {
  let component: CreateManager;
  let fixture: ComponentFixture<CreateManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateManager],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('organization', () => {
    const userProfile = signal<UserProfileModel | null>(null);
    const activeOrganization = signal({
      guid: 'org-active',
      name: 'Sunrise NGO',
      organizationTypeName: 'Guest house',
      city: 'Pune',
    });
    const organizationService = {
      activeOrganization,
      listAdmin: vi.fn(() => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 20 })),
    };
    let userService: User;

    const createAs = async (role: UserType) => {
      userProfile.set(new UserProfileModel({ guid: 'actor', role, isEmailVerified: true }));
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CreateManager],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Profile, useValue: { userProfile } },
          { provide: Organization, useValue: organizationService },
        ],
      }).compileComponents();

      userService = TestBed.inject(User);
      vi.spyOn(userService, 'createManager').mockReturnValue(of({} as UserProfileDto));
      fixture = TestBed.createComponent(CreateManager);
      component = fixture.componentInstance;
      await fixture.whenStable();

      const form = component['managerForm'];
      form.controls.username.clearAsyncValidators();
      form.patchValue({
        firstName: 'Asha',
        lastName: 'Patil',
        username: 'asha_patil',
        email: 'asha@example.org',
      });
      return form;
    };

    it('links a manager created by an owner to the active organization', async () => {
      const form = await createAs(UserType.OWNER);

      expect(form.valid).toBe(true);
      component['onSubmit']();

      expect(userService.createManager).toHaveBeenCalledWith(
        expect.objectContaining({ organizationGuid: 'org-active' }),
      );
    });

    it('requires an admin to pick the organization', async () => {
      const form = await createAs(UserType.ADMIN);
      const organization = { guid: 'org-picked', name: 'Hope Foundation' } as OrganizationListItem;

      expect(form.controls.organization.hasError('required')).toBe(true);
      form.controls.organization.setValue('Hope');
      expect(form.valid).toBe(false);

      form.controls.organization.setValue(organization);
      expect(form.valid).toBe(true);
      component['onSubmit']();

      expect(userService.createManager).toHaveBeenCalledWith(
        expect.objectContaining({ organizationGuid: 'org-picked' }),
      );
    });
  });
});
