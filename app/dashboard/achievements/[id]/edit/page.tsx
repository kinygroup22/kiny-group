/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/achievements/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { achievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AchievementForm } from "@/components/dashboard/achievement-management/achievement-form";

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const achievementId = parseInt(id);

  // Fetch the achievement
  const achievementData = await db
    .select()
    .from(achievements)
    .where(eq(achievements.id, achievementId))
    .limit(1);

  if (achievementData.length === 0) {
    notFound();
  }

  const achievement = achievementData[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Achievement</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{achievement.title}&quot;
        </p>
      </div>

      <AchievementForm achievement={achievement} />
    </div>
  );
}