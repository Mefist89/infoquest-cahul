const fs = require('fs');
const path = 'src/components/modules/OperatorCallModule.tsx';
let code = fs.readFileSync(path, 'utf8');

const newVideoExampleStage = `function VideoExampleStage({ content, button, saving, onComplete }: { content: (typeof operatorCallContent)["ru"]["videoExample"] | (typeof operatorCallContent)["ro"]["videoExample"]; button: string; saving: boolean; onComplete: () => void }) {
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
    <VideoPlaceholder title={content.title} placeholder={content.placeholder} hint={content.hint} src="/video/3video.mp4" />
    <div className="mt-5 space-y-3">
      {content.transcript.map((line, index) => <div key={\`\${line.speaker}-\${index}\`} className={\`max-w-[88%] rounded-2xl border p-4 \${index % 2 === 0 ? "border-danger/25 bg-danger/5" : "ml-auto border-neon/25 bg-neon/5"}\`}><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{line.speaker}</p><p className="mt-1 text-sm">{line.text}</p></div>)}
    </div>

    {'audioText' in content && 'audioFile' in content && content.audioText && content.audioFile && (
      <div className="mt-8 flex justify-center sm:justify-start">
        <button type="button" onClick={toggleMp3} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 transition-colors hover:border-neon hover:bg-slate-800 text-foreground group focus-ring">
          {playingMp3 ? <Volume2 className="text-neon size-6 group-hover:scale-110 transition-transform animate-pulse" /> : <Play className="text-neon size-6 group-hover:scale-110 transition-transform" />}
          <span className="font-bold text-sm sm:text-base">{content.audioText}</span>
        </button>
      </div>
    )}

    <ActionButton disabled={saving} onClick={onComplete}>{button}</ActionButton>
  </div>;
}`;

code = code.replace(
  /function VideoExampleStage\(\{ content, button, saving, onComplete \}: \{ content: \(typeof operatorCallContent\)\["ru"\]\["videoExample"\] \| \(typeof operatorCallContent\)\["ro"\]\["videoExample"\]; button: string; saving: boolean; onComplete: \(\) => void \}\) \{[\s\S]*?(?=function VideoPlaceholder)/,
  newVideoExampleStage + '\n\n'
);

fs.writeFileSync(path, code);
console.log("Updated VideoExampleStage successfully");
