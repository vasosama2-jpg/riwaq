import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { fetchCatalog } from "@/lib/catalog";
import { CATEGORIES, categoryLabel } from "@/lib/shop";

export const Route = createFileRoute("/")({
  loader: () => fetchCatalog(),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.shop.name} — الأقسام` : "رواق — الأقسام",
      },
      {
        name: "description",
        content: "واجهة بسيطة: اختار قسم، وشوف الأغراض اللي فيه.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { shop, products } = Route.useLoaderData();
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const sections = useMemo(() => {
    const counts = new Map<string, number>();
    const thumbs = new Map<string, string>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
      if (!thumbs.has(product.category) && product.image) thumbs.set(product.category, product.image);
    }
    const known = CATEGORIES.map((item) => item.id);
    const extra = [...counts.keys()].filter((id) => !known.includes(id as (typeof CATEGORIES)[number]["id"]));
    return [...known, ...extra]
      .map((id) => ({
        id,
        label: categoryLabel(id),
        count: counts.get(id) ?? 0,
        image: thumbs.get(id) ?? "",
      }))
      .filter((section) => section.count > 0);
  }, [products]);

  return (
    <Shell shop={shop}>
      <main className="mx-auto max-w-3xl px-4 pb-8 pt-8">
        <h1 className="font-display text-5xl">{shop.name}</h1>
        <p className="mt-2 text-muted">اختار قسم وتصفّح المنتجات التجريبية — لا توجد مبيعات حقيقية.</p>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                to="/section/$category"
                params={{ category: section.id }}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-line bg-surface p-3 transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                {section.image && !broken[section.id] ? (
                  <img
                    src={section.image}
                    alt=""
                    className="aspect-product w-16 rounded-xl object-cover"
                    onError={() => setBroken((current) => ({ ...current, [section.id]: true }))}
                  />
                ) : (
                  <div className="flex aspect-product w-16 items-center justify-center rounded-xl bg-bg font-display text-2xl text-muted">
                    {section.label.slice(0, 1)}
                  </div>
                )}
                <span className="min-w-0">
                  <span className="block font-display text-3xl leading-tight">{section.label}</span>
                  <span className="text-sm text-muted">
                    {section.count === 0 ? "فاضي" : `${section.count} أغراض`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">
          <Link to="/manage" className="text-ink underline-offset-4 hover:underline">
            إدارة المحل
          </Link>
          {" — معلومات عن تعديل النسخة التجريبية."}
        </p>
      </main>
    </Shell>
  );
}
