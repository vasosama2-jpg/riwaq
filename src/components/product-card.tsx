import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { categoryLabel, formatPrice, type Product } from "@/lib/shop";

export function ProductCard({
  product,
  currency,
  featured = false,
}: {
  product: Product;
  currency: string;
  featured?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <Link
      to="/product/$productId"
      params={{ productId: String(product.id) }}
      className={
        featured
          ? "group grid items-center gap-6 lg:grid-cols-2"
          : "group block min-w-0"
      }
    >
      <div className="overflow-hidden rounded-2xl bg-surface">
        {product.image && !broken ? (
          <img
            src={product.image}
            alt={product.title}
            className="aspect-product w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex aspect-product items-center justify-center font-display text-5xl text-muted">
            {product.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className={featured ? "space-y-3" : "mt-3 space-y-1"}>
        {featured ? <p className="text-sm text-primary">على الرف الأول</p> : null}
        <h2 className={featured ? "font-display text-4xl" : "font-display text-2xl leading-tight"}>
          {product.title}
        </h2>
        {featured ? <p className="max-w-md text-muted">{product.summary}</p> : null}
        <p className="tabular-nums text-primary">{formatPrice(product.price, currency)}</p>
        <p className="text-sm text-muted">
          {categoryLabel(product.category)}
          {product.origin ? ` · ${product.origin}` : ""}
          {!product.available ? " · خلصت" : ""}
        </p>
      </div>
    </Link>
  );
}
