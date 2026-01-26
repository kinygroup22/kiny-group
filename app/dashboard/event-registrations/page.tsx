/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/event-registrations/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, MessageCircle, Users, MapPin, Download, Filter, X, FileSpreadsheet, ChevronUp, ChevronDown, Check, Minus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DeleteRegistrationButton } from "@/components/dashboard/delete-registration-button";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

type SortField = 'name' | 'email' | 'event' | 'eventDate' | 'registeredAt';
type SortDirection = 'asc' | 'desc';

export default function EventRegistrationsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRegistrations, setSelectedRegistrations] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [eventSearchTerm, setEventSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEvent]);

  useEffect(() => {
    let filtered = registrations;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => {
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
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortField) {
        case 'name':
          aValue = getRegistrantName(a);
          bValue = getRegistrantName(b);
          break;
        case 'email':
          aValue = getRegistrantEmail(a);
          bValue = getRegistrantEmail(b);
          break;
        case 'event':
          aValue = a.event.title;
          bValue = b.event.title;
          break;
        case 'eventDate':
          aValue = a.event.eventStartDate ? new Date(a.event.eventStartDate) : new Date(0);
          bValue = b.event.eventStartDate ? new Date(b.event.eventStartDate) : new Date(0);
          break;
        case 'registeredAt':
          aValue = new Date(a.registration.registeredAt);
          bValue = new Date(b.registration.registeredAt);
          break;
        default:
          aValue = '';
          bValue = '';
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredRegistrations(filtered);
  }, [searchTerm, registrations, sortField, sortDirection]);

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
    setRegistrations(prev => prev.filter(reg => reg.registration.id !== registrationId));
    setSelectedRegistrations(prev => {
      const newSet = new Set(prev);
      newSet.delete(registrationId);
      return newSet;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectRegistration = (registrationId: number, checked: boolean) => {
    setSelectedRegistrations(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(registrationId);
      } else {
        newSet.delete(registrationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = getDataToExport().map(reg => reg.registration.id);
      setSelectedRegistrations(new Set(allIds));
    } else {
      setSelectedRegistrations(new Set());
    }
  };

  const getDataToExport = () => {
    return activeTab === "all" ? filteredRegistrations : 
           activeTab === "upcoming" ? 
           filteredRegistrations.filter(reg => 
             reg.event.eventStartDate && new Date(reg.event.eventStartDate) >= new Date()
           ) :
           filteredRegistrations.filter(reg => 
             reg.event.eventStartDate && new Date(reg.event.eventStartDate) < new Date()
           );
  };

  const getSelectedRegistrationsForExport = () => {
    const dataToExport = getDataToExport();
    return dataToExport.filter(reg => selectedRegistrations.has(reg.registration.id));
  };

  const exportToExcel = () => {
    const dataToExport = getSelectedRegistrationsForExport();
    
    if (dataToExport.length === 0) {
      // If no registrations are selected, export all visible registrations
      return exportAllToExcel();
    }
    
    // Prepare data for Excel with specific columns only
    const excelData = dataToExport.map(reg => {
      const registrationData = reg.registration.registrationData;
      return {
        'Name': getRegistrantName(reg),
        'Email': getRegistrantEmail(reg),
        'Phone': getRegistrantPhone(reg),
        'Event': reg.event.title,
        'Event Location': reg.event.eventLocation || 'N/A',
        'Event Date': reg.event.eventStartDate ? format(new Date(reg.event.eventStartDate), "PPP") : 'N/A',
        'Registration Date': format(new Date(reg.registration.registeredAt), "PPP p"),
        'Age': registrationData.age || 'N/A',
        'Organization': registrationData.organization || 'N/A',
        'Special Requests': registrationData.specialRequests || registrationData.special_requests || 'N/A',
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 30 }, // Event
      { wch: 20 }, // Event Location
      { wch: 15 }, // Event Date
      { wch: 20 }, // Registration Date
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Event Registrations");

    // Generate filename
    const eventName = selectedEvent !== "all" 
      ? events.find(e => e.slug === selectedEvent)?.title.replace(/[^a-z0-9]/gi, '_') 
      : "all-events";
    const filename = `event-registrations-${eventName}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const exportAllToExcel = () => {
    const dataToExport = getDataToExport();
    
    // Prepare data for Excel with specific columns only
    const excelData = dataToExport.map(reg => {
      const registrationData = reg.registration.registrationData;
      return {
        'Name': getRegistrantName(reg),
        'Email': getRegistrantEmail(reg),
        'Phone': getRegistrantPhone(reg),
        'Event': reg.event.title,
        'Event Location': reg.event.eventLocation || 'N/A',
        'Event Date': reg.event.eventStartDate ? format(new Date(reg.event.eventStartDate), "PPP") : 'N/A',
        'Registration Date': format(new Date(reg.registration.registeredAt), "PPP p"),
        'Age': registrationData.age || 'N/A',
        'Organization': registrationData.organization || 'N/A',
        'Special Requests': registrationData.specialRequests || registrationData.special_requests || 'N/A',
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 30 }, // Event
      { wch: 20 }, // Event Location
      { wch: 15 }, // Event Date
      { wch: 20 }, // Registration Date
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Event Registrations");

    // Generate filename
    const eventName = selectedEvent !== "all" 
      ? events.find(e => e.slug === selectedEvent)?.title.replace(/[^a-z0-9]/gi, '_') 
      : "all-events";
    const filename = `event-registrations-${eventName}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const exportToCSV = () => {
    const dataToExport = getSelectedRegistrationsForExport();
    
    if (dataToExport.length === 0) {
      // If no registrations are selected, export all visible registrations
      return exportAllToCSV();
    }

    const headers = ["Name", "Email", "Phone", "Event", "Event Location", "Event Date", "Registration Date", "Additional Data"];
    const rows = dataToExport.map(reg => [
      getRegistrantName(reg),
      getRegistrantEmail(reg),
      getRegistrantPhone(reg),
      reg.event.title,
      reg.event.eventLocation || 'N/A',
      reg.event.eventStartDate ? format(new Date(reg.event.eventStartDate), "PPP") : 'N/A',
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
    const eventName = selectedEvent !== "all" 
      ? events.find(e => e.slug === selectedEvent)?.title.replace(/[^a-z0-9]/gi, '_') 
      : "all-events";
    a.download = `event-registrations-${eventName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const exportAllToCSV = () => {
    const dataToExport = getDataToExport();

    const headers = ["Name", "Email", "Phone", "Event", "Event Location", "Event Date", "Registration Date", "Additional Data"];
    const rows = dataToExport.map(reg => [
      getRegistrantName(reg),
      getRegistrantEmail(reg),
      getRegistrantPhone(reg),
      reg.event.title,
      reg.event.eventLocation || 'N/A',
      reg.event.eventStartDate ? format(new Date(reg.event.eventStartDate), "PPP") : 'N/A',
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
    const eventName = selectedEvent !== "all" 
      ? events.find(e => e.slug === selectedEvent)?.title.replace(/[^a-z0-9]/gi, '_') 
      : "all-events";
    a.download = `event-registrations-${eventName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEvent("all");
  };

  const hasActiveFilters = searchTerm || selectedEvent !== "all";

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(eventSearchTerm.toLowerCase())
  );

  const isAllSelected = () => {
    const dataToExport = getDataToExport();
    return dataToExport.length > 0 && dataToExport.every(reg => selectedRegistrations.has(reg.registration.id));
  };

  const isIndeterminate = () => {
    const dataToExport = getDataToExport();
    const selectedCount = dataToExport.filter(reg => selectedRegistrations.has(reg.registration.id)).length;
    return selectedCount > 0 && selectedCount < dataToExport.length;
  };

  return (
    <TooltipProvider>
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <DashboardHeader 
            title="Event Registrations"
            description="Manage event registrations and contact registrants"
            icon={Users}
          />
          {filteredRegistrations.length > 0 && (
            <div className="flex gap-2">
              {selectedRegistrations.size > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRegistrations(new Set())}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Selection ({selectedRegistrations.size})
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToExcel} className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Export to Excel
                    {selectedRegistrations.size > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {selectedRegistrations.size} selected
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export to CSV
                    {selectedRegistrations.size > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {selectedRegistrations.size} selected
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden py-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">Total Events</CardDescription>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-3xl">{events.length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-blue-100 dark:bg-blue-900/30"></div>
          </Card>
          
          <Card className="overflow-hidden py-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">Total Registrations</CardDescription>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                {events.reduce((sum, e) => sum + e.registrationCount, 0)}
              </CardTitle>
            </CardHeader>
            <div className="h-1 bg-green-100 dark:bg-green-900/30"></div>
          </Card>
          
          <Card className="overflow-hidden py-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">Active Events</CardDescription>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                {events.filter(e => e.eventIsActive).length}
              </CardTitle>
            </CardHeader>
            <div className="h-1 bg-purple-100 dark:bg-purple-900/30"></div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Filters</h3>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
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
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <div className="relative">
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger className="w-full bg-background/50">
                        <SelectValue placeholder="Filter by event" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 sticky top-0 bg-background z-10 border-b">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                            <Input
                              placeholder="Search events..."
                              value={eventSearchTerm}
                              onChange={(e) => setEventSearchTerm(e.target.value)}
                              className="pl-7 h-8 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <SelectItem value="all">All Events</SelectItem>
                        {filteredEvents.map((event) => (
                          <SelectItem key={event.id} value={event.slug}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate pr-2">{event.title}</span>
                              <Badge variant="secondary" className="ml-2">
                                {event.registrationCount}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedEvent !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                        onClick={() => setSelectedEvent("all")}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm pt-6">
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
                <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
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
                  <TabsList className="grid w-full max-w-[400px] grid-cols-3 bg-muted/50">
                    <TabsTrigger value="all" className="data-[state=active]:bg-background">All</TabsTrigger>
                    <TabsTrigger value="upcoming" className="data-[state=active]:bg-background">Upcoming</TabsTrigger>
                    <TabsTrigger value="past" className="data-[state=active]:bg-background">Past</TabsTrigger>
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
                    handleSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    selectedRegistrations={selectedRegistrations}
                    handleSelectRegistration={handleSelectRegistration}
                    handleSelectAll={handleSelectAll}
                    isAllSelected={isAllSelected()}
                    isIndeterminate={isIndeterminate()}
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
                    handleSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    selectedRegistrations={selectedRegistrations}
                    handleSelectRegistration={handleSelectRegistration}
                    handleSelectAll={handleSelectAll}
                    isAllSelected={isAllSelected()}
                    isIndeterminate={isIndeterminate()}
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
                    handleSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    selectedRegistrations={selectedRegistrations}
                    handleSelectRegistration={handleSelectRegistration}
                    handleSelectAll={handleSelectAll}
                    isAllSelected={isAllSelected()}
                    isIndeterminate={isIndeterminate()}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

interface RegistrationsTableProps {
  registrations: Registration[];
  getRegistrantName: (reg: Registration) => string;
  getRegistrantEmail: (reg: Registration) => string;
  getRegistrantPhone: (reg: Registration) => string;
  handleWhatsAppClick: (phone: string) => void;
  handleDeleteRegistration: (registrationId: number) => void;
  handleSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedRegistrations: Set<number>;
  handleSelectRegistration: (registrationId: number, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

function RegistrationsTable({ 
  registrations, 
  getRegistrantName,
  getRegistrantEmail,
  getRegistrantPhone,
  handleWhatsAppClick,
  handleDeleteRegistration,
  handleSort,
  sortField,
  sortDirection,
  selectedRegistrations,
  handleSelectRegistration,
  handleSelectAll,
  isAllSelected,
  isIndeterminate
}: RegistrationsTableProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const checkboxState = isIndeterminate ? "indeterminate" : isAllSelected ? "checked" : "unchecked";

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left py-3 px-4 font-medium w-12">
              <div className="flex items-center justify-center">
                {checkboxState === "indeterminate" ? (
                  <div 
                    className="w-4 h-4 border border-primary rounded-sm bg-primary flex items-center justify-center cursor-pointer"
                    onClick={() => handleSelectAll(false)}
                  >
                    <Minus className="w-3 h-3 text-primary-foreground" />
                  </div>
                ) : (
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                )}
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                {renderSortIcon('name')}
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center">
                Contact
                {renderSortIcon('email')}
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors max-w-[200px]"
              onClick={() => handleSort('event')}
            >
              <div className="flex items-center">
                Event
                {renderSortIcon('event')}
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('eventDate')}
            >
              <div className="flex items-center">
                Event Date
                {renderSortIcon('eventDate')}
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('registeredAt')}
            >
              <div className="flex items-center">
                Registered
                {renderSortIcon('registeredAt')}
              </div>
            </th>
            <th className="text-right py-3 px-4 font-medium w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg, index) => {
            const phone = getRegistrantPhone(reg);
            const isSelected = selectedRegistrations.has(reg.registration.id);
            return (
              <tr 
                key={reg.registration.id} 
                className={`border-b hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'} ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
              >
                <td className="py-3 px-4">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRegistration(reg.registration.id, checked as boolean)}
                    aria-label={`Select ${getRegistrantName(reg)}`}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{getRegistrantName(reg)}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">{getRegistrantEmail(reg)}</div>
                  {phone !== "N/A" && (
                    <div className="text-xs text-muted-foreground">{phone}</div>
                  )}
                </td>
                <td className="py-3 px-4 max-w-[200px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="font-medium truncate">{reg.event.title}</div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground border-border">
                      <p>{reg.event.title}</p>
                    </TooltipContent>
                  </Tooltip>
                  {reg.event.eventLocation && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{reg.event.eventLocation}</span>
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
                        className="flex items-center gap-1 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800"
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