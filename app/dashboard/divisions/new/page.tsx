// app/dashboard/divisions/new/page.tsx
import { requireEditor } from "@/lib/auth";
import { VisualDivisionForm } from "@/components/dashboard/visual-division-form";
import { User } from "@/lib/db/schema";

export default async function NewDivisionPage() {
  const user = await requireEditor();

  return (
    <div className="w-full">
      <VisualDivisionForm user={user} />
    </div>
  );
}