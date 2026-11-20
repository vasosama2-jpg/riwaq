import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/media/$productId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.productId);
        if (!Number.isInteger(id) || id <= 0) {
          return new Response("bad id", { status: 400 });
        }
        const { readImage } = await import("@/lib/catalog.server");
        const image = await readImage(id);
        if (!image) return new Response("not found", { status: 404 });
        if (image.kind === "path") return Response.redirect(image.path, 302);
        const buffer = new ArrayBuffer(image.bytes.byteLength);
        new Uint8Array(buffer).set(image.bytes);
        return new Response(buffer, {
          headers: {
            "content-type": image.type,
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
