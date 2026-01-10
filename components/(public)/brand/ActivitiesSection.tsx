// components/(public)/brand/ActivitiesSection.tsx
"use client";

import { useState, useMemo } from "react";
import { BrandDivision, BrandActivity } from "@/lib/db/schema";
import { getThemeColors } from "@/lib/theme-utils";
import { ActivityCard } from "./ActivityCard";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ActivitiesSectionProps {
  division: BrandDivision & { 
    activities?: BrandActivity[] 
  };
}

export function ActivitiesSection({ division }: ActivitiesSectionProps) {
  const [selectedActivity, setSelectedActivity] = useState<BrandActivity | null>(null);
  const [showAll, setShowAll] = useState(false);
  const theme = getThemeColors(division);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activities = division.activities || [];

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activities]);

  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(0, 6);

  const handleViewActivity = (activity: BrandActivity) => {
    setSelectedActivity(activity);
  };

  if (activities.length === 0) {
    return (
      <section className="py-32 border-b border-border/50 bg-linear-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: theme.bg }}
            >
              <Calendar className="h-12 w-12" style={{ color: theme.text }} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Activities Coming Soon</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We&apos;re working on some exciting initiatives and activities. Check back soon to see what we&apos;ve been up to and how we&apos;re making an impact!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-32 border-b border-border/50 bg-linear-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm mb-6">
                <TrendingUp className="h-4 w-4" style={{ color: theme.text }} />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.text }}>
                  Recent Updates
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                Our Activities
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover our latest initiatives, events, and programs that drive meaningful change and create lasting impact.
              </p>
            </div>

            {/* Featured Activity (First Item) */}
            {sortedActivities.length > 0 && (
              <div className="mb-16">
                <div 
                  className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer"
                  onClick={() => handleViewActivity(sortedActivities[0])}
                >
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="relative aspect-4/3 lg:aspect-auto overflow-hidden">
                      <Image
                        src={sortedActivities[0].imageUrl || "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=1200&q=80"}
                        alt={sortedActivities[0].title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=1200&q=80";
                        }}
                        fill
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent lg:bg-linear-to-r" />
                      <div className="absolute top-6 left-6">
                        <span 
                          className="inline-block px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg backdrop-blur-sm"
                          style={{ backgroundColor: theme.primary }}
                        >
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-10 lg:p-14 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-6">
                        <Calendar className="h-5 w-5" style={{ color: theme.text }} />
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          {new Date(sortedActivities[0].createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight group-hover:text-primary transition-colors">
                        {sortedActivities[0].title}
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-8 line-clamp-4">
                        {sortedActivities[0].description}
                      </p>
                      <Button 
                        className="text-white w-fit px-8 py-6 text-base rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: theme.primary }}
                      >
                        Read Full Story →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Grid */}
            {sortedActivities.length > 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {displayedActivities.slice(1).map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      theme={theme}
                      onViewActivity={handleViewActivity}
                    />
                  ))}
                </div>

                {/* Show More Button */}
                {sortedActivities.length > 6 && (
                  <div className="text-center">
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => setShowAll(!showAll)}
                      className="px-10 py-6 text-base rounded-xl border-2 hover:shadow-lg transition-all duration-300"
                      style={{ borderColor: theme.primary }}
                    >
                      {showAll ? 'Show Less' : `View All ${sortedActivities.length} Activities`} →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          theme={theme}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </>
  );
}