import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CURRENCY_IDS } from "@/lib/shop";

const keySchema = z.object({
  key: z.string().trim().min(4, "كلمة السر أربع خانات على الأقل").max(80, "كلمة السر طويلة"),
});

const shopSchema = keySchema.extend({
  name: z.string().trim().min(2, "اسم المحل قصير").max(40, "اسم المحل طويل"),
  tagline: z.string().trim().min(2, "السطر التعريفي قصير").max(120, "السطر التعريفي طويل"),
  about: z.string().trim().max(600, "النبذة طويلة"),
  city: z.string().trim().max(40, "اسم المدينة طويل"),
  whatsapp: z.string().trim().max(24, "الرقم طويل"),
  currency: z.enum(CURRENCY_IDS),
});

const productSchema = keySchema.extend({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2, "اسم القطعة قصير").max(80, "اسم القطعة طويل"),
  summary: z.string().trim().min(2, "الوصف القصير ناقص").max(180, "الوصف القصير طويل"),
  story: z.string().trim().max(2000, "التفاصيل طويلة"),
  price: z
    .number()
    .int("السعر رقم صحيح")
    .min(0, "السعر ما بينقص عن صفر")
    .max(100_000_000, "السعر كبير"),
  category: z.string().trim().min(1, "اختار تصنيف").max(40, "التصنيف طويل"),
  origin: z.string().trim().max(80, "المصدر طويل"),
  available: z.boolean(),
  featured: z.boolean(),
  imageData: z.string().max(1_200_000, "الصورة كبيرة"),
});

const idSchema = z.object({
  id: z.number().int().positive(),
});

const deleteSchema = keySchema.extend({
  id: idSchema.shape.id,
});

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "البيانات ناقصة");
  }
  return parsed.data;
}

export const fetchCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { readCatalog } = await import("./catalog.server");
  return readCatalog();
});

export const fetchProduct = createServerFn({ method: "GET" })
  .validator((input: unknown) => parse(idSchema, input))
  .handler(async ({ data }) => {
    const { readProduct } = await import("./catalog.server");
    return readProduct(data.id);
  });

export const setManageKey = createServerFn({ method: "POST" })
  .validator((input: unknown) => parse(keySchema, input))
  .handler(async ({ data }) => {
    const { setShopKey } = await import("./catalog.server");
    return setShopKey(data.key);
  });

export const checkManageKey = createServerFn({ method: "POST" })
  .validator((input: unknown) => parse(keySchema, input))
  .handler(async ({ data }) => {
    const { checkShopKey } = await import("./catalog.server");
    return checkShopKey(data.key);
  });

export const updateShop = createServerFn({ method: "POST" })
  .validator((input: unknown) => parse(shopSchema, input))
  .handler(async ({ data }) => {
    const { saveShop } = await import("./catalog.server");
    return saveShop(data);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => parse(productSchema, input))
  .handler(async ({ data }) => {
    const { saveProduct } = await import("./catalog.server");
    return saveProduct(data);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => parse(deleteSchema, input))
  .handler(async ({ data }) => {
    const { removeProduct } = await import("./catalog.server");
    return removeProduct(data.id, data.key);
  });
