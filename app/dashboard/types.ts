// app/dashboard/types.ts
export type Activity = {
  id: string;
  type: 'post' | 'comment' | 'user' | 'brand';
  action: string;
  time: string;
  user: string;
  userEmail?: string;
  createdAt: Date;
  details?: {
    title?: string;
    slug?: string;
    published?: Date | null;
    content?: string;
    postTitle?: string | null;  // Allow null
    postSlug?: string | null;   // Allow null
    postId?: number;            // Changed from string to number to match database
    userName?: string | null;   // Allow null
    userEmail?: string | null;  // Allow null
    role?: string;
    name?: string;
  };
};

export type GroupedActivities = {
  [key: string]: Activity[];
};

export type ActivityCounts = {
  all: number;
  post: number;
  comment: number;
  user: number;
  brand: number;
};