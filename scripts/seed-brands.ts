// scripts/seed-brands.ts
import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { 
  users, 
  brandDivisions,
  brandDivisionImages,
  brandActivities
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function clearBrandData() {
  console.log("Clearing existing brand data...");
  
  try {
    // Delete all brand activities first (due to foreign key constraint)
    await db.delete(brandActivities);
    console.log("✅ Deleted all brand activities");
    
    // Delete all brand images
    await db.delete(brandDivisionImages);
    console.log("✅ Deleted all brand images");
    
    // Delete all brand divisions
    await db.delete(brandDivisions);
    console.log("✅ Deleted all brand divisions");
    
    console.log("Brand data cleared successfully!");
  } catch (error) {
    console.error("Error clearing brand data:", error);
    throw error;
  }
}

async function seedBrands() {
  console.log("Seeding brand divisions...");

  try {
    // Get admin user to use as author for all brands - using the updated admin email
    const [adminUser] = await db.select().from(users).where(eq(users.email, "thoriq@kcifoundation.org"));
    
    if (!adminUser) {
      console.error("Admin user not found. Please run the main seeder first.");
      return;
    }

    // Create brand divisions based on the provided information
    const brandDivisionsData = [
      {
        name: "Kiny Tours & Travel",
        slug: "kiny-tours",
        tagline: "Your Gateway to Global Experiences",
        description: "The tourism industry nowadays has become a primary need for society, thus it brings a great opportunity in the future.",
        fullDescription: "Kiny Tours & Travel specializes in providing exceptional travel experiences through our Inbound Division MICE (Meeting, Incentive, Convention, Exhibition), tailormade trips, private tours, reward tickets, and hotel bookings. Our extensive network ensures that every journey is memorable and enriching.",
        coverage: "167 Countries",
        delivery: "In-person Tours & Virtual Consultations",
        backgroundImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2070&q=80",
        logo: "/brandLogo/kinyTours.png",
        color: "#3B82F6", // Blue
        stats: { 
          label1: 'Countries', 
          value1: '167', 
          label2: 'English Speaking Drivers', 
          value2: '150+', 
          label3: 'Licensed Guides', 
          value3: '80+', 
          label4: 'Partners', 
          value4: '30+' 
        },
        services: [
          { name: "MICE Services", description: "Meeting, Incentive, Convention, Exhibition planning and execution" },
          { name: "Tailormade Trips", description: "Personalized itineraries designed to match your interests" },
          { name: "Private Tours", description: "Exclusive travel experiences with dedicated guides" },
          { name: "Hotel & Flight Bookings", description: "Premium accommodation and transportation arrangements" },
        ],
        achievements: [
          "150+ English speaking drivers spread throughout 167 countries",
          "80+ English speaking guides spread throughout 149 countries",
          "A chain network of restaurants, hotels, tourist attractions and event venues on 7 continents",
          "Partnership program for more than 30 schools and other establishments in Jakarta area",
        ],
        team: [
          { name: "Andi Pratama", position: "CEO & Founder" },
          { name: "Diana Kusuma", position: "Head of International Operations" },
          { name: "Raj Patel", position: "Director of Custom Tours" },
          { name: "Maria Santos", position: "Client Relations Manager" },
        ],
        theme: {
          primary: "#3B82F6",
          bg: "#3B82F61A",
          bgSolid: "#3B82F60D",
          border: "#3B82F633",
          text: "#3B82F6",
          accent: "#3B82F6",
          hover: "#2563EB",
          gradient: "linear-gradient(135deg, #3B82F6 0%, #3B82F6CC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "European Heritage Tour",
            description: "Explore centuries of history across iconic European destinations with our expert guides. Visit ancient ruins, medieval castles, and world-renowned museums.",
            imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
            order: 0
          },
          {
            title: "Asian Adventure Expedition",
            description: "Discover the diverse cultures and landscapes of Asia, from bustling cities to serene temples and pristine beaches. Experience the rich traditions and modern wonders.",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            order: 1
          },
          {
            title: "American Road Trip Experience",
            description: "Journey through the Americas with expert guides, exploring national parks, vibrant cities, and hidden gems. Create memories that last a lifetime.",
            imageUrl: "https://images.unsplash.com/photo-1552728089-a57944dc5eb2?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Kiny Cultura",
        slug: "kiny-cultura",
        tagline: "Building Character Through Cultural Exchange",
        description: "The Education and Culture industry is currently the most important industry due to its elements that serve as the spearheads for children's progress in character building and interaction in society.",
        fullDescription: "Kiny Cultura is dedicated to fostering global citizenship through cultural exchange and education. Our programs provide children with unique opportunities to experience diverse cultures, develop leadership skills, and gain international perspectives that will shape their future.",
        coverage: "150+ Countries",
        delivery: "In-person Programs & Virtual Exchanges",
        backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=2070&q=80",
        logo: "/brandLogo/kinyCultura.png",
        color: "#EC4899", // Pink/Magenta for colorful light theme
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
          { name: "School Immersion Program", description: "Cultural exchange programs for students to experience different education systems" },
          { name: "Cross Culture Program", description: "Interactive workshops celebrating diversity and global citizenship" },
          { name: "International Dance Competition", description: "Showcasing traditional and contemporary dance forms from around the world" },
          { name: "Leadership Program", description: "Developing young leaders with global perspectives and cultural awareness" },
        ],
        achievements: [
          "Certificates valid in 150 countries",
          "Cooperation with foreign and domestic governments",
          "Certificate recognized in Indonesia",
          "Collaboration with more than 50 schools in Indonesia",
        ],
        team: [
          { name: "Dr. Anisa Rahman", position: "Director of Cultural Programs" },
          { name: "Budi Santoso", position: "Head of Educational Partnerships" },
          { name: "Sarah Wijaya", position: "International Relations Coordinator" },
          { name: "Ahmad Fadli", position: "Program Development Manager" },
        ],
        theme: {
          primary: "#EC4899",
          bg: "#EC48991A",
          bgSolid: "#EC48990D",
          border: "#EC489933",
          text: "#EC4899",
          accent: "#EC4899",
          hover: "#DB2777",
          gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #FCA5A5 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "International Dance Workshop",
            description: "Learn traditional dances from around the world with renowned instructors. Experience the rhythm and movement of different cultures in this immersive workshop.",
            imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
            order: 0
          },
          {
            title: "Cultural Exchange Program",
            description: "Connect with students from different countries through our exchange program. Share experiences, learn new languages, and build lasting friendships.",
            imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
            order: 1
          },
          {
            title: "Global Leadership Summit",
            description: "Develop leadership skills through cultural immersion. Learn from global leaders and participate in workshops that foster cross-cultural understanding.",
            imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Kiny Xplore",
        slug: "kiny-xplore",
        tagline: "Empowering Athletes Through Global Sports",
        description: "Facilitating competitions abroad, providing skill enhancement training, creating networking opportunities, and promoting international collaboration in sports development.",
        fullDescription: "Kiny Xplore is dedicated to advancing athletic development through international exposure and training. We connect athletes with world-class coaches, competitions, and training facilities around the globe, creating opportunities for growth and excellence in sports.",
        coverage: "International",
        delivery: "Training Camps & Competitions",
        backgroundImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=2070&q=80",
        logo: "/brandLogo/kinyXplore.png",
        color: "#06B6D4", // Cyan
        stats: { 
          label1: 'Countries', 
          value1: '50+', 
          label2: 'Sports Clubs', 
          value2: '50+', 
          label3: 'Coaches', 
          value3: '30+', 
          label4: 'Athletes', 
          value4: '1000+' 
        },
        services: [
          { name: "International Competitions", description: "Organizing participation in global sporting events" },
          { name: "Skill Enhancement Training", description: "Specialized training programs with expert coaches" },
          { name: "Sports Clinics", description: "Workshops focused on specific skills and techniques" },
          { name: "Cross-Cultural Exchange", description: "Programs that combine sports with cultural experiences" },
        ],
        achievements: [
          "Collaboration with more than 50 sports clubs worldwide",
          "World-Class Coaches from various sporting disciplines",
          "Tailored Training Programs for individual athletes and teams",
          "Successful hosting of international sports events",
        ],
        team: [
          { name: "Rizki Ahmad", position: "Director of Sports Development" },
          { name: "Lena Chen", position: "Head of International Relations" },
          { name: "Michael Johnson", position: "Elite Training Coordinator" },
          { name: "Sofia Rodriguez", position: "Events Manager" },
        ],
        theme: {
          primary: "#06B6D4",
          bg: "#06B6D41A",
          bgSolid: "#06B6D40D",
          border: "#06B6D433",
          text: "#06B6D4",
          accent: "#06B6D4",
          hover: "#0891B2",
          gradient: "linear-gradient(135deg, #06B6D4 0%, #06B6D4CC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "International Sports Camp",
            description: "Train with world-class coaches in your sport. Our intensive camps focus on skill development, strategy, and physical conditioning.",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
            order: 0
          },
          {
            title: "Athletic Performance Workshop",
            description: "Enhance your skills with specialized training. Learn from experts in sports science, nutrition, and mental preparation.",
            imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
            order: 1
          },
          {
            title: "Global Sports Competition",
            description: "Compete against athletes from around the world. Test your skills in international tournaments and showcase your talent.",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Kinergy Project",
        slug: "kinergy-project",
        tagline: "Dream Beyond Limit",
        description: "A visionary initiative that specializes in delivering high-impact experiences through MICE, International Events & Cultural Programs, Global Branding & Activation Campaigns, and Creative Collaborations.",
        fullDescription: "Kinergy Project is the creative powerhouse of Kiny Group, turning imagination into action. Our reach spans nationwide and international coverage, connecting communities, brands, and ideas with bold execution and cultural resonance.",
        coverage: "Global",
        delivery: "Events & Brand Activations",
        backgroundImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2070&q=80",
        logo: "/brandLogo/kinergyProject.png",
        color: "#F59E0B", // Amber/Orange
        stats: { 
          label1: 'Events', 
          value1: '200+', 
          label2: 'Countries', 
          value2: '50+', 
          label3: 'Brands', 
          value3: '100+', 
          label4: 'Attendees', 
          value4: '50000+' 
        },
        services: [
          { name: "MICE Services", description: "Meetings, Incentives, Conferences, and Exhibitions" },
          { name: "International Events", description: "Large-scale cultural and entertainment programs" },
          { name: "Global Branding", description: "Brand activation campaigns with international reach" },
          { name: "Creative Collaborations", description: "Partnerships across Indonesia and the world" },
        ],
        achievements: [
          "Successfully executed events across 7 continents",
          "Innovative brand activations for Fortune 500 companies",
          "Award-winning cultural exchange programs",
          "Pioneering virtual and hybrid event experiences",
        ],
        team: [
          { name: "Kevin Wijaya", position: "Creative Director" },
          { name: "Natasha Lee", position: "Head of Global Partnerships" },
          { name: "Carlos Mendez", position: "Events Production Lead" },
          { name: "Priya Sharma", position: "Brand Strategy Director" },
        ],
        theme: {
          primary: "#F59E0B",
          bg: "#F59E0B1A",
          bgSolid: "#F59E0B0D",
          border: "#F59E0B33",
          text: "#F59E0B",
          accent: "#F59E0B",
          hover: "#D97706",
          gradient: "linear-gradient(135deg, #F59E0B 0%, #F59E0BCC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "Brand Activation Campaign",
            description: "Launch your brand with innovative marketing strategies. Our creative team designs memorable experiences that connect with your audience.",
            imageUrl: "https://images.unsplash.com/photo-1559136555-9303274d97f4?w=800&q=80",
            order: 0
          },
          {
            title: "International Cultural Festival",
            description: "Celebrate diversity through music, food, and art. Our festivals bring together cultures from around the world in vibrant, immersive experiences.",
            imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
            order: 1
          },
          {
            title: "Corporate Team Building Event",
            description: "Strengthen your team through unique challenges. Our custom-designed activities foster collaboration, communication, and creativity.",
            imageUrl: "https://images.unsplash.com/photo-1559136555-9303274d97f4?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Kiny & Soul",
        slug: "kiny-soul",
        tagline: "GOD'S SCHEDULE, NOT A TRAVEL AGENT'S",
        description: "A private spiritual travel service focusing on individually tailored Umrah trips with flexible departure dates based on your readiness, not rigid tour schedules.",
        fullDescription: "Kiny and Soul is a private spiritual travel service that honors your personal journey. Unlike conventional travel services, we don't operate on fixed departure dates. We believe your true journey begins when your heart is called.",
        coverage: "Saudi Arabia & Holy Sites",
        delivery: "Spiritual Journeys",
        backgroundImage: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=2070&q=80",
        logo: "/brandLogo/kinySoul.png",
        color: "#059669", // Islamic Green
        stats: { 
          label1: 'Pilgrims', 
          value1: '500+', 
          label2: 'Tours', 
          value2: '100+', 
          label3: 'Guides', 
          value3: '20+', 
          label4: 'Satisfaction', 
          value4: '99%' 
        },
        services: [
          { name: "Private Umrah Trips", description: "Individually tailored spiritual journeys" },
          { name: "Flexible Departure Dates", description: "Travel when your heart is ready" },
          { name: "Personalized Itineraries", description: "Custom spiritual experiences" },
          { name: "Premium Assistance", description: "End-to-end support from pre-departure to return" },
        ],
        achievements: [
          "Personalized spiritual journeys for over 500 pilgrims",
          "Flexible scheduling that respects individual readiness",
          "Expert guides with deep knowledge of holy sites",
          "Premium services that enhance the spiritual experience",
        ],
        team: [
          { name: "Ahmad Yani", position: "Spiritual Journey Director" },
          { name: "Fatima Al-Rashid", position: "Head of Pilgrim Services" },
          { name: "Omar Hassan", position: "Spiritual Guide Coordinator" },
          { name: "Aisha Binti", position: "Customer Experience Lead" },
        ],
        theme: {
          primary: "#059669",
          bg: "#0596691A",
          bgSolid: "#0596690D",
          border: "#05966933",
          text: "#059669",
          accent: "#059669",
          hover: "#047857",
          gradient: "linear-gradient(135deg, #059669 0%, #059669CC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "Spiritual Journey to Mecca",
            description: "Experience the holy sites with expert guidance. Our spiritual journeys provide deep insights and meaningful connections to sacred places.",
            imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
            order: 0
          },
          {
            title: "Islamic Heritage Tour",
            description: "Explore the rich history of Islamic civilization. Visit historic mosques, museums, and cultural sites with knowledgeable guides.",
            imageUrl: "https://images.unsplash.com/photo-1564399580075-548fe4291166?w=800&q=80",
            order: 1
          },
          {
            title: "Ramadan Umrah Package",
            description: "Special pilgrimage during the holy month. Experience the spiritual significance of Ramadan in the holy cities with our comprehensive package.",
            imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Kiny Education & Training",
        slug: "kiny-education",
        tagline: "Empowering Through Knowledge",
        description: "Professional development courses, specialized workshops, seminars, and accredited certification programs tailored to your needs.",
        fullDescription: "Kiny Education & Training offers comprehensive learning solutions designed to enhance professional skills and knowledge. Our programs are tailored to meet the specific needs of organizations and individuals across various sectors.",
        coverage: "Indonesia & International",
        delivery: "In-person, Online & Blended Learning",
        backgroundImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=2070&q=80",
        logo: "/brandLogo/kinyEducation.png",
        color: "#9333EA", // Purple
        stats: { 
          label1: 'Courses', 
          value1: '100+', 
          label2: 'Instructors', 
          value2: '50+', 
          label3: 'Students', 
          value3: '5000+', 
          label4: 'Certifications', 
          value4: '30+' 
        },
        services: [
          { name: "Professional Development Courses", description: "Comprehensive courses for career advancement" },
          { name: "Specialized Training", description: "Custom programs for administrations, finances, policy, and more" },
          { name: "Workshops and Seminars", description: "Interactive sessions on current governance and regulatory issues" },
          { name: "Certifications and Diplomas", description: "Accredited programs providing recognized credentials" },
        ],
        achievements: [
          "Accredited programs recognized across multiple industries",
          "Expert instructors with real-world experience",
          "Flexible learning options to suit diverse needs",
          "Successful placement of certified professionals",
        ],
        team: [
          { name: "Dr. Siti Nurhaliza", position: "Director of Education" },
          { name: "Prof. Bambang Sutrisno", position: "Head of Academic Programs" },
          { name: "Dr. Rahmat Wijaya", position: "Certification Coordinator" },
          { name: "Dewi Lestari", position: "Learning Experience Designer" },
        ],
        theme: {
          primary: "#9333EA",
          bg: "#9333EA1A",
          bgSolid: "#9333EA0D",
          border: "#9333EA33",
          text: "#9333EA",
          accent: "#9333EA",
          hover: "#7E22CE",
          gradient: "linear-gradient(135deg, #9333EA 0%, #9333EACC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "Professional Development Workshop",
            description: "Enhance your skills with industry experts. Our workshops cover the latest trends and best practices in your field.",
            imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
            order: 0
          },
          {
            title: "International Certification Program",
            description: "Earn globally recognized credentials. Our certification programs are designed to advance your career and open new opportunities.",
            imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
            order: 1
          },
          {
            title: "Leadership Training Seminar",
            description: "Develop your leadership potential. Learn from experienced leaders and practice essential skills in our interactive seminars.",
            imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Generasi Peduli Bumi",
        slug: "generasi-peduli-bumi",
        tagline: "Caring for Our Planet, Securing Our Future",
        description: "A youth-led environmental initiative focused on conservation, sustainability education, and community action to address climate change and protect natural resources.",
        fullDescription: "Generasi Peduli Bumi (Earth Care Generation) is a movement that empowers young people to become environmental stewards. Through education, hands-on conservation projects, and advocacy, we're building a generation that understands and values the importance of protecting our planet for future generations.",
        coverage: "Indonesia & Southeast Asia",
        delivery: "Community Projects & Educational Programs",
        backgroundImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2070&q=80",
        logo: "/brandLogo/generasiPeduliBumi.png",
        color: "#10B981", // Emerald Green
        stats: { 
          label1: 'Projects', 
          value1: '50+', 
          label2: 'Volunteers', 
          value2: '1000+', 
          label3: 'Schools', 
          value3: '100+', 
          label4: 'Trees Planted', 
          value4: '10000+' 
        },
        services: [
          { name: "Environmental Education", description: "Workshops and programs for schools and communities on conservation and sustainability" },
          { name: "Tree Planting Campaigns", description: "Organizing reforestation projects in critical areas across Indonesia" },
          { name: "Waste Management Solutions", description: "Implementing recycling and waste reduction programs in communities" },
          { name: "Climate Action Advocacy", description: "Youth-led campaigns to raise awareness and influence policy on environmental issues" },
        ],
        achievements: [
          "Planted over 10,000 trees in deforested areas",
          "Established recycling programs in 50+ communities",
          "Educated over 5,000 students on environmental conservation",
          "Recognized by the Ministry of Environment and Forestry",
        ],
        team: [
          { name: "Maya Sari", position: "Program Director" },
          { name: "Budi Hartono", position: "Conservation Lead" },
          { name: "Rina Wijaya", position: "Education Coordinator" },
          { name: "Ahmad Fauzi", position: "Community Outreach Manager" },
        ],
        theme: {
          primary: "#10B981",
          bg: "#10B9811A",
          bgSolid: "#10B9810D",
          border: "#10B98133",
          text: "#10B981",
          accent: "#10B981",
          hover: "#059669",
          gradient: "linear-gradient(135deg, #10B981 0%, #10B981CC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "Beach Cleanup Initiative",
            description: "Join our monthly beach cleanup events to protect marine ecosystems and raise awareness about plastic pollution. Together, we can make a difference.",
            imageUrl: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&q=80",
            order: 0
          },
          {
            title: "School Garden Project",
            description: "Help us establish sustainable gardens in schools across Indonesia. Students learn about nutrition, agriculture, and environmental stewardship.",
            imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
            order: 1
          },
          {
            title: "Youth Climate Summit",
            description: "Annual gathering of young environmental leaders to share ideas, develop solutions, and create action plans for a sustainable future.",
            imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
            order: 2
          }
        ]
      },
      {
        name: "Yuk Group",
        slug: "yuk-group",
        tagline: "Connecting Communities, Creating Opportunities",
        description: "A dynamic community development organization that fosters collaboration, entrepreneurship, and social innovation to create positive change in communities across Indonesia.",
        fullDescription: "Yuk Group is dedicated to building stronger communities through connection and collaboration. We bring together individuals, businesses, and organizations to create opportunities, share knowledge, and drive social innovation. Our initiatives focus on economic empowerment, education, and community development to create sustainable impact.",
        coverage: "Indonesia",
        delivery: "Community Programs & Business Incubation",
        backgroundImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=2070&q=80",
        logo: "/brandLogo/yukGroup.png",
        color: "#F97316", // Orange
        stats: { 
          label1: 'Communities', 
          value1: '75+', 
          label2: 'Startups', 
          value2: '50+', 
          label3: 'Entrepreneurs', 
          value3: '500+', 
          label4: 'Projects', 
          value4: '100+' 
        },
        services: [
          { name: "Business Incubation", description: "Supporting startups and entrepreneurs with mentorship, resources, and networking opportunities" },
          { name: "Community Development", description: "Implementing programs that address local needs and empower communities" },
          { name: "Skill Building Workshops", description: "Training programs focused on entrepreneurship, digital literacy, and professional development" },
          { name: "Networking Events", description: "Creating connections between individuals, businesses, and organizations for collaboration" },
        ],
        achievements: [
          "Successfully incubated 50+ startups that are now thriving businesses",
          "Implemented community development projects in 75+ communities",
          "Created over 1,000 jobs through our entrepreneurship programs",
          "Recognized as a leading social enterprise in Indonesia",
        ],
        team: [
          { name: "Rizki Pratama", position: "CEO & Founder" },
          { name: "Siti Nurhaliza", position: "Director of Community Programs" },
          { name: "Budi Santoso", position: "Business Incubation Lead" },
          { name: "Maya Putri", position: "Partnership Manager" },
        ],
        theme: {
          primary: "#F97316",
          bg: "#F973161A",
          bgSolid: "#F973160D",
          border: "#F9731633",
          text: "#F97316",
          accent: "#F97316",
          hover: "#EA580C",
          gradient: "linear-gradient(135deg, #F97316 0%, #F97316CC 100%)"
        },
        featured: true,
        authorId: adminUser.id,
        activities: [
          {
            title: "Startup Pitch Competition",
            description: "Annual competition where entrepreneurs showcase their innovative ideas to investors and industry experts. Win funding and mentorship for your startup.",
            imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
            order: 0
          },
          {
            title: "Community Leadership Workshop",
            description: "Develop your leadership skills and learn how to create positive change in your community. Our workshops cover project management, fundraising, and community organizing.",
            imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
            order: 1
          },
          {
            title: "Social Innovation Hackathon",
            description: "Intensive event where teams collaborate to develop innovative solutions to pressing social challenges. Join us to create technology for good.",
            imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
            order: 2
          }
        ]
      }
    ];

    // Insert brand divisions
    for (const brandData of brandDivisionsData) {
      // Extract activities from brandData
      const { activities, ...brandOnlyData } = brandData;
      
      // Insert brand division
      const [newBrand] = await db.insert(brandDivisions).values(brandOnlyData).returning();
      console.log(`✅ Created brand: ${brandOnlyData.name}`);
      
      // Add sample images for each brand
      const sampleImages = [
        {
          brandDivisionId: newBrand.id,
          imageUrl: `https://picsum.photos/seed/${brandOnlyData.slug}-1/800/600.jpg`,
          caption: `${brandOnlyData.name} - Image 1`,
          altText: `Image for ${brandOnlyData.name}`,
          order: 0
        },
        {
          brandDivisionId: newBrand.id,
          imageUrl: `https://picsum.photos/seed/${brandOnlyData.slug}-2/800/600.jpg`,
          caption: `${brandOnlyData.name} - Image 2`,
          altText: `Image for ${brandOnlyData.name}`,
          order: 1
        },
        {
          brandDivisionId: newBrand.id,
          imageUrl: `https://picsum.photos/seed/${brandOnlyData.slug}-3/800/600.jpg`,
          caption: `${brandOnlyData.name} - Image 3`,
          altText: `Image for ${brandOnlyData.name}`,
          order: 2
        }
      ];
      
      await db.insert(brandDivisionImages).values(sampleImages);
      console.log(`✅ Created 3 sample images for brand: ${brandOnlyData.name}`);
      
      // Add activities for this brand
      if (activities && activities.length > 0) {
        const activitiesWithBrandId = activities.map(activity => ({
          ...activity,
          brandDivisionId: newBrand.id
        }));
        
        await db.insert(brandActivities).values(activitiesWithBrandId);
        console.log(`✅ Created ${activities.length} activities for brand: ${brandOnlyData.name}`);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Brand divisions seeded successfully!");
    console.log("=".repeat(50));
    console.log("\n📋 Summary:");
    console.log(`  • ${brandDivisionsData.length} brand divisions created`);
    console.log(`  • ${brandDivisionsData.length * 3} sample images created`);
    console.log(`  • ${brandDivisionsData.length * 3} activities created`);
    
  } catch (error) {
    console.error("\n❌ Error seeding brand divisions:", error);
    throw error;
  }
}

async function main() {
  try {
    // First clear existing data
    await clearBrandData();
    
    // Then seed new data
    await seedBrands();
    
    console.log("\n✅ Brand seeding script completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Brand seeding script failed:", error);
    process.exit(1);
  }
}

main();