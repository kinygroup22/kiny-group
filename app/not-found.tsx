// Path: app/not-found.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Home, Search, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center overflow-hidden">        
        <div className="container relative mx-auto px-4 md:px-6 z-10 pt-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 404 Display */}
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-(--color-gold-300) via-(--color-gold-500) to-(--color-gold-300) bg-clip-text text-transparent">
                  404
                </span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-(--color-gold-500) to-transparent mx-auto"></div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Page Not Found
            </h2>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button asChild size="lg" className="group bg-gradient-to-r from-(--color-gold-500) to-(--color-gold-600) hover:from-(--color-gold-600) hover:to-(--color-gold-700) text-white font-semibold px-8 h-14 shadow-lg shadow-(--color-gold-500)/20">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-14 px-8 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link href="/brand">
                  <Compass className="mr-2 h-5 w-5" />
                  Explore Our Brands
                </Link>
              </Button>
            </div>
            
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="py-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                    <Home className="h-5 w-5 text-(--color-gold-400)" />
                    Home
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Return to our homepage and discover what KINY GROUP has to offer.
                  </CardDescription>
                  <Button asChild variant="ghost" className="text-(--color-gold-400) hover:text-(--color-gold-300) mt-2">
                    <Link href="/">Go Home</Link>
                  </Button>
                </CardHeader>
              </Card>
              
              <Card className="py-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                    <Compass className="h-5 w-5 text-(--color-gold-400)" />
                    Our Brands
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Explore our diverse portfolio of brands and services.
                  </CardDescription>
                  <Button asChild variant="ghost" className="text-(--color-gold-400) hover:text-(--color-gold-300) mt-2">
                    <Link href="/brand">Explore Brands</Link>
                  </Button>
                </CardHeader>
              </Card>
              
              <Card className="py-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                    <Search className="h-5 w-5 text-(--color-gold-400)" />
                    About Us
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Learn more about KINY GROUP and our mission.
                  </CardDescription>
                  <Button asChild variant="ghost" className="text-(--color-gold-400) hover:text-(--color-gold-300) mt-2">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Bottom Fade Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
}