import { UserType } from '../enums/auth';
import { SidebarDynamicRoute } from '../enums/navigation';

/** One link in the app sidebar. */
export interface SidebarNavigationLink {
  /** Visible label; also the tooltip when the sidebar is collapsed to icons. */
  label: string;
  /** One-line explanation, shown on dashboard shortcut cards. */
  description: string;
  /** Registered svg icon name (see data/icon-list.ts). */
  icon: string;
  /** Fixed target route; leave empty when `dynamicRoute` is set. */
  route?: string;
  /** Target resolved for the signed-in user at runtime. */
  dynamicRoute?: SidebarDynamicRoute;
  /** Roles that see the link. */
  allowedRoles: readonly UserType[];
  /** The link is highlighted while the current URL starts with one of these paths. */
  activeRoutePrefixes: readonly string[];
}

/** Titled group of sidebar links, e.g. "Property". */
export interface SidebarNavigationGroup {
  label: string;
  links: readonly SidebarNavigationLink[];
}

/** A sidebar link with its route resolved for the signed-in user. */
export interface ResolvedSidebarNavigationLink {
  label: string;
  description: string;
  icon: string;
  route: string;
  /** True while the current page belongs to this link. */
  isActive: boolean;
}

/** A sidebar group reduced to the links the signed-in user may see. */
export interface ResolvedSidebarNavigationGroup {
  label: string;
  links: ResolvedSidebarNavigationLink[];
}
