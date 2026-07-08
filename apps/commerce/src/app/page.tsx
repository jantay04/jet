import Link from "next/link";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "lvh.me:3000";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        JET Commerce
      </p>
      <h1 className="mt-3 text-5xl font-bold tracking-tight">
        Launch an online store in minutes.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-gray-600">
        The foundation product of JET — pick a name, add products, publish. AI,
        agents, and one-click deploy come next.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
        >
          Open dashboard
        </Link>
        <a
          href={`http://demo.${APP_DOMAIN}`}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-50"
        >
          View demo store ↗
        </a>
      </div>
    </main>
  );
}
