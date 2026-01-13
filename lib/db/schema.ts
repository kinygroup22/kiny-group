// lib/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb, primaryKey, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User Roles Enum
export const userRoles = {
  ADMIN: "admin",
  EDITOR: "editor",
  CONTRIBUTOR: "contributor",
  READER: "reader"
} as const;

export type UserRole = typeof userRoles[keyof typeof userRoles];

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }), // Make nullable for OAuth users
  role: varchar("role", { length: 20 }).notNull().default(userRoles.READER),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(), // Rich text editor content (HTML)
  featuredImage: varchar("featured_image", { length: 500 }), // Main cover image
  featured: boolean("featured").default(false),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  category: varchar("category", { length: 100 }),
  readTime: integer("read_time").default(5),
  views: integer("views").default(0), // Track views
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  publishedAt: timestamp("published_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Blog Comments Table
export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .references(() => blogPosts.id, { onDelete: "cascade" })
    .notNull(),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Blog Post Likes Table (Track individual user likes)
export const blogPostLikes = pgTable("blog_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .references(() => blogPosts.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" }), // REMOVED .notNull() - now nullable
  anonymousId: varchar("anonymous_id", { length: 255 }), // For anonymous users
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Blog Post Views Table (Track individual views)
export const blogPostViews = pgTable("blog_post_views", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .references(() => blogPosts.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address", { length: 45 }), // Support IPv6
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Brand/Division Content Table - Updated to match Brand interface
export const brandDivisions = pgTable("brand_divisions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tagline: varchar("tagline", { length: 255 }),
  description: text("description").notNull(),
  fullDescription: text("full_description").notNull(),
  // Removed coverage and delivery fields
  backgroundImage: varchar("background_image", { length: 500 }),
  logo: varchar("logo", { length: 500 }),
  color: varchar("color", { length: 20 }),
  // Brand Stats - FIXED DEFAULT VALUE
  stats: jsonb("stats").$type<{
    label1: string;
    value1: string;
    label2: string;
    value2: string;
    label3: string;
    value3: string;
    label4: string;
    value4: string;
  }>().notNull().default({
    label1: '',
    value1: '',
    label2: '',
    value2: '',
    label3: '',
    value3: '',
    label4: '',
    value4: '',
  }),
  // Brand Services
  services: jsonb("services").$type<Array<{
    name: string;
    description: string;
  }>>().notNull().default([]),
  // Brand Achievements
  achievements: jsonb("achievements").$type<string[]>().notNull().default([]),
  // Brand Team
  team: jsonb("team").$type<Array<{
    name: string;
    position: string;
  }>>().notNull().default([]),
  // Brand Theme - FIXED DEFAULT VALUE
  theme: jsonb("theme").$type<{
    [x: string]: string;
    primary: string;
    bg: string;
    bgSolid: string;
    border: string;
    text: string;
    accent: string;
    hover: string;
    gradient: string;
  }>().notNull().default({
    primary: '',
    bg: '',
    bgSolid: '',
    border: '',
    text: '',
    accent: '',
    hover: '',
    gradient: '',
  }),
  featured: boolean("featured").default(false),
  // New contact information fields
  email: varchar("email", { length: 255 }).default("info@kcifoundation.org"),
  whatsapp: varchar("whatsapp", { length: 50 }).default("+628123456789"),
  address: text("address").default("Jl. Tebet Timur Dalam II No.38B, Tebet,\nJakarta Selatan 12820"),
  contactTitle: varchar("contact_title", { length: 255 }).default("Let's Connect"),
  contactSubtitle: varchar("contact_subtitle", { length: 255 }).default("Get in Touch"),
  contactDescription: text("contact_description").default("Ready to start your journey with us? Our team is here to answer your questions and help you get started."),
  buttonText: varchar("button_text", { length: 255 }).default("Schedule Consultation"),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Brand Division Images Table (Multiple images per brand)
export const brandDivisionImages = pgTable("brand_division_images", {
  id: serial("id").primaryKey(),
  brandDivisionId: integer("brand_division_id")
    .references(() => brandDivisions.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  caption: text("caption"),
  altText: varchar("alt_text", { length: 255 }),
  order: integer("order").default(0), // For sorting images
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const brandActivities = pgTable("brand_activities", {
  id: serial("id").primaryKey(),
  brandDivisionId: integer("brand_division_id")
    .references(() => brandDivisions.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  order: integer("order").notNull().default(0), // <-- ADD .notNull() HERE
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Blog Categories Table
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Blog Post Categories (Many-to-Many)
export const blogPostCategories = pgTable("blog_post_categories", {
  postId: integer("post_id")
    .references(() => blogPosts.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: integer("category_id")
    .references(() => blogCategories.id, { onDelete: "cascade" })
    .notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.categoryId] }),
}));

// Clients Table (NEW)
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }).notNull(),
  order: integer("order").default(0), // For sorting
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Partners Table (NEW)
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }).notNull(),
  order: integer("order").default(0), // For sorting
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Journey Items Table (NEW)
export const journeyItems = pgTable("journey_items", {
  id: serial("id").primaryKey(),
  year: varchar("year", { length: 10 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  order: integer("order").default(0), // For sorting
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Achievements Table (NEW)
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Icon name from lucide-react
  order: integer("order").default(0), // For sorting
  featured: boolean("featured").default(false), // Highlight important achievements
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Departments Table (NEW)
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  head: varchar("head", { length: 255 }),
  description: text("description"),
  color: varchar("color", { length: 100 }), // For gradient color
  order: integer("order").default(0), // For sorting
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Team Members Table (NEW)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  bio: text("bio"),
  image: varchar("image", { length: 500 }),
  role: varchar("role", { length: 50 }).notNull().default("team_member"), // founder, executive, team_member
  departmentId: integer("department_id")
    .references(() => departments.id)
    .notNull(),
  order: integer("order").default(0), // For sorting
  icon: varchar("icon", { length: 50 }), // Icon name from lucide-react
  achievements: jsonb("achievements").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
  blogComments: many(blogComments),
  brandDivisions: many(brandDivisions),
  blogPostLikes: many(blogPostLikes),
  blogPostViews: many(blogPostViews),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  comments: many(blogComments),
  categories: many(blogPostCategories),
  likes: many(blogPostLikes),
  views: many(blogPostViews),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
  author: one(users, {
    fields: [blogComments.authorId],
    references: [users.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
    relationName: "parentComment",
  }),
}));

export const blogPostLikesRelations = relations(blogPostLikes, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostLikes.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogPostLikes.userId],
    references: [users.id],
  }),
}));

export const blogPostViewsRelations = relations(blogPostViews, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostViews.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogPostViews.userId],
    references: [users.id],
  }),
}));

export const brandDivisionsRelations = relations(brandDivisions, ({ one, many }) => ({
  author: one(users, {
    fields: [brandDivisions.authorId],
    references: [users.id],
  }),
  images: many(brandDivisionImages),
  activities: many(brandActivities), // FIXED: Added missing activities relation
}));

export const brandDivisionImagesRelations = relations(brandDivisionImages, ({ one }) => ({
  brandDivision: one(brandDivisions, {
    fields: [brandDivisionImages.brandDivisionId],
    references: [brandDivisions.id],
  }),
}));

export const brandActivitiesRelations = relations(brandActivities, ({ one }) => ({
  brandDivision: one(brandDivisions, {
    fields: [brandActivities.brandDivisionId],
    references: [brandDivisions.id],
  }),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPostCategories),
}));

export const blogPostCategoriesRelations = relations(blogPostCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostCategories.postId],
    references: [blogPosts.id],
  }),
  category: one(blogCategories, {
    fields: [blogPostCategories.categoryId],
    references: [blogCategories.id],
  }),
}));

// Relations for new tables
export const achievementsRelations = relations(achievements, ({ many }) => ({
  teamMembers: many(teamMembers),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  teamMembers: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
  department: one(departments, {
    fields: [teamMembers.departmentId],
    references: [departments.id],
  }),
  achievements: many(achievements),
}));

// Export all tables
export const tables = {
  users,
  blogPosts,
  blogComments,
  blogPostLikes,
  blogPostViews,
  brandDivisions,
  brandDivisionImages,
  brandActivities,
  blogCategories,
  blogPostCategories,
  clients,
  partners, // NEW
  journeyItems,
  achievements, 
  departments, 
  teamMembers, 
};

// Export all schemas
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;
export type BlogPostLike = typeof blogPostLikes.$inferSelect;
export type NewBlogPostLike = typeof blogPostLikes.$inferInsert;
export type BlogPostView = typeof blogPostViews.$inferSelect;
export type NewBlogPostView = typeof blogPostViews.$inferInsert;
export type BrandDivision = typeof brandDivisions.$inferSelect;
export type NewBrandDivision = typeof brandDivisions.$inferInsert;
export type BrandDivisionImage = typeof brandDivisionImages.$inferSelect; // NEW
export type NewBrandDivisionImage = typeof brandDivisionImages.$inferInsert; // NEW
export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Partner = typeof partners.$inferSelect; // NEW
export type NewPartner = typeof partners.$inferInsert; // NEW
export type JourneyItem = typeof journeyItems.$inferSelect;
export type NewJourneyItem = typeof journeyItems.$inferInsert;
export type Achievement = typeof achievements.$inferSelect; 
export type NewAchievement = typeof achievements.$inferInsert; 
export type Department = typeof departments.$inferSelect; 
export type NewDepartment = typeof departments.$inferInsert; 
export type TeamMember = typeof teamMembers.$inferSelect; 
export type NewTeamMember = typeof teamMembers.$inferInsert; 
export type BrandActivity = typeof brandActivities.$inferSelect; // NEW
export type NewBrandActivity = typeof brandActivities.$inferInsert; // NEW