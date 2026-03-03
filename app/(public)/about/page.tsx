// app/(public)/about/page.tsx
"use client";

import PageHeader from "@/components/(public)/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, Users, Award, Sparkles, Globe, Heart, Lightbulb, Handshake, Eye, Compass, Briefcase, GraduationCap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Define types for the data (keeping the same interfaces)
interface JourneyItem {
  year: string;
  title: string;
  description: string;
  image: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  featured: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  image: string;
  role: string;
  departmentId: number;
  departmentName: string;
  order: number;
  icon: string;
  achievements: string[];
}

interface Department {
  id: number;
  name: string;
  head: string;
  description: string;
  color: string;
  order: number;
  team: TeamMember[];
}

export default function AboutPage() {
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch journey items
        const journeyResponse = await fetch('/api/about/journey');
        if (journeyResponse.ok) {
          const journeyData = await journeyResponse.json();
          setJourneyItems(journeyData);
        }

        // Fetch achievements
        const achievementsResponse = await fetch('/api/about/achievements');
        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setAchievements(achievementsData);
        }

        // Fetch departments with team members
        const departmentsResponse = await fetch('/api/about/departments');
        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData);
        }

        // Fetch all team members separately for founder and executives
        const teamMembersResponse = await fetch('/api/about/team-members');
        if (teamMembersResponse.ok) {
          const teamMembersData = await teamMembersResponse.json();
          setTeamMembers(teamMembersData);
        }
      } catch (error) {
        console.error("Error fetching about page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get founder from team members
  const founder = teamMembers.find(member => member.role === 'founder');
  
  // Get executives from team members
  const executiveTeam = teamMembers.filter(member => member.role === 'executive');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
      <div className="max-w-6xl mx-auto pt-18">
        <PageHeader 
          title="About Us"
          description="Explore, learn, experience - Our Journey, Vision, and Commitment to delivering the best"
          emphasizedWord="Us"
        />

        {/* Enhanced Vision & Mission Section */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Vision Card */}
            <Card className="border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 group">
              <CardHeader className="pb-4 pt-4">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary-foreground shadow-lg">
                    <Eye className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl">Visi Kami</CardTitle>
                </div>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  Memperkaya kehidupan melalui program pendidikan yang transformatif dan inisiatif budaya, memberdayakan generasi pemimpin yang beragam di masa depan.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pt-4 border-t border-border">
                  <p className="text-xs md:text-sm text-muted-foreground italic">
                    To enrich lives through transformative educational programs and cultural initiatives, empowering the next generation of diverse leaders.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 group">
              <CardHeader className="pb-4 pt-4">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-primary-foreground shadow-lg">
                    <Compass className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl">Our Mission</CardTitle>
                </div>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  &quot;Kiny Group is dedicated to enhancing global connections through our multifaceted services&quot;
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="pt-4 border-t border-border">
                  <p className="text-xs md:text-sm text-muted-foreground italic">
                    &quot;Kiny Group berdedikasi untuk memperkuat koneksi global melalui berbagai layanan kami yang komprehensif&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <Card className="mt-4 md:mt-6 border-gold-500/20">
            <CardHeader className="text-center pb-4 pt-6">
              <CardTitle className="text-lg md:text-xl">Our Core Values</CardTitle>
              <CardDescription className="text-sm md:text-base">Principles that guide every step we take</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-lg border border-border hover:border-gold-500/30 transition-colors">
                  <Globe className="h-7 w-7 md:h-8 md:w-8 text-gold-500 mb-2 md:mb-3" />
                  <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Global Excellence</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">International standards in every service</p>
                </div>
                <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-lg border border-border hover:border-gold-500/30 transition-colors">
                  <Heart className="h-7 w-7 md:h-8 md:w-8 text-gold-500 mb-2 md:mb-3" />
                  <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Passion & Care</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">Full dedication to client satisfaction</p>
                </div>
                <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-lg border border-border hover:border-gold-500/30 transition-colors">
                  <Lightbulb className="h-7 w-7 md:h-8 md:w-8 text-gold-500 mb-2 md:mb-3" />
                  <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Innovation</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">Continuously innovating for the future</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Journey Section */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
              Our Journey
            </h2>
            <p className="text-muted-foreground mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
              From 2012 to present, continuously growing and innovating
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-gold-400 via-gold-500 to-gold-600 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-gold-400 via-gold-500 to-transparent animate-pulse"></div>
            </div>
            
            <div className="space-y-12 md:space-y-16">
              {journeyItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center group`}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`
                  }}
                >
                  <div className="w-1/2 px-4 md:px-8">
                    <Card className="border-gold-500/20 hover:border-gold-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-gold-500/20 hover:-translate-y-2 overflow-hidden">
                      <div className="relative h-40 md:h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-t from-card via-card/50 to-transparent z-10"></div>
                        <Image 
                          src={item.image} 
                          alt={item.title}
                          fill
                          className="object-contain transition-transform duration-700" // Changed to object-contain
                        />
                        <div className="absolute top-4 right-4 z-20">
                          <div className="bg-gold-500 text-primary-foreground px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-lg shadow-lg">
                            {item.year}
                          </div>
                        </div>
                      </div>
                      
                      <CardHeader className="space-y-2 md:space-y-3 pb-4">
                        <CardTitle className="text-lg md:text-xl group-hover:text-gold-400 transition-colors duration-300">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm md:text-base leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <div className="w-0 flex justify-center relative z-20">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-gold-500 shadow-lg shadow-gold-500/50 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-gold-400 animate-ping opacity-75"></div>
                      <div className="absolute inset-0 w-8 h-8 -m-2 rounded-full border-2 border-gold-400/30 group-hover:border-gold-400/60 transition-colors duration-500"></div>
                    </div>
                  </div>

                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-gold-500 to-gold-600 opacity-30"></div>
            
            <div className="space-y-6 md:space-y-8 pl-10 pr-4">
              {journeyItems.map((item, index) => (
                <div 
                  key={index}
                  className="relative group"
                  style={{
                    animation: `fadeInLeft 0.6s ease-out ${index * 0.15}s both`
                  }}
                >
                  <div className="absolute -left-7 top-6">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-gold-500 shadow-md shadow-gold-500/50 group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-gold-400 animate-ping opacity-75"></div>
                    </div>
                  </div>

                  <Card className="border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 hover:shadow-md hover:shadow-gold-500/10 overflow-hidden">
                    <div className="absolute top-3 right-3 z-10 bg-gold-500 text-primary-foreground px-2 py-1 rounded-full font-bold text-xs shadow-md">
                      {item.year}
                    </div>

                    <div className="relative h-32 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent z-10"></div>
                      <Image 
                        src={item.image} 
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <CardHeader className="space-y-1 md:space-y-2 pb-4">
                      <CardTitle className="text-base md:text-lg group-hover:text-gold-400 transition-colors duration-300">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Strengths & Achievements Section */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
              Our Strengths & Achievements
            </h2>
            <p className="text-muted-foreground mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
              Proud accomplishments in our journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 md:p-4 rounded-lg border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 hover:shadow-md hover:shadow-gold-500/10">
                {achievement.icon && (
                  <div className="w-5 h-5 md:w-6 md:h-6 text-gold-500 shrink-0 mt-0.5">
                    {/* Dynamic icon rendering based on icon name */}
                    {achievement.icon === 'Award' && <Award className="h-5 w-5 md:h-6 md:w-6" />}
                    {achievement.icon === 'Target' && <Target className="h-5 w-5 md:h-6 md:w-6" />}
                    {achievement.icon === 'Sparkles' && <Sparkles className="h-5 w-5 md:h-6 md:w-6" />}
                    {achievement.icon === 'Globe' && <Globe className="h-5 w-5 md:h-6 md:w-6" />}
                    {achievement.icon === 'Heart' && <Heart className="h-5 w-5 md:h-6 md:w-6" />}
                    {achievement.icon === 'Lightbulb' && <Lightbulb className="h-5 w-5 md:h-6 md:w-6" />}
                    {achievement.icon === 'Handshake' && <Handshake className="h-5 w-5 md:h-6 md:w-6" />}
                    {/* Default icon if none matches */}
                    {!['Award', 'Target', 'Sparkles', 'Globe', 'Heart', 'Lightbulb', 'Handshake'].includes(achievement.icon) && <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm md:text-base">{achievement.title}</p>
                  {achievement.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{achievement.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Tree Section */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
              Our Team & Organization
            </h2>
            <p className="text-muted-foreground mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
              Led by experienced professionals dedicated to your success
            </p>
          </div>

          {/* Founder Section */}
          {founder && (
            <div className="mb-8 md:mb-12">
              <Card className="border-gold-500/20 overflow-hidden hover:shadow-xl hover:shadow-gold-500/20 transition-all duration-500">
                <div className="relative py-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-gold-400/5 to-transparent"></div>
                  <CardHeader className="text-center pb-4 md:pb-6">
                    <div className="flex justify-center mb-4 md:mb-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gold-500 shadow-2xl">
                          <Image 
                            src={founder.image || "/images/placeholder-avatar.jpg"}
                            alt={founder.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gold-500 p-1.5 md:p-2 rounded-full shadow-lg">
                          <Award className="h-4 w-4 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">{founder.name}</CardTitle>
                    <CardDescription className="text-base md:text-lg text-gold-500 font-semibold mb-3 md:mb-4">
                      {founder.title}
                    </CardDescription>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                      {founder.bio}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 pt-4 border-t border-gold-500/20">
                      {founder.achievements && founder.achievements.length > 0 && founder.achievements.map((achievement, index) => (
                        <div 
                          key={index}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-xs md:text-sm hover:bg-gold-500/20 transition-colors duration-300"
                        >
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

          {/* Connecting Line */}
          {founder && (
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="w-0.5 h-8 md:h-12 bg-gradient-to-b from-gold-500 to-gold-300"></div>
            </div>
          )}

          {/* Executive Team */}
          {executiveTeam.length > 0 && (
            <div className="mb-8 md:mb-12">
              <h3 className="text-lg md:text-xl font-bold text-center mb-6 md:mb-8">Executive Team</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {executiveTeam.map((exec, index) => {
                  // Get icon component based on icon name
                  let IconComponent = Users; // Default icon
                  if (exec.icon === 'Briefcase') IconComponent = Briefcase;
                  else if (exec.icon === 'GraduationCap') IconComponent = GraduationCap;
                  else if (exec.icon === 'Users') IconComponent = Users;
                  
                  return (
                    <Card 
                      key={index}
                      className="border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-2 group"
                    >
                      <CardHeader className="text-center py-4">
                        <div className="flex justify-center mb-3 md:mb-4">
                          <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gold-500/50 group-hover:border-gold-500 transition-colors duration-300">
                              <Image 
                                src={exec.image || "/images/placeholder-avatar.jpg"}
                                alt={exec.name}
                                fill
                                className="object-cover p-1"
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gold-400 to-gold-600 p-1.5 md:p-2 rounded-full shadow-lg">
                              <IconComponent className="h-3 w-3 md:h-4 md:w-4 text-white" />
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-base md:text-lg group-hover:text-gold-400 transition-colors duration-300">
                          {exec.name}
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm font-medium">
                          {exec.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <div className="inline-block px-2 py-1 md:px-3 md:py-1 bg-accent rounded-full text-xs text-muted-foreground">
                          {exec.departmentName}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connecting Lines */}
          {(founder || executiveTeam.length > 0) && (
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-16 md:w-24 h-0.5 bg-gradient-to-r from-transparent to-gold-300"></div>
                <div className="w-0.5 h-8 md:h-12 bg-gradient-to-b from-gold-300 to-gold-500"></div>
                <div className="w-16 md:w-24 h-0.5 bg-gradient-to-l from-transparent to-gold-300"></div>
              </div>
            </div>
          )}

          {/* Departments */}
          {departments.length > 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-center mb-6 md:mb-8">Departments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {departments.map((dept, index) => (
                  <Card 
                    key={index}
                    className="border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-lg group"
                  >
                    <CardHeader className="pb-4 pt-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${dept.color || 'from-blue-500 to-blue-600'} flex items-center justify-center mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <CardTitle className="text-base md:text-lg group-hover:text-gold-400 transition-colors duration-300">
                        {dept.name}
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm font-medium">
                        {dept.head}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-xs text-muted-foreground font-semibold mb-1 md:mb-2">Team Members:</p>
                        {dept.team && dept.team.length > 0 ? (
                          dept.team.map((member, memberIndex) => (
                            <div 
                              key={memberIndex}
                              className="flex items-center gap-2 text-xs p-1.5 md:p-2 rounded bg-accent/50 hover:bg-accent transition-colors duration-200"
                            >
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-500"></div>
                              <span className="text-xs">{member.name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No team members assigned</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}