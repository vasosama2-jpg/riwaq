export const CURRENCY_IDS = ["USD", "SYP", "JOD", "LBP", "TRY", "AED", "SAR", "EUR"] as const;

export type CurrencyId = (typeof CURRENCY_IDS)[number];

export const CURRENCIES: { id: CurrencyId; label: string }[] = [
  { id: "USD", label: "دولار" },
  { id: "SYP", label: "ليرة سورية" },
  { id: "JOD", label: "دينار أردني" },
  { id: "LBP", label: "ليرة لبنانية" },
  { id: "TRY", label: "ليرة تركية" },
  { id: "AED", label: "درهم" },
  { id: "SAR", label: "ريال" },
  { id: "EUR", label: "يورو" },
];

export const CATEGORIES = [
  { id: "bags", label: "الشناتي" },
  { id: "shoes", label: "الأحذية" },
  { id: "wear", label: "لباس" },
  { id: "food", label: "مونة وطعام" },
  { id: "textile", label: "نسيج وبيت" },
  { id: "brass", label: "نحاس وحرف" },
  { id: "care", label: "عناية" },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
);

export function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id] ?? id;
}

export type Shop = {
  name: string;
  tagline: string;
  about: string;
  city: string;
  whatsapp: string;
  currency: string;
  hasKey: boolean;
};

export type Product = {
  id: number;
  title: string;
  summary: string;
  story: string;
  price: number;
  category: string;
  origin: string;
  image: string;
  available: boolean;
  featured: boolean;
};

export type Catalog = {
  shop: Shop;
  products: Product[];
};

export type ProductPage = {
  shop: Shop;
  product: Product;
  related: Product[];
};

export function formatPrice(amount: number, currency: string): string {
  const n = new Intl.NumberFormat("ar-u-nu-latn").format(amount);
  switch (currency) {
    case "USD":
      return `$${n}`;
    case "EUR":
      return `€${n}`;
    case "TRY":
      return `${n} ₺`;
    case "SYP":
      return `${n} ل.س`;
    case "JOD":
      return `${n} د.أ`;
    case "LBP":
      return `${n} ل.ل`;
    case "AED":
      return `${n} د.إ`;
    case "SAR":
      return `${n} ر.س`;
    default:
      return `${n} ${currency}`;
  }
}

export function orderMessage(
  shopName: string,
  currency: string,
  lines: { title: string; qty: number; price: number }[],
): string {
  const rows = lines.map(
    (line) => `• ${line.title} × ${line.qty} — ${formatPrice(line.price * line.qty, currency)}`,
  );
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  return `مرحبا ${shopName}\nحابب أطلب:\n${rows.join("\n")}\nالمجموع: ${formatPrice(total, currency)}`;
}

export function whatsappLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
