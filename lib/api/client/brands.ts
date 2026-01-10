/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/client/brands.ts
import { BrandDivision } from "@/lib/db/schema";

export const brandsAPI = {
  // Get all brand divisions
  getAll: async (featured?: boolean) => {
    const url = featured ? `/api/brand?featured=true` : `/api/brand`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch brand divisions");
    }
    
    return response.json() as Promise<BrandDivision[]>;
  },

  // Get a brand division by ID
  getById: async (id: number) => {
    const response = await fetch(`/api/brand/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch brand division");
    }
    
    return response.json() as Promise<BrandDivision & { images: any[] }>;
  },

  // Get a brand division by slug
  getBySlug: async (slug: string) => {
    const response = await fetch(`/api/brand/slug/${slug}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch brand division");
    }
    
    return response.json() as Promise<BrandDivision & { images: any[] }>;
  },
};