"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDevOwner } from "@/lib/owner";
import { slugify } from "@/lib/slug";

export async function createStore(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const subdomain = slugify(String(formData.get("subdomain") ?? "") || name);
  if (!name || !subdomain) return;

  const owner = await getDevOwner();

  const existing = await prisma.store.findUnique({ where: { subdomain } });
  if (existing) throw new Error(`Subdomain "${subdomain}" is taken.`);

  const store = await prisma.store.create({
    data: {
      name,
      subdomain,
      ownerId: owner.id,
      status: "PUBLISHED", // published by default for MVP; add draft flow later
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${store.id}`);
}

export async function addProduct(storeId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const priceDollars = Number(formData.get("price") ?? 0);
  if (!title) return;

  const slug = slugify(title);

  await prisma.product.create({
    data: {
      storeId,
      title,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      priceCents: Math.round((isFinite(priceDollars) ? priceDollars : 0) * 100),
      inventory: Number(formData.get("inventory") ?? 0) || 0,
      images: [`https://picsum.photos/seed/${slug}/600/600`],
    },
  });

  revalidatePath(`/dashboard/${storeId}`);
}
