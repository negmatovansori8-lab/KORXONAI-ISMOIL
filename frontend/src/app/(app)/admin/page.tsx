"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Topbar } from "@/components/Topbar";
import { api } from "@/lib/api";
import { useLocale } from "@/store/locale";
import { roleLabel, t } from "@/lib/i18n";

type User = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  employee?: { firstName: string; lastName: string } | null;
};

export default function AdminPage() {
  const locale = useLocale((s) => s.locale);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("ChangeMe@2026");
  const [role, setRole] = useState("EMPLOYEE");
  const [msg, setMsg] = useState("");

  const load = () => api.get("/users").then((r) => setUsers(r.data));
  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function createUser(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/users", { email, password, role });
      setEmail("");
      setMsg(t(locale, "userCreated"));
      load();
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : 0;
      setMsg(status === 409 ? t(locale, "emailTaken") : t(locale, "userCreateFail"));
    }
  }

  async function toggle(u: User) {
    await api.patch(`/users/${u.id}`, { isActive: !u.isActive });
    load();
  }

  async function changeRole(u: User, next: string) {
    await api.patch(`/users/${u.id}`, { role: next });
    load();
  }

  async function remove(u: User) {
    await api.delete(`/users/${u.id}`);
    load();
  }

  async function backup() {
    try {
      const { data } = await api.post("/storage/backup");
      setMsg(t(locale, "backupOk") + ": " + (data.file ?? t(locale, "save")));
    } catch {
      setMsg(t(locale, "backupNeedPg"));
    }
  }

  return (
    <div>
      <Topbar title={t(locale, "admin")} />
      <div className="space-y-6 p-6">
        <form onSubmit={createUser} className="grid gap-3 rounded-2xl border border-white/10 bg-oil-800/70 p-5 md:grid-cols-4">
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" type="email" placeholder="nav@oilenterprise.tj" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder={t(locale, "password")} value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            {["CEO", "MANAGER", "ADMIN", "EMPLOYEE"].map((r) => (
              <option key={r} value={r}>{roleLabel(locale, r)}</option>
            ))}
          </select>
          <button className="btn-gold">{t(locale, "add")}</button>
        </form>
        {msg && <p className="text-sm text-amber-300">{msg}</p>}
        <div className="flex gap-2">
          <button onClick={backup} className="btn-ghost">{t(locale, "backup")}</button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <table className="w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-2">{t(locale, "email")}</th>
                <th>{t(locale, "name")}</th>
                <th>{t(locale, "roles")}</th>
                <th>{t(locale, "status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-3">{u.email}</td>
                  <td>{u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : "—"}</td>
                  <td>
                    <select className="rounded-lg border border-white/10 bg-oil-900 px-2 py-1" value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                      {["CEO", "MANAGER", "ADMIN", "EMPLOYEE"].map((r) => (
                        <option key={r} value={r}>{roleLabel(locale, r)}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => toggle(u)} className={u.isActive ? "text-teal-400" : "text-rose-400"}>
                      {u.isActive ? t(locale, "active") : t(locale, "disabled")}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => remove(u)} className="text-rose-400">{t(locale, "delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
