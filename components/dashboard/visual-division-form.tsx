/* eslint-disable @typescript-eslint/no-unused-vars */
// components/dashboard/visual-division-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { ThemeSelector, generateThemeFromColor, Theme } from "@/components/ui/theme-selector";
import { User, BrandDivision, BrandActivity } from "@/lib/db/schema"; // Added BrandActivity
import { divisionsAPI } from "@/lib/api/client/divisions";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Save, X, Check, ArrowLeft, Loader2, MapPin, Truck, Star, Award, TrendingUp, Mail, Phone, MapPinIcon, CheckCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// --- NEW DND IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DivisionFormProps {
  user: User;
  division?: BrandDivision;
}

interface Service {
  name: string;
  description: string;
}

interface TeamMember {
  name: string;
  position: string;
}

// --- NEW SortableActivityItem Component ---
interface SortableActivityItemProps {
  activity: BrandActivity;
  onUpdate: (id: number, data: Partial<BrandActivity>) => void;
  onDelete: (id: number) => void;
}

function SortableActivityItem({ activity, onUpdate, onDelete }: SortableActivityItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(activity);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(activity.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(activity);
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("group flex items-start gap-4 p-4 border rounded-lg bg-card", isDragging && "shadow-lg")}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grab pt-1">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-3">
        {isEditing ? (
          <>
            <Input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
            <Textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
            <FileUpload
              value={editData.imageUrl}
              onChange={(url) => setEditData({ ...editData, imageUrl: url })}
              folder="divisions/activities"
              label="Activity Image"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm"><Check className="w-4 h-4" /></Button>
              <Button onClick={handleCancel} variant="outline" size="sm"><X className="w-4 h-4" /></Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{activity.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm"><Edit2 className="w-4 h-4" /></Button>
                <Button onClick={() => onDelete(activity.id)} variant="ghost" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <img src={activity.imageUrl} alt={activity.title} className="mt-3 rounded-md w-full h-40 object-cover border" />
          </>
        )}
      </div>
    </div>
  );
}

export function VisualDivisionForm({ user, division }: DivisionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugValidation, setSlugValidation] = useState<{ checking: boolean; available: boolean; message: string }>({
    checking: false,
    available: true,
    message: "",
  });
  const [editMode, setEditMode] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // --- NEW ACTIVITY STATE ---
  const [activities, setActivities] = useState<BrandActivity[]>([]);
  const [newActivity, setNewActivity] = useState({ title: '', description: '', imageUrl: '' });
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // --- NEW DND SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize theme with proper defaults
  const getInitialTheme = () => {
    if (division?.theme && Object.keys(division.theme).length > 0) {
      return division.theme;
    }
    return generateThemeFromColor(division?.color || "#3b82f6");
  };

  const [formData, setFormData] = useState({
    name: division?.name || "",
    slug: division?.slug || "",
    tagline: division?.tagline || "",
    description: division?.description || "",
    fullDescription: division?.fullDescription || "",
    coverage: division?.coverage || "",
    delivery: division?.delivery || "",
    backgroundImage: division?.backgroundImage || "",
    logo: division?.logo || "",
    color: division?.color || "#3b82f6",
    featured: division?.featured || false,
    stats: division?.stats || {
      label1: "",
      value1: "",
      label2: "",
      value2: "",
      label3: "",
      value3: "",
      label4: "",
      value4: "",
    },
    services: division?.services || [],
    achievements: division?.achievements || [],
    team: division?.team || [],
    theme: getInitialTheme(),
  });

  // --- NEW ACTIVITY FETCH EFFECT ---
  useEffect(() => {
    if (division) {
      divisionsAPI.getActivities(division.id).then(setActivities).catch(console.error);
    }
  }, [division]);

  // --- NEW ACTIVITY HANDLERS ---
  const handleAddActivity = async () => {
    if (!division) return;
    if (!newActivity.title || !newActivity.description || !newActivity.imageUrl) {
      toast.error("Please fill all activity fields");
      return;
    }
    setIsAddingActivity(true);
    try {
      const result = await divisionsAPI.createActivity(division.id, newActivity);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {  // Add this check
        setActivities([...activities, result.data]);
        setNewActivity({ title: '', description: '', imageUrl: '' });
        toast.success("Activity added successfully");
      }
    } catch (error) {
      toast.error("Failed to add activity");
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleUpdateActivity = async (id: number, data: Partial<BrandActivity>) => {
    try {
      const result = await divisionsAPI.updateActivity(id, data);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setActivities(activities.map(a => a.id === id ? result.data! : a));
        toast.success("Activity updated");
      }
    } catch (error) {
      toast.error("Failed to update activity");
    }
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      await divisionsAPI.deleteActivity(id);
      setActivities(activities.filter(a => a.id !== id));
      toast.success("Activity deleted");
    } catch (error) {
      toast.error("Failed to delete activity");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && division) {
      const oldIndex = activities.findIndex((item) => item.id === active.id);
      const newIndex = activities.findIndex((item) => item.id === over?.id);

      const newActivities = arrayMove(activities, oldIndex, newIndex);
      setActivities(newActivities);

      const newOrder = newActivities.map(a => a.id);
      await divisionsAPI.reorderActivities(division.id, newOrder);
    }
  };

  // Validate slug when it changes
  useEffect(() => {
    const validateSlug = async () => {
      if (!formData.slug || formData.slug === division?.slug) {
        setSlugValidation({ checking: false, available: true, message: "" });
        return;
      }

      setSlugValidation({ checking: true, available: true, message: "Checking..." });

      const result = await divisionsAPI.validateSlug(formData.slug, division?.id);
      
      if (result.data) {
        setSlugValidation({
          checking: false,
          available: result.data.available,
          message: result.data.available ? "✓ Slug is available" : result.data.error || "Slug is not available",
        });
      }
    };

    const timeoutId = setTimeout(validateSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.slug, division?.slug, division?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats, [field]: value },
    }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const color = typeof e === 'string' ? e : e.target.value;
    setFormData(prev => ({
        ...prev,
        color,
        theme: generateThemeFromColor(color),
    }));
    };

  const handleThemeChange = (theme: Theme) => {
    setFormData(prev => ({
      ...prev,
      theme,
    }));
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
        ...prev,
        name,
        slug: !division ? divisionsAPI.generateSlug(name) : prev.slug,
    }));
    };

  // Services management
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: "", description: "" }],
    }));
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      ),
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  // Achievements management
  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const updateAchievement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) =>
        i === index ? value : achievement
      ),
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  // Team management
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: "", position: "" }],
    }));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slugValidation.available) {
      toast.error("Please fix the slug before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure theme is properly formatted before submission
      const dataToSubmit = {
        ...formData,
        theme: {
          ...formData.theme,
          // Ensure all theme properties exist
          primary: formData.theme.primary || formData.color,
          bg: formData.theme.bg || `${formData.color}1A`,
          bgSolid: formData.theme.bgSolid || `${formData.color}0D`,
          border: formData.theme.border || `${formData.color}33`,
          text: formData.theme.text || formData.color,
          accent: formData.theme.accent || formData.color,
          hover: formData.theme.hover || formData.color,
          gradient: formData.theme.gradient || `linear-gradient(135deg, ${formData.color} 0%, ${formData.color}CC 100%)`,
        }
      };

      if (division) {
        const result = await divisionsAPI.update(division.id, dataToSubmit);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Division updated successfully");
          router.push("/dashboard/divisions");
          router.refresh();
        }
      } else {
        const result = await divisionsAPI.create(dataToSubmit);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Division created successfully");
          router.push("/dashboard/divisions");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error saving division:", error);
      toast.error("Failed to save division");
    } finally {
      setIsSubmitting(false);
    }
  };

  const theme = formData.theme;

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* Header with preview toggle */}
      <div className="sticky top-0 z-50 bg-background border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">
            {division ? "Edit Division" : "Create New Division"}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={previewMode ? "preview" : "edit"} onValueChange={(value) => setPreviewMode(value === "preview")}>
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button type="submit" disabled={isSubmitting || !slugValidation.available}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {division ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {division ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </div>

      {previewMode ? (
        // Preview Mode - Show the actual page layout
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="relative overflow-hidden h-[85vh] min-h-150">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${formData.backgroundImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2070&q=80"})` }}
            />
            <div
              className="absolute inset-0 mix-blend-multiply opacity-50"
              style={{ backgroundColor: theme.primary }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            
            <div className="relative z-10 h-full flex flex-col container mx-auto px-6 lg:px-10">
              <div className="pt-14 flex justify-between items-start">
                <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Divisions
                </Button>
                
                {/* Logo on top for mobile */}
                <div className="md:hidden">
                  <div className="w-20 h-20 relative">
                    <img
                      src={formData.logo || "/placeholder-logo.png"}
                      alt={`${formData.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-end pb-20">
                <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between">
                  <div className="max-w-5xl">
                    <p className="text-sm font-bold tracking-[0.3em] uppercase mb-6" style={{ color: theme.text }}>
                      {formData.tagline}
                    </p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 text-white">
                      {formData.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-6 max-w-3xl font-light">
                      {formData.description}
                    </p>
                    <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-3xl">
                      {formData.fullDescription}
                    </p>
                  </div>
                  
                  {/* Logo on right side for desktop - positioned in middle */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-40 h-40 lg:w-48 lg:h-48 relative">
                      <img
                        src={formData.logo || "/placeholder-logo.png"}
                        alt={`${formData.name} logo`}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        style={{ filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.5))" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {[
                  { label: formData.stats?.label1 || "", value: formData.stats?.value1 || "" },
                  { label: formData.stats?.label2 || "", value: formData.stats?.value2 || "" },
                  { label: formData.stats?.label3 || "", value: formData.stats?.value3 || "" },
                  { label: formData.stats?.label4 || "", value: formData.stats?.value4 || "" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3" style={{ color: theme.primary }}>
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Coverage & Delivery */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                        <MapPin className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Geographic Coverage
                        </p>
                        <p className="text-2xl md:text-3xl font-bold">{formData.coverage}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our extensive network spans across continents, ensuring we can deliver exceptional service wherever you need us.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                        <Truck className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Service Delivery
                        </p>
                        <p className="text-2xl md:text-3xl font-bold">{formData.delivery}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We offer flexible delivery options tailored to your preferences, combining modern technology with personal touch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    What We Offer
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl">
                    Comprehensive solutions designed to meet your unique needs with excellence and precision.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formData.services?.map((service, index) => (
                    <div key={index} className="group">
                      <div className="flex items-start gap-6 py-8 border-t border-border/50">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: theme.bg }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold mb-3">{service.name}</h3>
                          <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Activities - NEW SECTION FOR PREVIEW MODE */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    What We Do
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Activities</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl">
                    Showcase the key activities and operations of this division.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activities.map((activity) => (
                    <div key={activity.id} className="group">
                      <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-3">{activity.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                      Our Impact
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Key Achievements</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Milestones that demonstrate our commitment to excellence and innovation in everything we do.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {formData.achievements?.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-4 group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: theme.bg }}>
                          <CheckCircle className="h-4 w-4" style={{ color: theme.text }} />
                        </div>
                        <p className="text-base md:text-lg leading-relaxed pt-1">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Team */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    Meet Our Team
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Leadership</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Experienced professionals dedicated to driving our mission forward with vision and expertise.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {formData.team?.map((member, index) => (
                    <div key={index} className="text-center group">
                      <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ backgroundColor: theme.primary }}>
                        <span className="text-white font-bold text-3xl">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Quick Facts */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex items-center justify-between py-6 border-b-2 border-border/50">
                    <div className="flex items-center gap-3">
                      <Star className="h-6 w-6" style={{ color: theme.text }} />
                      <span className="font-semibold text-lg">Industry Rating</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5" style={{ color: theme.text }} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-6 border-b-2 border-border/50">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6" style={{ color: theme.text }} />
                      <span className="font-semibold text-lg">Response Time</span>
                    </div>
                    <span className="font-bold text-2xl" style={{ color: theme.text }}>24hrs</span>
                  </div>

                  <div className="flex items-center justify-between py-6 border-b-2 border-border/50">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6" style={{ color: theme.text }} />
                      <span className="font-semibold text-lg">Client Retention</span>
                    </div>
                    <span className="font-bold text-2xl" style={{ color: theme.text }}>95%+</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-24">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                      Let&apos;s Connect
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                      Ready to start your journey with us? Our team is here to answer your questions and help you get started.
                    </p>

                    <Button 
                      className="text-white px-8 py-6 text-lg border-0 hover:opacity-90 shadow-xl"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Schedule Consultation
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-4 py-6 border-b border-border/50">
                      <Mail className="h-6 w-6 mt-1 shrink-0" style={{ color: theme.text }} />
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Email
                        </p>
                        <p className="text-lg font-medium">
                          info@kcifoundation.org
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 py-6 border-b border-border/50">
                      <Phone className="h-6 w-6 mt-1 shrink-0" style={{ color: theme.text }} />
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Phone
                        </p>
                        <p className="text-lg font-medium">+62 21 83787735</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 py-6 border-b border-border/50">
                      <MapPinIcon className="h-6 w-6 mt-1 shrink-0" style={{ color: theme.text }} />
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Address
                        </p>
                        <p className="text-lg font-medium leading-relaxed">
                          Jl. Tebet Timur Dalam II No.38B, Tebet,<br />
                          Jakarta Selatan 12820
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        // Edit Mode - Show the page layout with editable fields
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="relative overflow-hidden h-[85vh] min-h-150">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${formData.backgroundImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2070&q=80"})` }}
            />
            <div
              className="absolute inset-0 mix-blend-multiply opacity-50"
              style={{ backgroundColor: theme.primary }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            
            <div className="relative z-10 h-full flex flex-col container mx-auto px-6 lg:px-10">
              <div className="pt-14 flex justify-between items-start">
                <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Divisions
                </Button>
                
                {/* Logo on top for mobile */}
                <div className="md:hidden">
                  <div className="w-20 h-20 relative">
                    <FileUpload
                      value={formData.logo}
                      onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                      folder="divisions/logos"
                      label=""
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-end pb-20">
                <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between">
                  <div className="max-w-5xl">
                    <EditableField
                      value={formData.tagline}
                      onChange={(value) => setFormData(prev => ({ ...prev, tagline: value }))}
                      className="text-sm font-bold tracking-[0.3em] uppercase mb-6"
                      style={{ color: theme.text }}
                      placeholder="Enter tagline"
                    />
                    <EditableField
                      value={formData.name}
                      onChange={handleNameChange}
                      className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 text-white"
                      placeholder="Enter division name"
                    />
                    <EditableField
                      value={formData.description}
                      onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                      className="text-xl md:text-2xl text-white/95 leading-relaxed mb-6 max-w-3xl font-light"
                      placeholder="Enter short description"
                    />
                    <EditableTextarea
                      value={formData.fullDescription}
                      onChange={(value) => setFormData(prev => ({ ...prev, fullDescription: value }))}
                      className="text-base md:text-lg text-white/80 leading-relaxed max-w-3xl"
                      placeholder="Enter full description"
                    />
                  </div>
                  
                  {/* Logo on right side for desktop - positioned in middle */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-40 h-40 lg:w-48 lg:h-48 relative">
                      <FileUpload
                        value={formData.logo}
                        onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                        folder="divisions/logos"
                        label=""
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="text-center">
                    <EditableField
                      value={formData.stats[`value${num}` as keyof typeof formData.stats]}
                      onChange={(value) => handleStatsChange(`value${num}`, value)}
                      className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
                      style={{ color: theme.primary }}
                      placeholder="0"
                    />
                    <EditableField
                      value={formData.stats[`label${num}` as keyof typeof formData.stats]}
                      onChange={(value) => handleStatsChange(`label${num}`, value)}
                      className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wide"
                      placeholder="Label"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Coverage & Delivery */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                        <MapPin className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Geographic Coverage
                        </p>
                        <EditableField
                          value={formData.coverage}
                          onChange={(value) => setFormData(prev => ({ ...prev, coverage: value }))}
                          className="text-2xl md:text-3xl font-bold"
                          placeholder="Enter coverage area"
                        />
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our extensive network spans across continents, ensuring we can deliver exceptional service wherever you need us.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                        <Truck className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Service Delivery
                        </p>
                        <EditableField
                          value={formData.delivery}
                          onChange={(value) => setFormData(prev => ({ ...prev, delivery: value }))}
                          className="text-2xl md:text-3xl font-bold"
                          placeholder="Enter delivery time"
                        />
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      We offer flexible delivery options tailored to your preferences, combining modern technology with personal touch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    What We Offer
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl">
                    Comprehensive solutions designed to meet your unique needs with excellence and precision.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formData.services?.map((service, index) => (
                    <div key={index} className="group">
                      <div className="flex items-start gap-6 py-8 border-t border-border/50">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: theme.bg }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <EditableField
                              value={service.name}
                              onChange={(value) => updateService(index, "name", value)}
                              className="text-xl md:text-2xl font-bold"
                              placeholder="Service name"
                            />
                            <Button
                              type="button"
                              onClick={() => removeService(index)}
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <EditableTextarea
                            value={service.description}
                            onChange={(value) => updateService(index, "description", value)}
                            className="text-muted-foreground leading-relaxed"
                            placeholder="Service description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center pt-8">
                    <Button type="button" onClick={addService} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- NEW ACTIVITY SECTION START --- */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    What We Do
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Activities</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl">Showcase the key activities and operations of this division.</p>
                </div>

                {/* Add New Activity Form */}
                <Card className="mb-8 py-6">
                  <CardHeader><CardTitle>Add New Activity</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label htmlFor="activity-title">Title</Label><Input id="activity-title" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} placeholder="Activity title" /></div>
                    <div><Label htmlFor="activity-description">Description</Label><Textarea id="activity-description" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} placeholder="Brief description of the activity" /></div>
                    <div><Label>Image</Label><FileUpload value={newActivity.imageUrl} onChange={(url) => setNewActivity({ ...newActivity, imageUrl: url })} folder="divisions/activities" label="Upload activity image" /></div>
                    <Button onClick={handleAddActivity} disabled={isAddingActivity} className="w-full">
                      {isAddingActivity ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Add Activity
                    </Button>
                  </CardContent>
                </Card>

                {/* List of Existing Activities */}
                {activities.length > 0 && (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <SortableActivityItem key={activity.id} activity={activity} onUpdate={handleUpdateActivity} onDelete={handleDeleteActivity} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </section>
          {/* --- NEW ACTIVITY SECTION END --- */}

          {/* Achievements */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                      Our Impact
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Key Achievements</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Milestones that demonstrate our commitment to excellence and innovation in everything we do.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {formData.achievements?.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-4 group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: theme.bg }}>
                          <CheckCircle className="h-4 w-4" style={{ color: theme.text }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <EditableField
                              value={achievement}
                              onChange={(value) => updateAchievement(index, value)}
                              className="text-base md:text-lg leading-relaxed pt-1"
                              placeholder="Enter achievement"
                            />
                            <Button
                              type="button"
                              onClick={() => removeAchievement(index)}
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center pt-4">
                      <Button type="button" onClick={addAchievement} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Team */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    Meet Our Team
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Leadership</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Experienced professionals dedicated to driving our mission forward with vision and expertise.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {formData.team?.map((member, index) => (
                    <div key={index} className="text-center group">
                      <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ backgroundColor: theme.primary }}>
                        <span className="text-white font-bold text-3xl">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <EditableField
                          value={member.name}
                          onChange={(value) => updateTeamMember(index, "name", value)}
                          className="text-lg font-bold"
                          placeholder="Name"
                        />
                        <EditableField
                          value={member.position}
                          onChange={(value) => updateTeamMember(index, "position", value)}
                          className="text-sm text-muted-foreground"
                          placeholder="Position"
                        />
                        <Button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center">
                    <Button type="button" onClick={addTeamMember} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Settings Section */}
          <section className="py-20 border-b border-border/50">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    Configuration
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <h3 className="text-xl font-bold mb-6">Basic Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="slug" className="block mb-2">URL Slug</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="division-url-slug"
                            required
                            className={cn(
                              !slugValidation.available && "border-red-500"
                            )}
                          />
                          {slugValidation.checking && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        {slugValidation.message && (
                          <p className={cn(
                            "text-sm mt-1",
                            slugValidation.available ? "text-green-600" : "text-red-600"
                          )}>
                            {slugValidation.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="featured">Featured Division</Label>
                          <p className="text-sm text-muted-foreground">
                            Display this division prominently on the homepage
                          </p>
                        </div>
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6">Visual Assets</h3>
                    <div className="space-y-6">
                      <div>
                        <Label className="block mb-2">Background Image</Label>
                        <FileUpload
                          value={formData.backgroundImage}
                          onChange={(url) => setFormData(prev => ({ ...prev, backgroundImage: url }))}
                          folder="divisions/backgrounds"
                          label=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Configuration */}
          <section className="py-20">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                  <p className="text-sm font-bold tracking-[0.3em] uppercase mb-4" style={{ color: theme.text }}>
                    Customization
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Theme & Colors</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl">
                    Customize the appearance of your division page
                  </p>
                </div>

                <div className="bg-card p-8 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="block mb-4">Brand Color</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="color"
                          value={formData.color}
                          onChange={handleColorChange}
                          className="w-20 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          value={formData.color}
                          onChange={handleColorChange}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This color will be used throughout the page
                      </p>
                    </div>

                    <div>
                      <Label className="block mb-4">Preview</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-12 rounded" style={{ backgroundColor: theme.primary }}></div>
                        <div className="h-12 rounded" style={{ backgroundColor: theme.bg }}></div>
                        <div className="h-12 rounded" style={{ backgroundColor: theme.accent }}></div>
                        <div className="h-12 rounded" style={{ backgroundColor: theme.text }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </form>
  );
}

// Editable field component
function EditableField({
  value,
  onChange,
  className,
  placeholder,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          autoFocus
        />
        <Button type="button" size="sm" onClick={handleSave}>
          <Check className="w-4 h-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn("group relative", className)}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-muted-foreground/50">{placeholder}</span>}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit2 className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

// Editable textarea component
function EditableTextarea({
  value,
  onChange,
  className,
  placeholder,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("group relative", className)}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-muted-foreground/50">{placeholder}</span>}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit2 className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}