import { daysUntil } from "./logic";
import type { PantryItem } from "./store";

export const AISLE_ORDER = ["Produce", "Meat", "Dairy", "Bakery", "Frozen", "Canned", "Pantry", "Spices", "Grocery"];

export function toStock(pantry: PantryItem[]) {
  return pantry.filter((item) => item.key).map((item) => ({ key: item.key as string, qty: item.qty }));
}

export function expiryLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

export function aisleRank(aisle: string) {
  const index = AISLE_ORDER.indexOf(aisle);
  return index === -1 ? 99 : index;
}

export function parseISO(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function spendByAisle(receipts: { lines: { aisle: string; price?: number }[] }[]) {
  const totals = new Map<string, number>();
  for (const receipt of receipts) {
    for (const line of receipt.lines) {
      if (!line.price) continue;
      totals.set(line.aisle, (totals.get(line.aisle) ?? 0) + line.price);
    }
  }
  const rows = [...totals.entries()].map(([aisle, total]) => ({ aisle, total }));
  const max = Math.max(...rows.map((row) => row.total), 1);
  return rows
    .map((row) => ({ ...row, share: Math.round((row.total / max) * 100) }))
    .sort((a, b) => b.total - a.total);
}
