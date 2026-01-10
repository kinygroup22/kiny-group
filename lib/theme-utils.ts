// lib/theme-utils.ts
import { BrandDivision } from "@/lib/db/schema";

export interface ThemeColors {
  primary: string;
  bg: string;
  bgSolid: string;
  border: string;
  text: string;
  accent: string;
  hover: string;
  gradient: string;
}

// Helper function to get theme with fallbacks
export const getThemeColors = (brand: BrandDivision): ThemeColors => {
  const defaultColor = "#3b82f6";
  
  return {
    primary: brand.theme?.primary || brand.color || defaultColor,
    bg: brand.theme?.bg || `${brand.color || defaultColor}1A`,
    bgSolid: brand.theme?.bgSolid || `${brand.color || defaultColor}0D`,
    border: brand.theme?.border || `${brand.color || defaultColor}33`,
    text: brand.theme?.text || brand.color || defaultColor,
    accent: brand.theme?.accent || brand.color || defaultColor,
    hover: brand.theme?.hover || brand.color || defaultColor,
    gradient: brand.theme?.gradient || `linear-gradient(135deg, ${brand.color || defaultColor} 0%, ${brand.color || defaultColor}CC 100%)`,
  };
};

// Helper function to create CSS variables from theme
export const createThemeCSSVariables = (brand: BrandDivision) => {
  const theme = getThemeColors(brand);
  
  return {
    "--theme-primary": theme.primary,
    "--theme-bg": theme.bg,
    "--theme-bg-solid": theme.bgSolid,
    "--theme-border": theme.border,
    "--theme-text": theme.text,
    "--theme-accent": theme.accent,
    "--theme-hover": theme.hover,
    "--theme-gradient": theme.gradient,
  } as React.CSSProperties;
};