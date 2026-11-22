"use client";

import { CheckCircle2, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { operatorCallContent } from "@/data/operator-call";
import { TheoryBoard } from "../shared/theory-board";
import { ActionButton } from "./stage-support";

function TheoryStage({
  locale,
  content,
  button,
  saving,
  onComplete,
}: {
  locale: "ru" | "ro";
  content: (typeof operatorCallContent)["ru"]["theory"] | (typeof operatorCallContent)["ro"]["theory"];
  button: string;
  saving: boolean;
  onComplete: () => void;
}) {
  return (
    <TheoryBoard
      moduleSlug="operator-call"
      locale={locale}
      content={content}
      button={button}
      saving={saving}
      onComplete={onComplete}
    />
  );
}

function VideoExplanationStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExplanation"] | (typeof operatorCallContent)["ro"]["videoExplanation"]; button: string; saving: boolean; onComplete: () => void }) {
  const [playingMp3, setPlayingMp3] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ('audioFile' in content && content.audioFile) {
       audioRef.current = new Audio(content.audioFile as string);
       audioRef.current.onended = () => setPlayingMp3(false);
    }
    return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = "";
       }
    };
  }, [content]);

  function toggleMp3() {
    if (!audioRef.current) return;
    if (playingMp3) {
      audioRef.current.pause();
      setPlayingMp3(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlayingMp3(true);
    }
  }

  return (
    <div>
      <StageVideo title={content.title} description={content.description} src={content.videoUrl} videoFallback={content.videoFallback} />
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {content.points.map((point) => (
          <li key={point} className="flex gap-3 rounded-xl border border-border bg-background/35 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neon" />
            {point}
          </li>
        ))}
      </ul>

      {'audioText' in content && 'audioFile' in content && content.audioText && content.audioFile && (
        <div className="mt-8 flex justify-center sm:justify-start">
          <button type="button" onClick={toggleMp3} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
            {playingMp3 ? <Volume2 className="text-neon size-6 group-hover:scale-110 transition-transform animate-pulse" /> : <Play className="text-neon size-6 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-sm sm:text-base">{content.audioText}</span>
          </button>
        </div>
      )}

      <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
    </div>
  );
}

function VideoExampleStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExample"] | (typeof operatorCallContent)["ro"]["videoExample"]; button: string; saving: boolean; onComplete: () => void }) {
  return <div>
    <StageVideo title={content.title} description={content.description} src={content.videoUrl} videoFallback={content.videoFallback} />
    <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
  </div>;
}

function StageVideo({ title, description, src, videoFallback }: { title: string; description: string; src?: string; videoFallback: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neon/25 bg-slate-950">
      {src && <video
        aria-label={title}
        className="aspect-video w-full bg-black object-cover"
        controls
        preload="metadata"
        playsInline
      >
        <source src={src} type="video/mp4" />
        <p>{videoFallback}</p>
      </video>}
      <div className="border-t border-border bg-card p-4">
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}


export { TheoryStage, VideoExplanationStage, VideoExampleStage };
