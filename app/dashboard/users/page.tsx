// app/dashboard/users/page.tsx
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Shield, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { DeleteUserButton } from "@/components/dashboard/delete-user-button";
import { desc } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";

export default async function UsersPage() {
  const user = await requireAdmin();

  // Fetch all users
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      case "contributor":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-600 dark:text-red-400";
      case "editor":
        return "text-blue-600 dark:text-blue-400";
      case "contributor":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <DashboardHeader 
          title="Users Management"
          description="Manage user accounts and permissions"
          icon={UsersIcon}
        />
        <Link href="/dashboard/users/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <UsersIcon className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {allUsers.filter(u => u.role === "admin").length}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Editors</p>
                <p className="text-2xl font-bold">
                  {allUsers.filter(u => u.role === "editor").length}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Edit className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">
                  {allUsers.filter(u => u.role === "contributor").length}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <UsersIcon className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage all system users</CardDescription>
        </CardHeader>
        <CardContent>
          {allUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <UsersIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No users yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first user</p>
              <Link href="/dashboard/users/new">
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Create User
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((userItem) => (
                    <tr 
                      key={userItem.id} 
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {(userItem.name || userItem.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {userItem.name || "No name"}
                            </p>
                            {userItem.id === user.id && (
                              <span className="text-xs text-muted-foreground">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground">{userItem.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={getRoleBadgeVariant(userItem.role)}
                          className="capitalize flex items-center gap-1.5 w-fit"
                        >
                          {userItem.role === "admin" && (
                            <Shield className="w-3 h-3" />
                          )}
                          <span className={getRoleColor(userItem.role)}>
                            {userItem.role}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(userItem.createdAt), { addSuffix: true })}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/users/${userItem.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1.5"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          {userItem.id !== user.id && (
                            <DeleteUserButton userId={userItem.id} userName={userItem.name || userItem.email} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}