// app/(public)/about/page.tsx
"use client";

import PageHeader from "@/components/(public)/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, Users, Award, Sparkles, Globe, Heart, Lightbulb, Handshake, Eye, Compass, Briefcase, GraduationCap, Quote } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Define types for the data
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
        const [journeyRes, achievementsRes, departmentsRes, teamRes] = await Promise.all([
          fetch('/api/about/journey'),
          fetch('/api/about/achievements'),
          fetch('/api/about/departments'),
          fetch('/api/about/team-members'),
        ]);

        if (journeyRes.ok) setJourneyItems(await journeyRes.json());
        if (achievementsRes.ok) setAchievements(await achievementsRes.json());
        if (departmentsRes.ok) setDepartments(await departmentsRes.json());
        if (teamRes.ok) setTeamMembers(await teamRes.json());
      } catch (error) {
        console.error("Error fetching about page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const founder = teamMembers.find(member => member.role === 'founder');
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

        {/* Vision & Mission — refined two-column */}
        <div className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Vision */}
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

            {/* Mission */}
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

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* Founder Section — Elegant editorial-style layout             */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {founder && (
          <div className="mb-16 md:mb-24">
            {/* Section heading */}
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold-500 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
                Leadership
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Meet Our Founder
              </h2>
              <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>

            {/* Founder card — side-by-side on desktop, stacked on mobile */}
            <div className="relative max-w-4xl mx-auto">
              {/* Subtle decorative background */}
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-br from-gold-500/[0.03] via-transparent to-gold-500/[0.03] rounded-3xl" />

              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
                {/* Portrait — takes 2 of 5 columns on desktop */}
                <div className="md:col-span-2 flex justify-center">
                  <div className="relative">
                    {/* Soft glow behind portrait */}
                    <div className="absolute inset-0 bg-gold-500/20 rounded-2xl blur-2xl scale-90" />

                    {/* Portrait frame */}
                    <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden border-2 border-gold-500/30 shadow-xl">
                      <Image
                        src={founder.image || "/images/placeholder-avatar.jpg"}
                        alt={founder.name}
                        fill
                        className="object-cover"
                      />
                      {/* Gentle bottom gradient for text legibility if needed */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>

                    {/* Small decorative accent */}
                    <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Bio — takes 3 of 5 columns on desktop */}
                <div className="md:col-span-3 text-center md:text-left space-y-5">
                  {/* Name & title */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {founder.name}
                    </h3>
                    <p className="text-gold-500 font-semibold text-base md:text-lg mt-1">
                      {founder.title}
                    </p>
                  </div>

                  {/* Thin separator */}
                  <div className="mx-auto md:mx-0 w-12 h-px bg-gold-500/40" />

                  {/* Bio text */}
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {founder.bio}
                  </p>

                  {/* Achievements as understated pills */}
                  {founder.achievements && founder.achievements.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">
                        Milestones
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {founder.achievements.map((achievement, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm border border-gold-500/25 bg-gold-500/[0.06] text-foreground/80 hover:border-gold-500/40 hover:bg-gold-500/10 transition-colors duration-200"
                          >
                            <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Executive Team — only shown if there are executives */}
        {executiveTeam.length > 0 && (
          <div className="mb-16 md:mb-24">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold-500 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
                Leadership Team
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Executive Team
              </h2>
              <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {executiveTeam.map((exec) => {
                let IconComponent = Users;
                if (exec.icon === 'Briefcase') IconComponent = Briefcase;
                else if (exec.icon === 'GraduationCap') IconComponent = GraduationCap;

                return (
                  <div
                    key={exec.id}
                    className="group text-center"
                  >
                    <div className="relative mx-auto w-28 h-28 md:w-32 md:h-32 mb-4">
                      <div className="absolute inset-0 rounded-full bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors duration-300" />
                      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gold-500/30 group-hover:border-gold-500/50 transition-colors duration-300">
                        <Image
                          src={exec.image || "/images/placeholder-avatar.jpg"}
                          alt={exec.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gold-400 to-gold-600 p-1.5 rounded-full shadow-md">
                        <IconComponent className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm md:text-base group-hover:text-gold-500 transition-colors duration-200">
                      {exec.name}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      {exec.title}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {exec.departmentName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Departments — only shown if there are departments with team members */}
        {departments.length > 0 && departments.some(d => d.team && d.team.length > 0) && (
          <div className="mb-16 md:mb-24">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold-500 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
                Organization
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Departments
              </h2>
              <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {departments.map((dept) => (
                <Card
                  key={dept.id}
                  className="border-gold-500/15 hover:border-gold-500/35 transition-all duration-300 hover:shadow-lg group"
                >
                  <CardHeader className="pb-4 pt-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${dept.color || 'from-gold-400 to-gold-600'} flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <CardTitle className="text-base md:text-lg group-hover:text-gold-500 transition-colors duration-200">
                      {dept.name}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium">
                      {dept.head}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Team Members:</p>
                      {dept.team && dept.team.length > 0 ? (
                        dept.team.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 text-xs p-1.5 md:p-2 rounded bg-accent/50 hover:bg-accent transition-colors duration-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                            <span>{member.name}</span>
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

        {/* Journey Section */}
        {journeyItems.length > 0 && (
          <div className="mb-16 md:mb-24">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold-500 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
                Timeline
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Our Journey
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm md:text-base">
                From 2012 to present, continuously growing and innovating
              </p>
              <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>

            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-gold-400/40 via-gold-500/30 to-gold-600/10" />

              <div className="space-y-16">
                {journeyItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center group`}
                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both` }}
                  >
                    <div className="w-1/2 px-8">
                      <Card className="border-gold-500/15 hover:border-gold-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-1 overflow-hidden">
                        <div className="relative h-48 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-contain transition-transform duration-700"
                          />
                          <div className="absolute top-4 right-4 z-20">
                            <div className="bg-gold-500 text-primary-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                              {item.year}
                            </div>
                          </div>
                        </div>
                        <CardHeader className="space-y-3 pb-4">
                          <CardTitle className="text-xl group-hover:text-gold-500 transition-colors duration-300">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>

                    <div className="w-0 flex justify-center relative z-20">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-gold-500 shadow-md shadow-gold-500/40 group-hover:scale-150 transition-transform duration-500" />
                        <div className="absolute inset-0 w-7 h-7 -m-2 rounded-full border border-gold-400/30 group-hover:border-gold-400/60 transition-colors duration-500" />
                      </div>
                    </div>

                    <div className="w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-gold-400/40 via-gold-500/30 to-gold-600/10" />

              <div className="space-y-6 pl-10 pr-2">
                {journeyItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative group"
                    style={{ animation: `fadeInLeft 0.6s ease-out ${index * 0.15}s both` }}
                  >
                    <div className="absolute -left-7 top-6">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-sm shadow-gold-500/40 group-hover:scale-150 transition-transform duration-300" />
                    </div>

                    <Card className="border-gold-500/15 hover:border-gold-500/40 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-3 right-3 z-10 bg-gold-500 text-primary-foreground px-2 py-1 rounded-full font-bold text-xs shadow-md">
                        {item.year}
                      </div>
                      <div className="relative h-32 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent z-10" />
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-base group-hover:text-gold-500 transition-colors duration-300">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="mb-16 md:mb-24">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold-500 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
                Recognition
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Our Strengths & Achievements
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm md:text-base">
                Proud accomplishments in our journey
              </p>
              <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {achievements.map((achievement) => {
                const iconMap: Record<string, React.ReactNode> = {
                  'Award': <Award className="h-5 w-5" />,
                  'Target': <Target className="h-5 w-5" />,
                  'Sparkles': <Sparkles className="h-5 w-5" />,
                  'Globe': <Globe className="h-5 w-5" />,
                  'Heart': <Heart className="h-5 w-5" />,
                  'Lightbulb': <Lightbulb className="h-5 w-5" />,
                  'Handshake': <Handshake className="h-5 w-5" />,
                };

                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-4 rounded-xl border border-gold-500/15 hover:border-gold-500/35 transition-all duration-300 hover:shadow-md hover:shadow-gold-500/5"
                  >
                    <div className="text-gold-500 shrink-0 mt-0.5">
                      {iconMap[achievement.icon] || <CheckCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">{achievement.title}</p>
                      {achievement.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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