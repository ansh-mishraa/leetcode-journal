import { cn } from "@/lib/utils";

type Tone = "neutral" | "easy" | "medium" | "hard" | "pupil" | "expert" | "master" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-border text-muted",
  easy: "border-transparent bg-diff-easy/12 text-diff-easy",
  medium: "border-transparent bg-diff-medium/12 text-diff-medium",
  hard: "border-transparent bg-diff-hard/12 text-diff-hard",
  pupil: "border-transparent bg-band-pupil/12 text-band-pupil",
  expert: "border-transparent bg-band-expert/12 text-band-expert",
  master: "border-transparent bg-band-master/12 text-band-master",
  danger: "border-transparent bg-destructive/12 text-destructive",
};

export function difficultyTone(difficulty?: string | null): Tone {
  const d = difficulty?.toLowerCase();
  if (d === "easy") return "easy";
  if (d === "medium") return "medium";
  if (d === "hard") return "hard";
  return "neutral";
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-data text-[10px] uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
