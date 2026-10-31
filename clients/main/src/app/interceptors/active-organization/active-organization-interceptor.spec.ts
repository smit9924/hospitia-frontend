import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { httpHeaders } from '../../data/constants';
import { Auth } from '../../services/auth';
import { Organization } from '../../services/organization/organization';
import { Profile } from '../../services/profile';
import { Snackbar } from '../../services/snackbar';
import { ErrorCodes } from '../../types/enums/error-codes';
import { OrganizationMembershipSummary } from '../../types/interfaces/organization';
import { activeOrganizationInterceptor } from './active-organization-interceptor';

const sunrise: OrganizationMembershipSummary = {
  guid: 'org-sunrise',
  name: 'Sunrise NGO',
  organizationTypeName: 'Guest house',
  city: 'Pune',
};
const bookingUrl = `${environment.bookingServiceBaseUrl}/organization/active`;
const authUrl = `${environment.authServiceBaseUrl}/users/profile`;

describe('activeOrganizationInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  const activeOrganization = signal<OrganizationMembershipSummary | null>(null);
  const organizationService = {
    activeOrganization: activeOrganization.asReadonly(),
    clearActiveOrganization: vi.fn(() => activeOrganization.set(null)),
  };
  const authService = { logout: vi.fn() };
  const profileService = { redirectToDefaultHome: vi.fn() };
  const snackbarService = { open: vi.fn() };

  const errorBody = (errorCode: ErrorCodes) => ({ metadata: null, message: 'x', errorCode });

  beforeEach(() => {
    vi.clearAllMocks();
    activeOrganization.set(sunrise);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([activeOrganizationInterceptor])),
        provideHttpClientTesting(),
        { provide: Organization, useValue: organizationService },
        { provide: Auth, useValue: authService },
        { provide: Profile, useValue: profileService },
        { provide: Snackbar, useValue: snackbarService },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('sends the active organization to the booking service', () => {
    http.get(bookingUrl).subscribe();

    const req = httpTesting.expectOne(bookingUrl);
    expect(req.request.headers.get(httpHeaders.activeOrganizationGuid)).toBe(sunrise.guid);
    req.flush({});
  });

  it('does not send the active organization to other services', () => {
    http.get(authUrl).subscribe();

    const req = httpTesting.expectOne(authUrl);
    expect(req.request.headers.has(httpHeaders.activeOrganizationGuid)).toBe(false);
    req.flush({});
  });

  it('sends no header when no organization is active', () => {
    activeOrganization.set(null);
    http.get(bookingUrl).subscribe();

    const req = httpTesting.expectOne(bookingUrl);
    expect(req.request.headers.has(httpHeaders.activeOrganizationGuid)).toBe(false);
    req.flush({});
  });

  it('logs the user out once when the active organization is rejected', () => {
    const results = { next: vi.fn(), error: vi.fn(), complete: vi.fn() };
    http.get(bookingUrl).subscribe(results);
    http.get(bookingUrl).subscribe();

    for (const req of httpTesting.match(bookingUrl)) {
      req.flush(errorBody(ErrorCodes.ACTIVE_ORGANIZATION_INVALID), {
        status: 403,
        statusText: 'Forbidden',
      });
    }

    expect(organizationService.clearActiveOrganization).toHaveBeenCalledTimes(1);
    expect(snackbarService.open).toHaveBeenCalledTimes(1);
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(results.error).not.toHaveBeenCalled();
    expect(results.next).not.toHaveBeenCalled();
    expect(results.complete).toHaveBeenCalled();
  });

  it('resolves the organization again when the backend requires one', () => {
    const results = { error: vi.fn(), complete: vi.fn() };
    http.get(bookingUrl).subscribe(results);

    httpTesting.expectOne(bookingUrl).flush(errorBody(ErrorCodes.ACTIVE_ORGANIZATION_REQUIRED), {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(organizationService.clearActiveOrganization).toHaveBeenCalled();
    expect(profileService.redirectToDefaultHome).toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(results.error).not.toHaveBeenCalled();
    expect(results.complete).toHaveBeenCalled();
  });

  it('passes other errors through', () => {
    const error = vi.fn();
    http.get(bookingUrl).subscribe({ error });

    httpTesting.expectOne(bookingUrl).flush(errorBody(ErrorCodes.ORGANIZATION_NOT_FOUND), {
      status: 404,
      statusText: 'Not Found',
    });

    expect(error).toHaveBeenCalled();
    expect(organizationService.clearActiveOrganization).not.toHaveBeenCalled();
  });
});
