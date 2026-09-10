export type Role = "CEO" | "MANAGER" | "ADMIN" | "EMPLOYEE";

export const Role = {
  CEO: "CEO",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
} as const satisfies Record<string, Role>;
