// lib/utils/data-transformers.ts
import type { BlogPost as DBBlogPost } from "@/lib/db/schema";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured: boolean;
  category?: string;
  readTime: number;
  publishedAt?: Date;
}

export function transformDbPostToFormPost(dbPost: DBBlogPost): BlogPost {
  return {
    id: dbPost.id,
    title: dbPost.title,
    slug: dbPost.slug,
    excerpt: dbPost.excerpt || undefined,
    content: dbPost.content,
    featured: dbPost.featured || false,
    category: dbPost.category || undefined,
    readTime: dbPost.readTime || 5,
    publishedAt: dbPost.publishedAt || undefined,
  };
}