// app/dashboard/departments/page.tsx
import { requireEditor } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Building } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DeleteDepartmentButton } from "@/components/dashboard/departments/delete-department-button";

export default async function DepartmentsPage() {
  const user = await requireEditor();

  // Fetch all departments
  const allDepartments = await db
    .select()
    .from(departments)
    .orderBy(departments.order);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <DashboardHeader 
          title="Departments"
          description="Manage company departments and teams"
          icon={Building}
        />
        <Link href="/dashboard/departments/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Department
          </Button>
        </Link>
      </div>

      {/* Departments Table */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>Manage your company departments and teams</CardDescription>
        </CardHeader>
        <CardContent>
          {allDepartments.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">No departments yet</h3>
              <p className="text-muted-foreground mb-6">Get started by adding your first department</p>
              <Link href="/dashboard/departments/new">
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Department
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Head</th>
                    <th className="text-left py-3 px-4 font-medium">Color</th>
                    <th className="text-left py-3 px-4 font-medium">Order</th>
                    <th className="text-left py-3 px-4 font-medium">Created</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDepartments.map((department) => (
                    <tr key={department.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{department.name}</div>
                          {department.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {department.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{department.head || "-"}</td>
                      <td className="py-3 px-4">
                        {department.color ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: department.color }}
                            />
                            <span className="text-xs">{department.color}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4">{department.order}</td>
                      <td className="py-3 px-4">
                        {formatDistanceToNow(new Date(department.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/departments/${department.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          {user.role === "admin" && (
                            <DeleteDepartmentButton 
                              id={department.id}
                              name={department.name}
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