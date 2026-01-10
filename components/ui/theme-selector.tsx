// components/ui/theme-selector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Palette, MapPin, Truck, CheckCircle, Star, Award, TrendingUp, Mail, Phone, MapPinIcon } from "lucide-react";
import Image from "next/image";

// Theme interface
export interface Theme {
  primary: string;
  bg: string;
  bgSolid: string;
  border: string;
  text: string;
  accent: string;
  hover: string;
  gradient: string;
}

// Helper function to generate theme from a base color
export const generateThemeFromColor = (baseColor: string): Theme => {
  return {
    primary: baseColor,
    bg: `${baseColor}1A`, // 10% opacity
    bgSolid: `${baseColor}0D`, // 5% opacity for solid backgrounds
    border: `${baseColor}33`, // 20% opacity
    text: baseColor,
    accent: baseColor,
    hover: baseColor,
    gradient: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}CC 100%)`,
  };
};

interface ThemeSelectorProps {
  brandColor: string;
  theme: Theme;
  logo?: string;
  name?: string;
  tagline?: string;
  description?: string;
  coverage?: string;
  delivery?: string;
  stats?: {
    label1: string;
    value1: string;
    label2: string;
    value2: string;
    label3: string;
    value3: string;
    label4: string;
    value4: string;
  };
  services?: Array<{ name: string; description: string }>;
  achievements?: string[];
  team?: Array<{ name: string; position: string }>;
  onColorChange: (color: string) => void;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSelector({
  brandColor,
  theme,
  logo,
  name,
  tagline,
  description,
  coverage,
  delivery,
  stats,
  services,
  achievements,
  team,
  onColorChange,
  onThemeChange,
}: ThemeSelectorProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onColorChange(newColor);
    onThemeChange(generateThemeFromColor(newColor));
  };

  const handleThemeChange = (field: string, value: string) => {
    onThemeChange({
      ...theme,
      [field]: value,
    });
  };

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Theme Configuration</CardTitle>
        <CardDescription>Fine-tune color theme (auto-generated from brand color) and preview the result</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Brand Preview
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Advanced Theme Editor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              {/* Hero Section Preview */}
              <div className="relative overflow-hidden h-[60vh]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2070&q=80)` }}
                />
                <div
                  className="absolute inset-0 mix-blend-multiply opacity-50"
                  style={{ backgroundColor: theme.primary }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                
                <div className="relative z-10 h-full flex flex-col container mx-auto px-6 lg:px-10">
                  <div className="pt-14 flex justify-between items-start">
                    <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
                      <div className="flex items-center">
                        <span className="mr-2 h-4 w-4">←</span>
                        Back to All Divisions
                      </div>
                    </Button>
                    
                    {/* Logo on top for mobile */}
                    <div className="md:hidden">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={logo || "/placeholder-logo.png"}
                          alt={name || "Division"}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end pb-20">
                    <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between">
                      <div className="max-w-5xl">
                        <p className="text-sm font-bold tracking-[0.3em] uppercase mb-6" style={{ color: theme.text }}>
                          {tagline || "Division tagline goes here"}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] mb-6 text-white">
                          {name || "Division Name"}
                        </h1>
                        <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-4 max-w-3xl font-light">
                          {description || "This is a preview of your division's description."}
                        </p>
                      </div>
                      
                      {/* Logo on right side for desktop - positioned in middle */}
                      <div className="hidden md:flex items-center justify-center">
                        <div className="w-32 h-32 relative">
                          <Image
                            src={logo || "/placeholder-logo.png"}
                            alt={name || "Division"}
                            fill
                            className="object-contain drop-shadow-2xl"
                            style={{ filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.5))" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar Preview */}
              <div className="border-b border-border/50">
                <div className="container mx-auto px-6 lg:px-12 py-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    {[
                      { label: stats?.label1 || "Label 1", value: stats?.value1 || "0" },
                      { label: stats?.label2 || "Label 2", value: stats?.value2 || "0" },
                      { label: stats?.label3 || "Label 3", value: stats?.value3 || "0" },
                      { label: stats?.label4 || "Label 4", value: stats?.value4 || "0" },
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.primary }}>
                          {stat.value}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coverage & Delivery Preview */}
              <div className="py-12 border-b border-border/50">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Geographic Coverage
                            </p>
                            <p className="text-lg md:text-xl font-bold">{coverage || "Global"}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Our extensive network spans across continents, ensuring we can deliver exceptional service wherever you need us.
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                            <Truck className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Service Delivery
                            </p>
                            <p className="text-lg md:text-xl font-bold">{delivery || "24/7"}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          We offer flexible delivery options tailored to your preferences, combining modern technology with personal touch.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Preview */}
              <div className="py-12 bg-muted/30">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                      <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: theme.text }}>
                        What We Offer
                      </p>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Services</h2>
                      <p className="text-base text-muted-foreground max-w-3xl">
                        Comprehensive solutions designed to meet your unique needs with excellence and precision.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(services || [
                        { name: "Service 1", description: "Description for service 1" },
                        { name: "Service 2", description: "Description for service 2" },
                      ]).slice(0, 2).map((service, index) => (
                        <div key={index} className="group">
                          <div className="flex items-start gap-4 py-6 border-t border-border/50">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: theme.bg }}>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg md:text-xl font-bold mb-2">{service.name}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Preview */}
              <div className="py-12 bg-muted/30">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="max-w-6xl mx-auto">
                    <div className="mb-8 text-center">
                      <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: theme.text }}>
                        Meet Our Team
                      </p>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">Leadership</h2>
                      <p className="text-base text-muted-foreground max-w-3xl mx-auto">
                        Experienced professionals dedicated to driving our mission forward with vision and expertise.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {(team || [
                        { name: "Team Member 1", position: "Position 1" },
                        { name: "Team Member 2", position: "Position 2" },
                        { name: "Team Member 3", position: "Position 3" },
                        { name: "Team Member 4", position: "Position 4" },
                      ]).slice(0, 4).map((member, index) => (
                        <div key={index} className="text-center group">
                          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ backgroundColor: theme.primary }}>
                            <span className="text-white font-bold text-xl">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold mb-1">{member.name}</h3>
                          <p className="text-xs text-muted-foreground">{member.position}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section Preview */}
              <div className="py-16">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div>
                        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: theme.text }}>
                          Let&apos;s Connect
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Get in Touch</h2>
                        <p className="text-base text-muted-foreground leading-relaxed mb-6">
                          Ready to start your journey with us? Our team is here to answer your questions and help you get started.
                        </p>

                        <Button 
                          className="text-white px-6 py-3 text-base border-0 hover:opacity-90 shadow-xl"
                          style={{ backgroundColor: theme.primary }}
                        >
                          Schedule Consultation
                        </Button>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start gap-3 py-4 border-b border-border/50">
                          <Mail className="h-5 w-5 mt-1 shrink-0" style={{ color: theme.text }} />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Email
                            </p>
                            <p className="text-sm font-medium">
                              info@{name?.toLowerCase().replace(/\s+/g, '') || 'division'}.kinygroup.org
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 py-4 border-b border-border/50">
                          <Phone className="h-5 w-5 mt-1 shrink-0" style={{ color: theme.text }} />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Phone
                            </p>
                            <p className="text-sm font-medium">+62 21 83787735</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 py-4 border-b border-border/50">
                          <MapPinIcon className="h-5 w-5 mt-1 shrink-0" style={{ color: theme.text }} />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Address
                            </p>
                            <p className="text-sm font-medium leading-relaxed">
                              Jl. Tebet Timur Dalam II No.38B, Tebet,<br />
                              Jakarta Selatan 12820
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="editor" className="space-y-4 mt-4">
            <div className="space-y-2 mb-4">
              <Label htmlFor="color">Brand Color (Auto-generates theme)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={brandColor}
                  onChange={handleColorChange}
                  className="w-20 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  value={brandColor}
                  onChange={handleColorChange}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Changing this color will automatically update all theme colors below
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Theme colors are auto-generated from your brand color. 
                You can fine-tune individual colors here, but changing the brand color above will reset these values.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(theme).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`theme-${key}`} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <div className="flex items-center gap-2">
                    {key.includes('gradient') ? (
                      <div 
                        className="w-10 h-10 rounded border border-gray-200" 
                        style={{ background: value }}
                      />
                    ) : (
                      <Input
                        id={`theme-${key}-color`}
                        type="color"
                        value={value.startsWith('#') ? value : '#3b82f6'}
                        onChange={(e) => handleThemeChange(key, e.target.value)}
                        className="w-10 h-10 p-1 border rounded cursor-pointer"
                      />
                    )}
                    <Input
                      id={`theme-${key}`}
                      value={value}
                      onChange={(e) => handleThemeChange(key, e.target.value)}
                      placeholder={`Enter ${key}`}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}