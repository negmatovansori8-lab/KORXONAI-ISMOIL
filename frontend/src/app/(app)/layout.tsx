"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PdfModal } from "@/components/PdfModal";
import { useAuth } from "@/store/auth";
import { canAccess, homeFor } from "@/lib/access";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuth((s) => s.token);
  const role = useAuth((s) => s.user?.role);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    if (useAuth.persist.hasHydrated()) finish();
    const unsub = useAuth.persist.onFinishHydration(finish);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem("oems_token") : null;
    if (!token && !stored) {
      window.location.replace("/login");
      return;
    }
    if (role && !canAccess(role, pathname)) {
      router.replace(homeFor(role));
    }
  }, [ready, token, role, pathname, router]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-oil-950" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
      <PdfModal />
    </div>
  );
}
