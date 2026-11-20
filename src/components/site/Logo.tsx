import { cn } from "@/lib/cn";

/**
 * Фирменный блок «Техник». Геометрия — та же, что в public/brand/logo.svg
 * (генератор: все шесть букв Т-Е-Х-Н-И-К состоят только из прямых штрихов,
 * поэтому вордмарк собран из полигонов по сетке 72/13 и не зависит от шрифта).
 *
 * Знак — головка болта «под шестигранник» с негативной «Т» в ключе.
 * На графите знак остаётся янтарным, вордмарк — светлым: контраст знака
 * к фону важнее «монохромной чистоты».
 */

const WORDMARK = [
  "M0 0H58V13H0Z",
  "M22.5 0H35.5V72H22.5Z",
  "M69 0H82V72H69Z",
  "M69 0H119V13H69Z",
  "M69 29.5H111V42.5H69Z",
  "M69 59H119V72H69Z",
  "M130 0L144.83 0L184.36 72L169.53 72Z",
  "M169.53 0L184.36 0L144.83 72L130 72Z",
  "M197 0H210V72H197Z",
  "M242 0H255V72H242Z",
  "M210 29.5H242V42.5H210Z",
  "M266 0H279V72H266Z",
  "M311 0H324V72H311Z",
  "M279 72L279 39.99L311 0L311 32.01Z",
  "M335 0H348V72H335Z",
  "M348 36L391 0L391 16.95L348 52.95Z",
  "M348 36L391 72L391 55.05L348 19.05Z",
];

const HEX = "M58.85 47.5L32 63L5.15 47.5L5.15 16.5L32 1L58.85 16.5Z";
const HEX_T = "M14.5 17H49.5V27H14.5ZM27 17H37V47H27Z";

/** Знак без надписи: фавикон, аватарки, мобильный хедер, бейджи. */
export function Mark({ className, slotColor = "var(--color-paper)" }: { className?: string; slotColor?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-8 w-8", className)} role="img" aria-label="Техник">
      <path d={HEX} fill="var(--color-accent)" />
      <path d={HEX_T} fill={slotColor} fillRule="evenodd" />
    </svg>
  );
}

export function Logo({
  className,
  mono = false,
  slotColor = "var(--color-paper)",
}: {
  className?: string;
  mono?: boolean;
  slotColor?: string;
}) {
  return (
    <svg viewBox="0 0 495 82" className={cn("h-7 w-auto", className)} role="img" aria-label="Техник">
      <g transform="scale(1.28)">
        <path d={HEX} fill={mono ? "currentColor" : "var(--color-accent)"} />
        <path d={HEX_T} fill={mono ? "var(--color-paper)" : slotColor} fillRule="evenodd" />
      </g>
      <g transform="translate(104 5)" fill="currentColor">
        {WORDMARK.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
