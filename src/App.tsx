/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HydraulicSimulator } from './components/HydraulicSimulator';
import { StepByStepGuide } from './components/StepByStepGuide';
import { MentalMathLab } from './components/MentalMathLab';
import { PracticeArena } from './components/PracticeArena';

export default function App() {
  const [volumeM3, setVolumeM3] = useState<number>(18);
  const [timeMin, setTimeMin] = useState<number>(500);

  const handleResetDefault = () => {
    setVolumeM3(18);
    setTimeMin(500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#simulador"
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            VazãoLab
          </a>

          {/* Zone 2: 4 clean single-line navigation links */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          >
            <a
              href="#simulador"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Simulador
            </a>
            <a
              href="#passos"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              3 Passos
            </a>
            <a
              href="#atalho"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Pulo do Gato
            </a>
            <a
              href="#praticar"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Praticar
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <a
              href="#praticar"
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap shrink-0"
            >
              Praticar Agora
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6 sm:py-12">
        <HydraulicSimulator
          volumeM3={volumeM3}
          timeMin={timeMin}
          onVolumeChange={setVolumeM3}
          onTimeChange={setTimeMin}
          onResetDefault={handleResetDefault}
        />

        <div className="border-t border-slate-200/80" />

        <StepByStepGuide volumeM3={volumeM3} timeMin={timeMin} />

        <div className="border-t border-slate-200/80" />

        <MentalMathLab volumeM3={volumeM3} timeMin={timeMin} />

        <div className="border-t border-slate-200/80" />

        <PracticeArena />
      </main>

      {/* Quiet Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <span>VazãoLab · Guia interativo de vazão volumétrica (Q = V ÷ t)</span>
          <span>1 m³ = 1.000 litros · 1 minuto = 60 segundos</span>
        </div>
      </footer>
    </div>
  );
}
