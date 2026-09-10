import type { Role } from "@/store/auth";

export const MONEY_ROLES: Role[] = ["CEO", "ADMIN"];
export const ADMIN_ROLES: Role[] = ["CEO", "ADMIN"];

const routes: Record<string, Role[]> = {
  "/dashboard": ["CEO", "ADMIN"],
  "/finance": ["CEO", "ADMIN"],
  "/admin": ["CEO", "ADMIN"],
  "/manager": ["CEO", "MANAGER", "ADMIN"],
  "/hr": ["CEO", "MANAGER", "ADMIN"],
  "/production": ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"],
  "/warehouse": ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"],
  "/settings": ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"],
  "/profile": ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"],
};

export function canAccess(role: Role | undefined, pathname: string) {
  if (!role) return false;
  const key = Object.keys(routes).find((r) => pathname === r || pathname.startsWith(r + "/"));
  if (!key) return true;
  return routes[key].includes(role);
}

export function homeFor(role: Role | undefined) {
  if (role === "ADMIN" || role === "CEO") return "/dashboard";
  if (role === "MANAGER") return "/manager";
  return "/profile";
}

export function seesMoney(role: Role | undefined) {
  return !!role && MONEY_ROLES.includes(role);
}
