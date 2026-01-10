// app/dashboard/components/activity-feed.tsx
"use client";

import { useState, useMemo, JSX } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Building2,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  User,
  Mail,
  Activity as ActivityIcon,
  Filter
} from "lucide-react";
import { Activity, GroupedActivities } from "../types";
import Link from "next/link";

interface ActivityFeedProps {
  initialActivities: Activity[];
  initialGroupedActivities: GroupedActivities;
}

export function ActivityFeed({ 
  initialActivities, 
  initialGroupedActivities 
}: ActivityFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Today', 'Yesterday']));
  const [showAll, setShowAll] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter activities based on search and tab
  const filteredActivities = useMemo(() => {
    let filtered = initialActivities;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter(activity => activity.type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [initialActivities, activeTab, searchTerm]);

  // Group filtered activities
  const groupedActivities = useMemo(() => {
    const groups: GroupedActivities = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey = '';
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month';
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  // Get activity icon
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'brand':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get activity color
  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'post':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20';
      case 'comment':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20';
      case 'user':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20';
      case 'brand':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  // Count activities by type
  const activityCounts = useMemo(() => {
    const counts = {
      all: initialActivities.length,
      post: initialActivities.filter(a => a.type === 'post').length,
      comment: initialActivities.filter(a => a.type === 'comment').length,
      user: initialActivities.filter(a => a.type === 'user').length,
      brand: initialActivities.filter(a => a.type === 'brand').length,
    };
    return counts;
  }, [initialActivities]);

  if (initialActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">No recent activity</p>
        <p className="text-sm text-muted-foreground">
          Activity will appear here as users interact with the system
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="flex lg:hidden justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search and Filter - Desktop */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Activity Type Selector - Mobile Dropdown */}
        <div className="lg:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span>All</span>
                  <Badge variant="secondary">{activityCounts.all}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="post">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Posts</span>
                  <Badge variant="secondary">{activityCounts.post}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="comment">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                  <Badge variant="secondary">{activityCounts.comment}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="user">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                  <Badge variant="secondary">{activityCounts.user}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="brand">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Brands</span>
                  <Badge variant="secondary">{activityCounts.brand}</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs - Desktop Only */}
      <div className="hidden lg:block">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {activityCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="post" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
              <Badge variant="secondary" className="ml-1">
                {activityCounts.post}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="comment" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
              <Badge variant="secondary" className="ml-1">
                {activityCounts.comment}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
              <Badge variant="secondary" className="ml-1">
                {activityCounts.user}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Brands
              <Badge variant="secondary" className="ml-1">
                {activityCounts.brand}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ActivityList 
              groupedActivities={groupedActivities} 
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
              getActivityIcon={getActivityIcon}
              getActivityColor={getActivityColor}
              showAll={showAll}
              setShowAll={setShowAll}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Activity List */}
      <div className="lg:hidden">
        <ActivityList 
          groupedActivities={groupedActivities} 
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
          getActivityIcon={getActivityIcon}
          getActivityColor={getActivityColor}
          showAll={showAll}
          setShowAll={setShowAll}
        />
      </div>
    </div>
  );
}

// Extracted Activity List component for reuse
interface ActivityListProps {
  groupedActivities: GroupedActivities;
  expandedGroups: Set<string>;
  toggleGroup: (group: string) => void;
  getActivityIcon: (type: Activity['type']) => JSX.Element;
  getActivityColor: (type: Activity['type']) => string;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
}

function ActivityList({
  groupedActivities,
  expandedGroups,
  toggleGroup,
  getActivityIcon,
  getActivityColor,
  showAll,
  setShowAll
}: ActivityListProps) {
  if (Object.keys(groupedActivities).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          No activities found matching your filters
        </p>
      </div>
    );
  }

  const groupsToShow = showAll 
    ? Object.entries(groupedActivities) 
    : Object.entries(groupedActivities).slice(0, 3);

  return (
    <div className="space-y-4">
      {groupsToShow.map(([group, activities]) => (
        <div key={group} className="border rounded-lg overflow-hidden">
          {/* Group Header */}
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
            onClick={() => toggleGroup(group)}
          >
            <span className="font-medium">{group}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{activities.length}</Badge>
              {expandedGroups.has(group) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </Button>

          {/* Group Content */}
          {expandedGroups.has(group) && (
            <div className="divide-y">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Activity Icon */}
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {activity.action}
                      </p>
                      
                      {/* Additional Details */}
                      {activity.details && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {activity.type === 'comment' && activity.details.content && (
                            <p className="italic">&quot;{activity.details.content.substring(0, 100)}...&quot;</p>
                          )}
                          {activity.type === 'user' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Badge variant="outline" className="text-xs w-fit">
                                {activity.details.role}
                              </Badge>
                              {activity.details.userEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {activity.details.userEmail}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* User and Time */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.user}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.time}
                          </span>
                          
                          {/* Action Links */}
                          {activity.type === 'post' && activity.details?.slug && (
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <Link 
                                href={`/blog/${activity.details.slug}`}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Show More/Less Button */}
      {Object.keys(groupedActivities).length > 3 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      )}
    </div>
  );
}