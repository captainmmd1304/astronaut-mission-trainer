'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface TourStep {
  /** matches data-tour="..." on an element; omit for a centred card */
  target?: string;
  title: string;
  body: string;
}

const PAD = 8;

export function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: 1200, h: 800 });
  const step = steps[i]!;
  const glide = useRef(false); // only animate between targets, never from the corner on first show
  const last = i === steps.length - 1;

  const measure = useCallback(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
    const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    const r = el ? el.getBoundingClientRect() : null;
    setRect(r);
    if (r) requestAnimationFrame(() => (glide.current = true));
  }, [step.target]);

  useLayoutEffect(() => {
    const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    el?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    measure();
    const t = setTimeout(measure, 250);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step.target, measure]);

  const next = useCallback(() => (last ? onClose() : setI((n) => n + 1)), [last, onClose]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, onClose]);

  // Card position: beside the target where there is room, else above or below, else centred.
  const W = Math.min(360, vp.w - 24);
  let style: React.CSSProperties = { left: (vp.w - W) / 2, top: Math.max(16, vp.h / 2 - 140), width: W };
  if (rect) {
    const roomRight = vp.w - rect.right;
    const roomLeft = rect.left;
    if (roomRight >= W + 28) style = { left: rect.right + 18, top: clamp(rect.top, 12, vp.h - 270), width: W };
    else if (roomLeft >= W + 28) style = { left: rect.left - W - 18, top: clamp(rect.top, 12, vp.h - 270), width: W };
    else if (vp.h - rect.bottom >= 250) style = { left: clamp(rect.left, 12, vp.w - W - 12), top: rect.bottom + 16, width: W };
    else style = { left: clamp(rect.left, 12, vp.w - W - 12), top: Math.max(12, rect.top - 250), width: W };
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="How to play">
      {rect ? (
        <div
          className={`pointer-events-none fixed rounded-2xl border-2 border-haze ${glide.current ? 'transition-all duration-300' : ''}`}
          style={{ left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: '0 0 0 9999px rgba(8,4,3,0.78), 0 0 30px 4px rgba(235,181,124,0.55)' }}
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(8,4,3,0.78)]" />
      )}
      <div key={i} className="panel rise fixed p-5" style={style}>
        <div className="flex items-center justify-between font-sans text-[13px] font-bold text-haze">
          <span>
            Tour · {i + 1} of {steps.length}
          </span>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-0.5 text-bone/70 hover:text-bone">
            Skip tour
          </button>
        </div>
        <h2 className="mt-2 font-sans text-[22px] font-extrabold leading-tight">{step.title}</h2>
        <p className="mt-2 text-[16.5px] leading-snug text-bone/90">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" disabled={i === 0} onClick={() => setI((n) => n - 1)} className="key key-quiet">
            Back
          </button>
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, k) => (
              <span key={k} className={`h-2 rounded-full transition-all ${k === i ? 'w-5 bg-ember' : 'w-2 bg-rust/60'}`} />
            ))}
          </div>
          <button type="button" onClick={next} className="key key-go !px-5 !py-2.5 !text-[16px]" autoFocus>
            {last ? 'Start playing' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const KEY = 'amt.tour.v1';
export const tourSeen = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
export const markTourSeen = () => {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
};
