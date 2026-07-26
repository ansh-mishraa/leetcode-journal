import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowStep = {
  id: string;
  label: string;
  hint: string;
  href: string;
  done?: boolean;
  current?: boolean;
};

export function NextStepBanner({
  title = "Your next step",
  steps,
}: {
  title?: string;
  steps: FlowStep[];
}) {
  const current = steps.find((s) => s.current) ?? steps.find((s) => !s.done);
  if (!current) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border glass-panel">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
            {title}
          </p>
          <p className="mt-1 font-display text-xl tracking-tight">
            {current.label}
          </p>
          <p className="mt-1 text-sm text-muted">{current.hint}</p>
        </div>
        <Link
          href={current.href}
          className="btn btn-primary shrink-0 self-start md:self-auto"
        >
          Continue
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ol className="grid border-t border-border sm:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3 text-sm",
              i > 0 && "border-t border-border sm:border-t-0 sm:border-l",
              step.current && "bg-ink-sunken/50",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-data text-[10px]",
                step.done
                  ? "bg-band-pupil/20 text-band-pupil"
                  : step.current
                    ? "bg-band-expert/20 text-band-expert"
                    : "bg-ink-sunken text-muted",
              )}
            >
              {step.done ? <Check className="size-3" /> : i + 1}
            </span>
            <div>
              <p className={cn("font-medium", !step.done && !step.current && "text-muted")}>
                {step.label}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
