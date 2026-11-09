'use client';
import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';

const PlanetCanvas = dynamic(() => import('@/three/PlanetCanvas'), { ssr: false });

class Safe extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** The 3D Mars-and-Earth hero. Falls back to a plain dark sky if WebGL is unavailable. */
export function PlanetStage({ offsetX = 0, dive = false, className = '' }: { offsetX?: number; dive?: boolean; className?: string }) {
  return (
    <div className={`isolate overflow-hidden bg-[#0b0605] ${className || 'absolute inset-0'}`}>
      <Safe>
        <PlanetCanvas offsetX={offsetX} dive={dive} />
      </Safe>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(11,6,5,0.75))]" />
    </div>
  );
}
