/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/event-registrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, MessageCircle, Users, MapPin, Download, Filter, X } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DeleteRegistrationButton } from "@/components/dashboard/delete-registration-button";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: number;
  title: string;
  slug: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventLocation: string | null;
  eventMaxParticipants: number | null;
  eventIsActive: boolean;
  registrationCount: number;
}

interface Registration {
  registration: {
    id: number;
    postId: number;
    userId: number | null;
    registrationData: Record<string, any>;
    registeredAt: string;
  };
  event: {
    id: number;
    title: string;
    slug: string;
    eventStartDate: string | null;
    eventEndDate: string | null;
    eventLocation: string | null;
  };
  user: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
}

export default function EventRegistrationsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEvent]);

  useEffect(() => {
    // Filter registrations based on search term
    if (!searchTerm) {
      setFilteredRegistrations(registrations);
    } else {
      const filtered = registrations.filter(reg => {
        const name = getRegistrantName(reg).toLowerCase();
        const email = getRegistrantEmail(reg).toLowerCase();
        const phone = getRegistrantPhone(reg).toLowerCase();
        const eventTitle = reg.event.title.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower) || 
               eventTitle.includes(searchLower);
      });
      setFilteredRegistrations(filtered);
    }
  }, [searchTerm, registrations]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/dashboard/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEvent && selectedEvent !== "all") params.append("event", selectedEvent);

      const response = await fetch(`/api/dashboard/event-registrations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRegistrantName = (reg: Registration) => {
    if (reg.user?.name) return reg.user.name;
    if (reg.registration.registrationData.name) return reg.registration.registrationData.name;
    return "Anonymous";
  };

  const getRegistrantEmail = (reg: Registration) => {
    if (reg.user?.email) return reg.user.email;
    if (reg.registration.registrationData.email) return reg.registration.registrationData.email;
    return "N/A";
  };

  const getRegistrantPhone = (reg: Registration) => {
    return reg.registration.registrationData.phone || 
           reg.registration.registrationData.whatsapp || 
           "N/A";
  };

  const handleWhatsAppClick = (phone: string) => {
    if (phone === "N/A") return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDeleteRegistration = (registrationId: number) => {
    // Remove the deleted registration from the state
    setRegistrations(prev => prev.filter(reg => reg.registration.id !== registrationId));
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === "all" ? filteredRegistrations : 
                         activeTab === "upcoming" ? 
                         filteredRegistrations.filter(reg => 
                           reg.event.eventStartDate && new Date(reg.event.eventStartDate) >= new Date()
                         ) :
                         filteredRegistrations.filter(reg => 
                           reg.event.eventStartDate && new Date(reg.event.eventStartDate) < new Date()
                         );

    const headers = ["Name", "Email", "Phone", "Event", "Registration Date", "Additional Data"];
    const rows = dataToExport.map(reg => [
      getRegistrantName(reg),
      getRegistrantEmail(reg),
      getRegistrantPhone(reg),
      reg.event.title,
      format(new Date(reg.registration.registeredAt), "PPp"),
      JSON.stringify(reg.registration.registrationData)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-registrations-${selectedEvent}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEvent("all");
  };

  const hasActiveFilters = searchTerm || selectedEvent !== "all";

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardHeader 
          title="Event Registrations"
          description="Manage event registrations and contact registrants"
          icon={Users}
        />
        {filteredRegistrations.length > 0 && (
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden py-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Events</CardDescription>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
          <div className="h-1 bg-blue-100"></div>
        </Card>
        
        <Card className="overflow-hidden py-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Registrations</CardDescription>
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">
              {events.reduce((sum, e) => sum + e.registrationCount, 0)}
            </CardTitle>
          </CardHeader>
          <div className="h-1 bg-green-100"></div>
        </Card>
        
        <Card className="overflow-hidden py-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Active Events</CardDescription>
              <div className="p-2 bg-purple-100 rounded-full">
                <Filter className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">
              {events.filter(e => e.eventIsActive).length}
            </CardTitle>
          </CardHeader>
          <div className="h-1 bg-purple-100"></div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filters</h3>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, phone, or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64 overflow-hidden">
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                    <SelectValue placeholder="Filter by event" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event) => (
                        <SelectItem key={event.id} value={event.slug} className="truncate">
                        {event.title} ({event.registrationCount})
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card className="overflow-hidden py-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle>
                Registrations 
                {selectedEvent !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {events.find(e => e.slug === selectedEvent)?.title}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${filteredRegistrations.length} registration${filteredRegistrations.length !== 1 ? "s" : ""} found`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No registrations found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm || selectedEvent !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Registrations will appear here once users sign up for events"}
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-2">
                <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-0">
                <RegistrationsTable 
                  registrations={filteredRegistrations} 
                  getRegistrantName={getRegistrantName}
                  getRegistrantEmail={getRegistrantEmail}
                  getRegistrantPhone={getRegistrantPhone}
                  handleWhatsAppClick={handleWhatsAppClick}
                  handleDeleteRegistration={handleDeleteRegistration}
                />
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-0">
                <RegistrationsTable 
                  registrations={filteredRegistrations.filter(reg => 
                    reg.event.eventStartDate && new Date(reg.event.eventStartDate) >= new Date()
                  )} 
                  getRegistrantName={getRegistrantName}
                  getRegistrantEmail={getRegistrantEmail}
                  getRegistrantPhone={getRegistrantPhone}
                  handleWhatsAppClick={handleWhatsAppClick}
                  handleDeleteRegistration={handleDeleteRegistration}
                />
              </TabsContent>
              
              <TabsContent value="past" className="mt-0">
                <RegistrationsTable 
                  registrations={filteredRegistrations.filter(reg => 
                    reg.event.eventStartDate && new Date(reg.event.eventStartDate) < new Date()
                  )} 
                  getRegistrantName={getRegistrantName}
                  getRegistrantEmail={getRegistrantEmail}
                  getRegistrantPhone={getRegistrantPhone}
                  handleWhatsAppClick={handleWhatsAppClick}
                  handleDeleteRegistration={handleDeleteRegistration}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface RegistrationsTableProps {
  registrations: Registration[];
  getRegistrantName: (reg: Registration) => string;
  getRegistrantEmail: (reg: Registration) => string;
  getRegistrantPhone: (reg: Registration) => string;
  handleWhatsAppClick: (phone: string) => void;
  handleDeleteRegistration: (registrationId: number) => void;
}

function RegistrationsTable({ 
  registrations, 
  getRegistrantName,
  getRegistrantEmail,
  getRegistrantPhone,
  handleWhatsAppClick,
  handleDeleteRegistration
}: RegistrationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left py-3 px-4 font-medium">Name</th>
            <th className="text-left py-3 px-4 font-medium">Contact</th>
            <th className="text-left py-3 px-4 font-medium">Event</th>
            <th className="text-left py-3 px-4 font-medium">Event Date</th>
            <th className="text-left py-3 px-4 font-medium">Registered</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg, index) => {
            const phone = getRegistrantPhone(reg);
            return (
              <tr 
                key={reg.registration.id} 
                className={`border-b hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{getRegistrantName(reg)}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">{getRegistrantEmail(reg)}</div>
                  {phone !== "N/A" && (
                    <div className="text-xs text-muted-foreground">{phone}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{reg.event.title}</div>
                  {reg.event.eventLocation && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {reg.event.eventLocation}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {reg.event.eventStartDate && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(reg.event.eventStartDate), "PP")}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {format(new Date(reg.registration.registeredAt), "PP")}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {phone !== "N/A" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        onClick={() => handleWhatsAppClick(phone)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    )}
                    <DeleteRegistrationButton
                      registrationId={reg.registration.id}
                      registrantName={getRegistrantName(reg)}
                      onDelete={() => handleDeleteRegistration(reg.registration.id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}