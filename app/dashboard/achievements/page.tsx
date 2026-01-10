// app/dashboard/achievements/page.tsx
import { requireEditor } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Award, Search } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { achievements } from "@/lib/db/schema";
import { or, ilike, sql } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { DeleteAchievementButton } from "@/components/dashboard/achievements/delete-achievement-button";

const ITEMS_PER_PAGE = 10;

type SearchParams = Promise<{
  page?: string;
  search?: string;
}>;

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireEditor();
  
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchQuery = params.search || "";

  // Build the where clause for search
  const whereClause = searchQuery
    ? or(
        ilike(achievements.title, `%${searchQuery}%`),
        ilike(achievements.description, `%${searchQuery}%`),
        ilike(achievements.icon, `%${searchQuery}%`)
      )
    : undefined;

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(achievements)
    .where(whereClause);

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch paginated achievements
  const allAchievements = await db
    .select()
    .from(achievements)
    .where(whereClause)
    .orderBy(achievements.order)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <DashboardHeader 
          title="Achievements"
          description="Manage company achievements and milestones"
          icon={Award}
        />
        <Link href="/dashboard/achievements/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Achievement
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form action="/dashboard/achievements" method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                name="search"
                placeholder="Search by title, description, or icon..."
                defaultValue={searchQuery}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchQuery && (
              <Link href="/dashboard/achievements">
                <Button type="button" variant="outline">Clear</Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Achievements Table */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>
            All Achievements
            {searchQuery && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({count} result{count !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;)
              </span>
            )}
          </CardTitle>
          <CardDescription>Manage your company achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          {allAchievements.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms
                  </p>
                  <Link href="/dashboard/achievements">
                    <Button variant="outline">Clear Search</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-foreground mb-2">No achievements yet</h3>
                  <p className="text-muted-foreground mb-6">Get started by adding your first achievement</p>
                  <Link href="/dashboard/achievements/new">
                    <Button className="flex items-center gap-2 mx-auto">
                      <Plus className="w-4 h-4" />
                      Add Achievement
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Title</th>
                      <th className="text-left py-3 px-4 font-medium">Icon</th>
                      <th className="text-left py-3 px-4 font-medium">Featured</th>
                      <th className="text-left py-3 px-4 font-medium">Order</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAchievements.map((achievement) => (
                      <tr key={achievement.id} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{achievement.title}</div>
                            {achievement.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {achievement.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{achievement.icon || "-"}</td>
                        <td className="py-3 px-4">
                          {achievement.featured ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{achievement.order}</td>
                        <td className="py-3 px-4">
                          {formatDistanceToNow(new Date(achievement.createdAt), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/achievements/${achievement.id}/edit`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                            </Link>
                            {user.role === "admin" && (
                              <DeleteAchievementButton 
                                id={achievement.id}
                                title={achievement.title}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/dashboard/achievements"
                    searchParams={searchQuery ? { search: searchQuery } : {}}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}