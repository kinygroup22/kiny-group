// lib/api/divisions.ts - Updated with order/reorder support
import { db } from "@/lib/db";
import { brandDivisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getDivisions() {
  return await db
    .select()
    .from(brandDivisions)
    .orderBy(asc(brandDivisions.order));
}

export async function getDivision(id: number) {
  const [division] = await db
    .select()
    .from(brandDivisions)
    .where(eq(brandDivisions.id, id))
    .limit(1);
  return division || null;
}

export async function getDivisionBySlug(slug: string) {
  try {
    const [division] = await db
      .select()
      .from(brandDivisions)
      .where(eq(brandDivisions.slug, slug))
      .limit(1);
    return division || null;
  } catch (error) {
    console.error("Error fetching division by slug:", error);
    return null;
  }
}

export async function reorderDivisions(orderedIds: number[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // Only admins and editors can reorder
  if (user.role !== "admin" && user.role !== "editor") {
    throw new Error("Permission denied");
  }

  // Update each division's order in a transaction-like manner
  const updates = orderedIds.map((id, index) =>
    db
      .update(brandDivisions)
      .set({ order: index, updatedAt: new Date() })
      .where(eq(brandDivisions.id, id))
  );

  await Promise.all(updates);

  return { success: true };
}

export async function createDivision(data: {
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  fullDescription: string;
  backgroundImage?: string;
  logo?: string;
  color?: string;
  stats?: {
    label1: string;
    value1: string;
    label2: string;
    value2: string;
    label3: string;
    value3: string;
    label4: string;
    value4: string;
  };
  services?: Array<{
    name: string;
    description: string;
  }>;
  achievements?: string[];
  team?: Array<{
    name: string;
    position: string;
  }>;
  theme?: {
    primary: string;
    bg: string;
    bgSolid: string;
    border: string;
    text: string;
    accent: string;
    hover: string;
    gradient: string;
  };
  featured?: boolean;
  order?: number;
  email?: string;
  whatsapp?: string;
  address?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  contactDescription?: string;
  buttonText?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // If no order specified, put at the end
  let order = data.order;
  if (order === undefined) {
    const existing = await getDivisions();
    order = existing.length;
  }

  const [newDivision] = await db
    .insert(brandDivisions)
    .values({
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      fullDescription: data.fullDescription,
      backgroundImage: data.backgroundImage,
      logo: data.logo,
      color: data.color,
      stats: data.stats || {
        label1: '',
        value1: '',
        label2: '',
        value2: '',
        label3: '',
        value3: '',
        label4: '',
        value4: '',
      },
      services: data.services || [],
      achievements: data.achievements || [],
      team: data.team || [],
      theme: data.theme || {
        primary: '',
        bg: '',
        bgSolid: '',
        border: '',
        text: '',
        accent: '',
        hover: '',
        gradient: '',
      },
      featured: data.featured || false,
      order,
      email: data.email || "info@kcifoundation.org",
      whatsapp: data.whatsapp || "+628123456789",
      address: data.address || "Jl. Tebet Timur Dalam II No.38B, Tebet,\nJakarta Selatan 12820",
      contactTitle: data.contactTitle || "Let's Connect",
      contactSubtitle: data.contactSubtitle || "Get in Touch",
      contactDescription: data.contactDescription || "Ready to start your journey with us? Our team is here to answer your questions and help you get started.",
      buttonText: data.buttonText || "Schedule Consultation",
      authorId: user.id,
    })
    .returning();

  return newDivision;
}

export async function updateDivision(
  id: number,
  data: {
    name?: string;
    slug?: string;
    tagline?: string;
    description?: string;
    fullDescription?: string;
    backgroundImage?: string;
    logo?: string;
    color?: string;
    stats?: {
      label1: string;
      value1: string;
      label2: string;
      value2: string;
      label3: string;
      value3: string;
      label4: string;
      value4: string;
    };
    services?: Array<{
      name: string;
      description: string;
    }>;
    achievements?: string[];
    team?: Array<{
      name: string;
      position: string;
    }>;
    theme?: {
      primary: string;
      bg: string;
      bgSolid: string;
      border: string;
      text: string;
      accent: string;
      hover: string;
      gradient: string;
    };
    featured?: boolean;
    order?: number;
    email?: string;
    whatsapp?: string;
    address?: string;
    contactTitle?: string;
    contactSubtitle?: string;
    contactDescription?: string;
    buttonText?: string;
  }
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const division = await getDivision(id);
  if (!division) {
    throw new Error("Division not found");
  }

  if (
    user.role === "editor" && 
    division.authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  const [updatedDivision] = await db
    .update(brandDivisions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(brandDivisions.id, id))
    .returning();

  return updatedDivision;
}

export async function deleteDivision(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  if (user.role !== "admin") {
    throw new Error("Permission denied");
  }

  await db.delete(brandDivisions).where(eq(brandDivisions.id, id));
  return { success: true };
}