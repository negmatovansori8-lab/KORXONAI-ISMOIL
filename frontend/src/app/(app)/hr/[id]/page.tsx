"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { st, td } from "@/lib/dataI18n";

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale((s) => s.locale);
  const [emp, setEmp] = useState<any>(null);

  useEffect(() => {
    api.get(`/employees/${id}`).then((r) => setEmp(r.data));
  }, [id]);

  if (!emp) return null;

  return (
    <div>
      <Topbar title={`${emp.firstName} ${emp.lastName}`} />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-6 lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-500/20 font-display text-2xl text-gold-300">
            {emp.firstName[0]}{emp.lastName[0]}
          </div>
          <h2 className="mt-4 text-2xl">{emp.firstName} {emp.lastName}</h2>
          <p className="text-gold-300">{td(locale, emp.position)}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/45">{t(locale, "department")}</dt><dd>{td(locale, emp.department.name)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">{t(locale, "baseSalary")}</dt><dd>{money(Number(emp.baseSalary))}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">{t(locale, "experience")}</dt><dd>{emp.experienceYrs} {t(locale, "years")}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">{t(locale, "status")}</dt><dd className="text-teal-400">{st(locale, emp.status)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">{t(locale, "performance")}</dt><dd>{Number(emp.performance)}%</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-6 lg:col-span-2">
          <h3 className="text-gold-300">{t(locale, "netSalary")}</h3>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th>{t(locale, "period")}</th>
                <th>{t(locale, "bonus")}</th>
                <th>{t(locale, "reward")}</th>
                <th>{t(locale, "deduction")}</th>
                <th>{t(locale, "netSalary")}</th>
              </tr>
            </thead>
            <tbody>
              {emp.payrolls?.map((p: any) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="py-2">{p.period}</td>
                  <td>{money(Number(p.bonus))}</td>
                  <td>{money(Number(p.reward))}</td>
                  <td>{money(Number(p.deduction))}</td>
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
