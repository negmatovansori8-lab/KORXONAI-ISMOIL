import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ceo = await prisma.employee.findUnique({ where: { code: "EMP-001" } });
  if (ceo) {
    await prisma.employee.update({
      where: { id: ceo.id },
      data: { firstName: "ISMOILOV", lastName: "ISMOIL", position: "Раиси корхона" },
    });
  }
  const map: Record<string, { name: string; description: string }> = {
    EXE: { name: "Дафтари раис", description: "Раис ва шӯро" },
    PRD: { name: "Истеҳсолот", description: "Истихроҷи нефт" },
    FIN: { name: "Молия", description: "Хазина ва ҳисобдорӣ" },
    HR: { name: "Кадрҳо", description: "Идораи кормандон" },
    WHS: { name: "Анбор ва логистика", description: "Захира ва нақлиёт" },
    ENG: { name: "Муҳандисӣ", description: "Чоҳҳо ва таҷҳизот" },
    SLS: { name: "Фурӯш", description: "Фурӯши нефт" },
  };
  for (const [code, data] of Object.entries(map)) {
    await prisma.department.updateMany({ where: { code }, data });
  }
  console.log("CEO updated to ISMOILOV ISMOIL");
}

main().finally(() => prisma.$disconnect());
