/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/clients/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ClientForm } from "@/components/dashboard/client-management/client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const { id } = await params;
  const clientId = parseInt(id);

  // Fetch the client
  const clientData = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (clientData.length === 0) {
    notFound();
  }

  const client = clientData[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Client</h1>
        <p className="text-muted-foreground">
          Update the details for &quot;{client.name}&quot;
        </p>
      </div>

      <ClientForm client={client} />
    </div>
  );
}