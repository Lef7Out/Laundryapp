"use client";

interface CounterControlProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  accentClassName?: string;
}

export default function CounterControl({
  label,
  value,
  onIncrement,
  onDecrement,
  accentClassName = "border-line",
}: CounterControlProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border ${accentClassName} bg-white px-3 py-2`}
    >
      <span className="text-sm text-ink/75">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={value === 0}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-sm font-medium text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-suds text-white transition hover:bg-suds-dark"
        >
          +
        </button>
      </div>
    </div>
  );
}
