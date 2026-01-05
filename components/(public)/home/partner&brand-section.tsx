// components/(public)/home/partner&brand-section.tsx
"use client";

import { useEffect, useState } from "react";
import { Globe, Users } from "lucide-react";
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
      <div className="w-full px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 mb-6">
            <Globe className="h-4 w-4 text-[var(--color-gold-400)]" />
            <span className="text-sm font-medium text-[var(--color-gold-300)]">Collaboration</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Our Partners and Clients
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            We are proud to collaborate with exceptional organizations and serve leading companies from various sectors
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-gold-500)]"></div>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {/* Partners Section */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-[var(--color-gold-500)]" />
                  Our Partners
                </h3>
              </div>
              
              <div className="relative w-full overflow-hidden">
                {/* Gradient overlays for smooth fade effect */}
                <div className="absolute top-0 left-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 right-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />
                
                <div className="relative flex items-center">
                  <style jsx global>{`
                    @keyframes scroll-reverse {
                      0% {
                        transform: translateX(-50%);
                      }
                      100% {
                        transform: translateX(0);
                      }
                    }
                    
                    .scroll-container-reverse {
                      display: flex;
                      animation: scroll-reverse 40s linear infinite;
                      width: fit-content;
                    }
                    
                    .scroll-container-reverse:hover {
                      animation-play-state: paused;
                    }
                    
                    /* Adjust animation speed for mobile */
                    @media (max-width: 768px) {
                      .scroll-container-reverse {
                        animation-duration: 30s;
                      }
                    }
                    
                    /* Slower animation for very wide screens */
                    @media (min-width: 1920px) {
                      .scroll-container-reverse {
                        animation-duration: 50s;
                      }
                    }
                  `}</style>
                  
                  <div className="scroll-container-reverse">
                    {duplicatedPartners.map((partner, index) => (
                      <div 
                        key={`partner-${partner.name}-${index}`} 
                        className="flex-shrink-0 flex flex-col items-center justify-center px-4 md:px-8 py-4 md:py-6"
                      >
                        <div className="relative w-16 h-16 md:w-24 md:h-24 mb-2 md:mb-4 group">
                          <Image 
                            src={partner.logo} 
                            alt={partner.name}
                            fill
                            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                          />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-[var(--color-gold-400)] transition-colors text-center max-w-[120px] md:max-w-[160px]">
                          {partner.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clients Section */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground flex items-center justify-center gap-2">
                  <Globe className="h-6 w-6 md:h-8 md:w-8 text-[var(--color-gold-500)]" />
                  Our Clients
                </h3>
              </div>
              
              <div className="relative w-full overflow-hidden">
                {/* Gradient overlays for smooth fade effect */}
                <div className="absolute top-0 left-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 right-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />
                
                <div className="relative flex items-center">
                  <style jsx global>{`
                    @keyframes scroll {
                      0% {
                        transform: translateX(0);
                      }
                      100% {
                        transform: translateX(-50%);
                      }
                    }
                    
                    .scroll-container {
                      display: flex;
                      animation: scroll 40s linear infinite;
                      width: fit-content;
                    }
                    
                    .scroll-container:hover {
                      animation-play-state: paused;
                    }
                    
                    /* Adjust animation speed for mobile */
                    @media (max-width: 768px) {
                      .scroll-container {
                        animation-duration: 30s;
                      }
                    }
                    
                    /* Slower animation for very wide screens */
                    @media (min-width: 1920px) {
                      .scroll-container {
                        animation-duration: 50s;
                      }
                    }
                  `}</style>
                  
                  <div className="scroll-container">
                    {duplicatedClients.map((client, index) => (
                      <div 
                        key={`client-${client.name}-${index}`} 
                        className="flex-shrink-0 flex flex-col items-center justify-center px-4 md:px-8 py-4 md:py-6"
                      >
                        <div className="relative w-16 h-16 md:w-24 md:h-24 mb-2 md:mb-4 group">
                          <Image 
                            src={client.logo} 
                            alt={client.name}
                            fill
                            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                          />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-[var(--color-gold-400)] transition-colors text-center max-w-[120px] md:max-w-[160px]">
                          {client.name}
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