import { inject, Injectable } from '@angular/core';
import { ChangePasswordReq, UsernameAvailabilityReq } from '../../types/interfaces/users';
import { Observable } from 'rxjs';
import { HttpClient, HttpContext } from '@angular/common/http';
import { SkipLoading } from '../../interceptors/loader/loader-interceptor';
import { apiRoutes } from '../../data/api-routes';

@Injectable({
  providedIn: 'root',
})
export class User {
  private http = inject(HttpClient);

  /**
   * Checks whether the provided username is available for registration or profile update.
   *
   * @param usernameAvailabilityRequest Request payload containing the username to validate.
   * @returns API reponse indicating whether the username is available.
   */

  checkUsernameAvailability(
    usernameAvailabilityRequest: UsernameAvailabilityReq,
  ): Observable<null> {
    const context = new HttpContext();
    context.set(SkipLoading, true);

    return this.http.get<null>(apiRoutes.users.usernameAvailability, {
      params: { ...usernameAvailabilityRequest },
      context: context,
    });
  }

  /**
   * Update user password.
   *
   * @param changePasswordReq
   * @returns API response indicating success or failure of the password change operation.
   */
  changePassword(changePasswordReq: ChangePasswordReq): Observable<null> {
    return this.http.put<null>(apiRoutes.users.changePassword, changePasswordReq);
  }
}
