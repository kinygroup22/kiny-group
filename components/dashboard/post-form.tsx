// components/dashboard/post-form.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BlogPost, User } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Save, 
  Eye, 
  AlertCircle, 
  X, 
  Image,
  Calendar,
  User as UserIcon,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  Tag,
  TrendingUp,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  CalendarDays,
  MapPin,
  Users
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface PostFormProps {
  user: User;
  post?: BlogPost;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export function PostForm({ user, post }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!post;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featuredImage: post?.featuredImage || "",
    featured: post?.featured || false,
    category: post?.category || "",
    readTime: post?.readTime || 5,
    published: !!post?.publishedAt || false,
    isEvent: post?.isEvent || false,
    // ADD EVENT FIELDS
    eventStartDate: post?.eventStartDate ? new Date(post.eventStartDate).toISOString().slice(0, 16) : "",
    eventEndDate: post?.eventEndDate ? new Date(post.eventEndDate).toISOString().slice(0, 16) : "",
    eventLocation: post?.eventLocation || "",
    eventMaxParticipants: post?.eventMaxParticipants || null,
    eventIsActive: post?.eventIsActive ?? true,
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generateSlug(value),
    }));
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    
    setUploadingImage(true);
    setUploadProgress(0);
    setError("");
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', 'blog-featured-images');
    
    try {
      // Create a new XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFormData(prev => ({ ...prev, featuredImage: response.url }));
          setUploadingImage(false);
        } else {
          const error = JSON.parse(xhr.responseText);
          setError(error.error || "Failed to upload image");
          setUploadingImage(false);
        }
      });
      
      // Handle error
      xhr.addEventListener('error', () => {
        setError("Failed to upload image. Please try again.");
        setUploadingImage(false);
      });
      
      // Open and send request
      xhr.open('POST', '/api/upload');
      xhr.send(uploadFormData);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      setUploadingImage(false);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };
  
  // Remove uploaded image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, featuredImage: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate event fields if isEvent is true
      if (formData.isEvent) {
        if (!formData.eventStartDate) {
          setError("Event start date is required for events");
          setLoading(false);
          return;
        }
        if (!formData.eventEndDate) {
          setError("Event end date is required for events");
          setLoading(false);
          return;
        }
        
        const startDate = new Date(formData.eventStartDate);
        const endDate = new Date(formData.eventEndDate);
        
        if (endDate <= startDate) {
          setError("Event end date must be after start date");
          setLoading(false);
          return;
        }
      }

      const url = isEditing ? `/api/posts/${post.id}` : "/api/posts";
      const method = isEditing ? "PATCH" : "POST";

      const canPublish = user.role === "admin" || user.role === "editor";
      const publishStatus = saveAsDraft ? false : (canPublish ? formData.published : false);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          published: publishStatus,
          // Convert dates to ISO string for API
          eventStartDate: formData.isEvent && formData.eventStartDate 
            ? new Date(formData.eventStartDate).toISOString() 
            : null,
          eventEndDate: formData.isEvent && formData.eventEndDate 
            ? new Date(formData.eventEndDate).toISOString() 
            : null,
          eventMaxParticipants: formData.isEvent && formData.eventMaxParticipants 
            ? parseInt(formData.eventMaxParticipants.toString()) 
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      router.push("/dashboard/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const canPublish = user.role === "admin" || user.role === "editor";

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          <Card className="py-6">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>Write your blog post content here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  required
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="post-url-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{formData.slug || "post-url-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Brief description of your post"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Optional summary shown in post listings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  placeholder="Write your post content here..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="py-6">
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>Configure post metadata and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {loadingCategories ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading categories...
                    </div>
                  ) : (
                    <Select
                      value={formData.category || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    min="1"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                {formData.featuredImage ? (
                  <div className="relative">
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={formData.featuredImage}
                        alt="Featured preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/800x400?text=Invalid+Image";
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {uploadingImage ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF, WebP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured">Featured Post</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this post prominently on the blog
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isEvent" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Event Post
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable event registration for this post
                    </p>
                  </div>
                  <Switch
                    id="isEvent"
                    checked={formData.isEvent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isEvent: checked })
                    }
                  />
                </div>

                {formData.isEvent && (
                  <Card className="border py-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Event Settings
                      </CardTitle>
                      <CardDescription>
                        Configure event details and registration settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="eventStartDate" className="flex items-center gap-2">
                            Start Date & Time *
                          </Label>
                          <Input
                            id="eventStartDate"
                            type="datetime-local"
                            value={formData.eventStartDate}
                            onChange={(e) =>
                              setFormData({ ...formData, eventStartDate: e.target.value })
                            }
                            required={formData.isEvent}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="eventEndDate" className="flex items-center gap-2">
                            End Date & Time *
                          </Label>
                          <Input
                            id="eventEndDate"
                            type="datetime-local"
                            value={formData.eventEndDate}
                            onChange={(e) =>
                              setFormData({ ...formData, eventEndDate: e.target.value })
                            }
                            required={formData.isEvent}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventLocation">
                          Location
                        </Label>
                        <Input
                          id="eventLocation"
                          value={formData.eventLocation}
                          onChange={(e) =>
                            setFormData({ ...formData, eventLocation: e.target.value })
                          }
                          placeholder="e.g., Online (Zoom), Hotel Mulia Jakarta, etc."
                        />
                        <p className="text-xs text-muted-foreground">
                          Specify where the event will take place
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventMaxParticipants">
                          Maximum Participants
                        </Label>
                        <Input
                          id="eventMaxParticipants"
                          type="number"
                          min="1"
                          value={formData.eventMaxParticipants || ""}
                          onChange={(e) =>
                            setFormData({ 
                              ...formData, 
                              eventMaxParticipants: e.target.value ? parseInt(e.target.value) : null 
                            })}
                          placeholder="Leave empty for unlimited"
                        />
                        <p className="text-xs text-muted-foreground">
                          Set a limit for event registrations (optional)
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="space-y-0.5">
                          <Label htmlFor="eventIsActive">Event Active</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow users to register for this event
                          </p>
                        </div>
                        <Switch
                          id="eventIsActive"
                          checked={formData.eventIsActive}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, eventIsActive: checked })
                          }
                        />
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Users will be able to register for this event. You can manage registrations from the posts dashboard.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {canPublish && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="published">Publish Post</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this post visible to readers
                      </p>
                    </div>
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, published: checked })
                      }
                    />
                  </div>
                )}

                {!canPublish && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Contributors can create drafts. An editor or admin must publish your post.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-96 overflow-hidden rounded-lg">
              {formData.featuredImage ? (
                <img
                  src={formData.featuredImage}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <Image className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />
              
              <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-12">
                <div className="max-w-4xl">
                  {formData.category && (
                    <Badge className="mb-4 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg text-sm px-4 py-1">
                      {categories.find(c => c.slug === formData.category)?.name || formData.category}
                    </Badge>
                  )}
                  
                  {formData.isEvent && (
                    <Badge className="mb-4 ml-2 bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg text-sm px-4 py-1">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      Event
                    </Badge>
                  )}
                  
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    {formData.title || "Untitled Post"}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name || "Author"}
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-white/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white/50">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="font-medium">{user.name || "Author"}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-white/30" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-white/30" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formData.readTime} min read
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-white/30" />
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      0 views
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 pb-10 -mt-12 relative z-10">
              <div className="max-w-4xl mx-auto">
                {/* Main Content Card */}
                <Card className="border-0 shadow-2xl overflow-hidden mb-8">
                  {formData.excerpt && (
                    <CardHeader className="bg-linear-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b py-6">
                      <p className="text-lg md:text-xl text-muted-foreground italic border-l-4 border-primary pl-6 py-3 leading-relaxed">
                        {formData.excerpt}
                      </p>
                    </CardHeader>
                  )}

                  <CardContent className="p-6 md:p-10 space-y-8">
                    {/* Event Registration Button */}
                    {formData.isEvent && (
                      <Card className="border bg-card">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 space-y-3">
                              <h3 className="text-xl font-bold flex items-center gap-2">
                                <CalendarDays className="h-6 w-6" />
                                Event Details
                              </h3>
                              
                              <div className="space-y-2 text-sm">
                                {formData.eventStartDate && formData.eventEndDate && (
                                  <div className="flex items-start gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                      <p className="font-medium">
                                        {new Date(formData.eventStartDate).toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                      <p className="text-muted-foreground">
                                        {new Date(formData.eventStartDate).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                        {' - '}
                                        {new Date(formData.eventEndDate).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {formData.eventLocation && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{formData.eventLocation}</span>
                                  </div>
                                )}
                                
                                {formData.eventMaxParticipants && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>Limited to {formData.eventMaxParticipants} participants</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button size="lg">
                              Register for Event
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}


                    {/* Floating Action Bar */}
                    <div className="sticky top-4 float-right ml-4 mb-4 flex flex-col gap-2 z-20">
                      <Button
                        size="icon"
                        variant="outline"
                        className="shadow-lg bg-background"
                        title="Like"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        className="shadow-lg bg-background"
                        title="Bookmark"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        className="shadow-lg bg-background"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Rich Text Content - Using custom styles matching the rich text editor */}
                    <div 
                      className="rich-text-content min-h-75 p-4 focus:outline-none max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.content || "<p class='text-muted-foreground'>No content yet...</p>" 
                      }} 
                    />

                    {/* Tags */}
                    {formData.category && (
                      <div className="pt-8 border-t border-border">
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Tags:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 border-primary/30 dark:border-primary/50 text-primary dark:text-primary/80 px-3 py-1 text-sm transition-colors cursor-pointer"
                          >
                            #{categories.find(c => c.slug === formData.category)?.name || formData.category}
                          </Badge>
                          {formData.isEvent && (
                            <Badge 
                              variant="outline" 
                              className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-3 py-1 text-sm transition-colors cursor-pointer"
                            >
                              #event
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats & Actions */}
                    <div className="pt-8 border-t border-border">
                      <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="lg"
                              className="border-2 border-primary/30 dark:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20"
                            >
                              <Heart className="mr-2 h-5 w-5" />
                              <span className="font-semibold">0</span>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="lg"
                              className="border-2 border-border hover:bg-muted"
                            >
                              <MessageCircle className="mr-2 h-5 w-5" />
                              <span className="font-semibold">0</span>
                            </Button>

                            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                              <TrendingUp className="h-5 w-5 text-muted-foreground" />
                              <span className="font-semibold text-sm">0</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground mr-2">Share:</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-950/20"
                          >
                            <Facebook className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="hover:bg-sky-50 hover:border-sky-500 dark:hover:bg-sky-950/20"
                          >
                            <Twitter className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="hover:bg-blue-50 hover:border-blue-700 dark:hover:bg-blue-950/20"
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="hover:bg-primary/10 hover:border-primary dark:hover:bg-primary/20"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Custom styles to match the rich text editor */}
            <style jsx global>{`
              .rich-text-content {
                color: hsl(var(--foreground));
                background-color: hsl(var(--background));
                min-height: 300px;
              }
              
              .rich-text-content:focus {
                outline: none;
              }
              
              .rich-text-content h1 {
                font-size: 2em;
                font-weight: bold;
                margin: 0.67em 0;
                color: hsl(var(--foreground));
              }
              
              .rich-text-content h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 0.75em 0;
                color: hsl(var(--foreground));
                border-bottom: 1px solid hsl(var(--border));
                padding-bottom: 0.5em;
              }
              
              .rich-text-content h3 {
                font-size: 1.17em;
                font-weight: bold;
                margin: 0.83em 0;
                color: hsl(var(--foreground));
              }
              
              .rich-text-content p {
                margin: 1rem 0;
                line-height: 1.5;
                color: hsl(var(--muted-foreground));
              }
              
              .rich-text-content blockquote {
                border-left: 4px solid hsl(var(--primary));
                padding-left: 1rem;
                margin: 1rem 0;
                color: hsl(var(--muted-foreground));
                background-color: hsl(var(--muted) / 0.5);
                padding: 1rem;
                border-radius: 0.375rem;
              }
              
              .rich-text-content pre {
                background-color: hsl(var(--muted));
                padding: 1rem;
                border-radius: 0.375rem;
                overflow-x: auto;
                font-family: monospace;
                color: hsl(var(--foreground));
                border: 1px solid hsl(var(--border));
              }
              
              .rich-text-content ul,
              .rich-text-content ol {
                padding-left: 2rem;
                margin: 1rem 0;
                color: hsl(var(--muted-foreground));
                list-style-position: outside;
              }
              
              .rich-text-content ul {
                list-style-type: disc;
              }
              
              .rich-text-content ol {
                list-style-type: decimal;
              }
              
              .rich-text-content li {
                margin: 0.5rem 0;
                display: list-item;
              }
              
              .rich-text-content a {
                color: hsl(var(--primary));
                text-decoration: underline;
                font-weight: 500;
              }
              
              .rich-text-content a:hover {
                color: hsl(var(--primary) / 0.8);
              }
              
              .rich-text-content img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1rem 0;
                border-radius: 0.375rem;
                border: 1px solid hsl(var(--border));
              }
              
              .rich-text-content code {
                color: hsl(var(--primary));
                background-color: hsl(var(--muted) / 0.5);
                padding: 0.125rem 0.375rem;
                border-radius: 0.25rem;
                font-family: monospace;
                font-size: 0.875em;
              }
              
              .rich-text-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 1rem 0;
              }
              
              .rich-text-content th {
                background-color: hsl(var(--muted));
                padding: 0.75rem;
                text-align: left;
                font-weight: 600;
                border: 1px solid hsl(var(--border));
              }
              
              .rich-text-content td {
                padding: 0.75rem;
                border: 1px solid hsl(var(--border));
              }
              
              .rich-text-content hr {
                border: none;
                border-top: 1px solid hsl(var(--border));
                margin: 2rem 0;
              }
            `}</style>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between gap-4 pt-6 border-t sticky bottom-0 bg-background pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/posts")}
          disabled={loading}
        >
          Cancel
        </Button>

        <div className="flex gap-2">
          {canPublish && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </>
              )}
            </Button>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {canPublish ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    {formData.published ? "Update & Publish" : "Update"}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Draft" : "Save Draft"}
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}