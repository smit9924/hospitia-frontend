// Application-wide constant values.

export const httpHeaders = {
  // Active organization GUID sent to the booking service; validated server-side.
  activeOrganizationGuid: 'X-Active-Organization-Guid',
} as const;

/** ISO 4217 code preselected wherever a price is entered (e.g. room type cost per night). */
export const DEFAULT_CURRENCY_CODE = 'INR';
