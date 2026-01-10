/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/api/users.ts
import { db } from "@/lib/db";
import { blogComments, blogPostLikes, blogPosts, blogPostViews, brandDivisions, users, type User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Get all users
export async function getUsers() {
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users).orderBy(users.createdAt);
}

// Get a single user by ID
export async function getUser(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

// Create a new user
export async function createUser(data: {
  name?: string;
  email: string;
  password: string;
  role: string;
}) {
  // Check if email already exists
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email));

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  // Validate password
  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Insert new user
  const [newUser] = await db
    .insert(users)
    .values({
      name: data.name || null,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  return newUser;
}

// Update an existing user
export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }
) {
  // Check if user exists
  const [existingUser] = await db.select().from(users).where(eq(users.id, id));
  
  if (!existingUser) {
    throw new Error("User not found");
  }

  // Check if email is being changed and if it's already in use
  if (data.email && data.email !== existingUser.email) {
    const [emailExists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email));

    if (emailExists) {
      throw new Error("This email is already in use by another user");
    }
  }

  // Prepare update data
  const updateData: {
    name?: string | null;
    email?: string;
    password?: string;
    role?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name || null;
  }
  
  if (data.email) {
    updateData.email = data.email;
  }
  
  if (data.role) {
    updateData.role = data.role;
  }

  // Hash the password if provided
  if (data.password) {
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  // Update user
  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return updatedUser;
}

// Delete a user
export async function deleteUser(id: number) {
  // Check if user exists
  const [existingUser] = await db.select().from(users).where(eq(users.id, id));
  
  if (!existingUser) {
    throw new Error("User not found");
  }

  try {
    // Delete all blog post likes by this user
    await db.delete(blogPostLikes).where(eq(blogPostLikes.userId, id));
    
    // Delete all blog post views by this user
    await db.delete(blogPostViews).where(eq(blogPostViews.userId, id));
    
    // Delete all blog comments by this user
    await db.delete(blogComments).where(eq(blogComments.authorId, id));
    
    // Delete all blog posts by this user
    await db.delete(blogPosts).where(eq(blogPosts.authorId, id));
    
    // Delete all brand divisions by this user
    await db.delete(brandDivisions).where(eq(brandDivisions.authorId, id));
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}