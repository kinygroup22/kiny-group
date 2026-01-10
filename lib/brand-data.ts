// lib/brand-data.ts
export interface BrandStats {
  label1: string;
  value1: string;
  label2: string;
  value2: string;
  label3: string;
  value3: string;
  label4: string;
  value4: string;
}

export interface BrandTheme {
  primary: string;
  bg: string;
  bgSolid: string;
  border: string;
  text: string;
  accent: string;
  hover: string;
  gradient: string;
}

export interface BrandService {
  name: string;
  description: string;
}

export interface BrandTeamMember {
  name: string;
  position: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  coverage: string;
  delivery: string;
  backgroundImage: string;
  logo: string;
  color: string;
  stats: BrandStats;
  services: BrandService[];
  achievements: string[];
  team: BrandTeamMember[];
  theme: BrandTheme;
}

export const brandsData: Brand[] = [
  {
    id: "kiny-cultura",
    name: "Kiny Cultura Indonesia",
    tagline: "Cross-Cultural Understanding",
    description: "Promoting cross-cultural understanding through folk dance competitions, immersion schools, and leadership programs for children from elementary to junior high school.",
    fullDescription: "Kiny Cultura Indonesia is dedicated to fostering global citizenship through cultural exchange and education. Our programs provide children with unique opportunities to experience diverse cultures, develop leadership skills, and gain international perspectives that will shape their future.",
    coverage: "150+ Countries",
    delivery: "In-Person & Virtual Programs",
    backgroundImage: "https://images.unsplash.com/photo-1515184689810-b8b7187c6975?w=2070&q=80",
    logo: "/brandLogo/kinyCultura.png",
    color: "var(--color-gold-500)",
    stats: { 
      label1: 'Countries', 
      value1: '150+', 
      label2: 'Schools', 
      value2: '50+', 
      label3: 'Students', 
      value3: '1500+', 
      label4: 'Festivals', 
      value4: '100+' 
    },
    services: [
      { name: "School Immersion Program", description: "Cultural exchange programs for students to experience different educational systems" },
      { name: "Cross Culture Program", description: "Interactive workshops celebrating diversity and global citizenship" },
      { name: "International Dance Competition", description: "Showcasing traditional and contemporary dance forms from around the world" },
      { name: "Leadership Program", description: "Developing young leaders with global perspectives and cultural awareness" },
    ],
    achievements: [
      "Certificates recognized in 150 countries from CID UNESCO",
      "Partnerships with 50+ schools across Indonesia",
      "Successfully engaged 1500+ students in cultural programs",
      "Collaborative programs with government and UNESCO",
    ],
    team: [
      { name: "Dr. Anisa Rahman", position: "Director of Cultural Programs" },
      { name: "Budi Santoso", position: "Head of Educational Partnerships" },
      { name: "Sarah Wijaya", position: "International Relations Coordinator" },
      { name: "Ahmad Fadli", position: "Program Development Manager" },
    ],
    theme: {
      primary: "from-[var(--color-gold-500)] to-[var(--color-gold-400)]",
      bg: "bg-[var(--color-gold-500)]/10",
      bgSolid: "bg-[var(--color-navy-800)]/50",
      border: "border-[var(--color-gold-500)]/30",
      text: "text-[var(--color-gold-500)]",
      accent: "bg-[var(--color-gold-500)]",
      hover: "hover:bg-[var(--color-gold-500)]/10",
      gradient: "bg-gradient-to-br from-[var(--color-gold-500)]/20 to-[var(--color-gold-400)]/20"
    }
  },
  {
    id: "kiny-education",
    name: "Kiny Education & Training",
    tagline: "Professional Development",
    description: "Providing development programs for university students and executives in collaboration with leading universities, offering internationally recognized certifications.",
    fullDescription: "Kiny Education & Training bridges the gap between academic knowledge and industry requirements. Our comprehensive programs are designed in collaboration with top universities worldwide, ensuring that participants gain both theoretical understanding and practical skills that are immediately applicable in their professional careers.",
    coverage: "Global Network",
    delivery: "In-Person, Online & Blended Learning",
    backgroundImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=2070&q=80",
    logo: "/brandLogo/kinyEducation.png",
    color: "var(--color-gold-600)",
    stats: { 
      label1: 'Programs', 
      value1: '50+', 
      label2: 'Universities', 
      value2: '30+', 
      label3: 'Certifications', 
      value3: '25+', 
      label4: 'Participants', 
      value4: '2000+' 
    },
    services: [
      { name: "Professional Development Courses", description: "Specialized courses in administration, finance, policy, and more" },
      { name: "Workshops and Seminars", description: "Interactive sessions on governance issues and technological advancements" },
      { name: "Certifications and Diplomas", description: "Accredited programs providing recognized credentials" },
      { name: "Executive Training", description: "Tailored programs for organizational leadership and management" },
    ],
    achievements: [
      "Partnerships with 30+ leading universities globally",
      "5000+ professionals trained and certified",
      "Custom programs for 100+ corporate clients",
      "98% satisfaction rate from program participants",
    ],
    team: [
      { name: "Prof. Dr. Siti Nurhaliza", position: "Academic Director" },
      { name: "Michael Chen", position: "Head of Corporate Training" },
      { name: "Dr. Rizki Ahmad", position: "Program Development Lead" },
      { name: "Lisa Permata", position: "International Partnerships Manager" },
    ],
    theme: {
      primary: "from-[var(--color-gold-600)] to-[var(--color-gold-500)]",
      bg: "bg-[var(--color-gold-600)]/10",
      bgSolid: "bg-[var(--color-navy-800)]/50",
      border: "border-[var(--color-gold-600)]/30",
      text: "text-[var(--color-gold-600)]",
      accent: "bg-[var(--color-gold-600)]",
      hover: "hover:bg-[var(--color-gold-600)]/10",
      gradient: "bg-gradient-to-br from-[var(--color-gold-600)]/20 to-[var(--color-gold-500)]/20"
    }
  },
  {
    id: "kiny-tours",
    name: "Kiny Tours & Travel",
    tagline: "Personalized Travel Experiences",
    description: "Offering personalized private tour experiences that enrich travelers' understanding of diverse cultures across 7 continents.",
    fullDescription: "Kiny Tours & Travel transforms ordinary trips into extraordinary journeys of discovery. Our personalized approach ensures that each travel experience is tailored to the individual's interests, providing not just sightseeing but deep cultural immersion and meaningful connections with local communities.",
    coverage: "167 Countries",
    delivery: "Private Tours & Custom Itineraries",
    backgroundImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2070&q=80",
    logo: "/brandLogo/kinyTours.png",
    color: "var(--color-gold-700)",
    stats: { 
      label1: 'Countries', 
      value1: '167', 
      label2: 'Drivers', 
      value2: '150+', 
      label3: 'Guides', 
      value3: '80+', 
      label4: 'Partners', 
      value4: '30+' 
    },
    services: [
      { name: "MICE Services", description: "Meetings, Incentives, Conferences, and Exhibitions planning" },
      { name: "Tailormade Private Tours", description: "Personalized itineraries designed around your interests" },
      { name: "Hotel & Flight Bookings", description: "Premium accommodation and transportation arrangements" },
      { name: "Cultural Immersion Experiences", description: "Authentic local experiences guided by certified experts" },
    ],
    achievements: [
      "150+ English-speaking drivers across 167 countries",
      "Network spanning 7 continents with restaurants, hotels, and venues",
      "Partnerships with 30+ schools and establishments in Jakarta",
      "Exclusive cooperation with Conseil International de la Danse",
    ],
    team: [
      { name: "Andi Pratama", position: "CEO & Founder" },
      { name: "Diana Kusuma", position: "Head of International Operations" },
      { name: "Raj Patel", position: "Director of Custom Tours" },
      { name: "Maria Santos", position: "Client Relations Manager" },
    ],
    theme: {
      primary: "from-[var(--color-gold-700)] to-[var(--color-gold-600)]",
      bg: "bg-[var(--color-gold-700)]/10",
      bgSolid: "bg-[var(--color-navy-800)]/50",
      border: "border-[var(--color-gold-700)]/30",
      text: "text-[var(--color-gold-700)]",
      accent: "bg-[var(--color-gold-700)]",
      hover: "hover:bg-[var(--color-gold-700)]/10",
      gradient: "bg-gradient-to-br from-[var(--color-gold-700)]/20 to-[var(--color-gold-600)]/20"
    }
  },
  {
    id: "kinergy-project",
    name: "Kinergy Project",
    tagline: "Dream Beyond Limit",
    description: "Delivering seamless event planning and management services that celebrate creativity and collaboration with bold execution and cultural resonance.",
    fullDescription: "Kinergy Project is the creative powerhouse that transforms imagination into action. We specialize in creating high-impact experiences that connect communities, brands, and ideas through bold execution and cultural resonance. From international events to global branding campaigns, we make dreams a reality.",
    coverage: "Nationwide & International",
    delivery: "Full-Service Event Management",
    backgroundImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=2070&q=80",
    logo: "/brandLogo/kinergy.png",
    color: "var(--color-gold-400)",
    stats: { 
      label1: 'Events', 
      value1: '200+', 
      label2: 'Countries', 
      value2: '25+', 
      label3: 'Clients', 
      value3: '100+', 
      label4: 'Volunteers', 
      value4: '200+' 
    },
    services: [
      { name: "MICE Events", description: "Comprehensive management of Meetings, Incentives, Conferences, and Exhibitions" },
      { name: "International Events", description: "Cross-cultural events that celebrate diversity and global connections" },
      { name: "Global Branding", description: "Creative campaigns that elevate brand presence across markets" },
      { name: "Creative Collaborations", description: "Partnerships that bring innovative ideas to life" },
    ],
    achievements: [
      "200+ events organized with environmental sustainability practices",
      "Successfully managed events with 200+ volunteers per event",
      "Synergized with 6000+ UMKM (micro, small, and medium enterprises)",
      "Implemented eco-friendly practices and waste management at all events",
    ],
    team: [
      { name: "Rizky Hakim", position: "Creative Director" },
      { name: "Nina Widodo", position: "Head of Event Operations" },
      { name: "David Tanaka", position: "Brand Strategy Lead" },
      { name: "Siti Aminah", position: "Sustainability Coordinator" },
    ],
    theme: {
      primary: "from-[var(--color-gold-400)] to-[var(--color-gold-300)]",
      bg: "bg-[var(--color-gold-400)]/10",
      bgSolid: "bg-[var(--color-navy-800)]/50",
      border: "border-[var(--color-gold-400)]/30",
      text: "text-[var(--color-gold-400)]",
      accent: "bg-[var(--color-gold-400)]",
      hover: "hover:bg-[var(--color-gold-400)]/10",
      gradient: "bg-gradient-to-br from-[var(--color-gold-400)]/20 to-[var(--color-gold-300)]/20"
    }
  },
  {
    id: "kiny-soul",
    name: "Kiny & Soul",
    tagline: "Spiritual Journeys",
    description: "Providing comfortable, flexible, and private services for Umrah and spiritual journeys with personalized itineraries that honor your spiritual path.",
    fullDescription: "Kiny & Soul understands that spiritual journeys are deeply personal and should not be constrained by rigid schedules. Our private Umrah services are designed around your spiritual readiness, not fixed tour dates. We believe that 'JADWALNYA ALLAH, BUKAN TRAVEL AGENT' - your journey begins when your heart is called.",
    coverage: "Sacred Destinations",
    delivery: "Private Spiritual Journeys",
    backgroundImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=2070&q=80",
    logo: "/brandLogo/kinySoul.png",
    color: "var(--color-gold-300)",
    stats: { 
      label1: 'Journeys', 
      value1: '500+', 
      label2: 'Destinations', 
      value2: '15+', 
      label3: 'Pilgrims', 
      value3: '2000+', 
      label4: 'Guides', 
      value4: '50+' 
    },
    services: [
      { name: "Private Umrah Trips", description: "Individually tailored journeys not bound by fixed group departures" },
      { name: "Flexible Departure Dates", description: "Travel when you're spiritually ready, not on a rigid schedule" },
      { name: "Personalized Itineraries", description: "Custom spiritual journeys that honor your unique path" },
      { name: "Premium Assistance", description: "Comprehensive support from pre-departure to destination" },
    ],
    achievements: [
      "500+ personalized spiritual journeys completed",
      "98% client satisfaction rate",
      "Recognized for exceptional spiritual guidance services",
      "Pioneered flexible departure model for spiritual travel",
    ],
    team: [
      { name: "Ustadz Ahmad Yani", position: "Spiritual Director" },
      { name: "Fatimah Abdullah", position: "Head of Pilgrim Services" },
      { name: "Ibrahim Hassan", position: "Destination Specialist" },
      { name: "Aisha Rahman", position: "Client Care Coordinator" },
    ],
    theme: {
      primary: "from-[var(--color-gold-300)] to-[var(--color-gold-200)]",
      bg: "bg-[var(--color-gold-300)]/10",
      bgSolid: "bg-[var(--color-navy-800)]/50",
      border: "border-[var(--color-gold-300)]/30",
      text: "text-[var(--color-gold-300)]",
      accent: "bg-[var(--color-gold-300)]",
      hover: "hover:bg-[var(--color-gold-300)]/10",
      gradient: "bg-gradient-to-br from-[var(--color-gold-300)]/20 to-[var(--color-gold-200)]/20"
    }
  },
  {
    id: "kiny-xplore",
    name: "Kiny Xplore",
    tagline: "International Sports Development",
    description: "A division dedicated to the advancement of sports on an international scale, addressing both international competitions and skill development training programs.",
    fullDescription: "Kiny Xplore is committed to elevating sports performance and creating opportunities for athletes to compete on the global stage. We facilitate international competitions, provide world-class training programs, and create networking opportunities that connect athletes with coaches, teams, and sports organizations worldwide.",
    coverage: "International",
    delivery: "Training & Competition Management",
    backgroundImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=2070&q=80",
    logo: "/brandLogo/kinyXplore.png",
    color: "var(--color-gold-200)",
    stats: { 
      label1: 'Competitions', 
      value1: '50+', 
      label2: 'Clubs', 
      value2: '50+', 
      label3: 'Athletes', 
      value3: '1000+', 
      label4: 'Countries', 
      value4: '30+' 
    },
    services: [
      { name: "International Competitions", description: "Facilitating participation in global sports events" },
      { name: "Skill Enhancement Training", description: "Specialized programs to improve athletic performance" },
      { name: "Sports Workshops", description: "Interactive sessions with expert coaches and athletes" },
      { name: "Cross-Cultural Sports Exchange", description: "Programs that connect athletes across borders" },
    ],
    achievements: [
      "Facilitated 50+ international competitions",
      "Partnerships with 50+ sports clubs worldwide",
      "Trained 1000+ athletes for international events",
      "Organized workshops with world-class coaches",
    ],
    team: [
      { name: "Ricky Subagja", position: "Director of Sports Development" },
      { name: "Maria Sharapova", position: "Head of International Relations" },
      { name: "John Smith", position: "Training Program Coordinator" },
      { name: "Siti Nurjanah", position: "Athlete Development Manager" },
    ],
    theme: {
      primary: "from-[var(--color-gold-200)] to-[var(--color-gold-100)]",
      bg: "bg-[var(--color-gold-200)]/10",
      bgSolid: "bg-[var(--color-navy-800)]/50",
      border: "border-[var(--color-gold-200)]/30",
      text: "text-[var(--color-gold-200)]",
      accent: "bg-[var(--color-gold-200)]",
      hover: "hover:bg-[var(--color-gold-200)]/10",
      gradient: "bg-gradient-to-br from-[var(--color-gold-200)]/20 to-[var(--color-gold-100)]/20"
    }
  }
];

// Helper function to get brand by ID
export const getBrandById = (id: string): Brand | undefined => {
  return brandsData.find(brand => brand.id === id);
};