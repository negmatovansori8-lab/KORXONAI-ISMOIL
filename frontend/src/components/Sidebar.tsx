"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Shield,
  Users,
  Wallet,
  Droplets,
  Warehouse,
  LogOut,
  UserCircle2,
  Settings,
  X,
} from "lucide-react";
import { Role, useAuth } from "@/store/auth";
import { useLocale } from "@/store/locale";
import { roleLabel, t } from "@/lib/i18n";
import { useUi } from "@/store/ui";
import { LanguageSwitch } from "@/components/LanguageSwitch";

const items: { href: string; key: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard, roles: ["CEO", "ADMIN"] },
  { href: "/manager", key: "manager", icon: Briefcase, roles: ["CEO", "MANAGER", "ADMIN"] },
  { href: "/admin", key: "admin", icon: Shield, roles: ["ADMIN", "CEO"] },
  { href: "/hr", key: "hr", icon: Users, roles: ["CEO", "MANAGER", "ADMIN"] },
  { href: "/finance", key: "finance", icon: Wallet, roles: ["CEO", "ADMIN"] },
  { href: "/production", key: "production", icon: Droplets, roles: ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"] },
  { href: "/warehouse", key: "warehouse", icon: Warehouse, roles: ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"] },
  { href: "/settings", key: "settings", icon: Settings, roles: ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"] },
  { href: "/profile", key: "profile", icon: UserCircle2, roles: ["CEO", "MANAGER", "ADMIN", "EMPLOYEE"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const locale = useLocale((s) => s.locale);
  const role = user?.role ?? "EMPLOYEE";
  const menu = useUi((s) => s.menu);
  const setMenu = useUi((s) => s.setMenu);

  const displayName = user?.employee
    ? `${user.employee.firstName} ${user.employee.lastName}`
    : user?.email;

  const nav = (
    <>
      <div className="flex items-center justify-between gap-3 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-700 shadow-glow">
            <Droplets className="h-6 w-6 text-oil-950" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-gold-400">{t(locale, "shortName")}</p>
            <p className="text-sm leading-tight text-white/80">{t(locale, "appName")}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-gold-300/90">{t(locale, "slogan")}</p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-white/60 md:hidden" onClick={() => setMenu(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-4 pb-3">
        <LanguageSwitch compact />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items
          .filter((i) => i.roles.includes(role))
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gold-500/15 text-gold-300 shadow-glow"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(locale, item.key)}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-white">{displayName}</p>
        <p className="text-xs tracking-wide text-gold-400">{roleLabel(locale, user?.role)}</p>
        <button
          onClick={() => {
            logout();
            setMenu(false);
            router.push("/login");
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {t(locale, "logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden h-full w-[260px] flex-col border-r border-white/10 bg-oil-900/90 backdrop-blur-xl md:flex">
        <div className="h-1.5 w-full bg-gradient-to-r from-tajik-red via-gold-400 to-tajik-green" />
        {nav}
      </aside>
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-black/60" onClick={() => setMenu(false)} />
          <aside className="relative flex h-full w-[86%] max-w-[300px] flex-col border-r border-white/10 bg-oil-900 shadow-card">
            <div className="h-1.5 w-full bg-gradient-to-r from-tajik-red via-gold-400 to-tajik-green" />
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
