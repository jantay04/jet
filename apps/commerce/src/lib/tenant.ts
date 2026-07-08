// Resolve a store's subdomain from an incoming request Host header.
//
// Local dev: use lvh.me (and *.lvh.me), which resolve to 127.0.0.1 — so
// `demo.lvh.me:3000` hits your local server as subdomain "demo".
// Prod: `demo.jet.app` → subdomain "demo"; custom domains handled later (JET Cloud).

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "lvh.me:3000";

// Hostnames on the root domain that are NOT tenants (the app itself).
const RESERVED = new Set(["www", "app", "admin", "api"]);

/** Returns the store subdomain for a host, or null if it's the root/app domain. */
export function subdomainFromHost(host: string | null): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0].toLowerCase();
  const rootHostname = APP_DOMAIN.split(":")[0].toLowerCase();

  if (hostname === rootHostname) return null; // root domain → app, not a store
  if (!hostname.endsWith(`.${rootHostname}`)) return null; // unrelated host

  const label = hostname.slice(0, -(rootHostname.length + 1));
  const sub = label.split(".")[0]; // left-most label
  if (!sub || RESERVED.has(sub)) return null;

  return sub;
}
