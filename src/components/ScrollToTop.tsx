"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop({ locale }: { locale: "ru" | "ro" }) {
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
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={scrollToTop}
        className="focus-ring flex size-12 items-center justify-center rounded-full bg-neon/10 border border-neon text-neon backdrop-blur-md shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:bg-neon hover:text-slate-950 hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all hover:-translate-y-1"
        aria-label={locale === "ro" ? "Înapoi sus" : "Наверх"}
      >
        <ArrowUp className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
}
