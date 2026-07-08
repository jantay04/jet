import { NextResponse, type NextRequest } from "next/server";
import { subdomainFromHost } from "@/lib/tenant";

// Multi-tenant routing (Next 16 "proxy" convention): requests to a store
// subdomain (demo.lvh.me) are internally rewritten to the storefront route
// /s/demo/*, while the root domain serves the JET dashboard/landing.
export function proxy(req: NextRequest) {
  const host = req.headers.get("host");
  const subdomain = subdomainFromHost(host);

  if (!subdomain) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/s/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and static assets.
  matcher: ["/((?!_next/|favicon.ico|.*\\.).*)"],
};
