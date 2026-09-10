"use client";

import { FormEvent, useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { api } from "@/lib/api";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { qty } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { st, td } from "@/lib/dataI18n";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
  assignee?: { employee?: { firstName: string; lastName: string } | null } | null;
};
type Equip = { id: string; code: string; name: string; type: string; status: string };
type Dept = { id: string; name: string; _count: { employees: number }; employees: { performance: number }[] };
type Report = { id: string; date: string; summary: string; production: number; incidents: number };

export default function ManagerPage() {
  const locale = useLocale((s) => s.locale);
  const [data, setData] = useState<{ departments: Dept[]; tasks: Task[]; equipment: Equip[]; reports: Report[] } | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const load = () => api.get("/manager/overview").then((r) => setData(r.data));
  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/tasks", { title, priority: "HIGH" });
    setTitle("");
    load();
  }

  async function addReport(e: FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    await api.post("/reports", { summary, production: 9000, incidents: 0 });
    setSummary("");
    load();
  }

  async function cycleTask(task: Task) {
    const order = ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    await api.patch(`/tasks/${task.id}`, { status: next });
    load();
  }

  return (
    <div>
      <Topbar title={t(locale, "manager")} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data?.departments.map((d) => {
            const avg = d.employees.length ? d.employees.reduce((s, e) => s + Number(e.performance), 0) / d.employees.length : 0;
            return (
              <div key={d.id} className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
                <p className="text-xs uppercase tracking-widest text-white/45">{t(locale, "sections")}</p>
                <p className="mt-2 text-lg text-white">{td(locale, d.name)}</p>
                <p className="text-sm text-gold-300">{d._count.employees} {t(locale, "employees")}</p>
                <p className="mt-2 text-xs text-white/50">{t(locale, "performance")}: {avg.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="mb-4 text-gold-300">{t(locale, "tasks")}</h3>
            <form onSubmit={addTask} className="mb-4 flex gap-2">
              <input className="flex-1 rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(locale, "add")} />
              <button className="btn-gold">{t(locale, "add")}</button>
            </form>
            <div className="space-y-2">
              {data?.tasks.map((task) => (
                <button key={task.id} onClick={() => cycleTask(task)} className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-left">
                  <div>
                    <p className="text-sm text-white">{td(locale, task.title)}</p>
                    <p className="text-xs text-white/45">{task.assignee?.employee ? `${task.assignee.employee.firstName} ${task.assignee.employee.lastName}` : t(locale, "unassigned")}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-gold-300">
                    {st(locale, task.priority)} · {st(locale, task.status)}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="mb-4 text-gold-300">{t(locale, "dailyReports")}</h3>
            <form onSubmit={addReport} className="mb-4 flex gap-2">
              <input className="flex-1 rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={summary} onChange={(e) => setSummary(e.target.value)} />
              <button className="btn-gold">{t(locale, "save")}</button>
            </form>
            <div className="space-y-3">
              {data?.reports.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-white/40">{formatDate(r.date, locale)} · {qty(Number(r.production))} · {r.incidents} {t(locale, "incidents")}</p>
                  <p className="mt-1 text-sm text-white/80">{td(locale, r.summary)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <h3 className="mb-4 text-gold-300">{t(locale, "equipment")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/45">
                <tr>
                  <th className="pb-2">{t(locale, "code")}</th>
                  <th>{t(locale, "name")}</th>
                  <th>{t(locale, "type")}</th>
                  <th>{t(locale, "status")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.equipment.map((e) => (
                  <tr key={e.id} className="border-t border-white/5">
                    <td className="py-2 text-gold-300">{e.code}</td>
                    <td>{td(locale, e.name)}</td>
                    <td className="text-white/60">{td(locale, e.type)}</td>
                    <td>
                      <span className={e.status === "OPERATIONAL" ? "text-teal-400" : e.status === "DOWN" ? "text-rose-400" : "text-amber-300"}>{st(locale, e.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
