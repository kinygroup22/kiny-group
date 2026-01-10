/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/team-members/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TeamMemberForm } from "@/components/dashboard/team-member-management/team-member-form";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const teamMemberId = parseInt(id);

  // Fetch the team member
  const teamMemberData = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.id, teamMemberId))
    .limit(1);

  if (teamMemberData.length === 0) {
    notFound();
  }

  const teamMember = teamMemberData[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Team Member</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{teamMember.name}&quot;
        </p>
      </div>

      <TeamMemberForm teamMember={teamMember} />
    </div>
  );
}