/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/event/register/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  authorId?: string;
  category: string;
  imageUrl: string;
  slug: string;
  isEvent: boolean;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventMaxParticipants?: number;
  eventIsActive?: boolean;
}

interface RegistrationData {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  specialRequests?: string;
  agreeToTerms: boolean;
}

// Create a separate component that uses useSearchParams
function EventRegistrationContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postSlug = searchParams.get("post");
  
  const [event, setEvent] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
    organization: "",
    specialRequests: "",
    agreeToTerms: false
  });

  // Fetch event details
  useEffect(() => {
    if (!postSlug) {
      setError("No event specified");
      setLoading(false);
      return;
    }
    
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching event with slug:", postSlug);
        const response = await fetch(`/api/blog/${postSlug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Event not found');
        }
        
        const data = await response.json();
        console.log("Event data received:", data);
        
        if (!data.isEvent) {
          setError("This is not an event");
          return;
        }
        
        setEvent(data);
        
        // If user is logged in, pre-fill the form
        if (session?.user) {
          setFormData(prev => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || ""
          }));
        }
        
        // Get registration count
        try {
          const registrationsResponse = await fetch(`/api/blog/${data.slug}/registrations-count`);
          if (registrationsResponse.ok) {
            const countData = await registrationsResponse.json();
            setRegistrationCount(countData.count || 0);
          }
        } catch (err) {
          console.error("Error fetching registration count:", err);
        }
        
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Event not found or an error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [postSlug, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.agreeToTerms) {
      setError("Please fill in all required fields and agree to the terms");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting registration for event:", event.slug);
      const response = await fetch(`/api/blog/${event.slug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      console.log("Registration response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setSuccess(true);
      setRegistrationCount(prev => prev + 1);
    } catch (err: any) {
      console.error('Error registering for event:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-6 text-center">{error}</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You have successfully registered for &quot;{event?.title}&quot;. We&apos;ll send a confirmation email to {formData.email} with more details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href={`/blog/${event?.slug}`}>
                    View Event Details
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/blog/${event?.slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
            </Link>
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-4">
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={event?.imageUrl || '/placeholder-event.jpg'} 
                    alt={event?.title || 'Event'}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{event?.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {event?.eventStartDate && new Date(event.eventStartDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {event?.eventStartDate && new Date(event.eventStartDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {event?.eventEndDate && ` - ${new Date(event.eventEndDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`}
                      </p>
                    </div>
                  </div>
                  
                  {event?.eventLocation && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{event.eventLocation}</p>
                      </div>
                    </div>
                  )}
                  
                  {event?.eventMaxParticipants && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-sm text-muted-foreground">
                          {registrationCount} / {event.eventMaxParticipants} registered
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (registrationCount / event.eventMaxParticipants) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Event Registration</CardTitle>
                  <p className="text-muted-foreground">
                    {status === 'authenticated' 
                      ? `You're logged in as ${session?.user?.name}. Complete the form below to register.`
                      : 'Please fill in your details to register for this event.'
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Registration Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                          disabled={status === 'authenticated'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Your email address"
                          required
                          disabled={status === 'authenticated'}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization/Company</Label>
                      <Input
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Your organization or company"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Special Requests or Dietary Requirements</Label>
                      <Textarea
                        id="specialRequests"
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Any special requests or dietary requirements"
                        rows={3}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="agreeToTerms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the terms and conditions *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          By registering for this event, you agree to our terms of service and privacy policy.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={submitting || !formData.agreeToTerms}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Registration...
                        </>
                      ) : (
                        'Register for Event'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback component to show while search params are loading
function EventRegistrationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading registration page...</p>
      </div>
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function EventRegistrationPage() {
  return (
    <Suspense fallback={<EventRegistrationLoading />}>
      <EventRegistrationContent />
    </Suspense>
  );
}