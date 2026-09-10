"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { st, td } from "@/lib/dataI18n";

type Emp = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  position: string;
  baseSalary: number;
  experienceYrs: number;
  performance: number;
  status: string;
  department: { name: string };
};

type Pay = {
  id: string;
  period: string;
  baseSalary: number;
  bonus: number;
  performancePercent: number;
  reward: number;
  deduction: number;
  netSalary: number;
  employee: Emp;
};

export default function HrPage() {
  const locale = useLocale((s) => s.locale);
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [payrolls, setPayrolls] = useState<Pay[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    code: "",
    firstName: "",
    lastName: "",
    position: "",
    departmentId: "",
    baseSalary: 5000,
    experienceYrs: 1,
    hireDate: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    const [e, p, d] = await Promise.all([api.get("/employees"), api.get("/payroll"), api.get("/departments")]);
    setEmployees(e.data);
    setPayrolls(p.data);
    setDepartments(d.data);
    if (!form.departmentId && d.data[0]) setForm((f) => ({ ...f, departmentId: d.data[0].id }));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post("/employees", { ...form, baseSalary: Number(form.baseSalary), experienceYrs: Number(form.experienceYrs) });
    load();
  }

  async function runPayroll() {
    await api.post("/payroll/run", {});
    load();
  }

  return (
    <div>
      <Topbar title={t(locale, "hr")} />
      <div className="space-y-6 p-6">
        <form onSubmit={add} className="grid gap-3 rounded-2xl border border-white/10 bg-oil-800/70 p-5 md:grid-cols-4">
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder="EMP-013" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder={t(locale, "name")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder={t(locale, "lastName")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder={t(locale, "position")} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{td(locale, d.name)}</option>
            ))}
          </select>
          <input type="number" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })} />
          <button className="btn-gold md:col-span-2">{t(locale, "add")}</button>
        </form>
        <div className="flex justify-end">
          <button onClick={runPayroll} className="btn-gold">{t(locale, "runPayroll")}</button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <table className="w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-2">{t(locale, "code")}</th>
                <th>{t(locale, "name")}</th>
                <th>{t(locale, "position")}</th>
                <th>{t(locale, "department")}</th>
                <th>{t(locale, "baseSalary")}</th>
                <th>{t(locale, "experience")}</th>
                <th>{t(locale, "performance")}</th>
                <th>{t(locale, "status")}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-t border-white/5">
                  <td className="py-3 text-gold-300">
                    <Link href={`/hr/${e.id}`}>{e.code}</Link>
                  </td>
                  <td>{e.firstName} {e.lastName}</td>
                  <td>{td(locale, e.position)}</td>
                  <td>{td(locale, e.department.name)}</td>
                  <td>{money(Number(e.baseSalary))}</td>
                  <td>{e.experienceYrs} {t(locale, "years")}</td>
                  <td>{Number(e.performance)}%</td>
                  <td className="text-teal-400">{st(locale, e.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <h3 className="mb-4 text-gold-300">{t(locale, "netSalary")}</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-2">{t(locale, "name")}</th>
                <th>{t(locale, "baseSalary")}</th>
                <th>{t(locale, "bonus")}</th>
                <th>{t(locale, "performance")}</th>
                <th>{t(locale, "reward")}</th>
                <th>{t(locale, "deduction")}</th>
                <th>{t(locale, "netSalary")}</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="py-2">{p.employee.firstName} {p.employee.lastName}</td>
                  <td>{money(Number(p.baseSalary))}</td>
                  <td>{money(Number(p.bonus))}</td>
                  <td>{Number(p.performancePercent)}%</td>
                  <td>{money(Number(p.reward))}</td>
                  <td className="text-rose-400">{money(Number(p.deduction))}</td>
                  <td className="text-teal-400">{money(Number(p.netSalary))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
