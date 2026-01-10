// Path: components/pages/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  emphasizedWord?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  emphasizedWord,
  gradientFrom = 'var(--color-gold-200)',
  gradientVia = 'var(--color-gold-400)',
  gradientTo = 'var(--color-gold-200)',
  className = '',
}) => {
  // Render description with emphasized word if provided
  const renderDescription = () => {
    if (!emphasizedWord) {
      return <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{description}</p>;
    }

    // Split description by the emphasized word
    const parts = description.split(emphasizedWord);
    
    return (
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-semibold" style={{ color: 'var(--color-gold-400)' }}>
                {emphasizedWord}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <div className={`text-center mb-20 ${className}`}>
      <h1 
        className="text-5xl md:text-7xl font-black mb-6 bg-linear-to-r from-(--color-gold-200) via-(--color-gold-400) to-(--color-gold-200) bg-clip-text text-transparent animate-linear"
        style={{
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient 8s linear infinite',
        }}
      >
        {title}
      </h1>
      {renderDescription()}
    </div>
  );
};

export default PageHeader;