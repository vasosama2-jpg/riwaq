import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Shell } from "@/components/shell";
import { fetchProduct } from "@/lib/catalog";
import { addToCart, useCart } from "@/lib/cart";
import { categoryLabel, formatPrice, orderMessage, whatsappLink } from "@/lib/shop";

export const Route = createFileRoute("/product/$productId")({
  loader: async ({ params }) => {
    const id = Number(params.productId);
    if (!Number.isInteger(id) || id <= 0) throw notFound();
    const page = await fetchProduct({ data: { id } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.title} — ${loaderData.shop.name}` },
          { name: "description", content: loaderData.product.summary },
        ]
      : [{ title: "رواق" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { shop, product, related } = Route.useLoaderData();
  const lines = useCart();
  const inCart = lines.find((line) => line.id === product.id);
  const [added, setAdded] = useState(false);
  const [broken, setBroken] = useState(false);
  const ask = whatsappLink(
    shop.whatsapp,
    orderMessage(shop.name, shop.currency, [{ title: product.title, qty: 1, price: product.price }]),
  );

  return (
    <Shell shop={shop}>
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-6">
        <p className="text-sm text-muted">
          <Link to="/" className="underline-offset-4 hover:underline">
            الأقسام
          </Link>
          <span aria-hidden="true"> / </span>
          <Link
            to="/section/$category"
            params={{ category: product.category }}
            className="underline-offset-4 hover:underline"
          >
            {categoryLabel(product.category)}
          </Link>
        </p>
        <div className="mt-4 grid items-start gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-surface">
            {product.image && !broken ? (
              <img
                src={product.image}
                alt={product.title}
                className="aspect-product w-full object-cover"
                onError={() => setBroken(true)}
              />
            ) : (
              <div className="flex aspect-product items-center justify-center font-display text-6xl text-muted">
                {product.title.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-5xl">{product.title}</h1>
            <p className="mt-3 text-lg">{product.summary}</p>
            <p className="mt-4 font-display text-4xl tabular-nums text-primary">
              {formatPrice(product.price, shop.currency)}
            </p>
            <p className="mt-2 text-sm text-muted">
              {categoryLabel(product.category)}
              {product.origin ? ` · ${product.origin}` : ""}
              {product.available ? "" : " · خلصت من الرف"}
            </p>
            {product.story ? (
              <p className="mt-6 max-w-xl whitespace-pre-line leading-relaxed text-ink">{product.story}</p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!product.available}
                onClick={() => {
                  addToCart({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                  });
                  setAdded(true);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-primary-fg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50"
              >
                {!product.available
                  ? "غير متوفرة"
                  : added || inCart
                    ? `بالطلب${inCart ? ` · ${inCart.qty}` : ""}`
                    : "أضف للطلب"}
              </button>
              {ask ? (
                <a
                  href={ask}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 transition-transform duration-150 ease-out active:scale-[0.96]"
                >
                  اسأل عنها على واتساب
                </a>
              ) : null}
            </div>
          </div>
        </div>
        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-3xl">كمان على الرف</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} currency={shop.currency} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </Shell>
  );
}
