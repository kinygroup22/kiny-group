// Path: components/scroll-to-top.tsx
"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScrollToTop() {  // Changed to default export
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gold-600 hover:bg-gold-700 shadow-lg shadow-gold-600/30 transition-all hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 text-navy-900" />
        </Button>
      )}
    </>
  );
}