// components/dashboard/team-member-management/team-member-form.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Upload, X, Plus } from "lucide-react";
import { TeamMember, Department } from "@/lib/db/schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TeamMemberFormProps {
  teamMember?: TeamMember;
}

export function TeamMemberForm({ teamMember }: TeamMemberFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    name: teamMember?.name || "",
    title: teamMember?.title || "",
    bio: teamMember?.bio || "",
    image: teamMember?.image || "",
    role: teamMember?.role || "team_member",
    departmentId: teamMember?.departmentId?.toString() || "",
    order: teamMember?.order || 0,
    icon: teamMember?.icon || "",
    achievements: teamMember?.achievements || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAchievement, setNewAchievement] = useState("");

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments");
      }
    };

    fetchDepartments();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title }));
    
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: "" }));
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const bio = e.target.value;
    setFormData(prev => ({ ...prev, bio }));
    
    if (errors.bio) {
      setErrors(prev => ({ ...prev, bio: "" }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: "" }));
    }
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, departmentId: value }));
    
    if (errors.departmentId) {
      setErrors(prev => ({ ...prev, departmentId: "" }));
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const order = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, order }));
    
    if (errors.order) {
      setErrors(prev => ({ ...prev, order: "" }));
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const icon = e.target.value;
    setFormData(prev => ({ ...prev, icon }));
    
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: "" }));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'team-members'); // Upload to team-members folder

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      setFormData(prev => ({ ...prev, image: data.url }));
      setErrors(prev => ({ ...prev, image: "" }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement.trim()]
    }));
    setNewAchievement("");
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required";
    }

    if (isNaN(formData.order) || formData.order < 0) {
      newErrors.order = "Order must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = teamMember ? `/api/team-members/${teamMember.id}` : '/api/team-members';
      const method = teamMember ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          departmentId: parseInt(formData.departmentId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save team member');
      }

      toast.success(teamMember ? "Team member updated successfully" : "Team member added successfully");
      router.push("/dashboard/team-members");
      router.refresh();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Card className="shadow-sm py-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Team Member Information</CardTitle>
          <CardDescription>
            Enter the details for your team member. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter team member name"
                className={cn(errors.name && "border-destructive focus:ring-destructive")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter job title"
                className={cn(errors.title && "border-destructive focus:ring-destructive")}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="Enter team member bio"
              className={cn(errors.bio && "border-destructive focus:ring-destructive")}
              disabled={isSubmitting}
              rows={3}
            />
            {errors.bio && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bio}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-1">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange} disabled={isSubmitting}>
                <SelectTrigger className={cn(errors.role && "border-destructive focus:ring-destructive")}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId" className="flex items-center gap-1">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.departmentId} onValueChange={handleDepartmentChange} disabled={isSubmitting}>
                <SelectTrigger className={cn(errors.departmentId && "border-destructive focus:ring-destructive")}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.departmentId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleOrderChange}
                placeholder="0"
                min="0"
                className={cn(errors.order && "border-destructive focus:ring-destructive")}
                disabled={isSubmitting}
              />
              {errors.order && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.order}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the list
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name</Label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleIconChange}
                placeholder="e.g., Briefcase, GraduationCap"
                className={cn(errors.icon && "border-destructive focus:ring-destructive")}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Use icon names from lucide-react (e.g., Briefcase, GraduationCap)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Photo
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs ml-auto"
                onClick={handleImageUpload}
                disabled={isSubmitting || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Image
                  </>
                )}
              </Button>
            </Label>

            {formData.image && (
              <div className="relative p-4 bg-muted/50 rounded-lg border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting || isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border rounded-full bg-white overflow-hidden">
                    <Image
                      src={formData.image}
                      alt={formData.name || "Team member photo"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{formData.name || "Team Member"}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {formData.image}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Upload a professional headshot or paste an image URL. Max file size: 10MB. Supported formats: JPEG, PNG, GIF, WebP
            </p>
          </div>

          <div className="space-y-2">
            <Label>Achievements</Label>
            <div className="flex gap-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add an achievement"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAchievement}
                disabled={isSubmitting || !newAchievement.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {achievement}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveAchievement(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {teamMember ? "Updating..." : "Adding..."}
            </>
          ) : (
            teamMember ? "Update Team Member" : "Add Team Member"
          )}
        </Button>
      </div>
    </form>
  );
}