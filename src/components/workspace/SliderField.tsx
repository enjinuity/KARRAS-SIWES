type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint: string;
  displayValue?: string;
  recommendedMin?: number;
  recommendedMax?: number;
  bandLabel?: string;
  bandHint?: string;
  onChange: (value: number) => void;
};

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  hint,
  displayValue,
  recommendedMin,
  recommendedMax,
  bandLabel,
  bandHint,
  onChange,
}: SliderFieldProps) {
  const rangeState =
    recommendedMin === undefined || recommendedMax === undefined
      ? null
      : value < recommendedMin
        ? 'below'
        : value > recommendedMax
          ? 'above'
          : 'within';
  const rangeTone =
    rangeState === 'within'
      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
      : rangeState === 'below'
        ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
        : rangeState === 'above'
          ? 'border-rose-300/30 bg-rose-300/10 text-rose-100'
          : 'border-white/10 bg-black/20 text-zinc-300';

  return (
    <label className="block rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-100">{label}</span>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-cyan-300"
      />
      <p className="mt-3 text-xs leading-5 text-zinc-500">{hint}</p>
      {bandLabel ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${rangeTone}`}>
            {rangeState === 'within'
              ? 'Within screening band'
              : rangeState === 'below'
                ? 'Below screening band'
                : rangeState === 'above'
                  ? 'Above screening band'
                  : 'Screening band'}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
            {bandLabel}
          </span>
        </div>
      ) : null}
      {bandHint ? <p className="mt-2 text-[11px] leading-5 text-zinc-500">{bandHint}</p> : null}
    </label>
  );
}
