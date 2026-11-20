import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { fetchCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/manage")({
  loader: () => fetchCatalog(),
  component: ManageDemo,
});
function ManageDemo() {
  const { shop } = Route.useLoaderData();
  return <Shell shop={shop}><main className="mx-auto max-w-3xl px-4 py-12">
    <h1 className="font-display text-4xl">لوحة الإدارة التجريبية</h1>
    <p className="mt-6 text-lg">هذه نسخة للتعلّم فقط. لا توجد قاعدة بيانات أو تسجيل دخول أو حفظ للطلبات.</p>
    <p className="mt-4">لتعديل المنتجات والأسعار والصور، افتح الملف <code>src/lib/catalog.server.ts</code> في المشروع وعدّل البيانات التجريبية، ثم ارفع التعديل عبر GitHub Desktop.</p>
    <Link to="/" className="mt-8 inline-block underline">العودة للمتجر</Link>
  </main></Shell>;
}
