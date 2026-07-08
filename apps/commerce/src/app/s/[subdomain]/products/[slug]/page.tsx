import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;

  const store = await prisma.store.findUnique({ where: { subdomain } });
  if (!store || store.status !== "PUBLISHED") notFound();

  const product = await prisma.product.findUnique({
    where: { storeId_slug: { storeId: store.id, slug } },
  });
  if (!product || product.status !== "ACTIVE") notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← {store.name}
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="aspect-square w-full rounded-xl object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
          <p className="mt-3 text-2xl text-gray-800">
            {formatPrice(product.priceCents, product.currency)}
          </p>
          {product.description && (
            <p className="mt-6 leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}
          <button
            className="mt-8 w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
            disabled={product.inventory <= 0}
          >
            {product.inventory > 0 ? "Add to cart" : "Sold out"}
          </button>
          <p className="mt-3 text-sm text-gray-400">
            {/* Checkout arrives in milestone 4 (Stripe). */}
            Checkout coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}
