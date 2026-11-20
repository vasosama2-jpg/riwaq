import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { Shell } from "@/components/shell";
import { fetchCatalog } from "@/lib/catalog";
import { CATEGORIES, categoryLabel } from "@/lib/shop";

export const Route = createFileRoute("/section/$category")({
  loader: async ({ params }) => {
    const category = params.category;
    if (!category || category.length > 40) throw notFound();
    const catalog = await fetchCatalog();
    const known = CATEGORIES.some((item) => item.id === category);
    const products = catalog.products.filter((product) => product.category === category);
    if (!known && products.length === 0) throw notFound();
    return { shop: catalog.shop, category, products };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${categoryLabel(loaderData.category)} — ${loaderData.shop.name}`
          : "قسم",
      },
    ],
  }),
  component: SectionPage,
});

function SectionPage() {
  const { shop, category, products } = Route.useLoaderData();
  const label = categoryLabel(category);

  return (
    <Shell shop={shop}>
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-6">
        <p className="text-sm text-muted">
          <Link to="/" className="underline-offset-4 hover:underline">
            الأقسام
          </Link>
        </p>
        <h1 className="mt-2 font-display text-5xl">{label}</h1>
        <p className="mt-2 text-muted">
          {products.length === 0 ? "لسا ما في أغراض بهالقسم." : `${products.length} أغراض`}
        </p>
        {products.length === 0 ? (
          <p className="mt-8">
            <Link to="/manage" className="text-primary underline-offset-4 hover:underline">
              ضيف أول غرض من الإدارة
            </Link>
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id} className="min-w-0">
                <ProductCard product={product} currency={shop.currency} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </Shell>
  );
}
