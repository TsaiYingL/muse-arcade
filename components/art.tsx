// Generated illustrations: avatars (no real people) and photo-like scenes.
import { useId } from "react";

function rng(seed: number) {
  let a = (seed * 9301 + 49297) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

const BGS = ["#C9E4FF", "#FFD9C7", "#D7F2DC", "#E9DDFF", "#FFE9A8", "#FFD1E3", "#CDEFF2", "#F2E2D0", "#DCE3EC", "#FBD6B6"];
const SKIN = ["#F6D2B8", "#EBB894", "#D69B73", "#B57852", "#8C5A3C", "#6B4330", "#F3C9A5"];
const HAIR = ["#2B1D16", "#4A2F22", "#7A4B2A", "#C58C4B", "#E3C07A", "#1F1F24", "#8E3B2E", "#5B5B66"];
const SHIRT = ["#3B5BDB", "#E8590C", "#2F9E44", "#AE3EC9", "#1C7ED6", "#F08C00", "#495057", "#D6336C", "#0CA678", "#F1F3F5"];

export function AvatarArt({ seed }: { seed: number }) {
  const r = rng(seed + 1);
  const bg = pick(r, BGS);
  const skin = pick(r, SKIN);
  const hair = pick(r, HAIR);
  const shirt = pick(r, SHIRT);
  const style = Math.floor(r() * 5);
  const glasses = r() < 0.22;
  return (
    <svg viewBox="0 0 100 100" className="block h-full w-full" aria-hidden>
      <rect width="100" height="100" fill={bg} />
      {style === 1 && <path d="M27 50 Q25 18 50 17 Q75 18 73 50 L76 80 Q62 76 60 62 L40 62 Q38 76 24 80 Z" fill={hair} />}
      <path d="M8 104 Q10 74 50 71 Q90 74 92 104 Z" fill={shirt} />
      <path d="M42 58 h16 v14 q-8 6 -16 0 Z" fill={skin} style={{ filter: "brightness(0.9)" }} />
      <ellipse cx="50" cy="45" rx="18.5" ry="21" fill={skin} />
      {style === 0 && <path d="M31 46 Q29 21 50 20 Q71 21 69 46 Q67 33 55 30 Q44 33 31 46Z" fill={hair} />}
      {style === 1 && <path d="M31 44 Q31 21 50 21 Q69 21 69 44 Q60 30 46 31 Q37 34 31 44Z" fill={hair} />}
      {style === 2 && (
        <>
          <circle cx="50" cy="17" r="9" fill={hair} />
          <path d="M31 44 Q30 22 50 22 Q70 22 69 44 Q64 30 50 29 Q36 30 31 44Z" fill={hair} />
        </>
      )}
      {style === 3 &&
        [
          [34, 30], [41, 24], [50, 22], [59, 24], [66, 30], [70, 38], [30, 38], [45, 27], [55, 27],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill={hair} />)}
      {style === 4 && <path d="M32 40 Q32 23 50 23 Q68 23 68 40 Q60 31 50 31 Q40 31 32 40Z" fill={hair} opacity="0.85" />}
      <circle cx="43" cy="47" r="1.9" fill="#2A211C" />
      <circle cx="57" cy="47" r="1.9" fill="#2A211C" />
      <path d="M44.5 55 Q50 59.5 55.5 55" stroke="#7A3B2E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {glasses && (
        <g stroke="#222" strokeWidth="1.4" fill="none">
          <circle cx="43" cy="47" r="5" />
          <circle cx="57" cy="47" r="5" />
          <path d="M48 47 h4" />
        </g>
      )}
    </svg>
  );
}

type SceneKind = "mountain" | "sea" | "forest" | "city" | "interior" | "bowl" | "plant" | "gift" | "garden";
const KIND: Record<number, SceneKind> = {
  0: "mountain", 1: "forest", 2: "mountain", 3: "sea", 4: "bowl", 5: "city", 6: "sea", 7: "sea",
  8: "plant", 9: "garden", 10: "interior", 12: "gift", 15: "plant",
};
const SKIES = [
  ["#7BB7F0", "#D9ECFF"], ["#F7A26B", "#FCE3B0"], ["#5A7FD6", "#F3B6A8"], ["#9FD3F5", "#EAF6FF"], ["#2E3A6B", "#E07A5F"],
];

export function Scene({ seed, className = "" }: { seed: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const kind = KIND[seed] ?? "mountain";
  const [top, bot] = SKIES[seed % SKIES.length];
  const g = `g${id}`;
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className={`block h-full w-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <linearGradient id={`w${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D8FC4" />
          <stop offset="1" stopColor="#1F5F8B" />
        </linearGradient>
      </defs>
      {kind === "interior" ? (
        <>
          <rect width="300" height="300" fill="#EFE6DA" />
          <rect x="0" y="210" width="300" height="90" fill="#C9A67E" />
          <rect x="30" y="60" width="90" height="70" fill="#9CC5E8" stroke="#fff" strokeWidth="6" />
          <rect x="150" y="40" width="110" height="170" fill="#7B5434" />
          {[60, 100, 140, 180].map((y) => <rect key={y} x="156" y={y} width="98" height="5" fill="#5E3F26" />)}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={160 + i * 22} y={68 + (i % 2) * 40} width="14" height="30" fill={["#D9480F", "#2B8A3E", "#1864AB", "#F59F00"][i]} />
              <rect x={166 + i * 20} y={150} width="12" height="28" fill={["#5F3DC4", "#E64980", "#0B7285", "#E8590C"][i]} />
            </g>
          ))}
          <rect x="20" y="170" width="120" height="50" rx="14" fill="#4C6EF5" />
          <rect x="30" y="150" width="100" height="35" rx="12" fill="#5C7CFA" />
          <circle cx="275" cy="190" r="16" fill="#2F9E44" />
          <rect x="266" y="200" width="18" height="18" fill="#C26B3A" />
        </>
      ) : kind === "bowl" || kind === "gift" || kind === "plant" || kind === "garden" ? (
        <>
          <rect width="300" height="300" fill={kind === "garden" ? "#6FAE5B" : "#F1E7DA"} />
          {kind !== "garden" && <rect y="200" width="300" height="100" fill="#D8C3A5" />}
          {kind === "bowl" && (
            <>
              <ellipse cx="150" cy="190" rx="80" ry="22" fill="#B0603A" />
              <path d="M70 190 Q80 260 150 262 Q220 260 230 190 Z" fill="#C8754A" />
              <ellipse cx="150" cy="190" rx="70" ry="16" fill="#8F4A2B" />
            </>
          )}
          {kind === "gift" && (
            <>
              <rect x="80" y="130" width="140" height="110" rx="6" fill="#E64980" />
              <rect x="140" y="130" width="20" height="110" fill="#FFD43B" />
              <rect x="70" y="110" width="160" height="30" rx="6" fill="#F06595" />
              <path d="M150 110 Q120 70 110 100 Q120 115 150 110 Q180 70 190 100 Q180 115 150 110" fill="#FFD43B" />
            </>
          )}
          {kind === "plant" &&
            [70, 150, 230].map((x, i) => (
              <g key={x}>
                <path d={`M${x - 26} 215 h52 l-8 50 h-36 Z`} fill={["#C2703D", "#F1F3F5", "#495057"][i]} />
                {[-30, -12, 8, 26].map((dx, j) => (
                  <ellipse key={j} cx={x + dx} cy={170 - (j % 2) * 26} rx="14" ry="30" fill={["#2F9E44", "#37B24D", "#2B8A3E"][(i + j) % 3]} transform={`rotate(${dx} ${x + dx} ${200})`} />
                ))}
              </g>
            ))}
          {kind === "garden" &&
            Array.from({ length: 14 }).map((_, i) => (
              <g key={i}>
                <circle cx={30 + (i % 5) * 60 + (i % 2) * 15} cy={40 + Math.floor(i / 5) * 95} r="34" fill="#3F8F3A" />
                <circle cx={36 + (i % 5) * 60 + (i % 2) * 15} cy={52 + Math.floor(i / 5) * 95} r="11" fill="#E03131" />
                <circle cx={18 + (i % 5) * 60 + (i % 2) * 15} cy={34 + Math.floor(i / 5) * 95} r="9" fill="#F03E3E" />
              </g>
            ))}
        </>
      ) : (
        <>
          <rect width="300" height="300" fill={`url(#${g})`} />
          <circle cx={80 + (seed * 37) % 150} cy="85" r="22" fill="#FFF3C4" opacity="0.9" />
          {kind === "mountain" && (
            <>
              <path d="M-10 200 L70 95 L130 170 L190 80 L310 210 L310 300 L-10 300 Z" fill="#7C8DB5" />
              <path d="M190 80 L172 104 L184 100 L196 110 L206 97 Z M70 95 L58 112 L72 108 L82 114 Z" fill="#fff" />
              <path d="M-10 230 L60 175 L120 215 L200 160 L310 230 L310 300 L-10 300 Z" fill="#4E6B57" />
              <rect y="245" width="300" height="55" fill={`url(#w${id})`} />
            </>
          )}
          {kind === "forest" && (
            <>
              <rect y="210" width="300" height="90" fill="#3C6E47" />
              {Array.from({ length: 9 }).map((_, i) => (
                <path key={i} d={`M${i * 36} 230 l18 -${70 + (i % 3) * 25} l18 ${70 + (i % 3) * 25} Z`} fill={i % 2 ? "#2D5A3A" : "#22492F"} />
              ))}
            </>
          )}
          {kind === "sea" && (
            <>
              <rect y="160" width="300" height="80" fill={`url(#w${id})`} />
              <path d="M0 230 Q80 215 160 232 T300 228 V300 H0 Z" fill="#F2D7A6" />
              <path d="M0 236 Q80 222 160 238" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" />
              <path d="M220 160 Q250 120 300 128 V160 Z" fill="#5E7D5A" />
            </>
          )}
          {kind === "city" && (
            <>
              {Array.from({ length: 10 }).map((_, i) => {
                const h = 70 + ((i * 53) % 110);
                return <rect key={i} x={i * 31} y={260 - h} width="27" height={h + 40} fill={i % 2 ? "#2B2D42" : "#3D405B"} />;
              })}
              {Array.from({ length: 30 }).map((_, i) => (
                <rect key={i} x={6 + (i % 10) * 31} y={180 + Math.floor(i / 10) * 22} width="6" height="8" fill="#FFD166" opacity="0.8" />
              ))}
            </>
          )}
        </>
      )}
    </svg>
  );
}
