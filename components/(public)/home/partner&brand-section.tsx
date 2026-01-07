// components/(public)/home/partner&brand-section.tsx
"use client";

import { useEffect, useState } from "react";
import { Globe, Users, Award, Star } from "lucide-react";
import Image from "next/image";

interface PartnerData {
  name: string;
  logo: string;
}

interface ClientData {
  name: string;
  logo: string;
  featured?: boolean;
}

export default function PartnersAndClientsSection() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch("/api/about/partners");
        if (response.ok) {
          const data = await response.json();
          setPartners(data);
        }
      } catch (err) {
        console.error("Error fetching partners:", err);
      } finally {
        setIsLoadingPartners(false);
      }
    };

    const fetchClients = async () => {
      try {
        const clientsResponse = await fetch('/api/about/clients');
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error("Error fetching client logos:", error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchPartners();
    fetchClients();
  }, []);

  // Separate featured and regular clients
  const featuredClients = clients.filter(client => client.featured);
  const regularClients = clients.filter(client => !client.featured);
  
  // If no featured flag exists, take first 8 as featured
  const displayFeatured = featuredClients.length > 0 ? featuredClients : clients.slice(0, 8);
  const displayRegular = featuredClients.length > 0 ? regularClients : clients.slice(8);

  // Create duplicates for infinite scroll
  const duplicatedFeatured = [...displayFeatured, ...displayFeatured, ...displayFeatured, ...displayFeatured];

  const isLoading = isLoadingPartners || isLoadingClients;

  return (
    <section className="py-16 md:py-24 relative bg-background overflow-hidden w-full">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 mb-6 backdrop-blur-sm">
            <Award className="h-5 w-5 text-[var(--color-gold-400)]" />
            <span className="text-sm font-semibold text-[var(--color-gold-300)] tracking-wide">Trusted Worldwide</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Our Partners and Clients
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            We are proud to collaborate with exceptional organizations and serve leading companies from various sectors
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-gold-500)]"></div>
          </div>
        ) : (
          <div className="space-y-20 md:space-y-28 max-w-7xl mx-auto">
            {/* Clients Section - Infinite Scroll */}
            <div>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-4 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-transparent to-[var(--color-gold-500)] rounded-full"></div>
                  <Star className="h-7 w-7 md:h-9 md:w-9 text-[var(--color-gold-500)]" />
                  <div className="h-1 w-8 bg-gradient-to-l from-transparent to-[var(--color-gold-500)] rounded-full"></div>
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                  Clients
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">Growing together with excellence</p>
              </div>
              
              <div className="relative w-full overflow-hidden py-6 md:py-8">
                {/* Enhanced gradient overlays */}
                <div className="absolute top-0 left-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 right-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background via-background/90 to-transparent pointer-events-none z-10" />
                
                <div className="relative flex items-center">
                  <style jsx global>{`
                    @keyframes scroll-featured {
                      0% {
                        transform: translateX(0);
                      }
                      100% {
                        transform: translateX(-50%);
                      }
                    }
                    
                    .scroll-container-featured {
                      display: flex;
                      animation: scroll-featured 80s linear infinite;
                      width: fit-content;
                    }
                    
                    .scroll-container-featured:hover {
                      animation-play-state: paused;
                    }
                    
                    @media (max-width: 768px) {
                      .scroll-container-featured {
                        animation-duration: 60s;
                      }
                    }
                  `}</style>
                  
                  <div className="scroll-container-featured">
                    {duplicatedFeatured.map((client, index) => (
                      <div 
                        key={`featured-${client.name}-${index}`} 
                        className="flex-shrink-0 flex flex-col items-center justify-center px-6 md:px-8 lg:px-10 py-4 md:py-6 group"
                      >
                        <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm p-6 md:p-8 border border-border/50 group-hover:border-[var(--color-gold-500)]/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[var(--color-gold-500)]/20 group-hover:scale-105">
                          <Image 
                            src={client.logo} 
                            alt={client.name}
                            fill
                            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100 p-2"
                          />
                        </div>
                        <span className="text-base md:text-lg font-semibold text-foreground group-hover:text-[var(--color-gold-400)] transition-colors duration-300 text-center max-w-[160px] md:max-w-[200px]">
                          {client.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* More Clients Grid - Compact Display for 24+ items */}
            {displayRegular.length > 0 && (
              <div>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-4 mb-4">
                    <div className="h-1 w-8 bg-gradient-to-r from-transparent to-[var(--color-gold-500)]/60 rounded-full"></div>
                    <Globe className="h-6 w-6 md:h-8 md:w-8 text-[var(--color-gold-500)]/80" />
                    <div className="h-1 w-8 bg-gradient-to-l from-transparent to-[var(--color-gold-500)]/60 rounded-full"></div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    More Clients
                  </h3>
                </div>

                <div className="flex justify-center">
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full max-w-7xl">
                    {displayRegular.map((client, index) => (
                      <div 
                        key={`regular-${client.name}-${index}`}
                        className="group flex flex-col items-center w-[calc(25%-9px)] md:w-[calc(16.666%-13.33px)] lg:w-[calc(12.5%-10.5px)]"
                      >
                        <div className="relative w-full aspect-square rounded-lg bg-background/30 backdrop-blur-sm p-2 md:p-3 border border-border/30 group-hover:border-[var(--color-gold-500)]/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[var(--color-gold-500)]/10 group-hover:scale-105">
                          <Image 
                            src={client.logo} 
                            alt={client.name}
                            fill
                            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100 p-1"
                          />
                        </div>
                        <span className="text-[10px] md:text-xs font-medium text-muted-foreground group-hover:text-[var(--color-gold-400)] transition-colors duration-300 text-center mt-1.5 line-clamp-2 max-w-full px-1">
                          {client.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Partners Section - Elegant Static Grid */}
            <div>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="h-1 w-6 bg-gradient-to-r from-transparent to-[var(--color-gold-500)] rounded-full"></div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-[var(--color-gold-500)]" />
                  <div className="h-1 w-6 bg-gradient-to-l from-transparent to-[var(--color-gold-500)] rounded-full"></div>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                  Strategic Partners
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">Collaborating for mutual success</p>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
                {partners.map((partner, index) => (
                  <div 
                    key={`partner-${partner.name}-${index}`} 
                    className="group flex flex-col items-center"
                  >
                    <div className="relative w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-xl bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm p-5 md:p-6 border border-border/40 group-hover:border-[var(--color-gold-500)]/40 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[var(--color-gold-500)]/15 group-hover:scale-110">
                      <Image 
                        src={partner.logo} 
                        alt={partner.name}
                        fill
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-75 group-hover:opacity-100 p-2"
                      />
                    </div>
                    <span className="text-sm md:text-base font-semibold text-foreground group-hover:text-[var(--color-gold-400)] transition-colors duration-300 text-center mt-3 max-w-[140px] md:max-w-[160px]">
                      {partner.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}