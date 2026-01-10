// app/style/page.tsx
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';

export default function StyleGuide() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useState(() => {
    setMounted(true);
  });

  if (!mounted) return null;

  // Color palettes
  const goldColors = [
    { name: 'gold-50', value: 'oklch(0.988 0.025 85)' },
    { name: 'gold-100', value: 'oklch(0.968 0.045 85)' },
    { name: 'gold-200', value: 'oklch(0.928 0.085 85)' },
    { name: 'gold-300', value: 'oklch(0.878 0.125 82)' },
    { name: 'gold-400', value: 'oklch(0.818 0.145 78)' },
    { name: 'gold-500', value: 'oklch(0.738 0.155 72)' },
    { name: 'gold-600', value: 'oklch(0.628 0.145 68)' },
    { name: 'gold-700', value: 'oklch(0.508 0.125 65)' },
    { name: 'gold-800', value: 'oklch(0.408 0.095 62)' },
    { name: 'gold-900', value: 'oklch(0.328 0.075 60)' },
  ];

  const navyColors = [
    { name: 'navy-50', value: 'oklch(0.965 0.008 250)' },
    { name: 'navy-100', value: 'oklch(0.925 0.015 250)' },
    { name: 'navy-200', value: 'oklch(0.815 0.025 250)' },
    { name: 'navy-300', value: 'oklch(0.685 0.035 250)' },
    { name: 'navy-400', value: 'oklch(0.545 0.042 250)' },
    { name: 'navy-500', value: 'oklch(0.405 0.048 250)' },
    { name: 'navy-600', value: 'oklch(0.325 0.045 250)' },
    { name: 'navy-700', value: 'oklch(0.245 0.038 250)' },
    { name: 'navy-800', value: 'oklch(0.185 0.028 250)' },
    { name: 'navy-900', value: 'oklch(0.135 0.018 250)' },
  ];

  const semanticColors = [
    { name: 'primary', light: 'oklch(0.738 0.155 72)', dark: 'oklch(0.818 0.145 78)' },
    { name: 'secondary', light: 'oklch(0.245 0.038 250)', dark: 'oklch(0.245 0.038 250)' },
    { name: 'accent', light: 'oklch(0.738 0.155 72)', dark: 'oklch(0.738 0.155 72)' },
    { name: 'destructive', light: 'oklch(0.568 0.215 27)', dark: 'oklch(0.568 0.215 27)' },
    { name: 'muted', light: 'oklch(0.945 0.005 250)', dark: 'oklch(0.245 0.035 250)' },
    { name: 'background', light: 'oklch(0.985 0.002 250)', dark: 'oklch(0.135 0.018 250)' },
    { name: 'foreground', light: 'oklch(0.185 0.028 250)', dark: 'oklch(0.945 0.008 85)' },
  ];

  // Border radius values
  const radiusValues = [
    { name: 'sm', value: 'calc(var(--radius) - 4px)' },
    { name: 'md', value: 'calc(var(--radius) - 2px)' },
    { name: 'lg', value: 'var(--radius)' },
    { name: 'xl', value: 'calc(var(--radius) + 4px)' },
    { name: '2xl', value: 'calc(var(--radius) + 8px)' },
    { name: '3xl', value: 'calc(var(--radius) + 12px)' },
    { name: '4xl', value: 'calc(var(--radius) + 16px)' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Style Guide</h1>
            <p className="text-muted-foreground mt-2">
              KINY GROUP Design System - {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors duration-200"
          >
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </header>

        <div className="space-y-16">
          {/* Color Palettes Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Color Palettes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gold Palette */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Gold Palette</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {goldColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center">
                      <div 
                        className="w-full h-16 rounded-md border border-border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs mt-1 text-muted-foreground">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navy Palette */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Navy Palette</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {navyColors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center">
                      <div 
                        className="w-full h-16 rounded-md border border-border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs mt-1 text-muted-foreground">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Semantic Colors Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Semantic Colors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {semanticColors.map((color) => (
                <div key={color.name} className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="font-medium capitalize">{color.name}</h3>
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                      <div 
                        className="w-full h-12 rounded-md border border-border"
                        style={{ backgroundColor: color.light }}
                      />
                      <p className="text-xs mt-1 text-muted-foreground">Light</p>
                    </div>
                    <div className="flex-1">
                      <div 
                        className="w-full h-12 rounded-md border border-border"
                        style={{ backgroundColor: color.dark }}
                      />
                      <p className="text-xs mt-1 text-muted-foreground">Dark</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Typography</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Headings</h3>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>
                  <h2 className="text-3xl font-bold tracking-tight">Heading 2</h2>
                  <h3 className="text-2xl font-bold tracking-tight">Heading 3</h3>
                  <h4 className="text-xl font-bold tracking-tight">Heading 4</h4>
                  <h5 className="text-lg font-bold tracking-tight">Heading 5</h5>
                  <h6 className="text-base font-bold tracking-tight">Heading 6</h6>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Body Text</h3>
                <div className="space-y-4">
                  <p className="text-base">
                    This is a standard paragraph of text. It demonstrates the default body text styling in the design system. 
                    The text is optimized for readability with appropriate line height and spacing.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is smaller muted text, often used for secondary information, captions, or less important content.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Buttons Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors duration-200">
                Primary
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md transition-colors duration-200">
                Secondary
              </button>
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md transition-colors duration-200">
                Accent
              </button>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md transition-colors duration-200">
                Destructive
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md transition-colors duration-200">
                Muted
              </button>
              <button className="px-4 py-2 border border-border rounded-md transition-colors duration-200">
                Outline
              </button>
            </div>
          </section>

          {/* Form Elements Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Form Elements</h2>
            <div className="space-y-6 max-w-md">
              <div>
                <label htmlFor="input" className="block text-sm font-medium mb-1">Input Field</label>
                <input 
                  type="text" 
                  id="input" 
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter text..."
                />
              </div>
              
              <div>
                <label htmlFor="textarea" className="block text-sm font-medium mb-1">Textarea</label>
                <textarea 
                  id="textarea" 
                  rows={3}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter longer text..."
                />
              </div>
              
              <div>
                <label htmlFor="select" className="block text-sm font-medium mb-1">Select</label>
                <select 
                  id="select" 
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </section>

          {/* Cards Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold mb-2">Card Title</h3>
                <p className="text-muted-foreground">
                  This is a sample card with some content to demonstrate the card styling in the design system.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Card with Shadow</h3>
                <p className="text-muted-foreground">
                  This card has a subtle shadow effect for more depth and emphasis.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    K
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">User Card</h3>
                    <p className="text-sm text-muted-foreground">Design System</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  This card demonstrates a more complex layout with an avatar and user information.
                </p>
              </div>
            </div>
          </section>

          {/* Border Radius Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Border Radius</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
              {radiusValues.map((radius) => (
                <div key={radius.name} className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 bg-primary rounded-md flex items-center justify-center text-primary-foreground"
                    style={{ borderRadius: radius.value }}
                  >
                    <span className="text-xs">{radius.name}</span>
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">{radius.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}