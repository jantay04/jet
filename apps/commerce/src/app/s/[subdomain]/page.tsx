import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

type StoreConfig = {
  theme?: { primary?: string; accent?: string };
  branding?: { tagline?: string };
};

export default async function StorefrontHome({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  const store = await prisma.store.findUnique({
    where: { subdomain },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!store || store.status !== "PUBLISHED") notFound();

  const config = (store.config ?? {}) as StoreConfig;
  const primary = config.theme?.primary ?? "#111827";

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: primary }}>
          {store.name}
        </h1>
        {config.branding?.tagline && (
          <p className="mt-2 text-lg text-gray-500">{config.branding.tagline}</p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {store.products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group rounded-xl border border-gray-200 p-4 transition hover:shadow-md"
          >
            {p.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.images[0]}
                alt={p.title}
                className="mb-4 aspect-square w-full rounded-lg object-cover"
              />
            )}
            <h2 className="font-medium">{p.title}</h2>
            <p className="mt-1 text-gray-600">
              {formatPrice(p.priceCents, p.currency)}
            </p>
          </Link>
        ))}
      </div>

      {store.products.length === 0 && (
        <p className="text-gray-500">This store has no products yet.</p>
      )}
    </main>
  );
}
