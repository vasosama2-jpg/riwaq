import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { cartCount, setCartQty, useCart } from "@/lib/cart";
import { formatPrice, orderMessage, whatsappLink, type Shop } from "@/lib/shop";

export function Shell({ shop, children }: { shop: Shop; children: ReactNode }) {
  const lines = useCart();
  const count = cartCount(lines);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const message = orderMessage(shop.name, shop.currency, lines);
  const wa = whatsappLink(shop.whatsapp, message);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2"
      >
        تخطى للمحتوى
      </a>
      <div className="h-1 bg-primary" />
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="min-h-11 leading-none">
            <span className="block font-display text-3xl">{shop.name}</span>
            <span className="text-xs text-muted">{shop.city || "معرض مفتوح"}</span>
          </Link>
          <nav className="ms-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-ink"
            >
              الأقسام
            </Link>
            <Link
              to="/manage"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-ink"
            >
              إدارة المحل
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              الطلب
              <span className="tabular-nums text-primary">{count}</span>
            </button>
          </nav>
        </div>
      </header>
      <div id="content">{children}</div>
      <footer className="mx-auto mt-20 max-w-6xl border-t border-line px-4 py-10">
        <p className="font-display text-3xl">{shop.name}</p>
        <p className="mt-2 max-w-xl text-muted">{shop.tagline}</p>
        <p className="mt-4 text-sm text-muted">
          المعرض عام. أي حدا يفتح الرابط يشوف نفس البضاعة، ويقدر يجهّز طلب ويرسله للمحل.
        </p>
      </footer>
      {open ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="إغلاق الطلب"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 id={titleId} className="font-display text-3xl">
                الطلب
              </h2>
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-full"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {lines.length === 0 ? (
                <p className="text-muted">الطلب فاضي. اختار قطعة من المعرض.</p>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => (
                    <li key={line.id} className="flex gap-3">
                      {line.image ? (
                        <img
                          src={line.image}
                          alt=""
                          className="aspect-product w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="aspect-product w-16 rounded-xl bg-bg" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-xl leading-tight">{line.title}</p>
                        <p className="tabular-nums text-sm text-primary">
                          {formatPrice(line.price, shop.currency)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex size-11 items-center justify-center rounded-full border border-line"
                            aria-label="نقص الكمية"
                            onClick={() => setCartQty(line.id, line.qty - 1)}
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-6 text-center tabular-nums">{line.qty}</span>
                          <button
                            type="button"
                            className="inline-flex size-11 items-center justify-center rounded-full border border-line"
                            aria-label="زيد الكمية"
                            onClick={() => setCartQty(line.id, line.qty + 1)}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lines.length > 0 ? (
              <div className="border-t border-line px-4 py-4">
                <p className="mb-3 flex items-baseline justify-between">
                  <span className="text-muted">المجموع</span>
                  <span className="font-display text-3xl tabular-nums text-primary">
                    {formatPrice(total, shop.currency)}
                  </span>
                </p>
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-primary-fg transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    أرسل الطلب على واتساب
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => void copyOrder()}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-primary-fg transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    {copied ? "اننسخ الطلب" : "انسخ نص الطلب"}
                  </button>
                )}
                {!shop.whatsapp ? (
                  <p className="mt-2 text-sm text-muted">
                    حط رقم واتساب من إدارة المحل حتى يوصل الطلب برسالة جاهزة.
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
