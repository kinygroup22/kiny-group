// app/dashboard/divisions/page.tsx
import { requireEditor } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Star, Calendar, User, CompassIcon } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { brandDivisions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { DeleteDivisionButton } from "@/components/dashboard/delete-division-button";
import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";

export default async function DivisionsPage() {
  const user = await requireEditor();

  // Fetch all brand divisions with author information
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
      createdAt: brandDivisions.createdAt,
      updatedAt: brandDivisions.updatedAt,
      authorId: brandDivisions.authorId,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(brandDivisions)
    .leftJoin(users, eq(brandDivisions.authorId, users.id))
    .orderBy(desc(brandDivisions.featured), desc(brandDivisions.createdAt));

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {divisions.map((division) => (
            <Card
              key={division.id}
              className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 py-6"
            >
              <CardHeader className="space-y-3">
                {/* Logo and Featured Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {division.logo ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                        <Image
                          src={division.logo}
                          alt={division.name}
                          className="h-full w-full object-cover"
                          width={48}
                          height={48}
                        />
                      </div>
                    ) : (
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: division.color || "#3b82f6" }}
                      >
                        {division.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {division.featured && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Title and Tagline */}
                <div>
                  <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                    {division.name}
                  </CardTitle>
                  {division.tagline && (
                    <CardDescription className="mt-1 line-clamp-1">
                      {division.tagline}
                    </CardDescription>
                  )}
                </div>

                {/* Description */}
                {division.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {division.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Meta Information */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-25">
                      {division.authorName || division.authorEmail?.split("@")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(division.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Link href={`/brand/${division.slug}`} target="_blank" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/divisions/${division.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <DeleteDivisionButton divisionId={division.id} divisionName={division.name} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

