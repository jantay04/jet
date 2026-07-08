import { prisma } from "@/lib/prisma";

// Placeholder auth. Until JET Auth (Clerk) lands, the dashboard operates as a
// single dev "owner". Replace with the authenticated user id later.
export async function getDevOwner() {
  return prisma.user.upsert({
    where: { email: "founder@jet.app" },
    update: {},
    create: { email: "founder@jet.app", name: "JET Founder" },
  });
}
