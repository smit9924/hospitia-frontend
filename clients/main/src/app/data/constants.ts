/** Application-wide constant values, grouped by purpose. */
export const appConstants = {
  httpHeaders: {
    // Active organization GUID sent to the booking service; validated server-side.
    activeOrganizationGuid: 'X-Active-Organization-Guid',
  },
  // ISO 4217 code preselected wherever a price is entered (e.g. room type cost per night).
  defaultCurrencyCode: 'INR',
} as const;
