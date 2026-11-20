// Реальные реквизиты магазина «Техник» — не придумывать другие значения.
export const site = {
  name: "Техник",
  legalName: "ИП Антипин Владимир Сергеевич",
  ogrnip: "310290429400023",
  ogrnipDate: "21.10.2010",
  inn: "290403963261",
  taxRegime: "УСН",
  legalAddress: "Республика Коми, Усть-Вымский район, п. Илья-Шор",
  address: "просп. Мира, 28, Котлас",
  city: "Котлас",
  phone: "+7 (950) 250-62-30",
  phoneHref: "+79502506230",
  rating: 4.2,
  reviewsCount: 16,
  hours: "пн–сб 9:00–18:00, вс 10:00–16:00",
  mapQuery: "Котлас, просп. Мира, 28",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3150",
};

export const categoriesSeed = [
  { slug: "power-tools", name: "Электро- и бензоинструмент", description: "Дрели, болгарки, пилы, генераторы — всё, что с мотором.", sort: 10 },
  { slug: "hand-tools", name: "Строительный инструмент", description: "Ручной инструмент для стройки и ремонта: от молотка до степлера.", sort: 20 },
  { slug: "fasteners", name: "Крепёжные изделия", description: "Саморезы, дюбели, скобы, анкеры — на вес и упаковками.", sort: 30 },
] as const;
