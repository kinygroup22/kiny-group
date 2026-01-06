/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/posts/PostsTableClient.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Edit, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Search,
  Filter,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import DeletePostButton from "@/components/dashboard/posts/DeletePostButton";
import { useState, useMemo, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the Category type
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Client component for the posts table with pagination and filtering
export default function PostsTableClient({ posts, user }: { posts: any[], user: any }) {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  // State for categories
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data: Category[] = await response.json();
        // Extract just the category names for the filter
        setCategories(data.map(cat => cat.name));
        setCategoriesError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories');
        // Fallback to extracting categories from posts if API fails
        const uniqueCategories = new Set(
            posts
                .map(post => post.category)
                .filter(Boolean)
                .map(cat => cat.trim())
            );
        setCategories(Array.from(uniqueCategories));
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, [posts]);
  
  // Filter posts based on search and filter criteria
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "published" && post.publishedAt) ||
        (statusFilter === "draft" && !post.publishedAt);
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        (post.category && post.category.trim().toLowerCase() === categoryFilter.trim().toLowerCase());
      
      // Featured filter
      const matchesFeatured = featuredFilter === "all" || 
        (featuredFilter === "featured" && post.featured) ||
        (featuredFilter === "not-featured" && !post.featured);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesFeatured;
    });
  }, [posts, searchTerm, statusFilter, categoryFilter, featuredFilter]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);
  
  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setFeaturedFilter("all");
    setCurrentPage(1);
  };
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || 
    statusFilter !== "all" || 
    categoryFilter !== "all" || 
    featuredFilter !== "all";
  
  return (
    <>
      {/* Posts Table */}
      <Card className="border-0 shadow-xl py-6">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl">All Posts</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search posts..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                    <Button 
                    variant="outline" 
                    size="icon" 
                    className={hasActiveFilters ? "bg-yellow-50 text-yellow-600 border-yellow-600 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900" : ""}
                    >
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {[statusFilter !== "all", categoryFilter !== "all", featuredFilter !== "all"].filter(Boolean).length}
                        </span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">Filter Posts</h4>
                        </div>
                        {hasActiveFilters && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters} 
                            className="h-7 px-2 text-xs hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-950"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear all
                        </Button>
                        )}
                    </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Publication Status
                        </label>
                        <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value);
                        handleFilterChange();
                        }}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                All Posts
                            </div>
                            </SelectItem>
                            <SelectItem value="published">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                Published
                            </div>
                            </SelectItem>
                            <SelectItem value="draft">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                Draft
                            </div>
                            </SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Category
                        </label>
                        {categoriesLoading ? (
                        <div className="flex items-center justify-center py-4 bg-muted/30 rounded-md">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                        </div>
                        ) : categoriesError ? (
                        <div className="text-sm text-red-500 py-3 px-3 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-900">
                            {categoriesError}
                        </div>
                        ) : (
                        <Select value={categoryFilter} onValueChange={(value) => {
                            setCategoryFilter(value);
                            handleFilterChange();
                        }}>
                            <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.sort().map(category => (
                                <SelectItem key={category} value={category}>
                                {category}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Featured Status
                        </label>
                        <Select value={featuredFilter} onValueChange={(value) => {
                        setFeaturedFilter(value);
                        handleFilterChange();
                        }}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select featured status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Posts</SelectItem>
                            <SelectItem value="featured">⭐ Featured Only</SelectItem>
                            <SelectItem value="not-featured">Regular Posts</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    </div>
                    
                    {hasActiveFilters && (
                    <div className="p-3 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground text-center">
                        {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
                        </p>
                    </div>
                    )}
                </PopoverContent>
                </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {hasActiveFilters ? "No posts match your filters" : "No posts yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first blog post and start sharing your content with the world."
                }
              </p>
              {!hasActiveFilters && (
                <Link href="/dashboard/posts/new">
                  <Button className="flex items-center gap-2 mx-auto bg-yellow-600 hover:bg-yellow-700">
                    <Plus className="w-4 h-4" />
                    Create Your First Post
                  </Button>
                </Link>
              )}
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 mx-auto">
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <Eye className="h-4 w-4 inline" />
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <Heart className="h-4 w-4 inline" />
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <MessageCircle className="h-4 w-4 inline" />
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                              {post.featuredImage ? (
                                <Image
                                  src={post.featuredImage}
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-yellow-400 to-yellow-600">
                                  <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link 
                                href={`/blog/${post.slug}`} 
                                target="_blank"
                                className="font-medium text-foreground hover:text-yellow-600 transition-colors line-clamp-1 block"
                              >
                                {post.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                {post.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {post.category}
                                  </Badge>
                                )}
                                {post.featured && (
                                  <Badge variant="secondary" className="text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {post.authorImage ? (
                              <Image
                                src={post.authorImage}
                                alt={post.authorName || "Author"}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {post.authorName || post.authorEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {post.publishedAt ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-0">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                              Draft
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {(post.views || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center text-sm font-semibold text-red-600 dark:text-red-400">
                            {(post.likes || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            {(post.commentsCount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Button variant="ghost" size="sm" title="View Post">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/posts/${post.id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit Post">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {(user.role === "admin" || user.role === "editor" || post.authorId === user.id) && (
                              <DeletePostButton postId={post.id} postTitle={post.title} />
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, filteredPosts.length)} of {filteredPosts.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}