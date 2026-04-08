interface ProgressIndicatorProps {
  currentWeight: number | null;
  currentReps: number | null;
  previousWeight: number | null;
  previousReps: number | null;
}

export default function ProgressIndicator({
  currentWeight,
  currentReps,
  previousWeight,
  previousReps,
}: ProgressIndicatorProps) {
  const cw = currentWeight ?? 0;
  const cr = currentReps ?? 0;
  const pw = previousWeight ?? 0;
  const pr = previousReps ?? 0;

  const currentVolume = cw * cr;
  const previousVolume = pw * pr;

  let color: string;
  let arrow: string;
  let label: string;

  if (previousVolume === 0) {
    return <span className="text-xs text-gray-500">New</span>;
  }

  if (currentVolume > previousVolume) {
    const pct = Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
    color = 'text-accent-green';
    arrow = '▲';
    label = `+${pct}%`;
  } else if (currentVolume < previousVolume) {
    const pct = Math.round(((previousVolume - currentVolume) / previousVolume) * 100);
    color = 'text-accent-red';
    arrow = '▼';
    label = `-${pct}%`;
  } else {
    color = 'text-accent-yellow';
    arrow = '=';
    label = 'Same';
  }

  return (
    <span className={`text-xs font-semibold ${color} flex items-center gap-1`}>
      <span>{arrow}</span>
      <span>{label}</span>
      <span className="text-gray-500 font-normal ml-1">
        (prev: {pw} lbs x {pr})
      </span>
    </span>
  );
}
