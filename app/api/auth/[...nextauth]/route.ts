// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, userRoles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object that will be stored in JWT
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);

          if (existingUser) {
            // User exists, update with Google info if needed
            await db
              .update(users)
              .set({
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                updatedAt: new Date(),
              })
              .where(eq(users.id, existingUser.id));
            
            // Add user ID to the user object
            user.id = existingUser.id.toString();
            user.role = existingUser.role;
          } else {
            // Create a new user
            const [newUser] = await db
              .insert(users)
              .values({
                name: user.name || "",
                email: user.email!,
                image: user.image,
                role: userRoles.READER, // Default role
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                image: users.image,
              });

            // Add user ID to the user object
            user.id = newUser.id.toString();
            user.role = newUser.role;
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      // Handle session updates (e.g., after profile changes)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.image = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data to session from JWT token
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 60 * 60, // 1 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };