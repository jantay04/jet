import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { addProduct } from "../actions";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "lvh.me:3000";

export default async function StoreDetail({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  if (!store) notFound();

  const addProductForStore = addProduct.bind(null, store.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
        ← All stores
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
        <a
          href={`http://${store.subdomain}.${APP_DOMAIN}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          View storefront ↗
        </a>
      </div>

      <h2 className="mt-12 font-semibold">Products</h2>
      <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
        {store.products.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-5 py-3">
            <span>{p.title}</span>
            <span className="text-gray-500">
              {formatPrice(p.priceCents, p.currency)} · {p.inventory} in stock
            </span>
          </li>
        ))}
        {store.products.length === 0 && (
          <li className="px-5 py-3 text-gray-500">No products yet.</li>
        )}
      </ul>

      <form
        action={addProductForStore}
        className="mt-10 space-y-4 rounded-xl border border-gray-200 p-6"
      >
        <h2 className="font-semibold">Add a product</h2>
        <div>
          <label className="block text-sm text-gray-600">Title</label>
          <input
            name="title"
            required
            placeholder="Blue Hoodie"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600">Price (USD)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600">Inventory</label>
            <input
              name="inventory"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Description</label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <button className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-700">
          Add product
        </button>
      </form>
    </main>
  );
}
