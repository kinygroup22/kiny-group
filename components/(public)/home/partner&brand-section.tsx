// components/(public)/home/partner&brand-section.tsx
"use client";

import { useEffect, useState } from "react";
import { Globe, Users, Award } from "lucide-react";
import Image from "next/image";

interface PartnerData {
  name: string;
  logo: string;
}

interface ClientData {
  name: string;
  logo: string;
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

  // Create enough duplicates for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];
  const duplicatedClients = [...clients, ...clients, ...clients, ...clients];

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
          <div className="space-y-20 md:space-y-28">
            {/* Clients Section - Now on Top with Much Larger Icons */}
            <div>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-4 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-transparent to-[var(--color-gold-500)] rounded-full"></div>
                  <Globe className="h-7 w-7 md:h-9 md:w-9 text-[var(--color-gold-500)]" />
                  <div className="h-1 w-8 bg-gradient-to-l from-transparent to-[var(--color-gold-500)] rounded-full"></div>
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                  Our Clients
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">Leading companies who trust us</p>
              </div>
              
              <div className="relative w-full overflow-hidden py-4 md:py-6">
                {/* Enhanced gradient overlays */}
                <div className="absolute top-0 left-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 right-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background via-background/90 to-transparent pointer-events-none z-10" />
                
                <div className="relative flex items-center">
                  <style jsx global>{`
                    @keyframes scroll-clients {
                      0% {
                        transform: translateX(0);
                      }
                      100% {
                        transform: translateX(-50%);
                      }
                    }
                    
                    .scroll-container-clients {
                      display: flex;
                      animation: scroll-clients 35s linear infinite;
                      width: fit-content;
                    }
                    
                    .scroll-container-clients:hover {
                      animation-play-state: paused;
                    }
                    
                    @media (max-width: 768px) {
                      .scroll-container-clients {
                        animation-duration: 25s;
                      }
                    }
                    
                    @media (min-width: 1920px) {
                      .scroll-container-clients {
                        animation-duration: 45s;
                      }
                    }
                  `}</style>
                  
                  <div className="scroll-container-clients">
                    {duplicatedClients.map((client, index) => (
                      <div 
                        key={`client-${client.name}-${index}`} 
                        className="flex-shrink-0 flex flex-col items-center justify-center px-6 md:px-8 lg:px-10 py-4 md:py-6 lg:py-8 group"
                      >
                        <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 mb-4 md:mb-6 rounded-xl bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm p-4 md:p-6 border border-border/50 group-hover:border-[var(--color-gold-500)]/30 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[var(--color-gold-500)]/15 group-hover:scale-105">
                          <Image 
                            src={client.logo} 
                            alt={client.name}
                            fill
                            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100 p-2"
                          />
                        </div>
                        <span className="text-sm md:text-base lg:text-lg font-semibold text-muted-foreground group-hover:text-[var(--color-gold-400)] transition-colors duration-300 text-center max-w-[140px] md:max-w-[180px] lg:max-w-[220px]">
                          {client.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Partners Section - Kept at Original Size for Contrast */}
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="h-1 w-6 bg-gradient-to-r from-transparent to-[var(--color-gold-500)]/60 rounded-full"></div>
                  <Users className="h-5 w-5 md:h-7 md:w-7 text-[var(--color-gold-500)]/80" />
                  <div className="h-1 w-6 bg-gradient-to-l from-transparent to-[var(--color-gold-500)]/60 rounded-full"></div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                  Our Partners
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">Strategic partnerships for success</p>
              </div>
              
              <div className="relative w-full overflow-hidden py-2">
                {/* Gradient overlays */}
                <div className="absolute top-0 left-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background via-background/85 to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 right-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background via-background/85 to-transparent pointer-events-none z-10" />
                
                <div className="relative flex items-center">
                  <style jsx global>{`
                    @keyframes scroll-partners {
                      0% {
                        transform: translateX(-50%);
                      }
                      100% {
                        transform: translateX(0);
                      }
                    }
                    
                    .scroll-container-partners {
                      display: flex;
                      animation: scroll-partners 30s linear infinite;
                      width: fit-content;
                    }
                    
                    .scroll-container-partners:hover {
                      animation-play-state: paused;
                    }
                    
                    @media (max-width: 768px) {
                      .scroll-container-partners {
                        animation-duration: 20s;
                      }
                    }
                    
                    @media (min-width: 1920px) {
                      .scroll-container-partners {
                        animation-duration: 40s;
                      }
                    }
                  `}</style>
                  
                  <div className="scroll-container-partners">
                    {duplicatedPartners.map((partner, index) => (
                      <div 
                        key={`partner-${partner.name}-${index}`} 
                        className="flex-shrink-0 flex flex-col items-center justify-center px-3 md:px-5 py-2 md:py-3 group"
                      >
                        <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mb-1 md:mb-2 rounded-lg bg-background/30 backdrop-blur-sm p-1 md:p-2 border border-border/30 group-hover:border-[var(--color-gold-500)]/20 transition-all duration-500 group-hover:shadow-md group-hover:shadow-[var(--color-gold-500)]/5 group-hover:scale-105">
                          <Image 
                            src={partner.logo} 
                            alt={partner.name}
                            fill
                            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100"
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-[var(--color-gold-400)] transition-colors duration-300 text-center max-w-[80px] md:max-w-[120px]">
                          {partner.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}