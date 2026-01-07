// app/dashboard/team-members/page.tsx
import { requireEditor } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Users } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { teamMembers, departments } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { eq } from "drizzle-orm";
import { DeleteTeamMemberButton } from "@/components/dashboard/team-members/delete-team-member-button";
import Image from "next/image";

export default async function TeamMembersPage() {
  const user = await requireEditor();

  // Fetch all team members with department info
  const allTeamMembers = await db
    .select({
      id: teamMembers.id,
      name: teamMembers.name,
      title: teamMembers.title,
      image: teamMembers.image,
      role: teamMembers.role,
      departmentId: teamMembers.departmentId,
      departmentName: departments.name,
      order: teamMembers.order,
      createdAt: teamMembers.createdAt,
    })
    .from(teamMembers)
    .leftJoin(departments, eq(teamMembers.departmentId, departments.id))
    .orderBy(teamMembers.order);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <DashboardHeader 
          title="Team Members"
          description="Manage team members and their roles"
          icon={Users}
        />
        <Link href="/dashboard/team-members/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Team Member
          </Button>
        </Link>
      </div>

      {/* Team Members Table */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {allTeamMembers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-6">Get started by adding your first team member</p>
              <Link href="/dashboard/team-members/new">
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Photo</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Department</th>
                    <th className="text-left py-3 px-4 font-medium">Order</th>
                    <th className="text-left py-3 px-4 font-medium">Created</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeamMembers.map((member) => (
                    <tr key={member.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-xs font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{member.name}</td>
                      <td className="py-3 px-4">{member.title}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          member.role === 'founder' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'executive' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{member.departmentName || "-"}</td>
                      <td className="py-3 px-4">{member.order}</td>
                      <td className="py-3 px-4">
                        {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/team-members/${member.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          {user.role === "admin" && (
                            <DeleteTeamMemberButton 
                              id={member.id}
                              name={member.name}
                            />
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