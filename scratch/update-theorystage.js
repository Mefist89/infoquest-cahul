const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

const newTheoryStage = `function TheoryStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["theory"] | (typeof operatorCallContent)["ro"]["theory"]; button: string; saving: boolean; onComplete: () => void }) {
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

  return <div>
    <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">{content.lead}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{content.cards.map((card, index) => <article key={card.title} className="rounded-3xl border border-border bg-background/40 p-5 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition hover:border-neon/40 hover:bg-background/60"><span className="text-sm font-black tracking-widest text-neon/60">0{index + 1}</span><h3 className="mt-3 text-lg sm:text-xl font-black text-foreground">{card.title}</h3><p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">{card.text}</p></article>)}</div>
    <p className="mt-8 rounded-3xl border border-neon/40 bg-neon/10 p-6 sm:p-8 text-lg sm:text-xl font-bold text-neon shadow-[0_0_30px_rgba(0,217,255,0.1)]">{content.rule}</p>
    
    <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-start gap-4">
      {'bookletText' in content && 'bookletFile' in content && content.bookletText && content.bookletFile && (
        <a href={content.bookletFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          <BookOpen className="text-neon size-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm sm:text-base">{content.bookletText}</span>
        </a>
      )}
      {'audioText' in content && 'audioFile' in content && content.audioText && content.audioFile && (
        <button type="button" onClick={toggleMp3} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          {playingMp3 ? <Volume2 className="text-neon size-6 group-hover:scale-110 transition-transform animate-pulse" /> : <Play className="text-neon size-6 group-hover:scale-110 transition-transform" />}
          <span className="font-bold text-sm sm:text-base">{content.audioText}</span>
        </button>
      )}
    </div>

    <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
  </div>;
}`;

code = code.replace(
  /function TheoryStage\(\{ content, button, saving, onComplete \}: \{ content: \(typeof operatorCallContent\)\["ru"\]\["theory"\] \| \(typeof operatorCallContent\)\["ro"\]\["theory"\]; button: string; saving: boolean; onComplete: \(\) => void \}\) \{[\s\S]*?(?=function VideoExplanationStage)/,
  newTheoryStage + '\n\n'
);

fs.writeFileSync(path, code);
console.log("Updated TheoryStage successfully");
