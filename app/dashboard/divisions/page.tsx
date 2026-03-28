// app/dashboard/divisions/page.tsx
import { requireEditor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Star, User, CompassIcon } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { brandDivisions, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { ReorderableDivisionsGrid } from "@/components/dashboard/division/reorderable-divisions-grid";

export default async function DivisionsPage() {
  const user = await requireEditor();

  // Fetch all brand divisions with author information, ordered by `order`
  const divisions = await db
    .select({
      id: brandDivisions.id,
      name: brandDivisions.name,
      slug: brandDivisions.slug,
      tagline: brandDivisions.tagline,
      description: brandDivisions.description,
      logo: brandDivisions.logo,
      color: brandDivisions.color,
      featured: brandDivisions.featured,
      order: brandDivisions.order,
      createdAt: brandDivisions.createdAt,
      updatedAt: brandDivisions.updatedAt,
      authorId: brandDivisions.authorId,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(brandDivisions)
    .leftJoin(users, eq(brandDivisions.authorId, users.id))
    .orderBy(asc(brandDivisions.order));

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DashboardHeader
          title="Brand Divisions"
          description="Manage your brand divisions and services"
          icon={CompassIcon}
        />
        <Link href="/dashboard/divisions/new">
          <Button size="lg" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Division
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Divisions</p>
                <p className="text-2xl font-bold">{divisions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">
                  {divisions.filter((d) => d.featured).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Divisions</p>
                <p className="text-2xl font-bold">
                  {divisions.filter((d) => d.authorId === user.id).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Divisions Grid */}
      {divisions.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <Star className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No divisions yet</h3>
                <p className="text-muted-foreground mt-2">
                  Get started by creating your first brand division
                </p>
              </div>
              <Link href="/dashboard/divisions/new">
                <Button size="lg" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Division
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ReorderableDivisionsGrid
          divisions={divisions}
          userRole={user.role}
          userId={user.id}
        />
      )}
    </div>
  );
}