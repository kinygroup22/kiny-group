// app/components/dashboard/division/reorderable-divisions-grid.tsx
"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Star, Calendar, User, GripVertical, Save, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { DeleteDivisionButton } from "@/components/dashboard/delete-division-button";

interface Division {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  logo: string | null;
  color: string | null;
  featured: boolean | null;
  order: number | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
  authorName: string | null;
  authorEmail: string | null;
}

interface ReorderableDivisionsGridProps {
  divisions: Division[];
  userRole: string;
  userId: number;
}

export function ReorderableDivisionsGrid({
  divisions: initialDivisions,
  userRole,
  userId,
}: ReorderableDivisionsGridProps) {
  const [divisions, setDivisions] = useState(initialDivisions);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalOrder, setOriginalOrder] = useState(initialDivisions);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEnterReorderMode = useCallback(() => {
    setIsReordering(true);
    setOriginalOrder([...divisions]);
    setHasChanges(false);
  }, [divisions]);

  const handleCancelReorder = useCallback(() => {
    setDivisions(originalOrder);
    setIsReordering(false);
    setHasChanges(false);
  }, [originalOrder]);

  const handleSaveOrder = useCallback(async () => {
    setIsSaving(true);
    try {
      const orderedIds = divisions.map((d) => d.id);
      const res = await fetch("/api/divisions/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save order");
      }

      setIsReordering(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save order:", error);
      alert(error instanceof Error ? error.message : "Failed to save order");
    } finally {
      setIsSaving(false);
    }
  }, [divisions]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: number) => {
      if (!isReordering) return;
      setDraggedId(id);
      e.dataTransfer.effectAllowed = "move";
      // Use a transparent image as drag preview
      const img = new window.Image();
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    },
    [isReordering]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: number) => {
      if (!isReordering || draggedId === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (id !== draggedId && id !== dragOverId) {
        setDragOverId(id);
      }

      // Perform the reorder on drag over for visual feedback
      if (id !== draggedId) {
        setDivisions((prev) => {
          const dragIndex = prev.findIndex((d) => d.id === draggedId);
          const overIndex = prev.findIndex((d) => d.id === id);
          if (dragIndex === -1 || overIndex === -1) return prev;

          const newItems = [...prev];
          const [removed] = newItems.splice(dragIndex, 1);
          newItems.splice(overIndex, 0, removed);
          return newItems;
        });
        setHasChanges(true);
      }
    },
    [isReordering, draggedId, dragOverId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  // Touch-based reorder (move up/down buttons)
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setDivisions((prev) => {
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems;
    });
    setHasChanges(true);
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setDivisions((prev) => {
      if (index === prev.length - 1) return prev;
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems;
    });
    setHasChanges(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Reorder Controls */}
      <div className="flex items-center justify-end gap-2">
        {!isReordering ? (
          <Button variant="outline" size="sm" onClick={handleEnterReorderMode}>
            <GripVertical className="w-4 h-4 mr-2" />
            Reorder
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelReorder}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSaving || !hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Order"}
            </Button>
          </>
        )}
      </div>

      {/* Divisions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {divisions.map((division, index) => (
          <Card
            key={division.id}
            className={`group transition-all duration-200 border-2 py-6 ${
              isReordering
                ? "cursor-grab active:cursor-grabbing"
                : "hover:shadow-lg hover:border-primary/50"
            } ${draggedId === division.id ? "opacity-50 scale-95" : ""} ${
              dragOverId === division.id ? "border-primary" : ""
            }`}
            draggable={isReordering}
            onDragStart={(e) => handleDragStart(e, division.id)}
            onDragOver={(e) => handleDragOver(e, division.id)}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="space-y-3">
              {/* Drag Handle + Logo and Featured Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {isReordering && (
                    <div className="flex flex-col items-center gap-0.5 mr-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                        title="Move up"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === divisions.length - 1}
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                        title="Move down"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  )}
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
                <div className="flex items-center gap-2">
                  {isReordering && (
                    <Badge variant="outline" className="text-xs tabular-nums">
                      #{index + 1}
                    </Badge>
                  )}
                  {division.featured && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
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

              {/* Action Buttons — hidden during reorder */}
              {!isReordering && (
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
                  {userRole === "admin" && (
                    <DeleteDivisionButton
                      divisionId={division.id}
                      divisionName={division.name}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}