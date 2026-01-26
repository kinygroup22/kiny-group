/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/posts.ts
import { db } from "@/lib/db";
import { blogPosts, eventRegistrations, users } from "@/lib/db/schema";
import { eq, and, gte, lte, count, desc, inArray, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function getPosts() {
  return await db.select().from(blogPosts);
}

export async function getPost(id: number) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return post;
}

export async function getPostBySlug(slug: string) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  return post;
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured?: boolean;
  category?: string;
  readTime?: number;
  published?: boolean;
  isEvent?: boolean;
  eventStartDate?: Date;
  eventEndDate?: Date;
  eventLocation?: string;
  eventMaxParticipants?: number;
  eventRegistrationForm?: Array<{
    name: string;
    label: string;
    type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date";
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const [newPost] = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured: data.featured || false,
      category: data.category,
      readTime: data.readTime || 5,
      publishedAt: data.published ? new Date() : null,
      isEvent: data.isEvent || false,
      eventStartDate: data.eventStartDate,
      eventEndDate: data.eventEndDate,
      eventLocation: data.eventLocation,
      eventMaxParticipants: data.eventMaxParticipants,
      eventRegistrationForm: data.eventRegistrationForm || [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
        { name: "phone", label: "Phone Number", type: "tel", required: false, placeholder: "Enter your phone number" },
        { name: "age", label: "Age", type: "number", required: true, placeholder: "Enter your age" }
      ],
      authorId: user.id,
    })
    .returning();

  return newPost;
}

export async function updatePost(
  id: number,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featured?: boolean;
    category?: string;
    readTime?: number;
    published?: boolean;
    isEvent?: boolean;
    eventStartDate?: Date;
    eventEndDate?: Date;
    eventLocation?: string;
    eventMaxParticipants?: number;
    eventIsActive?: boolean;
    eventRegistrationForm?: Array<{
      name: string;
      label: string;
      type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date";
      required: boolean;
      options?: string[];
      placeholder?: string;
    }>;
  }
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  if (!post) {
    throw new Error("Post not found");
  }

  if (user.role === "contributor" && post.authorId !== user.id) {
    throw new Error("Permission denied");
  }

  const [updatedPost] = await db
    .update(blogPosts)
    .set({
      ...data,
      publishedAt: data.published !== undefined 
        ? (data.published ? new Date() : null) 
        : post.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();

  return updatedPost;
}

export async function deletePost(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  if (user.role !== "admin" && user.role !== "editor") {
    throw new Error("Permission denied");
  }

  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return { success: true };
}

// ==================== EVENT FUNCTIONS ====================

/**
 * Get all active events with registration counts
 */
export async function getActiveEvents() {
  const now = new Date();
  const events = await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .where(
      and(
        eq(blogPosts.isEvent, true),
        eq(blogPosts.eventIsActive, true),
        gte(blogPosts.eventEndDate, now)
      )
    )
    .orderBy(desc(blogPosts.eventStartDate));

  // Get registration counts for each event
  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const [{ count: registrationCount }] = await db
        .select({ count: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.postId, event.post.id));

      return {
        ...event,
        registrationCount,
        spotsRemaining: event.post.eventMaxParticipants 
          ? event.post.eventMaxParticipants - registrationCount 
          : null,
        isFull: event.post.eventMaxParticipants 
          ? registrationCount >= event.post.eventMaxParticipants 
          : false,
      };
    })
  );

  return eventsWithCounts;
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents() {
  const now = new Date();
  return await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .where(
      and(
        eq(blogPosts.isEvent, true),
        eq(blogPosts.eventIsActive, true),
        gte(blogPosts.eventStartDate, now)
      )
    )
    .orderBy(blogPosts.eventStartDate);
}

/**
 * Get past events
 */
export async function getPastEvents() {
  const now = new Date();
  return await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .where(
      and(
        eq(blogPosts.isEvent, true),
        eq(blogPosts.eventIsActive, true),
        lte(blogPosts.eventEndDate, now)
      )
    )
    .orderBy(desc(blogPosts.eventStartDate));
}

/**
 * Get event details with registration info
 */
export async function getEventDetails(postId: number, userId?: number) {
  const [post] = await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.id, postId));

  if (!post) {
    throw new Error("Event not found");
  }

  // Get registration count
  const [{ count: registrationCount }] = await db
    .select({ count: count() })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.postId, postId));

  // Check if user is registered (if userId provided)
  let isUserRegistered = false;
  if (userId) {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.postId, postId),
          eq(eventRegistrations.userId, userId)
        )
      );
    isUserRegistered = !!registration;
  }

  return {
    ...post,
    registrationCount,
    spotsRemaining: post.post.eventMaxParticipants 
      ? post.post.eventMaxParticipants - registrationCount 
      : null,
    isFull: post.post.eventMaxParticipants 
      ? registrationCount >= post.post.eventMaxParticipants 
      : false,
    isUserRegistered,
  };
}

/**
 * Register for a single event
 */
export async function registerForEvent(
  postId: number,
  registrationData: Record<string, any>,
  userId?: number
) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId));
  if (!post) {
    throw new Error("Post not found");
  }

  if (!post.isEvent) {
    throw new Error("This post is not an event");
  }

  if (!post.eventIsActive) {
    throw new Error("Event is no longer active");
  }

  const now = new Date();
  if (post.eventEndDate && post.eventEndDate < now) {
    throw new Error("Event has already ended");
  }

  if (post.eventMaxParticipants) {
    const [{ count: registrationCount }] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.postId, postId));

    if (registrationCount >= post.eventMaxParticipants) {
      throw new Error("Event has reached maximum participants");
    }
  }

  if (userId) {
    const [existingRegistration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.postId, postId),
          eq(eventRegistrations.userId, userId)
        )
      );

    if (existingRegistration) {
      throw new Error("You are already registered for this event");
    }
  }

  const [newRegistration] = await db
    .insert(eventRegistrations)
    .values({
      postId,
      userId,
      registrationData,
    })
    .returning();

  return newRegistration;
}

/**
 * Register for multiple events (batch registration)
 * Useful if you want users to register for multiple events at once
 */
export async function registerForMultipleEvents(
  postIds: number[],
  registrationData: Record<string, any>,
  userId?: number
) {
  const results = [];
  const errors = [];

  for (const postId of postIds) {
    try {
      const registration = await registerForEvent(postId, registrationData, userId);
      results.push({ postId, success: true, registration });
    } catch (error) {
      errors.push({ 
        postId, 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }

  return { results, errors };
}

/**
 * Get event registrations (admin/author only)
 */
export async function getEventRegistrations(postId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId));
  if (!post) {
    throw new Error("Post not found");
  }

  if (
    user.role !== "admin" && 
    user.role !== "editor" && 
    post.authorId !== user.id
  ) {
    throw new Error("Permission denied");
  }

  return await db
    .select({
      registration: eventRegistrations,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(eventRegistrations)
    .leftJoin(users, eq(eventRegistrations.userId, users.id))
    .where(eq(eventRegistrations.postId, postId))
    .orderBy(desc(eventRegistrations.registeredAt));
}

/**
 * Get user's event registrations
 */
export async function getUserEventRegistrations(userId: number) {
  return await db
    .select({
      registration: eventRegistrations,
      post: blogPosts,
    })
    .from(eventRegistrations)
    .innerJoin(blogPosts, eq(eventRegistrations.postId, blogPosts.id))
    .where(eq(eventRegistrations.userId, userId))
    .orderBy(desc(eventRegistrations.registeredAt));
}

/**
 * Cancel event registration
 */
export async function cancelEventRegistration(registrationId: number, userId?: number) {
  const [registration] = await db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.id, registrationId));

  if (!registration) {
    throw new Error("Registration not found");
  }

  // Check if the user has permission to cancel
  if (userId && registration.userId !== userId) {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      throw new Error("Permission denied");
    }
  }

  await db.delete(eventRegistrations).where(eq(eventRegistrations.id, registrationId));
  return { success: true };
}

/**
 * Check if user can register for event
 */
export async function canUserRegisterForEvent(postId: number, userId?: number) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId));
  
  if (!post) {
    return { canRegister: false, reason: "Event not found" };
  }

  if (!post.isEvent) {
    return { canRegister: false, reason: "This is not an event" };
  }

  if (!post.eventIsActive) {
    return { canRegister: false, reason: "Event is no longer active" };
  }

  const now = new Date();
  if (post.eventEndDate && post.eventEndDate < now) {
    return { canRegister: false, reason: "Event has already ended" };
  }

  // Check if event is full
  if (post.eventMaxParticipants) {
    const [{ count: registrationCount }] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.postId, postId));

    if (registrationCount >= post.eventMaxParticipants) {
      return { canRegister: false, reason: "Event is full" };
    }
  }

  // Check if user is already registered
  if (userId) {
    const [existingRegistration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.postId, postId),
          eq(eventRegistrations.userId, userId)
        )
      );

    if (existingRegistration) {
      return { canRegister: false, reason: "Already registered" };
    }
  }

  return { canRegister: true };
}

/**
 * Get multiple events by IDs (for registration page)
 */
export async function getEventsByIds(postIds: number[]) {
  if (postIds.length === 0) return [];

  const events = await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .where(
      and(
        inArray(blogPosts.id, postIds),
        eq(blogPosts.isEvent, true),
        eq(blogPosts.eventIsActive, true)
      )
    );

  // Add registration info for each event
  const eventsWithInfo = await Promise.all(
    events.map(async (event) => {
      const [{ count: registrationCount }] = await db
        .select({ count: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.postId, event.post.id));

      return {
        ...event,
        registrationCount,
        spotsRemaining: event.post.eventMaxParticipants 
          ? event.post.eventMaxParticipants - registrationCount 
          : null,
        isFull: event.post.eventMaxParticipants 
          ? registrationCount >= event.post.eventMaxParticipants 
          : false,
      };
    })
  );

  return eventsWithInfo;
}

/**
 * Deactivate expired events (run via cron job)
 */
export async function checkEventExpiry() {
  const now = new Date();
  const expiredEvents = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isEvent, true),
        eq(blogPosts.eventIsActive, true),
        lte(blogPosts.eventEndDate, now)
      )
    );

  for (const event of expiredEvents) {
    await db
      .update(blogPosts)
      .set({ eventIsActive: false, updatedAt: now })
      .where(eq(blogPosts.id, event.id));
  }

  return { deactivatedEvents: expiredEvents.length };
}