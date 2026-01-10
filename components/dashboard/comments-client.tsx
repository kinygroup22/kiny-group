/* eslint-disable react-hooks/purity */
// components/dashboard/comments-client.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, ExternalLink, Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { DeleteCommentButton } from "@/components/dashboard/delete-comment-button";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";

type Comment = {
  id: number;
  content: string;
  createdAt: Date;
  postId: number;
  postTitle: string | null;
  postSlug: string | null;
  authorName: string | null;
  authorEmail: string | null;
  parentId: number | null;
};

type CommentsClientProps = {
  comments: Comment[];
  userRole: string;
};

type FilterType = "all" | "top-level" | "replies";
type SortType = "newest" | "oldest";

const ITEMS_PER_PAGE = 10;

export function CommentsClient({ comments, userRole }: CommentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [selectedPost, setSelectedPost] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique posts for filter dropdown
  const uniquePosts = useMemo(() => {
    const posts = new Map<string, string>();
    comments.forEach((comment) => {
      if (comment.postSlug && comment.postTitle) {
        posts.set(comment.postSlug, comment.postTitle);
      }
    });
    return Array.from(posts.entries());
  }, [comments]);

  // Filter and sort comments
  const filteredComments = useMemo(() => {
    let filtered = [...comments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (comment) =>
          comment.content.toLowerCase().includes(query) ||
          comment.authorName?.toLowerCase().includes(query) ||
          comment.authorEmail?.toLowerCase().includes(query) ||
          comment.postTitle?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType === "top-level") {
      filtered = filtered.filter((comment) => comment.parentId === null);
    } else if (filterType === "replies") {
      filtered = filtered.filter((comment) => comment.parentId !== null);
    }

    // Apply post filter
    if (selectedPost !== "all") {
      filtered = filtered.filter((comment) => comment.postSlug === selectedPost);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortType === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [comments, searchQuery, filterType, selectedPost, sortType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalComments = comments.length;
    const topLevelComments = comments.filter((c) => c.parentId === null).length;
    const repliesCount = comments.filter((c) => c.parentId !== null).length;
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentComments = comments.filter(
      (c) => new Date(c.createdAt) > oneDayAgo
    ).length;

    return {
      total: totalComments,
      topLevel: topLevelComments,
      replies: repliesCount,
      recent: recentComments,
    };
  }, [comments]);

  // Pagination
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);
  const paginatedComments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredComments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredComments, currentPage]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setSelectedPost("all");
    setSortType("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterType !== "all" ||
    selectedPost !== "all" ||
    sortType !== "newest";

  return (
    <div className="mx-auto">
      {/* Header */}
      <DashboardHeader
        title="Comment Management"
        description="Monitor and moderate blog post comments"
        icon={MessageSquare}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Level</p>
                <p className="text-2xl font-bold">{stats.topLevel}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Replies</p>
                <p className="text-2xl font-bold">{stats.replies}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last 24h</p>
                <p className="text-2xl font-bold">{stats.recent}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments, authors, or posts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              {/* Filter Type */}
              <Select 
                value={filterType} 
                onValueChange={(value: FilterType) => {
                  setFilterType(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-full md:w-45">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Comments</SelectItem>
                  <SelectItem value="top-level">Top Level Only</SelectItem>
                  <SelectItem value="replies">Replies Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select 
                value={sortType} 
                onValueChange={(value: SortType) => {
                  setSortType(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-full md:w-37.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Post Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={selectedPost} 
                onValueChange={(value) => {
                  setSelectedPost(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-full md:w-75">
                  <SelectValue placeholder="Filter by post" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  {uniquePosts.map(([slug, title]) => (
                    <SelectItem key={slug} value={slug}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: &quot;{searchQuery}&quot;
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        setSearchQuery("");
                        handleFilterChange();
                      }}
                    />
                  </Badge>
                )}
                {filterType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filterType === "top-level" ? "Top Level" : "Replies"}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        setFilterType("all");
                        handleFilterChange();
                      }}
                    />
                  </Badge>
                )}
                {selectedPost !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Post: {uniquePosts.find(([slug]) => slug === selectedPost)?.[1]}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        setSelectedPost("all");
                        handleFilterChange();
                      }}
                    />
                  </Badge>
                )}
                {sortType !== "newest" && (
                  <Badge variant="secondary" className="gap-1">
                    Sort: Oldest First
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        setSortType("newest");
                        handleFilterChange();
                      }}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {paginatedComments.length} of {filteredComments.length} comment
          {filteredComments.length !== 1 ? "s" : ""}
          {filteredComments.length !== comments.length && ` (filtered from ${comments.length} total)`}
        </div>
      )}

      {/* Comments Table */}
      <Card>
        <CardContent className="p-0">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {comments.length === 0 ? "No comments yet" : "No comments found"}
              </h3>
              <p className="text-muted-foreground">
                {comments.length === 0
                  ? "Comments will appear here once users start engaging with your posts"
                  : "Try adjusting your filters to see more results"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {(comment.authorName || comment.authorEmail || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {comment.authorName || comment.authorEmail || "Anonymous"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {comment.authorEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">
                            {comment.content}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/blog/${comment.postSlug}`}
                            className="text-primary hover:underline truncate block max-w-xs"
                          >
                            {comment.postTitle}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {comment.parentId ? (
                            <Badge variant="secondary">Reply</Badge>
                          ) : (
                            <Badge variant="outline">Top Level</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/blog/${comment.postSlug}`} target="_blank">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="sr-only">View Post</span>
                              </Button>
                            </Link>
                            {(userRole === "admin" || userRole === "editor") && (
                              <DeleteCommentButton
                                commentId={comment.id}
                                commentPreview={comment.content.substring(0, 100)}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredComments.length)} of{" "}
                    {filteredComments.length} comments
                    {hasActiveFilters && ` (filtered from ${comments.length} total)`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}