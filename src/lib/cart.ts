import { useEffect, useSyncExternalStore } from "react";

export type CartLine = {
  id: number;
  title: string;
  price: number;
  image: string;
  qty: number;
};

const STORAGE_KEY = "riwaq-cart";
const EMPTY: CartLine[] = [];

let snapshot: CartLine[] = EMPTY;
const listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  emit();
}

function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as CartLine;
  return (
    typeof line.id === "number" &&
    typeof line.title === "string" &&
    typeof line.price === "number" &&
    typeof line.image === "string" &&
    typeof line.qty === "number"
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useCart(): CartLine[] {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  useEffect(() => {
    if (hydrated) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      snapshot = Array.isArray(parsed) ? parsed.filter(isLine) : EMPTY;
    } catch {
      snapshot = EMPTY;
    }
    hydrated = true;
    emit();
  }, []);
  return lines;
}

export function addToCart(line: Omit<CartLine, "qty">) {
  const existing = snapshot.find((item) => item.id === line.id);
  snapshot = existing
    ? snapshot.map((item) =>
        item.id === line.id
          ? { ...line, qty: Math.min(99, item.qty + 1) }
          : item,
      )
    : [...snapshot, { ...line, qty: 1 }];
  persist();
}

export function setCartQty(id: number, qty: number) {
  snapshot =
    qty <= 0
      ? snapshot.filter((item) => item.id !== id)
      : snapshot.map((item) => (item.id === id ? { ...item, qty: Math.min(99, qty) } : item));
  persist();
}

export function clearCart() {
  snapshot = EMPTY;
  persist();
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}
