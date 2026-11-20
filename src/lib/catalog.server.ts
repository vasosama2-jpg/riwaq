import { createHash, timingSafeEqual } from "node:crypto";
import { getSql, type Sql } from "@/lib/db";
import { CURRENCY_IDS, type Catalog, type Product, type ProductPage, type Shop } from "@/lib/shop";

const MAX_PRODUCTS = 200;
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

class ShopError extends Error {}

type ShopRow = {
  name: string;
  tagline: string;
  about: string;
  city: string;
  whatsapp: string;
  currency: string;
  has_key: boolean;
};

type ProductRow = {
  id: number;
  title: string;
  summary: string;
  story: string;
  price: number;
  category: string;
  origin: string;
  image_path: string | null;
  has_upload: boolean;
  available: boolean;
  featured: boolean;
};

export type ShopInput = {
  key: string;
  name: string;
  tagline: string;
  about: string;
  city: string;
  whatsapp: string;
  currency: string;
};

export type ProductInput = {
  key: string;
  id?: number;
  title: string;
  summary: string;
  story: string;
  price: number;
  category: string;
  origin: string;
  available: boolean;
  featured: boolean;
  imageData: string;
};

export type Result = { ok: true } | { ok: false; error: string };

function flag(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function hashKey(key: string): string {
  return createHash("sha256").update(`riwaq-v1|${key}`).digest("hex");
}

function hashEquals(stored: string, key: string): boolean {
  const a = Buffer.from(stored);
  const b = Buffer.from(hashKey(key));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length < 8 || digits.length > 15) {
    throw new ShopError("اكتب رقم الواتساب مع رمز البلد، من غير صفر بالأول");
  }
  return digits;
}

function mapShop(row: ShopRow): Shop {
  return {
    name: row.name,
    tagline: row.tagline,
    about: row.about,
    city: row.city,
    whatsapp: row.whatsapp,
    currency: row.currency,
    hasKey: flag(row.has_key),
  };
}

function mapProduct(row: ProductRow): Product {
  const path = row.image_path?.trim() ? row.image_path : "";
  return {
    id: Number(row.id),
    title: row.title,
    summary: row.summary,
    story: row.story,
    price: Number(row.price),
    category: row.category,
    origin: row.origin ?? "",
    image: path || (flag(row.has_upload) ? `/media/${Number(row.id)}` : ""),
    available: flag(row.available),
    featured: flag(row.featured),
  };
}

async function db(): Promise<Sql> {
  return getSql();
}

async function ensureShop(sql: Sql): Promise<void> {
  await sql`
    insert into shop (id, name, tagline, about, city, currency)
    values (
      1,
      'رِواق',
      'بضاعتك معروضة، والباب مفتوح للكل',
      'رواق رف واحد لبضاعة مختارة. اللي يفتح الصفحة يشوف نفس المعرض.',
      '',
      'USD'
    )
    on conflict (id) do nothing
  `;
}

async function readShop(sql: Sql): Promise<Shop> {
  await ensureShop(sql);
  const rows = await sql<ShopRow>`
    select name, tagline, about, city, whatsapp, currency,
           (key_hash is not null) as has_key
    from shop where id = 1
  `;
  const row = rows[0];
  if (!row) throw new ShopError("تعريف المحل مش موجود");
  return mapShop(row);
}

async function requireKey(sql: Sql, key: string): Promise<string | null> {
  const rows = await sql<{ key_hash: string | null }>`select key_hash from shop where id = 1`;
  const hash = rows[0]?.key_hash;
  if (!hash) return "فعّل كلمة سر المحل أولاً";
  if (!hashEquals(hash, key)) return "كلمة السر غلط";
  return null;
}

function fail(error: unknown): Result {
  if (error instanceof ShopError) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: "ما قدرنا نحفظ. جرّب مرة ثانية." };
}

export async function readCatalog(): Promise<Catalog> {
  const sql = await db();
  const shop = await readShop(sql);
  const products = await sql<ProductRow>`
    select id, title, summary, story, price, category, origin, image_path,
           (image_data is not null) as has_upload, available, featured
    from products
    order by featured desc, sort_order asc, id asc
  `;
  return { shop, products: products.map(mapProduct) };
}

export async function readProduct(id: number): Promise<ProductPage | null> {
  const sql = await db();
  const shop = await readShop(sql);
  const rows = await sql<ProductRow>`
    select id, title, summary, story, price, category, origin, image_path,
           (image_data is not null) as has_upload, available, featured
    from products
    where id = ${id}
  `;
  const row = rows[0];
  if (!row) return null;
  const product = mapProduct(row);
  const relatedRows = await sql<ProductRow>`
    select id, title, summary, story, price, category, origin, image_path,
           (image_data is not null) as has_upload, available, featured
    from products
    where id <> ${id}
    order by (category = ${product.category}) desc, featured desc, sort_order asc, id asc
    limit 3
  `;
  return { shop, product, related: relatedRows.map(mapProduct) };
}

export async function readImage(
  id: number,
): Promise<{ kind: "bytes"; type: string; bytes: Uint8Array } | { kind: "path"; path: string } | null> {
  const sql = await db();
  const rows = await sql<{ image_data: string | null; image_path: string | null }>`
    select image_data, image_path from products where id = ${id}
  `;
  const row = rows[0];
  if (!row) return null;
  if (row.image_data) {
    const match = IMAGE_RE.exec(row.image_data);
    if (!match) return null;
    const type = `image/${match[1] ?? "jpeg"}`;
    const b64 = row.image_data.slice(row.image_data.indexOf(",") + 1);
    return { kind: "bytes", type, bytes: Buffer.from(b64, "base64") };
  }
  if (row.image_path) return { kind: "path", path: row.image_path };
  return null;
}

export async function setShopKey(key: string): Promise<Result> {
  try {
    const sql = await db();
    await ensureShop(sql);
    const rows = await sql<{ id: number }>`
      update shop
      set key_hash = ${hashKey(key)}, updated_at = now()
      where id = 1 and key_hash is null
      returning id
    `;
    if (!rows[0]) return { ok: false, error: "انحطت كلمة سر قبل هلق." };
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function checkShopKey(key: string): Promise<Result> {
  try {
    const sql = await db();
    await ensureShop(sql);
    const problem = await requireKey(sql, key);
    if (problem) return { ok: false, error: problem };
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function saveShop(input: ShopInput): Promise<Result> {
  try {
    const sql = await db();
    await ensureShop(sql);
    const problem = await requireKey(sql, input.key);
    if (problem) return { ok: false, error: problem };
    if (!CURRENCY_IDS.includes(input.currency as (typeof CURRENCY_IDS)[number])) {
      throw new ShopError("العملة مش مدعومة");
    }
    const phone = normalizePhone(input.whatsapp);
    await sql`
      update shop set
        name = ${input.name},
        tagline = ${input.tagline},
        about = ${input.about},
        city = ${input.city},
        whatsapp = ${phone},
        currency = ${input.currency},
        updated_at = now()
      where id = 1
    `;
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function saveProduct(input: ProductInput): Promise<Result> {
  try {
    const sql = await db();
    await ensureShop(sql);
    const problem = await requireKey(sql, input.key);
    if (problem) return { ok: false, error: problem };
    const image = input.imageData.trim();
    if (image && !IMAGE_RE.test(image)) throw new ShopError("الصورة ما انقبلت. جرّب JPG.");
    if (input.id) {
      const existing = await sql<{ id: number }>`select id from products where id = ${input.id}`;
      if (!existing[0]) return { ok: false, error: "القطعة مش موجودة" };
      if (image) {
        await sql`
          update products set
            title = ${input.title},
            summary = ${input.summary},
            story = ${input.story},
            price = ${input.price},
            category = ${input.category},
            origin = ${input.origin},
            available = ${input.available},
            featured = ${input.featured},
            image_data = ${image},
            image_path = null
          where id = ${input.id}
        `;
      } else {
        await sql`
          update products set
            title = ${input.title},
            summary = ${input.summary},
            story = ${input.story},
            price = ${input.price},
            category = ${input.category},
            origin = ${input.origin},
            available = ${input.available},
            featured = ${input.featured}
          where id = ${input.id}
        `;
      }
      return { ok: true };
    }
    if (!image) throw new ShopError("حط صورة للقطعة");
    const counts = await sql<{ n: number }>`select count(*)::int as n from products`;
    if (Number(counts[0]?.n ?? 0) >= MAX_PRODUCTS) {
      throw new ShopError("المعرض امتلأ. احذف قطعة قبل ما تضيف.");
    }
    await sql`
      insert into products (
        title, summary, story, price, category, origin,
        image_path, image_data, available, featured, sort_order
      ) values (
        ${input.title}, ${input.summary}, ${input.story}, ${input.price},
        ${input.category}, ${input.origin}, null, ${image},
        ${input.available}, ${input.featured}, 0
      )
    `;
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function removeProduct(id: number, key: string): Promise<Result> {
  try {
    const sql = await db();
    await ensureShop(sql);
    const problem = await requireKey(sql, key);
    if (problem) return { ok: false, error: problem };
    const rows = await sql<{ id: number }>`
      delete from products where id = ${id} returning id
    `;
    if (!rows[0]) return { ok: false, error: "القطعة مش موجودة" };
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
