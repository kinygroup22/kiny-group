/* eslint-disable react-hooks/set-state-in-effect */
"use client";

// Path: components/layout/header.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, LogIn, LogOut, User, Settings, FileText, PenTool } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Navigation links object
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/brand", label: "Brands" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check if current page is brand/[id] or blog/[id]
  // Fixed: Convert the match result to a boolean using !! (double negation)
  const isDetailPage = !!(pathname.match(/^\/brand\/[^/]+$/) || pathname.match(/^\/blog\/[^/]+$/));

  useEffect(() => {
    // Set initial scroll state based on whether we're on a detail page
    setIsScrolled(isDetailPage || window.scrollY > 10);

    const handleScroll = () => {
      // Always keep scrolled state true for detail pages
      if (isDetailPage) {
        setIsScrolled(true);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDetailPage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // User initials for avatar fallback
  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if user is admin
  const isAdmin = session?.user?.role === "admin";
  const isEditor = session?.user?.role === "editor";
  const isContributor = session?.user?.role === "contributor";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "border-b bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 shadow-sm" 
          : "bg-transparent"
      }`}>
      {/* Subtle linear overlay */}
      {/* <div className="absolute inset-0 bg-linear-to-r from-gold-500/5 via-transparent to-gold-500/5 pointer-events-none" /> */}
      
      {/* Container with max-width */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
          {/* Desktop Navigation */}
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-8 flex items-center group">
              <div className="relative w-24 h-12">
                <Image
                  src="/kiny-logo/gold.png"
                  alt="KINY GROUP Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <nav className="flex items-center space-x-8 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative transition-colors hover:text-primary hover:scale-105 transform duration-200 ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-gold-500/10 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-primary" />
            )}
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {/* Mobile Logo */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link href="/" className="flex items-center md:hidden group">
                <div className="relative w-20 h-12">
                  <Image
                    src="/kiny-logo/gold.png"
                    alt="KINY GROUP Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>
            
            {/* Theme Toggle & Auth Buttons */}
            <nav className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 px-0 hover:bg-primary/10"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              
              {/* <Button 
                asChild 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                >
                <Link href="/contact">Contact Us</Link>
              </Button> */}
                {/* Auth Button / Profile Dropdown */}
                {status === "loading" ? (
                  <div className="w-9 h-9 rounded-full bg-muted animate-pulse"></div>
                ) : session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                          <AvatarImage 
                            src={session.user?.image || ""} 
                            alt={session.user?.name || "User"} 
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials(session.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user?.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                          </p>
                          <p className="text-xs leading-none text-primary capitalize">
                            {session.user?.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Admin and Editor Menu Items */}
                      {(isAdmin || isEditor) && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="cursor-pointer flex w-full items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {/* Admin Only Menu Items */}
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings" className="cursor-pointer flex w-full items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Profile Settings</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {/* Editor and Contributor Menu Items */}
                      {(isEditor || isContributor) && (
                        <DropdownMenuItem asChild>
                          <Link href="/blog/create" className="cursor-pointer flex w-full items-center">
                            <PenTool className="mr-2 h-4 w-4" />
                            <span>Create Post</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {/* Editor Menu Items */}
                      {isEditor && (
                        <DropdownMenuItem asChild>
                          <Link href="/blog/manage" className="cursor-pointer flex w-full items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Manage Posts</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    asChild 
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                  >
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                )}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu - Now Absolute with solid background */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden border-t bg-background/95 backdrop-blur-xl shadow-lg">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-4 py-3 text-base font-medium transition-all ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    {link.label}
                    {pathname === link.href && (
                      <span className="ml-2 w-2 h-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="border-t mt-4 pt-4">
                {status === "loading" ? (
                  <div className="px-4 py-2">
                    <div className="w-full h-10 rounded-md bg-muted animate-pulse"></div>
                  </div>
                ) : session ? (
                  <div className="px-4 py-2 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={session.user?.image || ""} 
                          alt={session.user?.name || "User"} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(session.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        <p className="text-xs text-primary capitalize">{session.user?.role}</p>
                      </div>
                    </div>
                    <div className="space-y-1 pt-2">
                      {/* Admin and Editor Menu Items */}
                      {(isAdmin || isEditor) && (
                        <Link
                          href="/dashboard"
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={toggleMenu}
                        >
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Dashboard
                          </div>
                        </Link>
                      )}
                      
                      {/* Admin Only Menu Items */}
                      {isAdmin && (
                        <Link
                          href="/dashboard/settings"
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={toggleMenu}
                        >
                          <div className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Profile Settings
                          </div>
                        </Link>
                      )}
                      
                      {/* Editor and Contributor Menu Items */}
                      {(isEditor || isContributor) && (
                        <Link
                          href="/blog/create"
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={toggleMenu}
                        >
                          <div className="flex items-center">
                            <PenTool className="mr-2 h-4 w-4" />
                            Create Post
                          </div>
                        </Link>
                      )}
                      
                      {/* Editor Menu Items */}
                      {isEditor && (
                        <Link
                          href="/blog/manage"
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={toggleMenu}
                        >
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Manage Posts
                          </div>
                        </Link>
                      )}
                      
                      <button
                        className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          handleSignOut();
                          toggleMenu();
                        }}
                      >
                        <div className="flex items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}