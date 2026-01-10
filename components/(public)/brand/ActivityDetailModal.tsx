/* eslint-disable @next/next/no-img-element */
// components/(public)/brand/ActivityDetailModal.tsx
"use client";

import { BrandActivity } from "@/lib/db/schema";
import { X, Calendar } from "lucide-react";
import { useEffect } from "react";

interface ActivityDetailModalProps {
  activity: BrandActivity;
  theme: {
    text: string;
    primary: string;
    bg: string;
  };
  onClose: () => void;
}

export function ActivityDetailModal({ activity, theme, onClose }: ActivityDetailModalProps) {
  const formattedDate = new Date(activity.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-all hover:scale-110 shadow-lg"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Hero Image */}
        <div className="relative aspect-21/9 overflow-hidden rounded-t-3xl bg-muted">
          <img
            src={activity.imageUrl || "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=1600&q=80"}
            alt={activity.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=1600&q=80";
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-14">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90 font-semibold uppercase tracking-wider text-sm">
                {formattedDate}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl">
              {activity.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 lg:p-14">
          {/* Action Buttons */}
          {/* <div className="flex flex-wrap gap-3 mb-10 pb-10 border-b border-border/50">
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-xl"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Activity
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div> */}

          {/* Description */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>
                About This Activity
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>

            {/* Additional Details Section */}
            {/* <div className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-border/50">
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: theme.bg }}>
                <div className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
                  100+
                </div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                  Participants
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: theme.bg }}>
                <div className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
                  5+
                </div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                  Locations
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: theme.bg }}>
                <div className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
                  24h
                </div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                  Duration
                </div>
              </div>
            </div> */}
          </div>

          {/* Call to Action */}
          {/* <div className="mt-12 pt-10 border-t border-border/50">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-8 rounded-2xl">
              <div>
                <h3 className="text-2xl font-bold mb-2">Want to Get Involved?</h3>
                <p className="text-muted-foreground">
                  Learn more about how you can participate in our activities.
                </p>
              </div>
              <Button 
                size="lg"
                className="text-white px-8 py-6 text-base rounded-xl hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                style={{ backgroundColor: theme.primary }}
              >
                Contact Us →
              </Button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}