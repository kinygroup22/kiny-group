// app/dashboard/users/new/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { UserForm } from "@/components/dashboard/user-form";

export default async function NewUserPage() {
  const user = await requireAdmin();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New User</h1>
        <p className="text-muted-foreground">Add a new user to the system</p>
      </div>

      <UserForm user={user} />
    </div>
  );
}