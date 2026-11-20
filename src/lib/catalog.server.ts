import type { Catalog, ProductPage, Product } from "@/lib/shop";

// Static demo content: no database, accounts, or live orders.
const products: Product[] = [
  { id: 1, title: "شنطة جلد كلاسيكية", summary: "شنطة أنيقة للاستخدام اليومي", story: "منتج تجريبي للتعلم على إنشاء المتاجر.", price: 45, category: "bags", origin: "تجريبي", image: "/products/bag.jpg", available: true, featured: true },
  { id: 2, title: "حذاء رياضي", summary: "حذاء مريح للمشاوير", story: "منتج تجريبي غير متاح للبيع.", price: 39, category: "shoes", origin: "تجريبي", image: "/products/sneakers.jpg", available: true, featured: true },
  { id: 3, title: "صندل", summary: "صندل بتصميم بسيط", story: "منتج تجريبي غير متاح للبيع.", price: 24, category: "shoes", origin: "تجريبي", image: "/products/sandals.jpg", available: true, featured: false },
  { id: 4, title: "عسل طبيعي", summary: "عسل للعرض التجريبي", story: "هذه صورة ومنتج للعرض فقط.", price: 18, category: "food", origin: "تجريبي", image: "/products/honey.jpg", available: true, featured: true },
  { id: 5, title: "زيت زيتون", summary: "منتج من المونة", story: "هذا المنتج للعرض فقط.", price: 16, category: "food", origin: "تجريبي", image: "/products/olive.jpg", available: true, featured: false },
  { id: 6, title: "بهارات", summary: "تشكيلة بهارات", story: "هذا المنتج للعرض فقط.", price: 12, category: "food", origin: "تجريبي", image: "/products/spices.jpg", available: true, featured: false },
  { id: 7, title: "وسادة مزخرفة", summary: "لمسة جميلة للبيت", story: "منتج تجريبي للعرض.", price: 22, category: "textile", origin: "تجريبي", image: "/products/cushion.jpg", available: true, featured: false },
  { id: 8, title: "سجادة كليم", summary: "نسيج بنقوش جميلة", story: "منتج تجريبي للعرض.", price: 75, category: "textile", origin: "تجريبي", image: "/products/kilim.jpg", available: true, featured: true },
  { id: 9, title: "دلة قهوة", summary: "قطعة تراثية", story: "منتج تجريبي للعرض.", price: 32, category: "brass", origin: "تجريبي", image: "/products/dallah.jpg", available: true, featured: false },
  { id: 10, title: "مصباح", summary: "مصباح للزينة", story: "منتج تجريبي للعرض.", price: 55, category: "brass", origin: "تجريبي", image: "/products/lamp.jpg", available: true, featured: false },
  { id: 11, title: "صابون طبيعي", summary: "صابون لطيف", story: "منتج تجريبي للعرض.", price: 8, category: "care", origin: "تجريبي", image: "/products/soap.jpg", available: true, featured: false },
];
const shop = { name: "رِواق", tagline: "متجر تجريبي للتعلّم", about: "هذا المتجر للتعلّم على تصميم المواقع فقط. لا توجد طلبات أو مبيعات حقيقية.", city: "", whatsapp: "", currency: "USD", hasKey: false };
export async function readCatalog(): Promise<Catalog> { return { shop, products }; }
export async function readProduct(id: number): Promise<ProductPage | null> {
  const product = products.find((item) => item.id === id);
  if (!product) return null;
  return { shop, product, related: products.filter((item) => item.id !== id && item.category === product.category).slice(0, 3) };
}
export async function readImage(id: number): Promise<{ kind: "path"; path: string } | null> {
  const product = products.find((item) => item.id === id);
  return product ? { kind: "path", path: product.image } : null;
}
