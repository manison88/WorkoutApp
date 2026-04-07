

interface BodyMapSVGProps {
  muscleData: Record<string, number>;
  maxCount: number;
}

function getColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return '#2a2a3e';
  const ratio = Math.min(count / maxCount, 1);
  if (ratio <= 0.25) {
    // gray -> light yellow
    const t = ratio / 0.25;
    return lerpColor('#2a2a3e', '#fef08a', t);
  } else if (ratio <= 0.5) {
    const t = (ratio - 0.25) / 0.25;
    return lerpColor('#fef08a', '#fb923c', t);
  } else if (ratio <= 0.75) {
    const t = (ratio - 0.5) / 0.25;
    return lerpColor('#fb923c', '#ef4444', t);
  } else {
    const t = (ratio - 0.75) / 0.25;
    return lerpColor('#ef4444', '#dc2626', t);
  }
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

const OUTLINE = '#4a4a6a';
const STROKE_WIDTH = 1.5;

export default function BodyMapSVG({ muscleData, maxCount }: BodyMapSVGProps) {
  const fill = (muscle: string) => getColor(muscleData[muscle] || 0, maxCount);

  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Labels */}
      <text x="100" y="20" textAnchor="middle" fill="#9ca3af" fontSize="14" fontWeight="bold">FRONT</text>
      <text x="300" y="20" textAnchor="middle" fill="#9ca3af" fontSize="14" fontWeight="bold">BACK</text>

      {/* ==================== FRONT VIEW ==================== */}
      <g transform="translate(100, 260)">
        {/* Head */}
        <ellipse cx="0" cy="-195" rx="18" ry="22" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />

        {/* Neck */}
        <rect x="-8" y="-173" width="16" height="14" rx="3" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* Shoulders (front delts) */}
        <g data-muscle="shoulders">
          <path
            d="M-16,-155 C-30,-158 -42,-148 -44,-135 L-34,-130 L-22,-140 Z"
            fill={fill('shoulders')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M16,-155 C30,-158 42,-148 44,-135 L34,-130 L22,-140 Z"
            fill={fill('shoulders')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Chest */}
        <g data-muscle="chest">
          <path
            d="M-22,-150 L-4,-150 L-4,-118 C-10,-115 -20,-118 -26,-128 Z"
            fill={fill('chest')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M22,-150 L4,-150 L4,-118 C10,-115 20,-118 26,-128 Z"
            fill={fill('chest')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Abs */}
        <g data-muscle="abs">
          <path
            d="M-12,-118 L12,-118 L12,-60 C10,-55 -10,-55 -12,-60 Z"
            fill={fill('abs')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Obliques */}
        <g data-muscle="obliques">
          <path
            d="M-12,-118 L-22,-110 L-20,-65 L-12,-60 Z"
            fill={fill('obliques')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M12,-118 L22,-110 L20,-65 L12,-60 Z"
            fill={fill('obliques')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Biceps */}
        <g data-muscle="biceps">
          <path
            d="M-34,-130 L-44,-135 L-48,-100 L-42,-88 L-32,-92 L-30,-120 Z"
            fill={fill('biceps')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M34,-130 L44,-135 L48,-100 L42,-88 L32,-92 L30,-120 Z"
            fill={fill('biceps')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Forearms */}
        <g data-muscle="forearms">
          <path
            d="M-42,-88 L-48,-100 L-54,-68 L-50,-42 L-42,-44 L-38,-72 Z"
            fill={fill('forearms')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M42,-88 L48,-100 L54,-68 L50,-42 L42,-44 L38,-72 Z"
            fill={fill('forearms')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Quads */}
        <g data-muscle="quads">
          <path
            d="M-18,-55 L-4,-55 L-6,50 L-22,46 Z"
            fill={fill('quads')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M18,-55 L4,-55 L6,50 L22,46 Z"
            fill={fill('quads')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Calves (front) */}
        <g data-muscle="calves">
          <path
            d="M-20,58 L-6,58 L-8,130 L-16,135 L-22,130 Z"
            fill={fill('calves')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M20,58 L6,58 L8,130 L16,135 L22,130 Z"
            fill={fill('calves')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Knees (connective, not muscle) */}
        <ellipse cx="-13" cy="53" rx="9" ry="6" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />
        <ellipse cx="13" cy="53" rx="9" ry="6" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* Feet */}
        <ellipse cx="-14" cy="140" rx="10" ry="5" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />
        <ellipse cx="14" cy="140" rx="10" ry="5" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />
      </g>

      {/* ==================== BACK VIEW ==================== */}
      <g transform="translate(300, 260)">
        {/* Head */}
        <ellipse cx="0" cy="-195" rx="18" ry="22" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />

        {/* Neck */}
        <rect x="-8" y="-173" width="16" height="14" rx="3" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* Upper Back (traps / lats) */}
        <g data-muscle="upper_back">
          <path
            d="M-22,-155 L22,-155 L26,-128 L20,-110 L-20,-110 L-26,-128 Z"
            fill={fill('upper_back')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Shoulders (rear delts) */}
        <g data-muscle="shoulders">
          <path
            d="M-22,-155 C-34,-158 -44,-148 -44,-135 L-34,-130 L-26,-140 Z"
            fill={fill('shoulders')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M22,-155 C34,-158 44,-148 44,-135 L34,-130 L26,-140 Z"
            fill={fill('shoulders')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Lower Back */}
        <g data-muscle="lower_back">
          <path
            d="M-20,-110 L20,-110 L18,-60 C10,-55 -10,-55 -18,-60 Z"
            fill={fill('lower_back')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Triceps */}
        <g data-muscle="triceps">
          <path
            d="M-34,-130 L-44,-135 L-48,-100 L-42,-88 L-32,-92 L-30,-120 Z"
            fill={fill('triceps')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M34,-130 L44,-135 L48,-100 L42,-88 L32,-92 L30,-120 Z"
            fill={fill('triceps')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Forearms (back) */}
        <g data-muscle="forearms">
          <path
            d="M-42,-88 L-48,-100 L-54,-68 L-50,-42 L-42,-44 L-38,-72 Z"
            fill={fill('forearms')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M42,-88 L48,-100 L54,-68 L50,-42 L42,-44 L38,-72 Z"
            fill={fill('forearms')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Glutes */}
        <g data-muscle="glutes">
          <path
            d="M-18,-58 L-2,-55 L-2,-32 C-8,-28 -20,-32 -22,-42 Z"
            fill={fill('glutes')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M18,-58 L2,-55 L2,-32 C8,-28 20,-32 22,-42 Z"
            fill={fill('glutes')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Hamstrings */}
        <g data-muscle="hamstrings">
          <path
            d="M-22,-35 L-6,-30 L-6,50 L-22,46 Z"
            fill={fill('hamstrings')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M22,-35 L6,-30 L6,50 L22,46 Z"
            fill={fill('hamstrings')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Calves (back) */}
        <g data-muscle="calves">
          <path
            d="M-20,58 L-6,58 L-8,130 L-16,135 L-22,130 Z"
            fill={fill('calves')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
          <path
            d="M20,58 L6,58 L8,130 L16,135 L22,130 Z"
            fill={fill('calves')} stroke={OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
          />
        </g>

        {/* Knees */}
        <ellipse cx="-13" cy="53" rx="9" ry="6" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />
        <ellipse cx="13" cy="53" rx="9" ry="6" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* Feet */}
        <ellipse cx="-14" cy="140" rx="10" ry="5" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />
        <ellipse cx="14" cy="140" rx="10" ry="5" fill="#1e1e2e" stroke={OUTLINE} strokeWidth={STROKE_WIDTH} />
      </g>
    </svg>
  );
}
