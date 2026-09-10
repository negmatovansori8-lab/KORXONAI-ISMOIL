import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "CEO" | "MANAGER" | "ADMIN" | "EMPLOYEE";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
    department?: { name: string };
  } | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        localStorage.setItem("oems_token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("oems_token");
        set({ token: null, user: null });
      },
    }),
    { name: "oems-auth" }
  )
);
