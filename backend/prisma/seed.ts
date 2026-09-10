import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function periodOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function seedDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.task.deleteMany();
  await prisma.warehouseMovement.deleteMany();
  await prisma.warehouseItem.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.production.deleteMany();
  await prisma.well.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.financeTransaction.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  const departments = await prisma.$transaction([
    prisma.department.create({ data: { name: "Дафтари раис", code: "EXE", description: "Раис ва шӯро" } }),
    prisma.department.create({ data: { name: "Истеҳсолот", code: "PRD", description: "Истихроҷи нефт" } }),
    prisma.department.create({ data: { name: "Молия", code: "FIN", description: "Хазина ва ҳисобдорӣ" } }),
    prisma.department.create({ data: { name: "Кадрҳо", code: "HR", description: "Идораи кормандон" } }),
    prisma.department.create({ data: { name: "Анбор ва логистика", code: "WHS", description: "Захира ва нақлиёт" } }),
    prisma.department.create({ data: { name: "Муҳандисӣ", code: "ENG", description: "Чоҳҳо ва таҷҳизот" } }),
    prisma.department.create({ data: { name: "Фурӯш", code: "SLS", description: "Фурӯши нефт" } }),
  ]);

  const [exe, prd, fin, hr, whs, eng, sls] = departments;

  const staff = [
    { code: "EMP-001", firstName: "ISMOILOV", lastName: "ISMOIL", position: "Раиси корхона", departmentId: exe.id, baseSalary: 28000, experienceYrs: 22, performance: 96 },
    { code: "EMP-002", firstName: "Дилноза", lastName: "Саидова", position: "Менеҷери амалиёт", departmentId: prd.id, baseSalary: 16000, experienceYrs: 14, performance: 91 },
    { code: "EMP-003", firstName: "Фаррух", lastName: "Назаров", position: "Администратори система", departmentId: eng.id, baseSalary: 9500, experienceYrs: 9, performance: 88 },
    { code: "EMP-004", firstName: "Малика", lastName: "Юсупова", position: "Муҳандиси истеҳсолот", departmentId: prd.id, baseSalary: 7200, experienceYrs: 6, performance: 84 },
    { code: "EMP-005", firstName: "Ҷамшед", lastName: "Раҳимов", position: "Назоратчии молия", departmentId: fin.id, baseSalary: 11000, experienceYrs: 11, performance: 93 },
    { code: "EMP-006", firstName: "Зуҳро", lastName: "Исмоилова", position: "Мутахассиси кадрҳо", departmentId: hr.id, baseSalary: 5400, experienceYrs: 5, performance: 87 },
    { code: "EMP-007", firstName: "Акмал", lastName: "Турсунов", position: "Сардори анбор", departmentId: whs.id, baseSalary: 6100, experienceYrs: 8, performance: 82 },
    { code: "EMP-008", firstName: "Парвина", lastName: "Шарипова", position: "Таҳлилгари фурӯш", departmentId: sls.id, baseSalary: 6800, experienceYrs: 4, performance: 90 },
    { code: "EMP-009", firstName: "Бекзод", lastName: "Мирзоев", position: "Оператори чоҳ", departmentId: prd.id, baseSalary: 4200, experienceYrs: 3, performance: 78 },
    { code: "EMP-010", firstName: "Нилуфар", lastName: "Абдуллаева", position: "Техники нигоҳдорӣ", departmentId: eng.id, baseSalary: 4800, experienceYrs: 7, performance: 85 },
    { code: "EMP-011", firstName: "Шерзод", lastName: "Қодиров", position: "Ҳамоҳангсози логистика", departmentId: whs.id, baseSalary: 5000, experienceYrs: 4, performance: 80 },
    { code: "EMP-012", firstName: "Мадина", lastName: "Ҳакимова", position: "Геолог", departmentId: eng.id, baseSalary: 8900, experienceYrs: 10, performance: 92 },
  ];

  const employees = [];
  for (const s of staff) {
    employees.push(
      await prisma.employee.create({
        data: {
          ...s,
          status: "ACTIVE",
          hireDate: daysAgo(400 + Math.floor(Math.random() * 2000)),
          phone: `+992 90 ${100 + employees.length} ${2000 + employees.length}`,
        },
      })
    );
  }

  const hash = async (p: string) => bcrypt.hash(p, 10);

  const [ceo, manager, admin, employee] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "ceo@oilenterprise.tj",
        passwordHash: await hash("CEO@2026"),
        role: "CEO",
        employeeId: employees[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "manager@oilenterprise.tj",
        passwordHash: await hash("Manager@2026"),
        role: "MANAGER",
        employeeId: employees[1].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "admin@oilenterprise.tj",
        passwordHash: await hash("Admin@2026"),
        role: "ADMIN",
        employeeId: employees[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: "employee@oilenterprise.tj",
        passwordHash: await hash("Employee@2026"),
        role: "EMPLOYEE",
        employeeId: employees[3].id,
      },
    }),
  ]);

  for (const emp of employees) {
    const period = periodOf(new Date());
    const bonus = Number(emp.baseSalary) * 0.12;
    const perfAmt = Number(emp.baseSalary) * (Number(emp.performance) / 100) * 0.15;
    const reward = Number(emp.performance) > 90 ? 800 : 250;
    const deduction = Number(emp.performance) < 80 ? 180 : 0;
    const net = Number(emp.baseSalary) + bonus + perfAmt + reward - deduction;
    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        period,
        baseSalary: emp.baseSalary,
        bonus,
        performancePercent: emp.performance,
        reward,
        deduction,
        netSalary: Number(net.toFixed(2)),
      },
    });
  }

  const wells = await prisma.$transaction([
    prisma.well.create({ data: { name: "Сариқамиш-A1", location: "Суғд, 39.21N 69.34E", status: "ACTIVE", capacityBpd: 4200 } }),
    prisma.well.create({ data: { name: "Сариқамиш-B3", location: "Суғд, 39.18N 69.41E", status: "ACTIVE", capacityBpd: 3100 } }),
    prisma.well.create({ data: { name: "Хатлон-C2", location: "Хатлон, 37.49N 69.22E", status: "MAINTENANCE", capacityBpd: 1800 } }),
    prisma.well.create({ data: { name: "Данғара-D1", location: "Хатлон, 38.10N 69.35E", status: "ACTIVE", capacityBpd: 2650 } }),
  ]);

  for (let day = 59; day >= 0; day--) {
    const date = daysAgo(day);
    for (const well of wells) {
      if (well.status !== "ACTIVE" && day % 4 !== 0) continue;
      const planned = Number(well.capacityBpd) * (0.78 + (day % 7) * 0.02);
      const variance = (Math.sin(day / 4 + well.name.length) * 0.08 + 0.02) * planned;
      const actual = Math.max(0, planned + variance);
      const ratio = actual / planned;
      const status = ratio >= 1.03 ? "AHEAD" : ratio < 0.92 ? "BEHIND" : "ON_PLAN";
      await prisma.production.create({
        data: {
          wellId: well.id,
          occurredAt: date,
          plannedBarrels: Number(planned.toFixed(2)),
          actualBarrels: Number(actual.toFixed(2)),
          status,
        },
      });
    }

    const oilVolume = 6200 + Math.round(Math.sin(day / 5) * 380);
    const price = 78 + (day % 11) * 0.45;
    const oilAmount = oilVolume * price;
    await prisma.sale.create({
      data: {
        customer: day % 3 === 0 ? "CNPC Crude Desk" : day % 3 === 1 ? "Gazprom Neft Trading" : "SOCAR Energy",
        volumeBbl: oilVolume,
        pricePerBbl: Number(price.toFixed(2)),
        amount: Number(oilAmount.toFixed(2)),
        soldAt: date,
      },
    });

    await prisma.financeTransaction.create({
      data: {
        type: "INCOME",
        incomeCat: "OIL_SALES",
        amount: Number(oilAmount.toFixed(2)),
        occurredAt: date,
        description: `Crude offtake ${oilVolume} bbl`,
        reference: `SAL-${date.toISOString().slice(0, 10)}`,
      },
    });

    if (day % 3 === 0) {
      await prisma.financeTransaction.create({
        data: {
          type: "INCOME",
          incomeCat: "SERVICES",
          amount: 18500 + (day % 5) * 1200,
          occurredAt: date,
          description: "Field services & pipeline access",
        },
      });
    }
    if (day % 7 === 0) {
      await prisma.financeTransaction.create({
        data: {
          type: "INCOME",
          incomeCat: "OTHER_INCOME",
          amount: 9200,
          occurredAt: date,
          description: "By-product condensate sale",
        },
      });
    }

    if (date.getDate() === 1 || day === 0) {
      await prisma.financeTransaction.create({
        data: {
          type: "EXPENSE",
          expenseCat: "SALARY",
          amount: 124800,
          occurredAt: date,
          description: "Monthly payroll run",
        },
      });
    }
    await prisma.financeTransaction.create({
      data: {
        type: "EXPENSE",
        expenseCat: "EQUIPMENT",
        amount: 6400 + (day % 6) * 900,
        occurredAt: date,
        description: "Wellhead parts and pumps",
      },
    });
    await prisma.financeTransaction.create({
      data: {
        type: "EXPENSE",
        expenseCat: "TRANSPORT",
        amount: 4100 + (day % 4) * 350,
        occurredAt: date,
        description: "Tanker fleet and diesel",
      },
    });
    if (day % 10 === 0) {
      await prisma.financeTransaction.create({
        data: {
          type: "EXPENSE",
          expenseCat: "TAX",
          amount: 48600,
          occurredAt: date,
          description: "Royalty and corporate tax",
        },
      });
    }
    if (day % 5 === 2) {
      await prisma.financeTransaction.create({
        data: {
          type: "EXPENSE",
          expenseCat: "OTHER_EXPENSE",
          amount: 2700,
          occurredAt: date,
          description: "Camp utilities and HSE",
        },
      });
    }
  }

  await prisma.investment.createMany({
    data: [
      { name: "Обандозии Сариқамиш", amount: 4200000, startedAt: daysAgo(180), status: "ACTIVE", notes: "Барномаи соли 1" },
      { name: "Хати ҷамъоварии Данғара", amount: 1850000, startedAt: daysAgo(90), status: "ACTIVE" },
      { name: "Дугои рақамии SCADA", amount: 640000, startedAt: daysAgo(40), status: "PLANNED" },
    ],
  });

  await prisma.loan.createMany({
    data: [
      { lender: "Бонки миллии Тоҷикистон", principal: 6500000, remaining: 4120000, ratePct: 8.5, startedAt: daysAgo(600), dueAt: daysAgo(-400), status: "ACTIVE" },
      { lender: "Барномаи энергетикии ЕБРР", principal: 2800000, remaining: 980000, ratePct: 5.2, startedAt: daysAgo(320), dueAt: daysAgo(-200), status: "ACTIVE" },
    ],
  });

  const items = await prisma.$transaction([
    prisma.warehouseItem.create({ data: { sku: "CRU-001", name: "Нефти устуворшуда", category: "Маҳсулот", unit: "баррел", quantity: 18400, minStock: 8000, location: "Фермаи зарфҳо А" } }),
    prisma.warehouseItem.create({ data: { sku: "CHM-012", name: "Деэмулгатор", category: "Химикатҳо", unit: "L", quantity: 2400, minStock: 800, location: "Анбори химия" } }),
    prisma.warehouseItem.create({ data: { sku: "PIP-088", name: "Қубури API 5L 8 дюйм", category: "Маводҳо", unit: "m", quantity: 620, minStock: 200, location: "Майдони 2" } }),
    prisma.warehouseItem.create({ data: { sku: "PMP-004", name: "Маҷмӯи насоси ESP", category: "Таҷҳизот", unit: "адад", quantity: 6, minStock: 3, location: "Коргоҳ" } }),
    prisma.warehouseItem.create({ data: { sku: "DSL-001", name: "Сӯзишвории дизелӣ", category: "Сӯзишворӣ", unit: "L", quantity: 18500, minStock: 10000, location: "Истгоҳи сӯзишворӣ" } }),
    prisma.warehouseItem.create({ data: { sku: "HSE-021", name: "Детектори H2S", category: "Ҳифзи меҳнат", unit: "адад", quantity: 18, minStock: 12, location: "Ҷевони HSE" } }),
  ]);

  for (let i = 0; i < 24; i++) {
    const item = items[i % items.length];
    const type = i % 3 === 0 ? "OUT" : "IN";
    await prisma.warehouseMovement.create({
      data: {
        itemId: item.id,
        type,
        quantity: type === "IN" ? 40 + i * 2 : 12 + i,
        occurredAt: daysAgo(i * 2),
        reference: `${type}-${1000 + i}`,
        note: type === "IN" ? "Қабули воридот" : "Сарфи майдон",
      },
    });
  }

  await prisma.equipment.createMany({
    data: [
      { code: "EQ-ESP-01", name: "Поезди ESP A1", type: "Насоси зериобӣ", status: "OPERATIONAL", lastMaintenance: daysAgo(18), nextMaintenance: daysAgo(-40) },
      { code: "EQ-SEP-02", name: "Ҷудокунандаи 3-фаза B", type: "Раванд", status: "OPERATIONAL", lastMaintenance: daysAgo(9), nextMaintenance: daysAgo(-50) },
      { code: "EQ-GEN-03", name: "Генератори газӣ 2.5 МВт", type: "Барқ", status: "MAINTENANCE", lastMaintenance: daysAgo(2), nextMaintenance: daysAgo(-12) },
      { code: "EQ-TNK-04", name: "Зарфи захира T-120", type: "Захира", status: "OPERATIONAL", lastMaintenance: daysAgo(40), nextMaintenance: daysAgo(-80) },
      { code: "EQ-FLR-05", name: "Манораи сӯзиш FS-1", type: "Ҳифзи меҳнат", status: "DOWN", lastMaintenance: daysAgo(3), nextMaintenance: daysAgo(-2) },
    ],
  });

  await prisma.task.createMany({
    data: [
      { title: "Барқарор кардани манораи сӯзиш FS-1", description: "Ивази оташгирак ва санҷиши зарф", status: "IN_PROGRESS", priority: "CRITICAL", dueAt: daysAgo(-2), assigneeId: manager.id, creatorId: ceo.id },
      { title: "Анҷоми аудити моҳонаи HSE", status: "OPEN", priority: "HIGH", dueAt: daysAgo(-5), assigneeId: manager.id, creatorId: ceo.id },
      { title: "Пешгӯии истеҳсоли семоҳаи 3", status: "DONE", priority: "MEDIUM", dueAt: daysAgo(4), assigneeId: employee.id, creatorId: manager.id },
      { title: "Мутобиқсозии дизели анбор", status: "BLOCKED", priority: "HIGH", dueAt: daysAgo(-1), assigneeId: manager.id, creatorId: admin.id },
    ],
  });

  await prisma.dailyReport.create({
    data: {
      date: daysAgo(0),
      authorId: manager.id,
      summary: "Истеҳсолот тибқи нақша. Хатлон-C2 ҳанӯз дар таъмир. Захираи дизел хуб. Манораи сӯзиш хомӯш — вазифаи муҳим кушода аст.",
      production: 9120,
      incidents: 1,
    },
  });

  await prisma.notification.createMany({
    data: [
      { userId: ceo.id, title: "Истеҳсоли рӯзона", message: "Воқеӣ 9,120 баррел нисбат ба нақша 8,940 баррел (+2.0%)." },
      { userId: ceo.id, title: "Таҷҳизоти муҳим", message: "Манораи сӯзиш FS-1 хомӯш аст." },
      { userId: manager.id, title: "Вазифа таъин шуд", message: "Барқарор кардани манораи сӯзиш FS-1 пас аз 2 рӯз." },
      { userId: admin.id, title: "Нусхаи эҳтиётӣ", message: "Нусхаи шабонаи пойгоҳ анҷом шуд." },
    ],
  });

  console.log("Seed complete.");
  console.log("CEO      ceo@oilenterprise.tj / CEO@2026");
  console.log("Manager  manager@oilenterprise.tj / Manager@2026");
  console.log("Admin    admin@oilenterprise.tj / Admin@2026");
  console.log("Employee employee@oilenterprise.tj / Employee@2026");
}

export { seedDatabase };

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
