'use client';
import dynamic from 'next/dynamic';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SimState } from '@amt/sim';
import { atmosphere } from '@/game/atmosphere';
import type { Live, Look } from '@/three/Scene';
import { RockFrame } from './RockFrame';
import { Sky } from './Sky';

const OutpostCanvas = dynamic(() => import('@/three/OutpostCanvas'), { ssr: false });

/** If WebGL is missing or crashes, the CSS sky and rock frame still render. */
class Safe extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const DEFAULT_LOOK: Look = { seed: 101, baseColor: '#b5603a', rockDensity: 0.5, roughness: 0.5 };

export function Viewport({
  sim,
  look = DEFAULT_LOOK,
  frame = true,
  side = 'center',
  className = '',
}: {
  sim: SimState | null;
  look?: Look;
  frame?: boolean;
  /** Where the opening sits. The landing and select screens push it right to leave room for text. */
  side?: 'center' | 'right';
  className?: string;
}) {
  const atmo = useMemo(() => atmosphere(sim), [sim]);
  const live = useRef<Live>({ atmo, panelDust: 0, greenhouse: 1, link: true });
  live.current = { atmo, panelDust: sim?.power.panelDust ?? 0.04, greenhouse: sim?.power.powered.greenhouse ?? 1, link: sim?.comms.linkUp ?? true };

  const [calm, setCalm] = useState(false);
  useEffect(() => {
    setCalm(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <div className={`isolate overflow-hidden bg-night ${className || 'relative'}`}>
      <Sky atmo={atmo} />
      <Safe>
        <OutpostCanvas look={look} live={live} drift={!calm} shift={side === 'right' ? -13 : 0} />
      </Safe>
      {frame && <RockFrame side={side} />}
    </div>
  );
}
