/* eslint-disable @next/next/no-img-element */
// components/(public)/brand/ActivityCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { BrandActivity } from "@/lib/db/schema";

interface ActivityCardProps {
  activity: BrandActivity;
  theme: {
    text: string;
    primary: string;
    bg: string;
  };
  onViewActivity?: (activity: BrandActivity) => void;
}

export function ActivityCard({ activity, theme, onViewActivity }: ActivityCardProps) {
  const formattedDate = new Date(activity.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card 
      className="group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 h-full flex flex-col border-border/50 cursor-pointer bg-card/50 backdrop-blur-sm"
      onClick={() => onViewActivity?.(activity)}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <img
          src={activity.imageUrl || "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800&q=80"}
          alt={activity.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800&q=80"; 
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <CardContent className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.bg }}
          >
            <Calendar className="h-4 w-4" style={{ color: theme.text }} />
          </div>
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {formattedDate}
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {activity.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6 flex-1 line-clamp-3">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all duration-300" style={{ color: theme.primary }}>
          <span>Read More</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
}