interface BodyMapSVGProps {
  muscleData: Record<string, number>;
  maxCount: number;
}

function getColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return '#2a2a3e';
  const ratio = Math.min(count / maxCount, 1);
  if (ratio <= 0.25) {
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

const OUTLINE = '#3d3d5c';
const SW = 0.8;
const BODY_FILL = '#1e1e2e';

export default function BodyMapSVG({ muscleData, maxCount }: BodyMapSVGProps) {
  const f = (muscle: string) => getColor(muscleData[muscle] || 0, maxCount);

  return (
    <svg viewBox="0 0 440 520" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Labels */}
      <text x="110" y="18" textAnchor="middle" fill="#9ca3af" fontSize="13" fontWeight="600" letterSpacing="2">FRONT</text>
      <text x="330" y="18" textAnchor="middle" fill="#9ca3af" fontSize="13" fontWeight="600" letterSpacing="2">BACK</text>

      {/* ==================== FRONT VIEW ==================== */}
      <g transform="translate(110, 270)">
        {/* Head */}
        <path
          d="M0,-215 C-14,-215 -20,-208 -22,-198 C-24,-188 -22,-175 -16,-170 C-12,-167 -6,-165 0,-165 C6,-165 12,-167 16,-170 C22,-175 24,-188 22,-198 C20,-208 14,-215 0,-215 Z"
          fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW}
        />
        {/* Neck */}
        <path
          d="M-9,-165 C-9,-158 -10,-152 -10,-148 L10,-148 C10,-152 9,-158 9,-165"
          fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW}
        />

        {/* Trapezius / neck-to-shoulder connection */}
        <path
          d="M-10,-148 C-14,-146 -22,-144 -28,-144 L28,-144 C22,-144 14,-146 10,-148"
          fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW}
        />

        {/* Shoulders (front delts) */}
        <g data-muscle="shoulders">
          <path
            d="M-28,-144 C-36,-146 -46,-142 -50,-134 C-52,-128 -50,-120 -46,-116 L-34,-120 C-30,-128 -28,-136 -28,-144 Z"
            fill={f('shoulders')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M28,-144 C36,-146 46,-142 50,-134 C52,-128 50,-120 46,-116 L34,-120 C30,-128 28,-136 28,-144 Z"
            fill={f('shoulders')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Chest - pectorals with natural curve */}
        <g data-muscle="chest">
          <path
            d="M-28,-144 C-26,-140 -24,-134 -24,-126 C-24,-118 -18,-112 -4,-112 L-4,-144 Z"
            fill={f('chest')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M28,-144 C26,-140 24,-134 24,-126 C24,-118 18,-112 4,-112 L4,-144 Z"
            fill={f('chest')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Abs - six pack area with natural taper */}
        <g data-muscle="abs">
          <path
            d="M-14,-112 L14,-112 L14,-94 L13,-76 L12,-58 C10,-50 -10,-50 -12,-58 L-13,-76 L-14,-94 Z"
            fill={f('abs')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          {/* Ab line details */}
          <line x1="0" y1="-112" x2="0" y2="-54" stroke={OUTLINE} strokeWidth={0.4} opacity={0.5} />
          <line x1="-13" y1="-94" x2="13" y2="-94" stroke={OUTLINE} strokeWidth={0.4} opacity={0.5} />
          <line x1="-13.5" y1="-76" x2="13.5" y2="-76" stroke={OUTLINE} strokeWidth={0.4} opacity={0.5} />
        </g>

        {/* Obliques */}
        <g data-muscle="obliques">
          <path
            d="M-24,-120 C-24,-112 -22,-106 -20,-100 C-18,-88 -16,-72 -16,-58 L-12,-58 L-13,-76 L-14,-94 L-14,-112 C-18,-112 -22,-116 -24,-120 Z"
            fill={f('obliques')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M24,-120 C24,-112 22,-106 20,-100 C18,-88 16,-72 16,-58 L12,-58 L13,-76 L14,-94 L14,-112 C18,-112 22,-116 24,-120 Z"
            fill={f('obliques')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Biceps - more organic arm shape */}
        <g data-muscle="biceps">
          <path
            d="M-46,-116 C-48,-108 -50,-98 -50,-90 C-49,-80 -44,-76 -40,-78 C-36,-80 -34,-88 -34,-96 L-34,-120 C-38,-118 -44,-116 -46,-116 Z"
            fill={f('biceps')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M46,-116 C48,-108 50,-98 50,-90 C49,-80 44,-76 40,-78 C36,-80 34,-88 34,-96 L34,-120 C38,-118 44,-116 46,-116 Z"
            fill={f('biceps')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Forearms - tapered naturally */}
        <g data-muscle="forearms">
          <path
            d="M-50,-90 C-52,-78 -54,-66 -54,-54 C-54,-42 -52,-30 -48,-22 C-46,-18 -42,-18 -40,-22 C-38,-30 -38,-44 -38,-56 C-38,-66 -40,-76 -40,-78 C-44,-76 -49,-80 -50,-90 Z"
            fill={f('forearms')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M50,-90 C52,-78 54,-66 54,-54 C54,-42 52,-30 48,-22 C46,-18 42,-18 40,-22 C38,-30 38,-44 38,-56 C38,-66 40,-76 40,-78 C44,-76 49,-80 50,-90 Z"
            fill={f('forearms')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Hands */}
        <path d="M-48,-22 C-50,-14 -50,-8 -46,-4 C-42,0 -38,-2 -40,-10 C-40,-14 -40,-18 -40,-22" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
        <path d="M48,-22 C50,-14 50,-8 46,-4 C42,0 38,-2 40,-10 C40,-14 40,-18 40,-22" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />

        {/* Hip / pelvis connector */}
        <path
          d="M-16,-58 C-18,-50 -20,-46 -22,-42 L22,-42 C20,-46 18,-50 16,-58"
          fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW}
        />

        {/* Quads - muscular thigh with natural taper */}
        <g data-muscle="quads">
          <path
            d="M-22,-42 C-24,-34 -26,-20 -26,-4 C-26,14 -24,34 -22,52 C-20,58 -14,60 -10,58 C-6,54 -4,40 -4,24 C-4,8 -4,-16 -4,-38 C-8,-40 -16,-42 -22,-42 Z"
            fill={f('quads')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M22,-42 C24,-34 26,-20 26,-4 C26,14 24,34 22,52 C20,58 14,60 10,58 C6,54 4,40 4,24 C4,8 4,-16 4,-38 C8,-40 16,-42 22,-42 Z"
            fill={f('quads')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Knee caps */}
        <path d="M-20,58 C-20,64 -16,68 -12,68 C-8,68 -6,64 -6,58" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
        <path d="M20,58 C20,64 16,68 12,68 C8,68 6,64 6,58" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />

        {/* Calves - athletic calf shape */}
        <g data-muscle="calves">
          <path
            d="M-20,68 C-22,78 -24,90 -22,104 C-20,116 -18,128 -18,140 C-18,148 -16,152 -14,152 C-10,152 -8,148 -8,140 C-8,128 -6,116 -6,104 C-4,90 -6,78 -6,68 C-10,68 -16,68 -20,68 Z"
            fill={f('calves')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M20,68 C22,78 24,90 22,104 C20,116 18,128 18,140 C18,148 16,152 14,152 C10,152 8,148 8,140 C8,128 6,116 6,104 C4,90 6,78 6,68 C10,68 16,68 20,68 Z"
            fill={f('calves')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Feet */}
        <path d="M-20,152 C-22,156 -24,160 -22,162 C-18,164 -10,164 -8,162 C-6,160 -6,156 -6,152" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
        <path d="M20,152 C22,156 24,160 22,162 C18,164 10,164 8,162 C6,160 6,156 6,152" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
      </g>

      {/* ==================== BACK VIEW ==================== */}
      <g transform="translate(330, 270)">
        {/* Head */}
        <path
          d="M0,-215 C-14,-215 -20,-208 -22,-198 C-24,-188 -22,-175 -16,-170 C-12,-167 -6,-165 0,-165 C6,-165 12,-167 16,-170 C22,-175 24,-188 22,-198 C20,-208 14,-215 0,-215 Z"
          fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW}
        />
        {/* Neck */}
        <path
          d="M-9,-165 C-9,-158 -10,-152 -10,-148 L10,-148 C10,-152 9,-158 9,-165"
          fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW}
        />

        {/* Shoulders (rear delts) */}
        <g data-muscle="shoulders">
          <path
            d="M-28,-144 C-36,-146 -46,-142 -50,-134 C-52,-128 -50,-120 -46,-116 L-34,-120 C-30,-128 -28,-136 -28,-144 Z"
            fill={f('shoulders')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M28,-144 C36,-146 46,-142 50,-134 C52,-128 50,-120 46,-116 L34,-120 C30,-128 28,-136 28,-144 Z"
            fill={f('shoulders')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Upper Back - traps and lats */}
        <g data-muscle="upper_back">
          <path
            d="M-28,-144 L-10,-148 L10,-148 L28,-144 C28,-136 26,-126 24,-118 C22,-112 20,-108 18,-106 L-18,-106 C-20,-108 -22,-112 -24,-118 C-26,-126 -28,-136 -28,-144 Z"
            fill={f('upper_back')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          {/* Spine line */}
          <line x1="0" y1="-148" x2="0" y2="-106" stroke={OUTLINE} strokeWidth={0.4} opacity={0.5} />
          {/* Lat wing hints */}
          <path d="M-18,-130 C-20,-126 -22,-120 -24,-118" stroke={OUTLINE} strokeWidth={0.3} opacity={0.4} fill="none" />
          <path d="M18,-130 C20,-126 22,-120 24,-118" stroke={OUTLINE} strokeWidth={0.3} opacity={0.4} fill="none" />
        </g>

        {/* Lower Back */}
        <g data-muscle="lower_back">
          <path
            d="M-18,-106 L18,-106 C18,-96 16,-82 16,-70 C14,-60 12,-54 10,-50 C6,-46 -6,-46 -10,-50 C-12,-54 -14,-60 -16,-70 C-16,-82 -18,-96 -18,-106 Z"
            fill={f('lower_back')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          {/* Spine line */}
          <line x1="0" y1="-106" x2="0" y2="-50" stroke={OUTLINE} strokeWidth={0.4} opacity={0.5} />
        </g>

        {/* Triceps */}
        <g data-muscle="triceps">
          <path
            d="M-46,-116 C-48,-108 -50,-98 -50,-90 C-49,-80 -44,-76 -40,-78 C-36,-80 -34,-88 -34,-96 L-34,-120 C-38,-118 -44,-116 -46,-116 Z"
            fill={f('triceps')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M46,-116 C48,-108 50,-98 50,-90 C49,-80 44,-76 40,-78 C36,-80 34,-88 34,-96 L34,-120 C38,-118 44,-116 46,-116 Z"
            fill={f('triceps')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Forearms (back) */}
        <g data-muscle="forearms">
          <path
            d="M-50,-90 C-52,-78 -54,-66 -54,-54 C-54,-42 -52,-30 -48,-22 C-46,-18 -42,-18 -40,-22 C-38,-30 -38,-44 -38,-56 C-38,-66 -40,-76 -40,-78 C-44,-76 -49,-80 -50,-90 Z"
            fill={f('forearms')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M50,-90 C52,-78 54,-66 54,-54 C54,-42 52,-30 48,-22 C46,-18 42,-18 40,-22 C38,-30 38,-44 38,-56 C38,-66 40,-76 40,-78 C44,-76 49,-80 50,-90 Z"
            fill={f('forearms')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Hands */}
        <path d="M-48,-22 C-50,-14 -50,-8 -46,-4 C-42,0 -38,-2 -40,-10 C-40,-14 -40,-18 -40,-22" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
        <path d="M48,-22 C50,-14 50,-8 46,-4 C42,0 38,-2 40,-10 C40,-14 40,-18 40,-22" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />

        {/* Glutes - rounded muscular shape */}
        <g data-muscle="glutes">
          <path
            d="M-16,-50 C-18,-46 -22,-40 -24,-34 C-24,-28 -20,-24 -14,-26 C-8,-28 -4,-34 -4,-40 C-4,-44 -8,-48 -16,-50 Z"
            fill={f('glutes')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M16,-50 C18,-46 22,-40 24,-34 C24,-28 20,-24 14,-26 C8,-28 4,-34 4,-40 C4,-44 8,-48 16,-50 Z"
            fill={f('glutes')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Hamstrings - long posterior thigh */}
        <g data-muscle="hamstrings">
          <path
            d="M-24,-34 C-26,-20 -26,-4 -26,14 C-26,34 -24,48 -22,56 C-18,60 -12,60 -8,56 C-6,48 -4,34 -4,14 C-4,-4 -4,-16 -4,-26 C-8,-28 -16,-30 -24,-34 Z"
            fill={f('hamstrings')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M24,-34 C26,-20 26,-4 26,14 C26,34 24,48 22,56 C18,60 12,60 8,56 C6,48 4,34 4,14 C4,-4 4,-16 4,-26 C8,-28 16,-30 24,-34 Z"
            fill={f('hamstrings')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Knee backs */}
        <path d="M-20,58 C-20,64 -16,68 -12,68 C-8,68 -6,64 -6,58" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
        <path d="M20,58 C20,64 16,68 12,68 C8,68 6,64 6,58" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />

        {/* Calves (back) - diamond shaped calf muscle */}
        <g data-muscle="calves">
          <path
            d="M-20,68 C-22,76 -24,86 -24,98 C-24,110 -22,124 -20,136 C-18,146 -16,152 -14,152 C-10,152 -8,148 -8,140 C-6,128 -4,114 -4,100 C-4,86 -6,78 -6,68 C-10,68 -16,68 -20,68 Z"
            fill={f('calves')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
          <path
            d="M20,68 C22,76 24,86 24,98 C24,110 22,124 20,136 C18,146 16,152 14,152 C10,152 8,148 8,140 C6,128 4,114 4,100 C4,86 6,78 6,68 C10,68 16,68 20,68 Z"
            fill={f('calves')} stroke={OUTLINE} strokeWidth={SW} strokeLinejoin="round"
          />
        </g>

        {/* Feet */}
        <path d="M-20,152 C-22,156 -24,160 -22,162 C-18,164 -10,164 -8,162 C-6,160 -6,156 -6,152" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
        <path d="M20,152 C22,156 24,160 22,162 C18,164 10,164 8,162 C6,160 6,156 6,152" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={SW} />
      </g>
    </svg>
  );
}
