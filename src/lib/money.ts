export function kopecksToRub(kopecks: number): number {
  return Math.round(kopecks) / 100;
}
export function rubToKopecks(rub: number): number {
  return Math.round(rub * 100);
}
export function formatRub(kopecks: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(kopecksToRub(kopecks)) + " ₽";
}
