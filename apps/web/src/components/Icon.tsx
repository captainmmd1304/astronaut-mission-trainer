import type { ReactNode } from 'react';

const P: Record<string, ReactNode> = {
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M21 10v4M8 10l-1 4h3l-1 3" />
    </>
  ),
  air: <path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7" />,
  water: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  food: <path d="M12 21V9M12 9c0-3 2-5 5-5 0 3-2 5-5 5zM12 13c0-3-2-5-5-5 0 3 2 5 5 5zM12 17c0-2.5 1.8-4 4.5-4 0 2.5-1.8 4-4.5 4z" />,
  rad: (
    <>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 4a8 8 0 0 1 6.9 4l-4.4 2.6M18.9 16a8 8 0 0 1-13.8 0l4.4-2.6M5.1 8A8 8 0 0 1 12 4v5" />
    </>
  ),
  dust: <path d="M4 8h9a2.5 2.5 0 1 0-2.5-2.5M3 13h14a2.5 2.5 0 1 1-2.5 2.5M6 18h6M16 8h4M2 18h2" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />,
  shield: <path d="M12 3l7 3v5c0 5-3 8.500-7 10-4-1.500-7-5-7-10V6z" />,
  leaf: <path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8" />,
  signal: (
    <>
      <circle cx="12" cy="17" r="1.4" />
      <path d="M8 13a5.600 5.600 0 0 1 8 0M5 10a9.500 9.500 0 0 1 14 0" />
    </>
  ),
  suit: (
    <>
      <circle cx="12" cy="7" r="3.200" />
      <path d="M6 21v-5a6 6 0 0 1 12 0v5M9 21v-4M15 21v-4" />
    </>
  ),
  tools: <path d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9zM6 4l4 4M4 6l4 4" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .900-1 1.700M12 17v.1" />
    </>
  ),
  play: <path d="M7 4l13 8-13 8z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};

export function Icon({ name, size = 20, className = '' }: { name: keyof typeof P | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {P[name]}
    </svg>
  );
}
