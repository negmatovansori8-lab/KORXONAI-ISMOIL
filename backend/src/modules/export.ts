import fs from "fs";
import path from "path";
import { Router } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Role } from "../types/roles";
import { authenticate, authorize } from "../middleware/auth";
import { buildCeoDashboard } from "./dashboard";
import { prisma } from "../lib/prisma";
import { num } from "../lib/period";
import { COMPANY } from "../config/company";

export const exportRouter = Router();
exportRouter.use(authenticate, authorize(Role.CEO, Role.ADMIN));

type Lang = "tg" | "ru" | "en";
type Period = "daily" | "monthly" | "yearly";

const KPI: Record<Lang, Record<string, string>> = {
  tg: {
    revenue: "Даромади умумӣ",
    expenses: "Хароҷоти умумӣ",
    profit: "Фоидаи холис",
    losses: "Зарарҳо",
    investment: "Сармоягузорӣ",
    loans: "Қарзҳо",
    employees: "Кормандон",
    production: "Истеҳсолот (баррел)",
  },
  ru: {
    revenue: "Выручка",
    expenses: "Расходы",
    profit: "Чистая прибыль",
    losses: "Убытки",
    investment: "Инвестиции",
    loans: "Кредиты",
    employees: "Сотрудники",
    production: "Добыча (баррель)",
  },
  en: {
    revenue: "Total revenue",
    expenses: "Total expenses",
    profit: "Net profit",
    losses: "Losses",
    investment: "Investment",
    loans: "Loans",
    employees: "Employees",
    production: "Production (bbl)",
  },
};

const L: Record<Lang, Record<string, string>> = {
  tg: {
    title: "Ҳисоботи раис",
    chairman: "Раис",
    period: "Давра",
    date: "Сана",
    city: "Шаҳр",
    daily: "Рӯзона",
    monthly: "Моҳона",
    yearly: "Солона",
    kpis: "Нишондиҳандаҳои асосӣ",
    finance: "Ҳисобкунии молия",
    formula: "Фоида = Даромад − Хароҷот",
    income: "Даромад",
    expense: "Хароҷот",
    oilSales: "Фурӯши нефт",
    services: "Хизматрасонӣ",
    otherIncome: "Дигар даромадҳо",
    salary: "Маош",
    equipment: "Таҷҳизот",
    transport: "Нақлиёт",
    tax: "Андоз",
    otherExpense: "Хароҷоти дигар",
    net: "Натиҷаи соф",
    production: "Истеҳсолот нисбат ба нақша",
    actual: "Воқеӣ",
    planned: "Нақша",
    attainment: "Иҷрои нақша",
    series: "Силсилаи вақт",
    staff: "Кормандон",
    investLoans: "Сармоягузорӣ ва қарзҳо",
    code: "Рамз",
    name: "Ном",
    position: "Вазифа",
    dept: "Бахш",
    wage: "Маош",
    perf: "Иҷро %",
    status: "Статус",
    amount: "Маблағ",
    remaining: "Боқимонда",
    lender: "Қарздиҳанда",
    signed: "Имзо",
    footer: "Ҳуҷҷати расмии корхона · маҳрамона",
    indicator: "Нишондиҳанда",
    value: "Қимат",
    change: "Тағйир %",
    bucket: "Давра",
    sales: "Фурӯш",
  },
  ru: {
    title: "Отчёт председателя",
    chairman: "Председатель",
    period: "Период",
    date: "Дата",
    city: "Город",
    daily: "День",
    monthly: "Месяц",
    yearly: "Год",
    kpis: "Ключевые показатели",
    finance: "Финансовый расчёт",
    formula: "Прибыль = Доход − Расход",
    income: "Доход",
    expense: "Расход",
    oilSales: "Продажа нефти",
    services: "Услуги",
    otherIncome: "Прочие доходы",
    salary: "Зарплата",
    equipment: "Оборудование",
    transport: "Транспорт",
    tax: "Налоги",
    otherExpense: "Прочие расходы",
    net: "Чистый результат",
    production: "Добыча к плану",
    actual: "Факт",
    planned: "План",
    attainment: "Выполнение",
    series: "Динамика",
    staff: "Сотрудники",
    investLoans: "Инвестиции и кредиты",
    code: "Код",
    name: "Имя",
    position: "Должность",
    dept: "Отдел",
    wage: "Оклад",
    perf: "Вып. %",
    status: "Статус",
    amount: "Сумма",
    remaining: "Остаток",
    lender: "Кредитор",
    signed: "Подпись",
    footer: "Официальный документ предприятия · конфиденциально",
    indicator: "Показатель",
    value: "Значение",
    change: "Изм. %",
    bucket: "Период",
    sales: "Продажи",
  },
  en: {
    title: "Chairman report",
    chairman: "Chairman",
    period: "Period",
    date: "Date",
    city: "City",
    daily: "Daily",
    monthly: "Monthly",
    yearly: "Yearly",
    kpis: "Key indicators",
    finance: "Financial calculation",
    formula: "Profit = Revenue − Expenses",
    income: "Income",
    expense: "Expense",
    oilSales: "Oil sales",
    services: "Services",
    otherIncome: "Other income",
    salary: "Payroll",
    equipment: "Equipment",
    transport: "Transport",
    tax: "Tax",
    otherExpense: "Other expenses",
    net: "Net result",
    production: "Production vs plan",
    actual: "Actual",
    planned: "Plan",
    attainment: "Attainment",
    series: "Time series",
    staff: "Workforce",
    investLoans: "Investments and loans",
    code: "Code",
    name: "Name",
    position: "Position",
    dept: "Department",
    wage: "Salary",
    perf: "Perf. %",
    status: "Status",
    amount: "Amount",
    remaining: "Remaining",
    lender: "Lender",
    signed: "Signature",
    footer: "Official company document · confidential",
    indicator: "Indicator",
    value: "Value",
    change: "Change %",
    bucket: "Period",
    sales: "Sales",
  },
};

const STATUS: Record<Lang, Record<string, string>> = {
  tg: { ACTIVE: "Фаъол", PLANNED: "Нақша", ON_LEAVE: "Рухсатӣ" },
  ru: { ACTIVE: "Активен", PLANNED: "План", ON_LEAVE: "Отпуск" },
  en: { ACTIVE: "Active", PLANNED: "Planned", ON_LEAVE: "On leave" },
};

function langOf(q: unknown): Lang {
  return q === "ru" || q === "en" || q === "tg" ? q : "tg";
}

function periodOf(q: unknown): Period {
  return q === "daily" || q === "yearly" || q === "monthly" ? q : "monthly";
}

const MONTHS: Record<Lang, string[]> = {
  tg: ["январ", "феврал", "март", "апрел", "май", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

function formatAt(iso: string | undefined, period: Period, lang: Lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const month = MONTHS[lang][d.getMonth()];
  const year = d.getFullYear();
  if (period === "daily") {
    const hh = String(d.getHours()).padStart(2, "0");
    return `${d.getDate()} ${month} ${year} ${hh}:00`;
  }
  if (period === "yearly") return `${month} ${year}`;
  return `${d.getDate()} ${month} ${year}`;
}

function fmt(n: number) {
  return Number(n || 0).toLocaleString("tg-TJ", { maximumFractionDigits: 0 });
}

function findFont(names: string[]) {
  const dirs = ["C:\\Windows\\Fonts", path.join(process.cwd(), "fonts")];
  for (const n of names) {
    for (const d of dirs) {
      const p = path.join(d, n);
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined;
}

function fonts() {
  const regular = findFont(["arial.ttf", "ARIAL.TTF", "tahoma.ttf", "segoeui.ttf", "NotoSans-Regular.ttf"]);
  const bold = findFont(["arialbd.ttf", "ARIALBD.TTF", "tahomabd.ttf", "segoeuib.ttf", "NotoSans-Bold.ttf"]) || regular;
  return { regular, bold };
}

async function payload(period: Period) {
  const [dash, employees, investments, loans] = await Promise.all([
    buildCeoDashboard(period),
    prisma.employee.findMany({ include: { department: true }, orderBy: { code: "asc" } }),
    prisma.investment.findMany({ orderBy: { amount: "desc" } }),
    prisma.loan.findMany({ orderBy: { remaining: "desc" } }),
  ]);
  return { dash, employees, investments, loans };
}

const GOLD = "FFC9972A";
const DARK = "FF0D1117";
const CREAM = "FFFAF6EB";
const TEAL = "FF0F766E";
const ROSE = "FFBE123C";

function paintHeader(ws: ExcelJS.Worksheet, lastCol: number, title: string, subtitle: string) {
  ws.mergeCells(1, 1, 1, lastCol);
  ws.mergeCells(2, 1, 2, lastCol);
  ws.mergeCells(3, 1, 3, lastCol);
  const a = ws.getRow(1);
  a.height = 28;
  a.getCell(1).value = COMPANY.name;
  a.getCell(1).font = { name: "Calibri", size: 16, bold: true, color: { argb: GOLD } };
  a.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  a.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  const b = ws.getRow(2);
  b.height = 22;
  b.getCell(1).value = title;
  b.getCell(1).font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  b.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  const c = ws.getRow(3);
  c.getCell(1).value = subtitle;
  c.getCell(1).font = { name: "Calibri", size: 10, color: { argb: GOLD } };
  c.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  for (let i = 1; i <= lastCol; i++) {
    a.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
    b.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
    c.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  }
}

function styleHead(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { name: "Calibri", bold: true, size: 11, color: { argb: DARK } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF8A6A1A" } },
    };
  });
}

function zebra(ws: ExcelJS.Worksheet, from: number, to: number) {
  for (let i = from; i <= to; i++) {
    if ((i - from) % 2 === 1) {
      ws.getRow(i).eachCell((cell) => {
        if (!cell.fill || (cell.fill as { fgColor?: { argb?: string } }).fgColor?.argb !== GOLD) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } };
        }
      });
    }
  }
}

exportRouter.get("/excel", async (req, res, next) => {
  try {
    const period = periodOf(req.query.period);
    const lang = langOf(req.query.lang);
    const t = L[lang];
    const { dash, employees, investments, loans } = await payload(period);
    const when = formatAt(new Date().toISOString(), "daily", lang);
    const sub = `${COMPANY.slogan}  ·  ${t.chairman}: ${COMPANY.ceo}  ·  ${t.period}: ${t[period]}  ·  ${t.city}: ${COMPANY.city}  ·  ${when}`;

    const wb = new ExcelJS.Workbook();
    wb.creator = COMPANY.ceo;
    wb.company = COMPANY.name;
    wb.created = new Date();
    wb.title = `${COMPANY.name} — ${t.title}`;

    const kpis = wb.addWorksheet(t.kpis, { views: [{ state: "frozen", ySplit: 4 }] });
    paintHeader(kpis, 3, t.title, sub);
    kpis.addRow([]);
    const kh = kpis.addRow([t.indicator, t.value, t.change]);
    styleHead(kh);
    Object.entries(dash.kpis).forEach(([k, v]) => {
      const row = kpis.addRow([KPI[lang][k] ?? k, v.value, v.pct / 100]);
      row.getCell(2).numFmt = "#,##0.00";
      row.getCell(3).numFmt = "0.00%";
      if (k === "profit") row.getCell(2).font = { color: { argb: TEAL }, bold: true };
      if (k === "expenses" || k === "losses") row.getCell(2).font = { color: { argb: ROSE } };
    });
    kpis.columns = [{ width: 36 }, { width: 22 }, { width: 14 }];
    zebra(kpis, 6, 5 + Object.keys(dash.kpis).length);

    const fin = wb.addWorksheet(t.finance);
    paintHeader(fin, 2, t.finance, t.formula);
    fin.addRow([]);
    styleHead(fin.addRow([t.income, t.value]));
    [
      [t.oilSales, dash.financeBreakdown.income.oilSales],
      [t.services, dash.financeBreakdown.income.services],
      [t.otherIncome, dash.financeBreakdown.income.otherIncome],
      [t.income, dash.kpis.revenue.value],
    ].forEach((r) => {
      const row = fin.addRow(r);
      row.getCell(2).numFmt = "#,##0.00";
    });
    fin.addRow([]);
    styleHead(fin.addRow([t.expense, t.value]));
    [
      [t.salary, dash.financeBreakdown.expense.salary],
      [t.equipment, dash.financeBreakdown.expense.equipment],
      [t.transport, dash.financeBreakdown.expense.transport],
      [t.tax, dash.financeBreakdown.expense.tax],
      [t.otherExpense, dash.financeBreakdown.expense.otherExpense],
      [t.expense, dash.kpis.expenses.value],
    ].forEach((r) => {
      const row = fin.addRow(r);
      row.getCell(2).numFmt = "#,##0.00";
    });
    fin.addRow([]);
    const net = fin.addRow([t.net, dash.kpis.profit.value]);
    net.font = { bold: true, color: { argb: TEAL } };
    net.getCell(2).numFmt = "#,##0.00";
    fin.columns = [{ width: 36 }, { width: 22 }];

    const series = wb.addWorksheet(t.series, { views: [{ state: "frozen", ySplit: 5 }] });
    paintHeader(series, 6, t.series, sub);
    series.addRow([]);
    styleHead(series.addRow([t.bucket, t.income, t.expense, t.net, t.production, t.sales]));
    dash.charts.forEach((c) => {
      const row = series.addRow([formatAt((c as { at?: string }).at, period, lang), c.revenue, c.expense, c.profit, c.production, c.sales]);
      [2, 3, 4, 5, 6].forEach((i) => (row.getCell(i).numFmt = "#,##0.00"));
    });
    series.columns = [{ width: 28 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }];
    zebra(series, 6, 5 + dash.charts.length);

    const hr = wb.addWorksheet(t.staff, { views: [{ state: "frozen", ySplit: 5 }] });
    paintHeader(hr, 7, t.staff, sub);
    hr.addRow([]);
    styleHead(hr.addRow([t.code, t.name, t.position, t.dept, t.wage, t.perf, t.status]));
    employees.forEach((e) => {
      const row = hr.addRow([
        e.code,
        `${e.firstName} ${e.lastName}`,
        e.position,
        e.department.name,
        num(e.baseSalary),
        num(e.performance) / 100,
        STATUS[lang][e.status] ?? e.status,
      ]);
      row.getCell(5).numFmt = "#,##0.00";
      row.getCell(6).numFmt = "0.0%";
    });
    hr.columns = [{ width: 12 }, { width: 24 }, { width: 28 }, { width: 24 }, { width: 14 }, { width: 12 }, { width: 12 }];
    zebra(hr, 6, 5 + employees.length);

    const inv = wb.addWorksheet(t.investLoans);
    paintHeader(inv, 3, t.investLoans, sub);
    inv.addRow([]);
    styleHead(inv.addRow([t.name, t.amount, t.status]));
    investments.forEach((i) => {
      const row = inv.addRow([i.name, num(i.amount), STATUS[lang][i.status] ?? i.status]);
      row.getCell(2).numFmt = "#,##0.00";
    });
    inv.addRow([]);
    styleHead(inv.addRow([t.lender, t.remaining, t.status]));
    loans.forEach((i) => {
      const row = inv.addRow([i.lender, num(i.remaining), STATUS[lang][i.status] ?? i.status]);
      row.getCell(2).numFmt = "#,##0.00";
    });
    inv.columns = [{ width: 42 }, { width: 18 }, { width: 14 }];

    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="KNT-Hisobot-${period}.xlsx"`);
    res.setHeader("Content-Length", buf.length);
    res.setHeader("Cache-Control", "no-store");
    res.end(buf);
  } catch (err) {
    next(err);
  }
});

exportRouter.get("/pdf", async (req, res, next) => {
  try {
    const period = periodOf(req.query.period);
    const lang = langOf(req.query.lang);
    const t = L[lang];
    const { dash, investments, loans } = await payload(period);
    const { regular, bold } = fonts();

    const doc = new PDFDocument({
      margin: 0,
      size: "A4",
      info: { Title: `${COMPANY.name} — ${t.title}`, Author: COMPANY.ceo, Creator: COMPANY.name },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const use = (isBold = false) => {
      const f = isBold ? bold : regular;
      if (f) doc.font(f);
    };

    const W = doc.page.width;
    const left = 42;
    const right = W - 42;
    const width = right - left;

    use(true);
    doc.rect(0, 0, W, 118).fill("#0d1117");
    doc.rect(0, 118, W, 5).fill("#c9972a");
    doc.fillColor("#c9972a").fontSize(9).text(`${COMPANY.name}  ·  ${COMPANY.slogan}  ·  ${COMPANY.city}`, left, 22, { width });
    doc.fillColor("#ffffff").fontSize(22).text(t.title, left, 42, { width });
    doc.fillColor("#e2b84a").fontSize(12).text(`${t.chairman}: ${COMPANY.ceo}`, left, 74, { width });
    use(false);
    doc.fillColor("#b8b8b8").fontSize(9).text(
      `${t.period}: ${t[period]}    ${t.date}: ${formatAt(new Date().toISOString(), "daily", lang)}`,
      left,
      94,
      { width }
    );

    let y = 140;
    use(true);
    doc.fillColor("#1a1408").fontSize(13).text(t.kpis, left, y);
    y += 22;
    use(false);

    const entries = Object.entries(dash.kpis);
    const colW = (width - 12) / 2;
    const rowH = 46;
    entries.forEach(([k, v], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = left + col * (colW + 12);
      const yy = y + row * (rowH + 8);
      doc.roundedRect(x, yy, colW, rowH, 6).fill("#faf6eb");
      doc.rect(x, yy, 4, rowH).fill("#c9972a");
      use(false);
      doc.fillColor("#8a6a1a").fontSize(8).text(KPI[lang][k] ?? k, x + 14, yy + 8, { width: colW - 24 });
      use(true);
      const color = k === "profit" ? "#0f766e" : k === "expenses" || k === "losses" ? "#be123c" : "#111111";
      doc.fillColor(color).fontSize(13).text(fmt(v.value), x + 14, yy + 22, { width: colW - 24 });
    });
    y += Math.ceil(entries.length / 2) * (rowH + 8) + 10;

    use(true);
    doc.fillColor("#1a1408").fontSize(13).text(t.finance, left, y);
    y += 18;
    use(false);
    doc.fillColor("#5a4a20").fontSize(9).text(t.formula, left, y);
    y += 16;
    doc.fontSize(10).fillColor("#222");
    doc.text(
      `${t.income} ${fmt(dash.kpis.revenue.value)}  −  ${t.expense} ${fmt(dash.kpis.expenses.value)}`,
      left,
      y,
      { width }
    );
    y += 16;
    use(true);
    doc.fillColor("#0f766e").fontSize(12).text(`${t.net}: ${fmt(dash.kpis.profit.value)}`, left, y);
    y += 22;

    const inc = [
      [t.oilSales, dash.financeBreakdown.income.oilSales],
      [t.services, dash.financeBreakdown.income.services],
      [t.otherIncome, dash.financeBreakdown.income.otherIncome],
    ];
    const exp = [
      [t.salary, dash.financeBreakdown.expense.salary],
      [t.equipment, dash.financeBreakdown.expense.equipment],
      [t.transport, dash.financeBreakdown.expense.transport],
      [t.tax, dash.financeBreakdown.expense.tax],
      [t.otherExpense, dash.financeBreakdown.expense.otherExpense],
    ];
    const boxW = (width - 12) / 2;
    const boxH = 118;
    doc.roundedRect(left, y, boxW, boxH, 6).strokeColor("#e2b84a").lineWidth(1).stroke();
    doc.roundedRect(left + boxW + 12, y, boxW, boxH, 6).strokeColor("#e2b84a").lineWidth(1).stroke();
    use(true);
    doc.fillColor("#8a6a1a").fontSize(10).text(t.income, left + 10, y + 8);
    doc.text(t.expense, left + boxW + 22, y + 8);
    use(false);
    doc.fillColor("#222").fontSize(9);
    inc.forEach((r, i) => doc.text(`${r[0]}    ${fmt(Number(r[1]))}`, left + 10, y + 28 + i * 16, { width: boxW - 20 }));
    exp.forEach((r, i) =>
      doc.text(`${r[0]}    ${fmt(Number(r[1]))}`, left + boxW + 22, y + 28 + i * 16, { width: boxW - 20 })
    );
    y += boxH + 18;

    use(true);
    doc.fillColor("#1a1408").fontSize(13).text(t.production, left, y);
    y += 18;
    use(false);
    const att = dash.productionVsPlan.attainment;
    doc.fillColor("#444").fontSize(10).text(
      `${t.actual}: ${fmt(dash.productionVsPlan.actual)}    ${t.planned}: ${fmt(dash.productionVsPlan.planned)}    ${t.attainment}: ${att}%`,
      left,
      y,
      { width }
    );
    y += 18;
    doc.roundedRect(left, y, width, 12, 4).fill("#eee8d5");
    doc.roundedRect(left, y, Math.max(8, Math.min(width, (width * att) / 100)), 12, 4).fill(att >= 100 ? "#0f766e" : "#c9972a");
    y += 28;

    if (y > 620) {
      doc.addPage();
      y = 48;
    }
    use(true);
    doc.fillColor("#1a1408").fontSize(13).text(t.investLoans, left, y);
    y += 16;
    use(false);
    doc.fillColor("#222").fontSize(9);
    investments.forEach((i) => {
      doc.text(`${i.name}    ${fmt(num(i.amount))}`, left, y, { width });
      y += 14;
    });
    loans.forEach((i) => {
      doc.text(`${i.lender}    ${fmt(num(i.remaining))}`, left, y, { width });
      y += 14;
    });

    y = Math.max(y + 24, 720);
    doc.moveTo(left, y).lineTo(left + 180, y).strokeColor("#c9972a").lineWidth(1).stroke();
    use(false);
    doc.fillColor("#666").fontSize(8).text(t.signed, left, y + 6);
    use(true);
    doc.fillColor("#1a1408").fontSize(11).text(COMPANY.ceo, left, y + 18);
    use(false);
    doc.fillColor("#999").fontSize(8).text(`${t.footer}  ·  ${COMPANY.name}`, left, 810, { width, align: "center" });

    doc.end();
    const buf = await done;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="KNT-Hisobot-${period}.pdf"`);
    res.setHeader("Content-Length", buf.length);
    res.setHeader("Cache-Control", "no-store");
    res.end(buf);
  } catch (err) {
    next(err);
  }
});
