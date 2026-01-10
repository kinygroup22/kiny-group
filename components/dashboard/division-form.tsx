// components/dashboard/division-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { ThemeSelector, generateThemeFromColor, Theme } from "@/components/ui/theme-selector";
import { User, BrandDivision } from "@/lib/db/schema";
import { divisionsAPI } from "@/lib/api/client/divisions";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function DivisionForm({ user, division }: DivisionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugValidation, setSlugValidation] = useState<{ checking: boolean; available: boolean; message: string }>({
    checking: false,
    available: true,
    message: "",
  });

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

  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color,
    }));
  };

  const handleThemeChange = (theme: Theme) => {
    setFormData(prev => ({
      ...prev,
      theme,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details for your brand division</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter division name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">
                URL Slug * 
                {slugValidation.checking && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
              </Label>
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
              {slugValidation.message && (
                <p className={cn(
                  "text-sm",
                  slugValidation.available ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {slugValidation.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              placeholder="Brief tagline for the division"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage Area</Label>
              <Input
                id="coverage"
                name="coverage"
                value={formData.coverage}
                onChange={handleInputChange}
                placeholder="e.g., Indonesia, Southeast Asia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery Time</Label>
              <Input
                id="delivery"
                name="delivery"
                value={formData.delivery}
                onChange={handleInputChange}
                placeholder="e.g., 24-48 hours"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description (will be shown in cards)"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description *</Label>
            <Textarea
              id="fullDescription"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleInputChange}
              placeholder="Detailed description of the division"
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Add key statistics for your division</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="space-y-2 p-4 border rounded-lg">
                <Label htmlFor={`stat-label${num}`}>Stat {num} Label</Label>
                <Input
                  id={`stat-label${num}`}
                  value={formData.stats[`label${num}` as keyof typeof formData.stats]}
                  onChange={(e) => handleStatsChange(`label${num}`, e.target.value)}
                  placeholder={`e.g., ${num === 1 ? "Projects Completed" : num === 2 ? "Happy Clients" : num === 3 ? "Years Experience" : "Team Members"}`}
                />
                <Label htmlFor={`stat-value${num}`}>Value</Label>
                <Input
                  id={`stat-value${num}`}
                  value={formData.stats[`value${num}` as keyof typeof formData.stats]}
                  onChange={(e) => handleStatsChange(`value${num}`, e.target.value)}
                  placeholder={`e.g., ${num === 1 ? "500+" : num === 2 ? "200+" : num === 3 ? "10+" : "50+"}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>List the services offered by this division</CardDescription>
            </div>
            <Button type="button" onClick={addService} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.services.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No services added yet. Click &quot;Add Service&quot; to get started.
            </p>
          ) : (
            formData.services.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Service Name</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        placeholder="Enter service name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => updateService(index, "description", e.target.value)}
                        placeholder="Describe the service"
                        rows={2}
                      />
                    </div>
                  </div>
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
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>List key achievements and milestones</CardDescription>
            </div>
            <Button type="button" onClick={addAchievement} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No achievements added yet. Click &quot;Add Achievement&quot; to get started.
            </p>
          ) : (
            formData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={achievement}
                  onChange={(e) => updateAchievement(index, e.target.value)}
                  placeholder="Enter achievement"
                  className="flex-1"
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
            ))
          )}
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Add team members for this division</CardDescription>
            </div>
            <Button type="button" onClick={addTeamMember} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.team.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No team members added yet. Click &quot;Add Member&quot; to get started.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {formData.team.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                          placeholder="Enter name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={member.position}
                          onChange={(e) => updateTeamMember(index, "position", e.target.value)}
                          placeholder="Enter position"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Assets */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Visual Assets</CardTitle>
          <CardDescription>Upload images for your division</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FileUpload
              value={formData.logo}
              onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
              folder="divisions/logos"
              label="Logo"
            />
            <FileUpload
              value={formData.backgroundImage}
              onChange={(url) => setFormData(prev => ({ ...prev, backgroundImage: url }))}
              folder="divisions/backgrounds"
              label="Background Image"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Configuration with Preview */}
      <ThemeSelector
        brandColor={formData.color}
        theme={formData.theme}
        logo={formData.logo}
        name={formData.name}
        tagline={formData.tagline}
        description={formData.description}
        stats={formData.stats}
        services={formData.services}
        onColorChange={handleColorChange}
        onThemeChange={handleThemeChange}
      />

      {/* Settings */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure additional settings for your division</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 sticky bottom-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-4 border rounded-lg">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !slugValidation.available}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {division ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{division ? "Update Division" : "Create Division"}</>
          )}
        </Button>
      </div>
    </form>
  );
}