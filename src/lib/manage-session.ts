const KEY = "riwaq-manage-key";

export function readManageKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(KEY) ?? "";
}

export function writeManageKey(key: string) {
  sessionStorage.setItem(KEY, key);
}

export function clearManageKey() {
  sessionStorage.removeItem(KEY);
}
