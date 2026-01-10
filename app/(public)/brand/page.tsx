// app/(public)/brand/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/(public)/layout/page-header";
import { brandsAPI } from "@/lib/api/client/brands";
import { BrandDivision } from "@/lib/db/schema";
import { getThemeColors, createThemeCSSVariables } from "@/lib/theme-utils";

export default function BrandPage() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [brandsData, setBrandsData] = useState<BrandDivision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Fetch brands data from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsAPI.getAll();
        setBrandsData(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleNext = () => {
    if (isAnimating || brandsData.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % brandsData.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating || brandsData.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + brandsData.length) % brandsData.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  useEffect(() => {
    if (brandsData.length === 0) return;
    
    const interval = setInterval(() => {
      if (!isAnimating) handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [isAnimating, brandsData.length]);

  const getPositionStyles = (index: number) => {
    if (brandsData.length === 0) return {};
    
    const diff = (index - activeIndex + brandsData.length) % brandsData.length;
    
    if (diff === 0) {
      return {
        transform: 'translateX(-50%) scale(1) translateY(-50%)',
        left: '50%',
        top: '50%',
        zIndex: 50,
        opacity: 1,
        filter: 'brightness(1.1) blur(0px)',
      };
    } else if (diff === 1) {
      return {
        transform: 'translateX(0%) scale(0.85) translateY(-50%)',
        left: '72%',
        top: '50%',
        zIndex: 40,
        opacity: 0.7,
        filter: 'blur(1px)',
      };
    } else if (diff === brandsData.length - 1) {
      return {
        transform: 'translateX(-100%) scale(0.85) translateY(-50%)',
        left: '28%',
        top: '50%',
        zIndex: 40,
        opacity: 0.7,
        filter: 'blur(1px)',
      };
    } else if (diff === 2) {
      return {
        transform: 'translateX(0%) scale(0.7) translateY(-50%)',
        left: '88%',
        top: '50%',
        zIndex: 30,
        opacity: 0.4,
        filter: 'blur(2px)',
      };
    } else if (diff === brandsData.length - 2) {
      return {
        transform: 'translateX(-100%) scale(0.7) translateY(-50%)',
        left: '12%',
        top: '50%',
        zIndex: 30,
        opacity: 0.4,
        filter: 'blur(2px)',
      };
    } else {
      return {
        transform: 'translateX(-50%) scale(0.5) translateY(-50%)',
        left: diff > brandsData.length / 2 ? '-25%' : '125%',
        top: '50%',
        zIndex: 10,
        opacity: 0,
        filter: 'blur(3px)',
      };
    }
  };

  const currentBrand = brandsData[activeIndex];
  const currentTheme = currentBrand ? getThemeColors(currentBrand) : getThemeColors({} as BrandDivision);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-lg">Loading brand divisions...</p>
        </div>
      </div>
    );
  }

  if (brandsData.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Brand Divisions Available</h1>
          <p className="text-lg">Check back later for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background text-foreground overflow-hidden relative"
      style={createThemeCSSVariables(currentBrand)}
    >
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/5 to-background" />
      
      {/* Animated decorative orbs */}
      <div 
        className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
        style={{ backgroundColor: currentTheme.primary, opacity: 0.06 }}
      />
      <div 
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"
        style={{ backgroundColor: currentTheme.primary, opacity: 0.06 }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slower"
        style={{ backgroundColor: currentTheme.primary, opacity: 0.04 }}
      />

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 relative z-10">
        <div className="max-w-6xl mx-auto pt-18">
          <PageHeader 
            title="Our Brands"
            description="Six exceptional divisions, one unified vision of excellence"
            emphasizedWord="Brands"
          />

          {/* Brand Slider with touch support */}
          <div 
            className="relative mx-auto max-w-6xl h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] mb-12 md:mb-16 lg:mb-20"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div ref={sliderRef} className="relative w-full h-full perspective-1500">
              {brandsData.map((brand, index) => {
                const isActive = index === activeIndex;
                const isHovered = hoveredIndex === index;
                const styles = getPositionStyles(index);
                const theme = getThemeColors(brand);
                
                return (
                  <div 
                    key={brand.id}
                    className="absolute w-[240px] h-[340px] sm:w-[280px] sm:h-[400px] md:w-[340px] md:h-[480px] lg:w-[420px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ease-out cursor-pointer"
                    style={{
                      ...styles,
                      transform: isHovered && !isActive ? `${styles.transform} scale(1.05)` : styles.transform,
                    }}
                    onClick={() => {
                      if (!isAnimating) {
                        setActiveIndex(index);
                      }
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Background image with enhanced parallax */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                      style={{
                        backgroundImage: `url(${brand.backgroundImage})`,
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    />
                    
                    {/* Dynamic colored overlay */}
                    <div
                      className="absolute inset-0 mix-blend-multiply transition-opacity duration-700"
                      style={{ 
                        backgroundColor: theme.primary,
                        opacity: isActive ? 0.35 : 0.45,
                      }}
                    />
                    
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/50" />
                    
                    {/* Active border glow */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 rounded-3xl animate-border-glow pointer-events-none"
                        style={{
                          boxShadow: `0 0 40px ${theme.primary}90, inset 0 0 40px ${theme.primary}40`,
                          border: `2px solid ${theme.primary}60`,
                        }}
                      />
                    )}

                    {/* Content - Always visible on mobile, hover on desktop */}
                    <div className={`absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-end transition-all duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
                    }`}>
                      <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5">
                        {/* Tagline badge */}
                        <div className="inline-block">
                          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/20 backdrop-blur-xl border border-white/20 shadow-lg">
                            <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">
                              {brand.tagline}
                            </p>
                          </div>
                        </div>
                        
                        {/* Brand name */}
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.1] text-white drop-shadow-2xl">
                          {brand.name}
                        </h2>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-white/90 line-clamp-3 drop-shadow-lg">
                          {brand.description}
                        </p>
                        
                        {/* CTA Button */}
                        <Link
                          href={`/brand/${brand.id}`}
                          className="group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 text-xs sm:text-sm md:text-base text-white shadow-xl"
                          style={{ backgroundColor: theme.primary }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explore Division
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>

                    {/* Brand logo - enhanced */}
                    <div className="absolute top-4 sm:top-5 md:top-6 lg:top-8 right-4 sm:right-5 md:right-6 lg:right-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-background/95 backdrop-blur-xl border border-white/30 p-2 sm:p-2.5 md:p-3 overflow-hidden shadow-2xl">
                      <Image 
                        src={brand.logo || "/placeholder-logo.png"}
                        alt={brand.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Mobile tap indicator */}
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center md:hidden">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">TAP</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enhanced navigation controls - positioned below cards */}
            <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 z-50">
              <button
                onClick={handlePrev}
                disabled={isAnimating}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-background/80 backdrop-blur-xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:scale-110 hover:shadow-2xl shadow-lg"
                style={{ borderColor: `${currentTheme.border}` }}
              >
                <ChevronLeft 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform group-hover:-translate-x-1" 
                  style={{ color: currentTheme.primary }}
                />
              </button>
              
              {/* Enhanced dot indicators */}
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-3 sm:px-4 md:px-6 rounded-full bg-background/80 backdrop-blur-xl border-2 shadow-lg" style={{ borderColor: `${currentTheme.border}` }}>
                {brandsData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => !isAnimating && setActiveIndex(index)}
                    className={`transition-all duration-500 rounded-full ${
                      index === activeIndex
                        ? 'w-6 sm:w-8 md:w-10 h-1.5 sm:h-2 md:h-2.5 shadow-lg'
                        : 'w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 md:h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-125'
                    }`}
                    style={index === activeIndex ? { 
                      backgroundColor: currentTheme.primary,
                      boxShadow: `0 0 15px ${currentTheme.primary}80` 
                    } : {}}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-background/80 backdrop-blur-xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:scale-110 hover:shadow-2xl shadow-lg"
                style={{ borderColor: `${currentTheme.border}` }}
              >
                <ChevronRight 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform group-hover:translate-x-1" 
                  style={{ color: currentTheme.primary }}
                />
              </button>
            </div>
          </div>

          {/* Enhanced stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { label: currentBrand.stats?.label1 || "", value: currentBrand.stats?.value1 || "" },
              { label: currentBrand.stats?.label2 || "", value: currentBrand.stats?.value2 || "" },
              { label: currentBrand.stats?.label3 || "", value: currentBrand.stats?.value3 || "" },
              { label: currentBrand.stats?.label4 || "", value: currentBrand.stats?.value4 || "" },
            ].map((stat, index) => (
              <div 
                key={index}
                className="group relative p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-xl border transition-all duration-700 hover:scale-105 hover:shadow-2xl overflow-hidden"
                style={{ 
                  borderColor: currentTheme.border,
                  boxShadow: `0 4px 20px ${currentTheme.primary}10`,
                  backgroundColor: currentTheme.bg,
                }}
              >
                {/* Background glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
                  style={{ backgroundColor: `${currentTheme.primary}15` }}
                />
                
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 transition-all duration-700 group-hover:scale-110" style={{ color: currentTheme.primary }}>
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground transition-all duration-700">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Division overview text */}
          <div className="mt-12 md:mt-16 lg:mt-20 text-center max-w-3xl mx-auto">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Each division of Kiny Group represents our commitment to excellence in different sectors. 
              Explore our divisions to discover how we can help you achieve your goals.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes border-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animate-border-glow {
          animation: border-glow 2.5s ease-in-out infinite;
        }
        
        .perspective-1500 {
          perspective: 1500px;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .perspective-1500 {
            perspective: 1000px;
          }
        }
      `}</style>
    </div>
  );
}