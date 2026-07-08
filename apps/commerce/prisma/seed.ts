import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "founder@jet.app" },
    update: {},
    create: { email: "founder@jet.app", name: "JET Founder" },
  });

  const store = await prisma.store.upsert({
    where: { subdomain: "demo" },
    update: {},
    create: {
      name: "Demo Store",
      subdomain: "demo",
      status: "PUBLISHED",
      ownerId: owner.id,
      config: {
        theme: { primary: "#111827", accent: "#6366f1", font: "Inter" },
        branding: { tagline: "The first store launched on JET." },
      },
      products: {
        create: [
          {
            title: "JET Tee",
            slug: "jet-tee",
            description: "Soft cotton tee with the JET mark.",
            priceCents: 2500,
            inventory: 100,
            images: ["https://picsum.photos/seed/jet-tee/600/600"],
          },
          {
            title: "JET Mug",
            slug: "jet-mug",
            description: "Ceramic mug for late-night shipping.",
            priceCents: 1500,
            inventory: 200,
            images: ["https://picsum.photos/seed/jet-mug/600/600"],
          },
          {
            title: "JET Sticker Pack",
            slug: "jet-sticker-pack",
            description: "Five vinyl stickers.",
            priceCents: 800,
            inventory: 500,
            images: ["https://picsum.photos/seed/jet-stickers/600/600"],
          },
        ],
      },
    },
  });

  console.log(`Seeded store "${store.name}" at ${store.subdomain} with 3 products.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
