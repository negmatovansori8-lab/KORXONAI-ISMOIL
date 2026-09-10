import { Locale, t } from "./i18n";

type Triple = [string, string, string];

const rows: Triple[] = [
  ["Обандозии Сариқамиш", "Закачка воды Сарикамыш", "Sariqamish water injection"],
  ["Хати ҷамъоварии Данғара", "Сборный трубопровод Дангара", "Danghara gathering line"],
  ["Дугои рақамии SCADA", "Цифровой двойник SCADA", "Digital twin SCADA"],
  ["Бонки миллии Тоҷикистон", "Национальный банк Таджикистана", "National Bank of Tajikistan"],
  ["Барномаи энергетикии ЕБРР", "Энергетическая программа ЕБРР", "EBRD Energy Facility"],
  ["Дафтари раис", "Исполнительный офис", "Executive office"],
  ["Истеҳсолот", "Добыча", "Production"],
  ["Молия", "Финансы", "Finance"],
  ["Кадрҳо", "Кадры", "HR"],
  ["Анбор ва логистика", "Склад и логистика", "Warehouse and logistics"],
  ["Муҳандисӣ", "Инженерия", "Engineering"],
  ["Фурӯш", "Продажи", "Sales"],
  ["Раиси корхона", "Председатель предприятия", "Company chairman"],
  ["Менеҷери амалиёт", "Менеджер операций", "Operations manager"],
  ["Администратори система", "Системный администратор", "System administrator"],
  ["Муҳандиси истеҳсолот", "Инженер добычи", "Production engineer"],
  ["Назоратчии молия", "Финансовый контролёр", "Finance controller"],
  ["Мутахассиси кадрҳо", "Специалист по кадрам", "HR specialist"],
  ["Сардори анбор", "Начальник склада", "Warehouse chief"],
  ["Таҳлилгари фурӯш", "Аналитик продаж", "Sales analyst"],
  ["Оператори чоҳ", "Оператор скважины", "Well operator"],
  ["Техники нигоҳдорӣ", "Техник по обслуживанию", "Maintenance technician"],
  ["Ҳамоҳангсози логистика", "Координатор логистики", "Logistics coordinator"],
  ["Геолог", "Геолог", "Geologist"],
  ["Нефти устуворшуда", "Стабилизированная нефть", "Stabilized crude"],
  ["Деэмулгатор", "Деэмульгатор", "Demulsifier"],
  ["Қубури API 5L 8 дюйм", "Труба API 5L 8 дюймов", "API 5L pipe 8in"],
  ["Маҷмӯи насоси ESP", "Насосный агрегат ESP", "ESP pump assembly"],
  ["Сӯзишвории дизелӣ", "Дизельное топливо", "Diesel fuel"],
  ["Детектори H2S", "Детектор H2S", "H2S detector"],
  ["Маҳсулот", "Продукция", "Product"],
  ["Химикатҳо", "Химикаты", "Chemicals"],
  ["Маводҳо", "Материалы", "Materials"],
  ["Таҷҳизот", "Оборудование", "Equipment"],
  ["Сӯзишворӣ", "Топливо", "Fuel"],
  ["Ҳифзи меҳнат", "Охрана труда", "HSE"],
  ["Фермаи зарфҳо А", "Резервуарный парк А", "Tank Farm A"],
  ["Анбори химия", "Химсклад", "Chem Store"],
  ["Майдони 2", "Площадка 2", "Yard 2"],
  ["Коргоҳ", "Мастерская", "Workshop"],
  ["Истгоҳи сӯзишворӣ", "Топливный остров", "Fuel island"],
  ["Ҷевони HSE", "Шкаф HSE", "HSE locker"],
  ["Поезди ESP A1", "Поезд ESP A1", "ESP Train A1"],
  ["Ҷудокунандаи 3-фаза B", "3-фазный сепаратор B", "3-phase separator B"],
  ["Генератори газӣ 2.5 МВт", "Газовый генератор 2.5 МВт", "Gas generator 2.5MW"],
  ["Зарфи захира T-120", "Резервуар T-120", "Storage tank T-120"],
  ["Манораи сӯзиш FS-1", "Факельная установка FS-1", "Flare stack FS-1"],
  ["Насоси зериобӣ", "Погружной насос", "Submersible pump"],
  ["Раванд", "Процесс", "Process"],
  ["Барқ", "Энергия", "Power"],
  ["Захира", "Хранение", "Storage"],
  ["Барқарор кардани манораи сӯзиш FS-1", "Восстановить факел FS-1", "Restore flare stack FS-1"],
  ["Ивази оташгирак ва санҷиши зарф", "Заменить запальник и проверить барабан", "Replace igniter and inspect KO drum"],
  ["Анҷоми аудити моҳонаи HSE", "Завершить месячный аудит HSE", "Complete monthly HSE audit"],
  ["Пешгӯии истеҳсоли семоҳаи 3", "Прогноз добычи за III квартал", "Issue Q3 production forecast"],
  ["Мутобиқсозии дизели анбор", "Сверка складского дизеля", "Reconcile warehouse diesel"],
  ["Истеҳсолот тибқи нақша. Хатлон-C2 ҳанӯз дар таъмир. Захираи дизел хуб. Манораи сӯзиш хомӯш — вазифаи муҳим кушода аст.", "Добыча по плану. Хатлон-C2 ещё в ремонте. Запас дизеля в норме. Факел выключен — критическая задача открыта.", "Production on plan. Khatlon-C2 still in maintenance. Diesel stock healthy. Flare stack down — critical task open."],
  ["Истеҳсоли рӯзона", "Дневная добыча", "Daily production"],
  ["Воқеӣ 9,120 баррел нисбат ба нақша 8,940 баррел (+2.0%).", "Факт 9 120 барр. против плана 8 940 барр. (+2.0%).", "Actual 9,120 bbl vs plan 8,940 bbl (+2.0%)."],
  ["Таҷҳизоти муҳим", "Критическое оборудование", "Critical equipment"],
  ["Манораи сӯзиш FS-1 хомӯш аст.", "Факельная установка FS-1 выключена.", "Flare stack FS-1 is DOWN."],
  ["Вазифа таъин шуд", "Задача назначена", "Task assigned"],
  ["Барқарор кардани манораи сӯзиш FS-1 пас аз 2 рӯз.", "Восстановить факел FS-1 через 2 дня.", "Restore flare stack FS-1 is due in 2 days."],
  ["Нусхаи эҳтиётӣ", "Резервная копия", "Backup"],
  ["Нусхаи шабонаи пойгоҳ анҷом шуд.", "Ночное резервное копирование базы завершено.", "Nightly database backup completed."],
  ["Сариқамиш-A1", "Сарикамыш-A1", "Sariqamish-A1"],
  ["Сариқамиш-B3", "Сарикамыш-B3", "Sariqamish-B3"],
  ["Хатлон-C2", "Хатлон-C2", "Khatlon-C2"],
  ["Данғара-D1", "Дангара-D1", "Danghara-D1"],
  ["Суғд", "Согд", "Sughd"],
  ["Хатлон", "Хатлон", "Khatlon"],
  ["Қабули воридот", "Приход на склад", "Inbound receipt"],
  ["Сарфи майдон", "Выдача на промысел", "Field issue"],
  ["Баррел", "Баррель", "bbl"],
  ["адад", "шт.", "ea"],
];

const lookup = new Map<string, Triple>();
for (const row of rows) {
  for (const v of row) lookup.set(v.trim().toLowerCase(), row);
}

function pick(locale: Locale | undefined, row: Triple) {
  if (locale === "ru") return row[1];
  if (locale === "en") return row[2];
  return row[0];
}

export function td(locale: Locale | undefined, value?: string | number | null) {
  if (value == null || value === "") return "";
  const raw = String(value).trim();
  const hit = lookup.get(raw.toLowerCase());
  if (hit) return pick(locale, hit);

  let out = raw;
  const fragments = ["Sughd", "Khatlon", "Суғд", "Хатлон", "Согд"];
  for (const f of fragments) {
    const row = lookup.get(f.toLowerCase());
    if (row && out.toLowerCase().includes(f.toLowerCase())) {
      out = out.replace(new RegExp(f, "ig"), pick(locale, row));
    }
  }
  return out;
}

export function st(locale: Locale | undefined, code?: string | null) {
  if (!code) return "";
  const key = `st_${code}`;
  const translated = t(locale, key);
  return translated === key ? td(locale, code) : translated;
}
