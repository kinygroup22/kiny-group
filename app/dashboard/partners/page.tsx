// app/dashboard/partners/page.tsx
import { requireEditor } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Handshake, Search } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { ilike, sql } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

type SearchParams = Promise<{
  page?: string;
  search?: string;
}>;

export default async function PartnersPage({
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
    ? ilike(partners.name, `%${searchQuery}%`)
    : undefined;

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(partners)
    .where(whereClause);

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch paginated partners
  const allPartners = await db
    .select()
    .from(partners)
    .where(whereClause)
    .orderBy(partners.order)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <DashboardHeader 
          title="Partners"
          description="Manage partner logos and information"
          icon={Handshake}
        />
        <Link href="/dashboard/partners/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Partner
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form action="/dashboard/partners" method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                name="search"
                placeholder="Search by partner name..."
                defaultValue={searchQuery}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchQuery && (
              <Link href="/dashboard/partners">
                <Button type="button" variant="outline">Clear</Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>
            All Partners
            {searchQuery && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({count} result{count !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;)
              </span>
            )}
          </CardTitle>
          <CardDescription>Manage your partner logos and information</CardDescription>
        </CardHeader>
        <CardContent>
          {allPartners.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms
                  </p>
                  <Link href="/dashboard/partners">
                    <Button variant="outline">Clear Search</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-foreground mb-2">No partners yet</h3>
                  <p className="text-muted-foreground mb-6">Get started by adding your first partner</p>
                  <Link href="/dashboard/partners/new">
                    <Button className="flex items-center gap-2 mx-auto">
                      <Plus className="w-4 h-4" />
                      Add Partner
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
                      <th className="text-left py-3 px-4 font-medium">Logo</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Order</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPartners.map((partner) => (
                      <tr key={partner.id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="relative w-16 h-16">
                            <Image
                              src={partner.logoUrl}
                              alt={partner.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">{partner.name}</td>
                        <td className="py-3 px-4">{partner.order}</td>
                        <td className="py-3 px-4">
                          {formatDistanceToNow(new Date(partner.createdAt), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/partners/${partner.id}/edit`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                            </Link>
                            {user.role === "admin" && (
                              <DeleteButton 
                                id={partner.id}
                                resourceType="partner"
                                resourceName={partner.name}
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
                    baseUrl="/dashboard/partners"
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