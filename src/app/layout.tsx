import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/config/site";
import { CartProvider } from "@/components/cart/store";

/**
 * Шрифты лежат файлами в src/fonts и подключаются через next/font/local:
 * сборка на сервере не ходит в сеть (fonts.gstatic.com с этого VPS отвечает
 * через раз, на соседних проектах это трижды роняло прод-сборку).
 * Подмножества — только cyrillic + latin, это ~108 КБ на все начертания.
 *
 * Geologica — дисплейный: механические окончания, узкие овалы, «приборная»
 * пластика. Inter — интерфейсный: нейтральный, с табличными цифрами для цен.
 */
const geologica = localFont({
  src: [
    { path: "../fonts/geologica-cyrillic-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/geologica-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-geologica",
  preload: true,
});

const inter = localFont({
  src: [
    { path: "../fonts/inter-cyrillic-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.appUrl),
  title: { default: `${site.name} — инструмент и крепёж в Котласе`, template: `%s — ${site.name}` },
  description: `Магазин «${site.name}»: строительный, электро- и бензоинструмент, крепёж. ${site.address}. ${site.phone}.`,
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/favicon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#14171c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${geologica.variable}`}>
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
