const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

const newVideoExplanationStage = `function VideoExplanationStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExplanation"] | (typeof operatorCallContent)["ro"]["videoExplanation"]; button: string; saving: boolean; onComplete: () => void }) {
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
      <VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} src={content.videoUrl} />
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
}`;

code = code.replace(
  /function VideoExplanationStage\(\{ content, button, saving, onComplete \}: \{ content: \(typeof operatorCallContent\)\["ru"\]\["videoExplanation"\] \| \(typeof operatorCallContent\)\["ro"\]\["videoExplanation"\]; button: string; saving: boolean; onComplete: \(\) => void \}\) \{[\s\S]*?(?=function VideoExampleStage)/,
  newVideoExplanationStage + '\n\n'
);

fs.writeFileSync(path, code);
console.log("Updated VideoExplanationStage successfully");
