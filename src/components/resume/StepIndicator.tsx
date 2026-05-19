"use client";

const STEPS = ["Personal", "Experience", "Education", "Tailor", "Template", "Preview"];

export function StepIndicator({
  current,
  onJump
}: {
  current: number;
  onJump?: (i: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {STEPS.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onJump?.(i)}
              className={`flex items-center gap-2 rounded-pill border px-3 py-1.5 transition ${
                active
                  ? "border-accent bg-accent text-white"
                  : done
                  ? "border-border bg-surface text-text"
                  : "border-border bg-card text-text-muted"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-pill text-[10px] ${
                active ? "bg-white/20" : done ? "bg-accent/20 text-accent" : "bg-border"
              }`}>
                {done ? "✓" : i + 1}
              </span>
              <span>{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="text-text-muted">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
