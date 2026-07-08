import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDevOwner } from "@/lib/owner";
import { createStore } from "./actions";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "lvh.me:3000";

// Reads from the database on every request — never prerender at build time
// (there's no DB reachable during the Vercel build).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const owner = await getDevOwner();
  const stores = await prisma.store.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Your stores</h1>

      <ul className="mt-8 space-y-3">
        {stores.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-5 py-4"
          >
            <div>
              <Link href={`/dashboard/${s.id}`} className="font-medium hover:underline">
                {s.name}
              </Link>
              <p className="text-sm text-gray-500">
                {s._count.products} products ·{" "}
                <a
                  href={`http://${s.subdomain}.${APP_DOMAIN}`}
                  className="text-indigo-600 hover:underline"
                >
                  {s.subdomain}.{APP_DOMAIN}
                </a>
              </p>
            </div>
            <span className="text-xs uppercase tracking-wide text-gray-400">
              {s.status}
            </span>
          </li>
        ))}
        {stores.length === 0 && (
          <li className="text-gray-500">No stores yet — create your first one below.</li>
        )}
      </ul>

      <form action={createStore} className="mt-12 space-y-4 rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold">Create a store</h2>
        <div>
          <label className="block text-sm text-gray-600">Store name</label>
          <input
            name="name"
            required
            placeholder="Acme Goods"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">
            Subdomain (leave blank to derive from name)
          </label>
          <input
            name="subdomain"
            placeholder="acme"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <button className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-700">
          Create store
        </button>
      </form>
    </main>
  );
}
