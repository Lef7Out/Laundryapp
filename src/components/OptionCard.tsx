"use client";

interface OptionCardProps {
  label: string;
  description: string;
  feeLabel: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function OptionCard({
  label,
  description,
  feeLabel,
  isSelected,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-suds bg-sky/70"
          : "border-line bg-white hover:bg-sky/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="mt-0.5 text-xs text-ink/60">{description}</p>
        </div>
        <span
          className={`shrink-0 font-mono text-xs font-medium ${
            isSelected ? "text-suds-dark" : "text-ink/50"
          }`}
        >
          {feeLabel}
        </span>
      </div>
    </button>
  );
}
