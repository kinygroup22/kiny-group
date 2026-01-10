/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/departments/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DepartmentForm } from "@/components/dashboard/department-management/department-form";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const departmentId = parseInt(id);

  // Fetch the department
  const departmentData = await db
    .select()
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  if (departmentData.length === 0) {
    notFound();
  }

  const department = departmentData[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Department</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{department.name}&quot;
        </p>
      </div>

      <DepartmentForm department={department} />
    </div>
  );
}