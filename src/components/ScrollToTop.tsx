"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
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
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="focus-ring flex size-12 items-center justify-center rounded-full bg-neon/10 border border-neon text-neon backdrop-blur-md shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:bg-neon hover:text-slate-950 hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all hover:-translate-y-1"
        aria-label="Наверх"
      >
        <ArrowUp className="size-6" />
      </button>
    </div>
  );
}
