// app/(public)/layout.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Positioned absolutely over content */}
      <Header />
      
      {/* Main content - No top padding initially, content goes under header */}
      <main className="flex-1 relative">  
        {children}
      </main>
      
      <Footer />
    </div>
  );
}