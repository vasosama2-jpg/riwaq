import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Shell } from "@/components/shell";
import {
  checkManageKey,
  deleteProduct,
  fetchCatalog,
  setManageKey,
  updateProduct,
  updateShop,
} from "@/lib/catalog";
import { clearCart } from "@/lib/cart";
import { clearManageKey, readManageKey, writeManageKey } from "@/lib/manage-session";
import {
  CATEGORIES,
  CURRENCIES,
  categoryLabel,
  formatPrice,
  type Product,
  type Shop,
} from "@/lib/shop";

export const Route = createFileRoute("/manage")({
  loader: () => fetchCatalog(),
  head: () => ({
    meta: [{ title: "إدارة المحل — رواق" }],
  }),
  component: ManagePage,
});

const fieldClass =
  "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-ink outline-none";

function ManagePage() {
  const { shop, products } = Route.useLoaderData();
  const router = useRouter();
  const [key, setKey] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shop.hasKey) {
      setReady(true);
      return;
    }
    const saved = readManageKey();
    if (!saved) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void checkManageKey({ data: { key: saved } }).then((result) => {
      if (cancelled) return;
      if (result.ok) setKey(saved);
      else clearManageKey();
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [shop.hasKey]);

  function lock() {
    clearManageKey();
    setKey("");
    setError("");
  }

  function noteAuth(message: string) {
    if (message.includes("كلمة السر")) {
      clearManageKey();
      setKey("");
    }
    setError(message);
  }

  return (
    <Shell shop={shop}>
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-primary">لوحة المحل</p>
            <h1 className="font-display text-5xl">إدارة البضاعة</h1>
          </div>
          {key ? (
            <button type="button" onClick={lock} className="min-h-11 rounded-full px-3 text-sm text-muted">
              اقفل الإدارة
            </button>
          ) : null}
        </div>
        <p className="mt-3 max-w-2xl text-muted">
          المعرض عام: أي حدا يفتح الرابط يشوف نفس القطع. كلمة السر بس بتمنع التعديل، مش بتسكر المشاهدة.
          احفظها، ما في استرجاع من غير ما نضيف تسجيل دخول.
        </p>
        {error ? <p className="mt-4 text-primary">{error}</p> : null}

        {!ready ? (
          <p className="mt-10 text-muted">عم نفتح اللوحة…</p>
        ) : !shop.hasKey ? (
          <Setup
            onDone={async (next) => {
              writeManageKey(next);
              setKey(next);
              setError("");
              await router.invalidate();
            }}
            onError={setError}
          />
        ) : !key ? (
          <Unlock
            onDone={(next) => {
              writeManageKey(next);
              setKey(next);
              setError("");
            }}
            onError={setError}
          />
        ) : (
          <Panel
            shop={shop}
            products={products}
            manageKey={key}
            onError={noteAuth}
            onSaved={() => {
              setError("");
              return router.invalidate();
            }}
          />
        )}
      </main>
    </Shell>
  );
}

function Setup({
  onDone,
  onError,
}: {
  onDone: (key: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [key, setKey] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await setManageKey({ data: { key } });
    setPending(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    await onDone(key.trim());
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="mt-10 max-w-md space-y-3">
      <h2 className="font-display text-3xl">حط كلمة سر للمحل</h2>
      <p className="text-sm text-muted">أول ما تنحط، ما حدا غيرك بيقدر يضيف أو يعدّل أو يحذف.</p>
      <label className="block text-sm text-muted" htmlFor="new-key">
        كلمة السر
      </label>
      <input
        id="new-key"
        type="password"
        autoComplete="new-password"
        value={key}
        minLength={4}
        onChange={(event) => setKey(event.target.value)}
        className={fieldClass}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-primary-fg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50"
      >
        {pending ? "عم نحفظ…" : "فعّل الإدارة"}
      </button>
    </form>
  );
}

function Unlock({
  onDone,
  onError,
}: {
  onDone: (key: string) => void;
  onError: (message: string) => void;
}) {
  const [key, setKey] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await checkManageKey({ data: { key } });
    setPending(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onDone(key.trim());
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="mt-10 max-w-md space-y-3">
      <h2 className="font-display text-3xl">ادخل كلمة السر</h2>
      <label className="block text-sm text-muted" htmlFor="key">
        كلمة سر المحل
      </label>
      <input
        id="key"
        type="password"
        autoComplete="current-password"
        value={key}
        onChange={(event) => setKey(event.target.value)}
        className={fieldClass}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-bg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50"
      >
        {pending ? "عم نتأكد…" : "افتح اللوحة"}
      </button>
    </form>
  );
}

function Panel({
  shop,
  products,
  manageKey,
  onError,
  onSaved,
}: {
  shop: Shop;
  products: Product[];
  manageKey: string;
  onError: (message: string) => void;
  onSaved: () => Promise<unknown>;
}) {
  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-5">
      <ShopForm shop={shop} manageKey={manageKey} onError={onError} onSaved={onSaved} />
      <div className="space-y-10 lg:col-span-3">
        <ProductEditor
          manageKey={manageKey}
          currency={shop.currency}
          onError={onError}
          onSaved={onSaved}
        />
        <ProductList
          products={products}
          currency={shop.currency}
          manageKey={manageKey}
          onError={onError}
          onSaved={onSaved}
        />
      </div>
    </div>
  );
}

function ShopForm({
  shop,
  manageKey,
  onError,
  onSaved,
}: {
  shop: Shop;
  manageKey: string;
  onError: (message: string) => void;
  onSaved: () => Promise<unknown>;
}) {
  const [name, setName] = useState(shop.name);
  const [tagline, setTagline] = useState(shop.tagline);
  const [about, setAbout] = useState(shop.about);
  const [city, setCity] = useState(shop.city);
  const [whatsapp, setWhatsapp] = useState(shop.whatsapp);
  const [currency, setCurrency] = useState(shop.currency);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setName(shop.name);
    setTagline(shop.tagline);
    setAbout(shop.about);
    setCity(shop.city);
    setWhatsapp(shop.whatsapp);
    setCurrency(shop.currency);
  }, [shop]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setNote("");
    const result = await updateShop({
      data: {
        key: manageKey,
        name,
        tagline,
        about,
        city,
        whatsapp,
        currency: currency as (typeof CURRENCIES)[number]["id"],
      },
    });
    setPending(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    if (currency !== shop.currency) clearCart();
    setNote("انحفظ تعريف المحل");
    await onSaved();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3 lg:col-span-2">
      <h2 className="font-display text-3xl">تعريف المحل</h2>
      <Field label="الاسم" value={name} onChange={setName} />
      <Field label="سطر تحت الاسم" value={tagline} onChange={setTagline} />
      <Field label="نبذة" value={about} onChange={setAbout} multiline />
      <Field label="المدينة" value={city} onChange={setCity} />
      <Field
        label="واتساب مع رمز البلد"
        value={whatsapp}
        onChange={setWhatsapp}
        placeholder="9639xxxxxxx"
        inputMode="tel"
      />
      <label className="block text-sm text-muted">
        العملة
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          {CURRENCIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-bg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50"
      >
        {pending ? "عم نحفظ…" : "احفظ المحل"}
      </button>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </form>
  );
}

function ProductEditor({
  manageKey,
  currency,
  product,
  onError,
  onSaved,
  onCancel,
}: {
  manageKey: string;
  currency: string;
  product?: Product;
  onError: (message: string) => void;
  onSaved: () => Promise<unknown>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [story, setStory] = useState(product?.story ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const preset = CATEGORIES.some((item) => item.id === product?.category);
  const [category, setCategory] = useState(product ? (preset ? product.category : "__custom") : "bags");
  const [customCategory, setCustomCategory] = useState(product && !preset ? product.category : "");
  const [origin, setOrigin] = useState(product?.origin ?? "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [imageData, setImageData] = useState("");
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) {
      setImageData("");
      return;
    }
    try {
      setImageData(await compressImage(file));
      setNote("");
    } catch (error) {
      setImageData("");
      onError(error instanceof Error ? error.message : "الصورة ما انفتحت");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(price);
    if (!Number.isInteger(amount)) {
      onError("السعر لازم يكون رقم صحيح، من غير فاصلة");
      return;
    }
    const chosen = category === "__custom" ? customCategory.trim() : category;
    setPending(true);
    setNote("");
    const result = await updateProduct({
      data: {
        key: manageKey,
        id: product?.id,
        title,
        summary,
        story,
        price: amount,
        category: chosen,
        origin,
        available,
        featured,
        imageData,
      },
    });
    setPending(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    setNote(product ? "انعدّلت القطعة" : "انضافت القطعة");
    if (!product) {
      setTitle("");
      setSummary("");
      setStory("");
      setPrice("");
      setOrigin("");
      setImageData("");
      setFeatured(false);
      setAvailable(true);
    }
    await onSaved();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3">
      <h2 className="font-display text-3xl">{product ? "تعديل القطعة" : "قطعة جديدة"}</h2>
      <Field label="الاسم" value={title} onChange={setTitle} />
      <Field label="سطر قصير" value={summary} onChange={setSummary} />
      <Field label="التفاصيل" value={story} onChange={setStory} multiline />
      <Field label={`السعر (${currency})`} value={price} onChange={setPrice} inputMode="numeric" />
      <label className="block text-sm text-muted">
        التصنيف
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
          <option value="__custom">تصنيف ثاني</option>
        </select>
      </label>
      {category === "__custom" ? (
        <Field label="اسم التصنيف" value={customCategory} onChange={setCustomCategory} />
      ) : null}
      <Field label="المصدر" value={origin} onChange={setOrigin} />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={available}
          onChange={(event) => setAvailable(event.target.checked)}
        />
        متوفرة على الرف
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
        />
        تبيّن بأول المعرض
      </label>
      <label className="block text-sm text-muted">
        {product ? "صورة جديدة (اختياري)" : "صورة القطعة"}
        <input
          type="file"
          accept="image/*"
          required={!product}
          onChange={(event) => void onFile(event.target.files?.[0])}
          className="mt-1 block w-full text-sm"
        />
      </label>
      {imageData ? (
        <img src={imageData} alt="" className="aspect-product w-32 rounded-xl object-cover" />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-primary-fg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50"
        >
          {pending ? "عم نحفظ…" : product ? "احفظ التعديل" : "أضف للرف"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="min-h-11 rounded-full px-4 text-sm">
            إلغاء
          </button>
        ) : null}
      </div>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </form>
  );
}

function ProductList({
  products,
  currency,
  manageKey,
  onError,
  onSaved,
}: {
  products: Product[];
  currency: string;
  manageKey: string;
  onError: (message: string) => void;
  onSaved: () => Promise<unknown>;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function remove(id: number) {
    const result = await deleteProduct({ data: { id, key: manageKey } });
    if (!result.ok) {
      onError(result.error);
      return;
    }
    setConfirmId(null);
    setEditing(null);
    await onSaved();
  }

  return (
    <section>
      <h2 className="font-display text-3xl">الرف الحالي</h2>
      <ul className="mt-4 divide-y divide-line">
        {products.map((product) => (
          <li key={product.id} className="py-4">
            <div className="flex gap-3">
              {product.image ? (
                <img src={product.image} alt="" className="aspect-product w-16 rounded-xl object-cover" />
              ) : (
                <div className="aspect-product w-16 rounded-xl bg-bg" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl leading-tight">{product.title}</p>
                <p className="text-sm text-muted">
                  {categoryLabel(product.category)} ·{" "}
                  <span className="tabular-nums">{formatPrice(product.price, currency)}</span>
                  {product.available ? "" : " · مخفية عن الزبون"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="min-h-11 rounded-full border border-line px-4 text-sm"
                    onClick={() => setEditing(editing === product.id ? null : product.id)}
                  >
                    {editing === product.id ? "سكر التعديل" : "تعديل"}
                  </button>
                  {confirmId === product.id ? (
                    <button
                      type="button"
                      className="min-h-11 rounded-full px-4 text-sm text-primary"
                      onClick={() => void remove(product.id)}
                    >
                      تأكيد الحذف
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="min-h-11 rounded-full px-4 text-sm text-muted"
                      onClick={() => setConfirmId(product.id)}
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
            {editing === product.id ? (
              <div className="mt-4 border-t border-line pt-4">
                <ProductEditor
                  manageKey={manageKey}
                  currency={currency}
                  product={product}
                  onError={onError}
                  onSaved={onSaved}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  inputMode?: "text" | "tel" | "numeric";
}) {
  const id = useId();
  return (
    <label className="block text-sm text-muted" htmlFor={id}>
      {label}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={`${fieldClass} mt-1 py-3`}
        />
      ) : (
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClass} mt-1`}
        />
      )}
    </label>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxEdge = 1200;
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("المتصفح ما قدر يقرأ الصورة"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      let quality = 0.82;
      let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > 900_000 && quality > 0.5) {
        quality -= 0.1;
        data = canvas.toDataURL("image/jpeg", quality);
      }
      if (data.length > 1_100_000) {
        reject(new Error("الصورة كبيرة. اختار صورة أصغر"));
        return;
      }
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("هالصورة ما انفتحت. جرّب JPG"));
    };
    image.src = url;
  });
}
