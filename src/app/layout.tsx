import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { CartProvider } from "@/components/cart/store";

export const metadata: Metadata = {
  metadataBase: new URL(site.appUrl),
  title: { default: `${site.name} — инструмент и крепёж в Котласе`, template: `%s — ${site.name}` },
  description: `Магазин «${site.name}»: строительный, электро- и бензоинструмент, крепёж. ${site.address}. ${site.phone}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
