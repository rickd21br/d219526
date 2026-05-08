import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { INSPIRATION_LIBRARY, InspirationAudio, InspirationTrack } from "@/data/inspirationLibrary";
import { Headphones, Pause, Play, ChevronDown, ListMusic, Star, Trophy, RotateCcw, LayoutGrid, Rows3, Save, MoreVertical, BookOpen } from "lucide-react";
import { useStorage } from "@/hooks/useStorage";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBonusProgress } from "@/hooks/useBonusProgress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type PlayerTrack = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  collection: string;
  bookId: string;
  bookTrackIds: string[];
};

const VICTORY_SRC = "/sounds/vitoria.mp3";

function StarRating({ value, onChange, size = 14 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label="Avaliação">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(n);
          }}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          className="transition-transform active:scale-90"
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
          />
        </button>
      ))}
    </div>
  );
}

function BonusAudioCard({
  item,
  playingId,
  currentId,
  onTrackPlay,
  rating,
  onRate,
  completed,
  variant,
  currentTime,
  duration,
  speed,
  onSpeedChange,
  onSaveProgress,
  onSeek,
}: {
  item: InspirationAudio;
  playingId: string | null;
  currentId?: string;
  onTrackPlay: (item: InspirationAudio, track: InspirationTrack) => void;
  rating: number;
  onRate: (v: number) => void;
  completed: boolean;
  variant: "grid" | "list";
  currentTime: number;
  duration: number;
  speed: number;
  onSpeedChange: (s: number) => void;
  onSaveProgress: () => void;
  onSeek: (sec: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const isList = variant === "list";
  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-elevated">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group block w-full text-left"
        aria-expanded={open}
      >
        <div className={cn("relative overflow-hidden bg-secondary", isList ? "aspect-[4/5]" : "aspect-[3/4]")}>
          <img
            src={item.cover}
            alt={`Capa do audiobook ${item.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {completed && (
            <span className={cn(
              "absolute left-2 top-2 flex items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow-glow ring-2 ring-amber-200",
              isList ? "h-9 w-9" : "h-7 w-7"
            )}>
              <Trophy className={isList ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2.5} />
            </span>
          )}
          {isList && completed && (
            <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-primary/90 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
              Audiobook completo
            </span>
          )}
          <div className={cn(
            "absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-card via-card/70 to-transparent",
            isList ? "p-4" : "p-2"
          )}>
            <h2 className={cn(
              "font-bold leading-tight text-card-foreground",
              isList ? "text-xl" : "line-clamp-2 text-xs"
            )}>{item.title}</h2>
            <span className={cn(
              "shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow",
              isList ? "h-12 w-12" : "h-7 w-7"
            )}>
              <ChevronDown className={cn("transition-transform duration-300", open && "rotate-180", isList ? "h-6 w-6" : "h-4 w-4")} />
            </span>
          </div>
        </div>
      </button>

      <div className={cn("flex items-center justify-between gap-2", isList ? "px-4 py-2.5" : "px-2.5 py-1.5")}>
        <StarRating value={rating} onChange={onRate} size={isList ? 18 : 14} />
        {completed && <Trophy className={cn("text-amber-500", isList ? "h-5 w-5" : "h-3.5 w-3.5")} />}
      </div>

      <div className={cn("grid transition-all duration-500 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-border/70 p-3">
            <div>
              <p className="text-[11px] font-semibold text-primary">{item.author}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-card-foreground">{item.description}</p>
              <p className="mt-2 rounded-xl bg-primary/10 p-2 text-[11px] font-semibold italic leading-snug text-primary">"{item.trigger}"</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/50 p-2">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <ListMusic className="h-3 w-3" /> Playlist
              </div>
              <div className="space-y-1.5">
                {item.tracks.map((track, index) => {
                  const selected = currentId === track.id;
                  const playing = playingId === track.id;
                  return (
                    <div key={track.id}>
                      {selected ? (
                        <div className="space-y-1.5">
                          <p className="truncate px-1 text-[11px] font-bold leading-tight text-foreground">{track.title}</p>
                          <div className="rounded-2xl border border-primary/30 bg-card px-2 py-2 shadow-soft">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onTrackPlay(item, track)}
                              aria-label={playing ? "Pausar" : "Tocar"}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow active:scale-95"
                            >
                              {playing ? <Pause className="h-4 w-4" strokeWidth={3} /> : <Play className="ml-0.5 h-4 w-4" strokeWidth={3} />}
                            </button>
                            <select
                              value={speed}
                              onChange={(e) => { e.stopPropagation(); onSpeedChange(Number(e.target.value)); }}
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Velocidade"
                              className="ml-auto h-7 shrink-0 rounded-full bg-secondary px-2 text-[10px] font-bold text-foreground outline-none"
                            >
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1.0x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2.0x</option>
                            </select>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onSaveProgress(); }}
                              aria-label="Salvar ponto"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground active:scale-95"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={Math.min(currentTime, duration || 0)}
                            onChange={(e) => { e.stopPropagation(); onSeek(Number(e.target.value)); }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Posição"
                            className="audio-range-mini mt-2 w-full"
                            style={{ ['--pct' as any]: `${duration ? (currentTime / duration) * 100 : 0}%`, background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${duration ? (currentTime / duration) * 100 : 0}%, hsl(var(--secondary)) ${duration ? (currentTime / duration) * 100 : 0}%, hsl(var(--secondary)) 100%)` }}
                          />
                          <div className="mt-1 flex items-center justify-between px-1 text-[9px] font-semibold tabular-nums text-muted-foreground">
                            <span>{fmt(currentTime)}</span>
                            <span>{fmt(duration)}</span>
                          </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onTrackPlay(item, track)}
                          className="flex w-full items-center gap-2 rounded-xl bg-card px-2 py-1.5 text-left transition-smooth hover:bg-card/80 active:scale-[0.98]"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Play className="ml-0.5 h-3 w-3" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-bold">{track.title}</span>
                            <span className="block text-[9px] text-muted-foreground">Faixa {index + 1}</span>
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AudioPlayer({
  track,
  playing,
  loading,
  progress,
  speed,
  onSpeedChange,
  onToggle,
  currentTime,
  duration,
  onSeek,
  onSkip,
  onPrev,
  onNext,
  onSave,
}: {
  track: PlayerTrack | null;
  playing: boolean;
  loading: boolean;
  progress: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onToggle: () => void;
  currentTime: number;
  duration: number;
  onSeek: (sec: number) => void;
  onSkip: (delta: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    const mm = h > 0 ? m.toString().padStart(2, "0") : m.toString();
    const ss = sec.toString().padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };
  return (
    <section className="sticky top-3 z-30 mb-5 overflow-hidden rounded-[1.35rem] p-4 text-primary-foreground shadow-floating backdrop-blur" style={{ background: "var(--gradient-card)" }}>
      <div className="flex items-start gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black/15 ring-1 ring-white/10">
          <BookOpen className="h-7 w-7 text-primary-foreground/90" strokeWidth={2} />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-soft">
            <Play className="ml-0.5 h-2.5 w-2.5" strokeWidth={3} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">Audio</span>
          <h2 className="mt-1 truncate text-base font-bold leading-tight">{track ? track.title : "Selecione um audiobook"}</h2>
          <p className="truncate text-xs text-primary-foreground/80">{track ? track.subtitle : "Você chegou até aqui. Não pare agora."}</p>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Posição do áudio"
          disabled={!track || !duration}
          className="audio-range w-full"
          style={{ ['--pct' as any]: `${progress}%` }}
        />
        <div className="mt-1 flex items-center justify-between text-[11px] font-semibold tabular-nums text-primary-foreground/85">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          disabled={!track || loading}
          aria-label={playing ? "Pausar" : "Tocar"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-glow active:scale-95 disabled:opacity-50"
        >
          {playing ? <Pause className="h-6 w-6" strokeWidth={3} /> : <Play className="ml-0.5 h-6 w-6" strokeWidth={3} />}
        </button>
        <span className="mx-1 h-8 w-px bg-primary-foreground/20" />
        <div className="relative ml-auto">
          <select
            aria-label="Velocidade do áudio"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="h-9 appearance-none rounded-full bg-black/20 pl-3 pr-7 text-xs font-bold text-primary-foreground outline-none"
          >
            <option className="text-foreground" value={0.75}>0.75x</option>
            <option className="text-foreground" value={1}>1.0x</option>
            <option className="text-foreground" value={1.25}>1.25x</option>
            <option className="text-foreground" value={1.5}>1.5x</option>
            <option className="text-foreground" value={2}>2.0x</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
        </div>
        <button type="button" onClick={onSave} disabled={!track} aria-label="Salvar progresso" className="flex h-9 items-center gap-1.5 rounded-full bg-black/20 px-3 text-xs font-bold active:scale-95 disabled:opacity-50">
          <Save className="h-4 w-4" /> Salvar
        </button>
      </div>
    </section>
  );
}

const Audios = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const victoryRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useStorage<PlayerTrack | null>("d21.bonusLastTrack", null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [resumePrompt, setResumePrompt] = useState<{ track: PlayerTrack; saved: number } | null>(null);
  const [trophyBook, setTrophyBook] = useState<InspirationAudio | null>(null);
  const completedRef = useRef(false);

  const [view, setView] = useStorage<"grid" | "list">("d21.bonusView", "list");

  const { savePosition, getPosition, markTrackCompleted, setRating, getRating, isBookCompleted } = useBonusProgress();

  const startPlayback = (track: PlayerTrack, fromTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTrack(track);
    setLoading(true);
    completedRef.current = false;
    audio.src = track.src;
    audio.playbackRate = speed;
    const onLoaded = () => {
      audio.currentTime = fromTime > 1 ? fromTime : 0;
      audio.play()
        .then(() => {
          setLoading(false);
          setPlayingId(track.id);
        })
        .catch(() => {
          setLoading(false);
          setPlayingId(null);
          toast.error("Não consegui iniciar este áudio.");
        });
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.load();
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const playTrack = (track: PlayerTrack) => {
    const audio = audioRef.current;
    if (currentTrack?.id === track.id && audio && audio.src) {
      if (audio.paused) {
        audio.play().then(() => setPlayingId(track.id)).catch(() => toast.error("Não consegui retomar."));
      } else {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }
    const saved = getPosition(track.id);
    if (saved > 5) {
      setResumePrompt({ track, saved });
      return;
    }
    setPlayerProgress(0);
    startPlayback(track, 0);
  };

  const selectInspirationTrack = (item: InspirationAudio, track: InspirationTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      subtitle: item.author,
      src: track.src,
      collection: item.title,
      bookId: item.id,
      bookTrackIds: item.tracks.map((t) => t.id),
    });
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || !isFinite(audio.duration) || !currentTrack) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    setPlayerProgress(pct);
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
    savePosition(currentTrack.id, audio.currentTime, audio.duration);

    if (pct >= 95 && !completedRef.current) {
      completedRef.current = true;
      const justFinishedBook = markTrackCompleted(currentTrack.id, currentTrack.bookId, currentTrack.bookTrackIds);
      if (justFinishedBook) {
        const book = INSPIRATION_LIBRARY.find((b) => b.id === currentTrack.bookId);
        if (book) {
          setTrophyBook(book);
          victoryRef.current?.play().catch(() => {});
        }
      }
    }
  };

  const handleSaveProgress = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !audio.duration) {
      toast.error("Nada para salvar ainda.");
      return;
    }
    savePosition(currentTrack.id, audio.currentTime, audio.duration);
    toast.success("Ponto salvo. Você pode continuar depois.");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <MobileShell>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Headphones className="h-6 w-6 text-primary" /> Bônus Exclusivo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Best sellers com capa, cortina e playlist integrada.
        </p>
      </header>

      <AudioPlayer
        track={currentTrack}
        playing={!!playingId}
        loading={loading}
        progress={playerProgress}
        speed={speed}
        onSpeedChange={setSpeed}
        onToggle={() => currentTrack && playTrack(currentTrack)}
        currentTime={currentTime}
        duration={duration}
        onSeek={(sec) => { if (audioRef.current) audioRef.current.currentTime = sec; }}
        onSkip={(delta) => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min((audioRef.current.duration || 0), audioRef.current.currentTime + delta)); }}
        onPrev={() => {
          if (!currentTrack) return;
          const book = INSPIRATION_LIBRARY.find((b) => b.id === currentTrack.bookId);
          if (!book) return;
          const idx = book.tracks.findIndex((t) => t.id === currentTrack.id);
          const prev = book.tracks[idx - 1];
          if (prev) selectInspirationTrack(book, prev);
        }}
        onNext={() => {
          if (!currentTrack) return;
          const book = INSPIRATION_LIBRARY.find((b) => b.id === currentTrack.bookId);
          if (!book) return;
          const idx = book.tracks.findIndex((t) => t.id === currentTrack.id);
          const next = book.tracks[idx + 1];
          if (next) selectInspirationTrack(book, next);
        }}
        onSave={handleSaveProgress}
      />

      <section className="mb-3 flex items-center justify-end gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground">Visualização:</span>
        <div className="inline-flex rounded-full border border-border bg-secondary p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Visualizar em 3 colunas"
            className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-smooth", view === "grid" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground")}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="Visualizar em lista"
            className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-smooth", view === "list" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground")}
          >
            <Rows3 className="h-3.5 w-3.5" /> Lista
          </button>
        </div>
      </section>

      <section className={cn("pb-6", view === "grid" ? "grid grid-cols-3 gap-3" : "flex flex-col gap-4")}>
        {INSPIRATION_LIBRARY.map((item) => (
          <BonusAudioCard
            key={item.id}
            item={item}
            playingId={playingId}
            currentId={currentTrack?.id}
            onTrackPlay={selectInspirationTrack}
            rating={getRating(item.id)}
            onRate={(v) => {
              setRating(item.id, v);
              toast.success(`Avaliado com ${v} estrela${v > 1 ? "s" : ""}`);
            }}
            completed={isBookCompleted(item.id)}
            variant={view}
            currentTime={currentTime}
            duration={duration || (currentTrack ? 0 : 0)}
            speed={speed}
            onSpeedChange={setSpeed}
            onSaveProgress={handleSaveProgress}
            onSeek={(sec) => { if (audioRef.current) audioRef.current.currentTime = sec; }}
          />
        ))}
      </section>

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration || 0)}
        onEnded={() => {
          setPlayingId(null);
          setPlayerProgress(100);
        }}
        onCanPlay={() => setLoading(false)}
        onPause={() => setPlayingId(null)}
        onPlay={() => currentTrack && setPlayingId(currentTrack.id)}
        onError={() => {
          setLoading(false);
          setPlayingId(null);
          toast.error("Este arquivo de áudio não pôde ser carregado.");
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="hidden"
      />
      <audio ref={victoryRef} src={VICTORY_SRC} preload="auto" className="hidden" />

      {/* Resume prompt */}
      <Dialog open={!!resumePrompt} onOpenChange={(o) => !o && setResumePrompt(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Continuar de onde parou?</DialogTitle>
            <DialogDescription>
              Você ouviu até {resumePrompt ? formatTime(resumePrompt.saved) : "0:00"} desta faixa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <button
              type="button"
              onClick={() => {
                if (!resumePrompt) return;
                const t = resumePrompt;
                setResumePrompt(null);
                setPlayerProgress(0);
                startPlayback(t.track, t.saved);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
            >
              <Play className="h-4 w-4" /> Continuar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!resumePrompt) return;
                const t = resumePrompt;
                setResumePrompt(null);
                setPlayerProgress(0);
                startPlayback(t.track, 0);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 text-sm font-bold active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trophy reward */}
      <Dialog open={!!trophyBook} onOpenChange={(o) => !o && setTrophyBook(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-3">
              <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow-glow ring-4 ring-amber-200">
                <Trophy className="h-10 w-10" strokeWidth={2.5} />
              </span>
              <span>Insígnia conquistada!</span>
            </DialogTitle>
            <DialogDescription>
              Você concluiu <strong>{trophyBook?.title}</strong>. Continue sua jornada de aprendizado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setTrophyBook(null)}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
            >
              Incrível!
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
};

export default Audios;
