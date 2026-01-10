// app/dashboard/users/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { UserForm } from "@/components/dashboard/user-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> // Changed to Promise
}) {
  const user = await requireAdmin();
  const { id } = await params; // Await params
  const userId = parseInt(id);

  if (isNaN(userId)) {
    redirect("/dashboard/users");
  }

  // Fetch the user
  const [userToEdit] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!userToEdit) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
        <p className="text-muted-foreground">Update user information and permissions</p>
      </div>

      <UserForm user={user} userToEdit={userToEdit} />
    </div>
  );
}