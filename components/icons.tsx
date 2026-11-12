// Hand-drawn SVG icons approximating the current Facebook / Messenger iOS glyphs (see DESIGN_FACTS.md).
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = ({ size = 24, ...rest }: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  ...rest,
});
const stroke = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// ---------- Facebook header ----------
export const MenuIcon = (p: P) => (
  <svg {...base(p)}><path d="M3.5 6h17M3.5 12h17M3.5 18h17" {...stroke} strokeWidth={2} /></svg>
);
export const CreateIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5.5" {...stroke} strokeWidth={1.9} />
    <path d="M12 8v8M8 12h8" {...stroke} strokeWidth={1.9} />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="7.1" {...stroke} strokeWidth={2.1} />
    <path d="m16.2 16.2 4.6 4.6" {...stroke} strokeWidth={2.1} />
  </svg>
);
export const MessengerGlyph = (p: P) => (
  <svg {...base(p)}>
    <path
      fill="currentColor"
      d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.99-.88c.17-.07.36-.09.54-.04.91.25 1.88.39 2.89.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2z"
    />
    <path
      fill="#fff"
      d="M6 14.54l2.94-4.66c.47-.74 1.47-.93 2.17-.4l2.34 1.75c.21.16.51.16.72 0l3.16-2.4c.42-.32.97.18.69.63l-2.94 4.66c-.47.74-1.47.93-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63z"
    />
  </svg>
);
export const PhotoIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="4.5" fill="currentColor" />
    <circle cx="15.5" cy="8.5" r="1.8" fill="#fff" />
    <path d="M5.5 18.5 10 12.5l3.2 3.8 2-2.3 3.3 4.5z" fill="#fff" />
  </svg>
);

// ---------- Facebook tab bar ----------
export const HomeIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)}>
    {filled ? (
      <>
        <path d="M3.6 10.2 12 3.3l8.4 6.9V19a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" fill="currentColor" />
        <rect x="10.2" y="14.6" width="3.6" height="6.4" rx="1.4" fill="#fff" />
      </>
    ) : (
      <path d="M4.2 10.4 12 4l7.8 6.4V19a1.3 1.3 0 0 1-1.3 1.3H15v-5.8H9v5.8H5.5A1.3 1.3 0 0 1 4.2 19z" {...stroke} strokeWidth={1.8} />
    )}
  </svg>
);
export const FriendsIcon = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={1.8}>
    <circle cx="9" cy="7.8" r="3.3" />
    <path d="M2.8 19.6c0-3.3 2.7-5.7 6.2-5.7s6.2 2.4 6.2 5.7z" />
    <circle cx="16.8" cy="8.6" r="2.6" />
    <path d="M16.2 13.7c3 0 5 1.9 5 4.6h-3.6" />
  </svg>
);
export const ReelsIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" {...stroke} strokeWidth={1.8} />
    <path d="M3.4 8.6h17.2M8.6 3.3l2.6 5.2M14.3 3.3l2.6 5.2" {...stroke} strokeWidth={1.8} />
    <path d="M10.2 12.2v5.4l4.6-2.7z" fill="currentColor" stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
  </svg>
);
export const MarketplaceIcon = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={1.8}>
    <path d="M4.6 4h14.8l1.4 4.6a2.6 2.6 0 0 1-5.1.6 2.6 2.6 0 0 1-5.2 0 2.6 2.6 0 0 1-5.2 0 2.6 2.6 0 0 1-5.1-.6z" />
    <path d="M5 11.6V20h14v-8.4M9.8 20v-4.8h4.4V20" />
  </svg>
);
export const BellIcon = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={1.8}>
    <path d="M6 16.5v-5.3a6 6 0 0 1 12 0v5.3l1.6 2.1H4.4z" />
    <path d="M9.8 21a2.3 2.3 0 0 0 4.4 0" />
  </svg>
);

// ---------- Feed post ----------
export const MoreIcon = (p: P) => (
  <svg {...base(p)}>
    {[5, 12, 19].map((x) => <circle key={x} cx={x} cy="12" r="1.8" fill="currentColor" />)}
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="M5.5 5.5l13 13M18.5 5.5l-13 13" {...stroke} strokeWidth={2} /></svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.6 3.6 5.6 3.6 9s-1 6.4-3.6 9c-2.6-2.6-3.6-5.6-3.6-9S9.4 5.6 12 3z" />
  </svg>
);
export const LikeOutline = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={1.7}>
    <path d="M7.2 10.2v9.6H4.6a1.4 1.4 0 0 1-1.4-1.4v-6.8a1.4 1.4 0 0 1 1.4-1.4z" />
    <path d="M7.2 10.2 10.9 4a1.7 1.7 0 0 1 3.1 1.2l-.8 4h5.2a2 2 0 0 1 2 2.4l-1.3 6.7a2 2 0 0 1-2 1.6H7.2" />
  </svg>
);
export const CommentOutline = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={1.7}>
    <path d="M12 3.8c4.8 0 8.4 3.3 8.4 7.6S16.8 19 12 19c-1.1 0-2.1-.2-3.1-.5L4.6 20l1.2-3.6c-1.4-1.4-2.2-3.1-2.2-5C3.6 7.1 7.2 3.8 12 3.8z" />
  </svg>
);
export const ShareOutline = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={1.7}>
    <path d="M13.2 4.6 20.6 11.4l-7.4 6.8v-3.9c-4.7 0-7.6 1.3-9.8 4.6.6-5.2 3.6-9 9.8-9.6z" />
  </svg>
);
export const ReactLike = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <defs>
      <linearGradient id="rl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#18AFFF" />
        <stop offset="1" stopColor="#0062DF" />
      </linearGradient>
    </defs>
    <circle cx="8" cy="8" r="8" fill="url(#rl)" />
    <path d="M4.3 7.3h1.6v4.4H4.3zM6.5 11.7V7.4l1.9-2.9c.3-.4 1-.2 1 .3l-.3 1.9h2.2c.5 0 .9.5.8 1l-.6 3.1c-.1.5-.5.9-1 .9z" fill="#fff" />
  </svg>
);
export const ReactLove = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <defs>
      <linearGradient id="rh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF6680" />
        <stop offset="1" stopColor="#E61739" />
      </linearGradient>
    </defs>
    <circle cx="8" cy="8" r="8" fill="url(#rh)" />
    <path d="M8 12.2S3.9 9.7 3.9 7a2.1 2.1 0 0 1 4.1-.8A2.1 2.1 0 0 1 12.1 7C12.1 9.7 8 12.2 8 12.2z" fill="#fff" />
  </svg>
);
export const ReactWow = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
    <defs>
      <linearGradient id="rw" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FEEA70" />
        <stop offset="1" stopColor="#F69B30" />
      </linearGradient>
    </defs>
    <circle cx="8" cy="8" r="8" fill="url(#rw)" />
    <ellipse cx="5.6" cy="6.6" rx="1" ry="1.4" fill="#5B3600" />
    <ellipse cx="10.4" cy="6.6" rx="1" ry="1.4" fill="#5B3600" />
    <ellipse cx="8" cy="11" rx="1.7" ry="2.1" fill="#5B3600" />
  </svg>
);

// ---------- Messenger inbox ----------
export const ComposeIcon = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={2}>
    <path d="M11 3.8H6.6a2.8 2.8 0 0 0-2.8 2.8v10.8a2.8 2.8 0 0 0 2.8 2.8h10.8a2.8 2.8 0 0 0 2.8-2.8V13" />
    <path d="M18.3 3.3a2.1 2.1 0 0 1 3 3l-8.4 8.4-3.9 1 1-3.9z" />
  </svg>
);
export const FacebookCircle = (p: P) => (
  <svg {...base(p)}>
    <defs>
      <clipPath id="fbc"><circle cx="12" cy="12" r="10.5" /></clipPath>
    </defs>
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <path
      clipPath="url(#fbc)"
      fill="#fff"
      d="M13.6 23v-8.1h2.6l.45-3.1H13.6V9.9c0-.9.3-1.6 1.6-1.6h1.6V5.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8v3.1h2.6V23z"
    />
  </svg>
);
export const MetaAIRing = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const cols = ["#A33BFF", "#7B4DFF", "#4C6BFF", "#2D8CFF", "#3D7BFF", "#7A5CFF", "#C04BE8", "#E05AC8"];
      return (
        <ellipse
          key={i}
          cx={12 + Math.cos(a) * 7}
          cy={12 + Math.sin(a) * 7}
          rx="3.1"
          ry="2.2"
          fill={cols[i]}
          transform={`rotate(${(a * 180) / Math.PI + 90} ${12 + Math.cos(a) * 7} ${12 + Math.sin(a) * 7})`}
        />
      );
    })}
  </svg>
);
export const WaveIcon = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={2.2}>
    <path d="M5 10v4M9.7 6.5v11M14.3 8.5v7M19 10.5v3" />
  </svg>
);
export const VerifiedBadge = ({ size = 16 }: { size?: number }) => {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? 7.1 : 8;
    const a = (i / 24) * Math.PI * 2;
    return `${8 + Math.cos(a) * r},${8 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <polygon points={pts} fill="#0866FF" stroke="#0866FF" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
export const ChatsTabIcon = (p: P) => (
  <svg {...base(p)}>
    <path
      fill="currentColor"
      d="M12 2.5c-5.4 0-9.6 3.9-9.6 9.1 0 2.7 1.1 5.1 3 6.7.2.1.3.3.3.6l.1 1.8c0 .5.6.9 1.1.6l2-.9c.2-.1.4-.1.6 0 .8.2 1.7.4 2.6.4 5.4 0 9.6-3.9 9.6-9.1S17.4 2.5 12 2.5z"
    />
  </svg>
);
export const StoriesTabIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="3" width="12" height="18" rx="2.6" fill="currentColor" />
    <rect x="16.2" y="5" width="5.3" height="14" rx="2.2" fill="currentColor" />
  </svg>
);

// ---------- Messenger thread ----------
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="M15.2 4.2 7.4 12l7.8 7.8" {...stroke} strokeWidth={2.6} /></svg>
);
export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path
      fill="currentColor"
      d="M7.2 3.1c.6-.2 1.3.1 1.6.7l1.4 3.1c.3.6.1 1.3-.4 1.7L8.4 9.6c-.2.2-.3.5-.2.8.9 2.1 2.9 4.2 5.1 5.2.3.1.6 0 .8-.2l1.1-1.4c.4-.5 1.1-.7 1.7-.4l3.1 1.4c.6.3.9 1 .7 1.6l-.6 2.2c-.3 1-1.2 1.7-2.2 1.6C10 19.8 4.2 14 3.6 6.1c-.1-1 .6-1.9 1.6-2.2z"
    />
  </svg>
);
export const VideoIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="1.8" y="5.5" width="14" height="13" rx="3.4" fill="currentColor" />
    <path d="m17.2 10.6 3.6-2.6c.5-.4 1.3 0 1.3.7v6.6c0 .7-.8 1.1-1.3.7l-3.6-2.6z" fill="currentColor" />
  </svg>
);
export const PlusCircle = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="10.2" fill="currentColor" />
    <path d="M12 7.2v9.6M7.2 12h9.6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
export const CameraIcon = (p: P) => (
  <svg {...base(p)}>
    <path
      fill="currentColor"
      d="M9 3.6h6c.6 0 1.1.3 1.4.8l.9 1.5h2.2a2.9 2.9 0 0 1 2.9 2.9v8.9a2.9 2.9 0 0 1-2.9 2.9h-15a2.9 2.9 0 0 1-2.9-2.9V8.8a2.9 2.9 0 0 1 2.9-2.9h2.2l.9-1.5c.3-.5.8-.8 1.4-.8z"
    />
    <circle cx="12" cy="13" r="4.6" fill="#fff" />
    <circle cx="12" cy="13" r="3" fill="currentColor" />
  </svg>
);
export const GalleryIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.2" y="3.2" width="19.6" height="17.6" rx="3.6" fill="currentColor" />
    <rect x="4.2" y="5.2" width="15.6" height="13.6" rx="2" fill="#fff" />
    <circle cx="15.6" cy="9" r="1.7" fill="currentColor" />
    <path d="M4.6 18.4 9.2 12.3l3.1 3.6 2-2.2 4.9 4.7z" fill="currentColor" />
  </svg>
);
export const MicIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="8.2" y="2.2" width="7.6" height="12.6" rx="3.8" fill="currentColor" />
    <path d="M5 11.2a7 7 0 0 0 14 0M12 18.2v3.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);
export const SmileyIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="10.4" fill="currentColor" />
    <circle cx="8.6" cy="9.6" r="1.5" fill="#fff" />
    <circle cx="15.4" cy="9.6" r="1.5" fill="#fff" />
    <path d="M7.4 13.6a4.9 4.9 0 0 0 9.2 0z" fill="#fff" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
export const ThumbUpFilled = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M2.2 10.6a1.6 1.6 0 0 1 1.6-1.6h2.4v12.4H3.8a1.6 1.6 0 0 1-1.6-1.6z" />
    <path
      fill="currentColor"
      d="M7.8 9.5 12 2.6c.5-.8 1.6-1 2.4-.5.7.4 1 1.3.8 2.1L14.3 8.4h5.3c1.6 0 2.8 1.5 2.4 3.1l-1.8 7.6c-.3 1.3-1.4 2.2-2.8 2.2H7.8z"
    />
  </svg>
);
export const ReplyIcon = (p: P) => (
  <svg {...base(p)}><path d="M10 5 4 10.5l6 5.5v-3.6c5 0 8 1.4 10 5.1-.5-5.4-3.6-9-10-9.5z" fill="currentColor" /></svg>
);
export const ShareSquare = (p: P) => (
  <svg {...base(p)} {...stroke} strokeWidth={2}>
    <path d="M12 14.5V3.5M8 7.2l4-3.9 4 3.9M8.2 10.2H6.5a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h11a1.8 1.8 0 0 0 1.8-1.8V12a1.8 1.8 0 0 0-1.8-1.8h-1.7" />
  </svg>
);
