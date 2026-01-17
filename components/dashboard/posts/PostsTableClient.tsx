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
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced event countdown with better formatting
const getEventCountdown = (startDate: Date | null, endDate: Date | null, isActive: boolean | null) => {
  if (!startDate || !endDate) return null;
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (!isActive) {
    return {
      status: "ended",
      label: "Event Ended",
      sublabel: format(end, "MMM d, yyyy 'at' h:mm a"),
      color: "text-muted-foreground",
      icon: "🏁"
    };
  }
  
  // Event is upcoming
  if (now < start) {
    const daysUntil = differenceInDays(start, now);
    const hoursUntil = differenceInHours(start, now) % 24;
    
    if (daysUntil === 0) {
      if (hoursUntil === 0) {
        const minutesUntil = differenceInMinutes(start, now);
        return {
          status: "imminent",
          label: `Starts in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`,
          sublabel: format(start, "h:mm a"),
          color: "text-orange-600 dark:text-orange-500",
          icon: "🔥"
        };
      }
      return {
        status: "today",
        label: `Starts in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
        sublabel: format(start, "h:mm a"),
        color: "text-orange-600 dark:text-orange-500",
        icon: "⏰"
      };
    } else if (daysUntil === 1) {
      return {
        status: "tomorrow",
        label: "Starts Tomorrow",
        sublabel: format(start, "MMM d 'at' h:mm a"),
        color: "text-blue-600 dark:text-blue-400",
        icon: "📅"
      };
    } else if (daysUntil <= 7) {
      return {
        status: "soon",
        label: `Starts in ${daysUntil} days`,
        sublabel: format(start, "EEE, MMM d 'at' h:mm a"),
        color: "text-blue-600 dark:text-blue-400",
        icon: "📆"
      };
    } else {
      return {
        status: "upcoming",
        label: `Starts in ${daysUntil} days`,
        sublabel: format(start, "MMM d, yyyy 'at' h:mm a"),
        color: "text-blue-500 dark:text-blue-400",
        icon: "📅"
      };
    }
  }
  
  // Event is ongoing
  if (now >= start && now <= end) {
    const totalDuration = differenceInHours(end, start);
    const remaining = differenceInHours(end, now);
    
    if (totalDuration < 24) {
      return {
        status: "live",
        label: `Live Now • ${remaining}h left`,
        sublabel: `Ends at ${format(end, "h:mm a")}`,
        color: "text-green-600 dark:text-green-500 animate-pulse",
        icon: "🔴"
      };
    } else {
      const totalDays = differenceInDays(end, start) + 1;
      const currentDay = differenceInDays(now, start) + 1;
      const daysRemaining = differenceInDays(end, now);
      
      return {
        status: "live",
        label: `Day ${currentDay} of ${totalDays}`,
        sublabel: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`,
        color: "text-green-600 dark:text-green-500",
        icon: "🟢"
      };
    }
  }
  
  // Event has ended
  const daysSinceEnd = differenceInDays(now, end);
  return {
    status: "past",
    label: "Event Ended",
    sublabel: `${daysSinceEnd} day${daysSinceEnd !== 1 ? 's' : ''} ago`,
    color: "text-muted-foreground",
    icon: "🏁"
  };
};

// Get event status badge
const getEventStatusBadge = (startDate: Date | null, endDate: Date | null, isActive: boolean | null) => {
  if (!startDate || !endDate) return null;
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (!isActive) {
    return { 
      label: "Inactive", 
      className: "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800" 
    };
  } else if (now < start) {
    return { 
      label: "Upcoming", 
      className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900" 
    };
  } else if (now >= start && now <= end) {
    return { 
      label: "Live", 
      className: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900 animate-pulse" 
    };
  } else {
    return { 
      label: "Ended", 
      className: "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800" 
    };
  }
};

export default function PostsTableClient({ posts, user }: { posts: any[], user: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data: Category[] = await response.json();
        setCategories(data.map(cat => cat.name));
        setCategoriesError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories');
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
  
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchTerm === "" || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "published" && post.publishedAt) ||
        (statusFilter === "draft" && !post.publishedAt);
      
      const matchesCategory = categoryFilter === "all" || 
        (post.category && post.category.trim().toLowerCase() === categoryFilter.trim().toLowerCase());
      
      const matchesFeatured = featuredFilter === "all" || 
        (featuredFilter === "featured" && post.featured) ||
        (featuredFilter === "not-featured" && !post.featured);
      
      const matchesEvent = eventFilter === "all" || 
        (eventFilter === "event" && post.isEvent) ||
        (eventFilter === "regular" && !post.isEvent);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesFeatured && matchesEvent;
    });
  }, [posts, searchTerm, statusFilter, categoryFilter, featuredFilter, eventFilter]);
  
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);
  
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setFeaturedFilter("all");
    setEventFilter("all");
    setCurrentPage(1);
  };
  
  const hasActiveFilters = searchTerm !== "" || 
    statusFilter !== "all" || 
    categoryFilter !== "all" || 
    featuredFilter !== "all" ||
    eventFilter !== "all";
  
  return (
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
                      {[statusFilter !== "all", categoryFilter !== "all", featuredFilter !== "all", eventFilter !== "all"].filter(Boolean).length}
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
                        <SelectItem value="all">All Posts</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Category
                    </label>
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
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
                      Post Type
                    </label>
                    <Select value={eventFilter} onValueChange={(value) => {
                      setEventFilter(value);
                      handleFilterChange();
                    }}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Posts</SelectItem>
                        <SelectItem value="event">Events Only</SelectItem>
                        <SelectItem value="regular">Regular Posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No posts match your filters" : "No posts yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters 
                ? "Try adjusting your filters." 
                : "Create your first post to get started."
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              <Link href="/dashboard/posts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Event Info</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Stats</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <TooltipProvider>
                    {paginatedPosts.map((post) => {
                      const eventCountdown = post.isEvent ? getEventCountdown(post.eventStartDate, post.eventEndDate, post.eventIsActive) : null;
                      const eventStatusBadge = post.isEvent ? getEventStatusBadge(post.eventStartDate, post.eventEndDate, post.eventIsActive) : null;
                      
                      return (
                        <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                {post.featuredImage ? (
                                  <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link href={`/blog/${post.slug}`} target="_blank" className="font-medium hover:text-yellow-600 line-clamp-1 block">
                                  {post.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {post.category && <Badge variant="outline" className="text-xs">{post.category}</Badge>}
                                  {post.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                                  {post.isEvent && (
                                    <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs">
                                      <CalendarDays className="h-3 w-3 mr-1" />
                                      Event
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {post.authorImage ? (
                                <Image src={post.authorImage} alt={post.authorName} width={32} height={32} className="rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{post.authorName || post.authorEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {post.publishedAt ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Published</Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-300 text-orange-700">Draft</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {post.isEvent && eventCountdown ? (
                              <div className="space-y-2.5 min-w-[220px]">
                                {/* Main countdown display */}
                                <div className="flex items-start gap-2.5">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900/30 dark:to-gold-800/30 flex items-center justify-center shadow-sm">
                                    <span className="text-base">{eventCountdown.icon}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold leading-tight ${eventCountdown.color}`}>
                                      {eventCountdown.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                                      {eventCountdown.sublabel}
                                    </p>
                                  </div>
                                </div>

                                {/* Status badge and details */}
                                <div className="space-y-2">
                                  {eventStatusBadge && (
                                    <Badge 
                                      className={`${eventStatusBadge.className} text-xs font-medium px-2.5 py-0.5 shadow-sm`}
                                    >
                                      {eventStatusBadge.label}
                                    </Badge>
                                  )}
                                  
                                  {/* Location and capacity in a compact grid */}
                                  <div className="space-y-1.5">
                                    {post.eventLocation && (
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <div className="flex-shrink-0 w-4 h-4 rounded bg-muted flex items-center justify-center">
                                          <MapPin className="h-2.5 w-2.5" />
                                        </div>
                                        <span className="truncate font-medium">{post.eventLocation}</span>
                                      </div>
                                    )}
                                    
                                    {post.eventMaxParticipants && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1.5 text-xs cursor-help">
                                            <div className="flex-shrink-0 w-4 h-4 rounded bg-muted flex items-center justify-center">
                                              <Users className="h-2.5 w-2.5 text-muted-foreground" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <span className={`font-semibold ${
                                                post.registrationCount >= post.eventMaxParticipants 
                                                  ? "text-red-600 dark:text-red-400" 
                                                  : post.registrationCount >= post.eventMaxParticipants * 0.8
                                                  ? "text-orange-600 dark:text-orange-400"
                                                  : "text-muted-foreground"
                                              }`}>
                                                {post.registrationCount || 0}
                                              </span>
                                              <span className="text-muted-foreground">/</span>
                                              <span className="text-muted-foreground">{post.eventMaxParticipants}</span>
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">
                                          <div className="space-y-1">
                                            <p className="font-semibold">{post.registrationCount || 0} registered</p>
                                            <p className="text-muted-foreground">
                                              {post.eventMaxParticipants - (post.registrationCount || 0)} spots remaining
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-muted-foreground text-sm font-medium">—</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-center">
                              <div className="flex items-center gap-3">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-sm flex items-center gap-1">
                                      <Eye className="h-3 w-3 text-purple-600" />
                                      {post.views || 0}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Views</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-sm flex items-center gap-1">
                                      <Heart className="h-3 w-3 text-red-600" />
                                      {post.likes || 0}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Likes</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-sm flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3 text-yellow-600" />
                                      {post.commentsCount || 0}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Comments</p></TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/blog/${post.slug}`} target="_blank">
                                    <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent><p>View Post</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                                    <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit Post</p></TooltipContent>
                              </Tooltip>
                              {post.isEvent && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/dashboard/posts/${post.id}/registrations`}>
                                      <Button variant="ghost" size="sm">
                                        <Users className="w-4 h-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent><p>View Registrations</p></TooltipContent>
                                </Tooltip>
                              )}
                              {(user.role === "admin" || user.role === "editor" || post.authorId === user.id) && (
                                <DeletePostButton postId={post.id} postTitle={post.title} />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </TooltipProvider>
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, filteredPosts.length)} of {filteredPosts.length}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}