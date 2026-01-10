// components/(public)/layout/page-header.tsx
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  emphasizedWord?: string;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  description, 
  emphasizedWord,
  children,
  className 
}: PageHeaderProps) {
  // Function to highlight the emphasized word in the title
  const renderTitle = () => {
    if (!emphasizedWord) return title;
    
    const parts = title.split(emphasizedWord);
    return (
      <>
        {parts[0]}
        <span className="text-gold-500">{emphasizedWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className={cn("text-center mb-12 md:mb-16", className)}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
        {renderTitle()}
      </h1>
      {description && (
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-6 md:mt-8">
          {children}
        </div>
      )}
    </div>
  );
}