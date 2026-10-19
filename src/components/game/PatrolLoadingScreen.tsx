"use client";

import { useState, useEffect, useMemo } from "react";

interface PatrolLoadingScreenProps {
  locale: "ru" | "ro";
  onComplete: () => void;
}

export function PatrolLoadingScreen({ locale, onComplete }: PatrolLoadingScreenProps) {
  const texts = useMemo(() => ({
    ru: {
      loading: "Загружаем патруль",
      preparing: "Подготовка к патрулированию...",
      assets: "Ассеты",
      ready: "Готово! Нажмите для входа",
      files: "файлов"
    },
    ro: {
      loading: "Încărcăm patrula",
      preparing: "Pregătire pentru patrulare...",
      assets: "Resurse",
      ready: "Gata! Apăsați pentru a intra",
      files: "fișiere"
    }
  }), []);

  const assets = useMemo(() => [
    { url: "/game/sprites/player.png", name: "player.png", type: "image" as const },
    { url: "/game/sprites/player.xml", name: "player.xml", type: "xml" as const },
    { url: "/game/sprites/shadow.png", name: "shadow.png", type: "image" as const },
    { url: "/game/sprites/shadow.xml", name: "shadow.xml", type: "xml" as const },
    { url: "/game/sprites/npc-female.png", name: "npc-female.png", type: "image" as const },
    { url: "/game/sprites/npc-female.xml", name: "npc-female.xml", type: "xml" as const },
    { url: "/game/sprites/npc-male.png", name: "npc-male.png", type: "image" as const },
    { url: "/game/sprites/npc-male.xml", name: "npc-male.xml", type: "xml" as const },
  ], []);

  const [progress, setProgress] = useState<{
    total: number;
    loaded: number;
    currentFile: string;
    complete: boolean;
  }>(() => ({
    total: assets.length,
    loaded: 0,
    currentFile: texts[locale].preparing,
    complete: false
  }));

  useEffect(() => {
    let mounted = true;

    const loadAsset = async (asset: typeof assets[0]) => {
      if (!mounted) return;

      setProgress(prev => ({
        ...prev,
        currentFile: asset.name
      }));

      try {
        if (asset.type === "xml") {
          await fetch(asset.url);
        } else {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load ${asset.name}`));
            img.src = asset.url;
          });
        }

        if (!mounted) return;

        setProgress(prev => ({
          ...prev,
          loaded: prev.loaded + 1
        }));
      } catch (error) {
        console.warn(`Failed to preload ${asset.name}:`, error);
        if (!mounted) return;
        setProgress(prev => ({
          ...prev,
          loaded: prev.loaded + 1
        }));
      }
    };

    const loadAll = async () => {
      await new Promise(r => setTimeout(r, 300));

      for (const asset of assets) {
        await loadAsset(asset);
      }

      if (!mounted) return;

      setProgress({
        total: assets.length,
        loaded: assets.length,
        currentFile: texts[locale].ready,
        complete: true
      });

      await new Promise(r => setTimeout(r, 500));

      if (mounted) {
        onComplete();
      }
    };

    loadAll();

    return () => {
      mounted = false;
    };
  }, [locale, onComplete, assets, texts]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060d1f]">
      <div className="relative w-full max-w-lg mx-6">
        <div className="absolute inset-0 rounded-3xl border border-neon/30 bg-gradient-to-br from-neon/5 via-transparent to-danger/5 blur-xl pointer-events-none" />
        
        <div className="relative rounded-3xl border border-neon/40 bg-card/95 p-8 sm:p-10 backdrop-blur-sm shadow-[0_0_60px_rgba(0,217,255,0.2)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-neon/10 border border-neon/30 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" style={{animationDelay: '300ms'}} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-neon">
                {texts[locale].loading}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              {texts[locale].assets}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {texts[locale].preparing}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-neon">
                {progress.loaded} / {progress.total} {texts[locale].files}
              </span>
              <span className="font-mono font-black text-neon">
                {Math.min(100, Math.round((progress.loaded / progress.total) * 100))}%
              </span>
            </div>
            
            <div className="h-3 rounded-full bg-secondary overflow-hidden relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-neon via-danger to-gold transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, (progress.loaded / progress.total) * 100)}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            <p className="text-xs text-muted-foreground text-center font-mono">
              {progress.currentFile}
            </p>
          </div>

          {!progress.complete && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 mb-6 p-3 rounded-xl bg-background/60 border border-border">
              {[
                { name: "player.png", size: "99 KB", icon: "🖼️" },
                { name: "player.xml", size: "3 KB", icon: "📄" },
                { name: "shadow.png", size: "104 KB", icon: "🖼️" },
                { name: "shadow.xml", size: "3 KB", icon: "📄" },
                { name: "npc-female.png", size: "99 KB", icon: "🖼️" },
                { name: "npc-female.xml", size: "3 KB", icon: "📄" },
                { name: "npc-male.png", size: "96 KB", icon: "🖼️" },
                { name: "npc-male.xml", size: "3 KB", icon: "📄" },
              ].map((file, i) => (
                <div 
                  key={file.name} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                    i < progress.loaded 
                      ? "bg-success/10 border border-success/30" 
                      : i === progress.loaded 
                        ? "bg-neon/10 border border-neon/30 animate-pulse" 
                        : "bg-background/60 border border-border"
                  }`}
                >
                  <span className="text-lg">{file.icon}</span>
                  <span className="font-mono text-sm font-medium flex-1 text-foreground">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                  {i < progress.loaded && (
                    <span className="text-success">✓</span>
                  )}
                  {i === progress.loaded && !progress.complete && (
                    <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              ))}
            </div>
          )}

          {progress.complete && (
            <button
              onClick={onComplete}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-neon via-danger to-gold p-[2px]"
            >
              <span className="relative flex min-h-14 items-center justify-center rounded-xl bg-[#060d1f] px-6 py-3 text-center text-lg font-black text-foreground transition-all">
                {texts[locale].ready}
                <span className="absolute -right-8 opacity-0 group-hover:opacity-100 group-hover:right-4 transition-all duration-300">
                  →
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const style = document.createElement('style');
style.textContent = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;
if (typeof document !== 'undefined' && !document.querySelector('#patrol-loading-styles')) {
  style.id = 'patrol-loading-styles';
  document.head.appendChild(style);
}