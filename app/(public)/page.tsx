"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Sparkles, Users, TrendingUp, Award, Globe, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ClientsSection from "@/components/(public)/home/clients-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Parallax Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=2070&q=80')" }}
        />
        
        {/* Overlay to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.15),transparent_70%)]" />
        
        <div className="container relative mx-auto px-4 md:px-6 z-10 pt-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white/70">Welcome to</span>
              <br />
              <span className="bg-gradient-to-r from-(--color-gold-300) via-(--color-gold-500) to-(--color-gold-300) bg-clip-text text-transparent">
                KINY GROUP
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transforming industries through innovation, excellence, and unwavering commitment to quality across our diverse brand portfolio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="group bg-gradient-to-r from-(--color-gold-500) to-(--color-gold-600) hover:from-(--color-gold-600) hover:to-(--color-gold-700) text-white font-semibold px-8 h-14 shadow-lg shadow-(--color-gold-500)/20">
                <Link href="/brand">
                  Explore Our Brands
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-14 px-8 ">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
            
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-(--color-gold-400) mb-2">10+</div>
                <div className="text-sm text-white/70">Years of Experience</div>
              </div>
              <div className="text-center border-x border-gold-500/20">
                <div className="text-3xl md:text-4xl font-bold text-(--color-gold-400) mb-2">500+</div>
                <div className="text-sm text-white/70">Satisfied Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-(--color-gold-400) mb-2">15+</div>
                <div className="text-sm text-white/70">Brands</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Fade Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section with Modern Cards */}
      <section className="py-24 md:py-32 relative bg-background">
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 mb-6">
              <Award className="h-4 w-4 text-[var(--color-gold-400)]" />
              <span className="text-sm font-medium text-[var(--color-gold-300)]">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Excellence in Every
              <span className="text-[var(--color-gold-500)]"> Aspect</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine innovation, expertise, and dedication to deliver exceptional value to our clients and partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="pt-6 group relative overflow-hidden border bg-card backdrop-blur-sm hover:border-[var(--color-gold-500)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold-500)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-500)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-7 w-7 text-[var(--color-gold-500)]" />
                </div>
                <CardTitle className="text-2xl mb-3">Premium Quality</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Uncompromising standards in every service we deliver, ensuring excellence and satisfaction at every touchpoint.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2 */}
            <Card className="pt-6 group relative overflow-hidden border bg-card backdrop-blur-sm hover:border-[var(--color-gold-500)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold-500)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-500)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-[var(--color-gold-500)]" />
                </div>
                <CardTitle className="text-2xl mb-3">Leading Innovation</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Pioneering solutions that push boundaries and set new industry standards through continuous innovation.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3 */}
            <Card className="pt-6 group relative overflow-hidden border bg-card backdrop-blur-sm hover:border-[var(--color-gold-500)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold-500)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-500)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-[var(--color-gold-500)]" />
                </div>
                <CardTitle className="text-2xl mb-3">Expert Team</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Industry veterans with decades of combined experience, dedicated to your success and growth.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 4 */}
            <Card className="pt-6 group relative overflow-hidden border bg-card backdrop-blur-sm hover:border-[var(--color-gold-500)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold-500)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-500)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="h-7 w-7 text-[var(--color-gold-500)]" />
                </div>
                <CardTitle className="text-2xl mb-3">Global Reach</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  International presence with local expertise, serving clients across multiple continents and markets.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 5 */}
            <Card className="pt-6 group relative overflow-hidden border bg-card backdrop-blur-sm hover:border-[var(--color-gold-500)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold-500)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-500)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-[var(--color-gold-500)]" />
                </div>
                <CardTitle className="text-2xl mb-3">Trust & Security</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Robust security measures and transparent practices that build long-term trust with every partnership.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 6 */}
            <Card className="pt-6 group relative overflow-hidden border bg-card backdrop-blur-sm hover:border-[var(--color-gold-500)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold-500)]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-500)]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-7 w-7 text-[var(--color-gold-500)]" />
                </div>
                <CardTitle className="text-2xl mb-3">Premium Support</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  24/7 support team ready to assist you with personalized solutions and expert guidance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use the ClientsSection component here */}
      <ClientsSection />

      {/* CTA Section with Enhanced Design */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/10 via-[var(--color-gold-500)]/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.15),transparent_70%)]" />
        
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-[var(--color-gold-500)]/30 bg-card backdrop-blur-xl shadow-2xl shadow-[var(--color-gold-500)]/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-gold-500)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-gold-500)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <CardHeader className="relative text-center p-12 md:p-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 mb-8 mx-auto">
                  <ArrowRight className="h-4 w-4 text-[var(--color-gold-400)]" />
                  <span className="text-sm font-medium text-[var(--color-gold-300)]">Get Started Today</span>
                </div>
                
                <CardTitle className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                  Ready to Transform Your Business?
                </CardTitle>
                
                <CardDescription className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join hundreds of successful clients who trust KINY GROUP to deliver exceptional results. Let&apos;s create something extraordinary together.
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="group bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-600)] hover:from-[var(--color-gold-600)] hover:to-[var(--color-gold-700)] text-white font-semibold px-8 h-14 shadow-lg shadow-[var(--color-gold-500)]/20">
                    <Link href="/contact">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="h-14 px-8">
                    <Link href="/brand">View Our Portfolio</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}