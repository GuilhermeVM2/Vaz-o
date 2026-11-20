import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import {
  computeFlowMetrics,
  describeBottleComparison,
  formatBR,
  formatIntBR,
  formatMinutesToHours,
} from '../utils/mathFormat';

interface HydraulicSimulatorProps {
  volumeM3: number;
  timeMin: number;
  onVolumeChange: (val: number) => void;
  onTimeChange: (val: number) => void;
  onResetDefault: () => void;
}

const SPEED_OPTIONS = [
  { label: '1× (Real)', value: 1 },
  { label: '60× (1 min/s)', value: 60 },
  { label: '3000× (Rápido)', value: 3000 },
];

export function HydraulicSimulator({
  volumeM3,
  timeMin,
  onVolumeChange,
  onTimeChange,
  onResetDefault,
}: HydraulicSimulatorProps) {
  const metrics = computeFlowMetrics(volumeM3, timeMin);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(3000);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setElapsedSeconds((prev) => Math.min(prev, metrics.timeS));
  }, [metrics.timeS]);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let frameId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current !== null) {
        const dt = (now - lastFrameRef.current) / 1000;
        setElapsedSeconds((prev) => {
          const next = prev + dt * speed;
          if (next >= metrics.timeS) {
            return 0;
          }
          return next;
        });
      }
      lastFrameRef.current = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, speed, metrics.timeS]);

  const progress = Math.min(1, metrics.timeS > 0 ? elapsedSeconds / metrics.timeS : 0);
  const currentLiters = progress * metrics.volumeL;
  const currentMinutes = elapsedSeconds / 60;

  // For the 1-second bottle visualizer: show how much water exits in 1 second relative to a 500 mL bottle
  const bottleCountDisplay = Math.min(3, Math.max(1, Math.ceil(metrics.flowMLs / 500)));
  const isDefaultProblem = volumeM3 === 18 && timeMin === 500;

  // Grid cells representing 1.000 L water tanks (up to 36 visible cells, or grouped)
  const totalBoxes = Math.round(volumeM3);
  const filledBoxesExact = progress * totalBoxes;
  const cols = totalBoxes <= 12 ? 4 : totalBoxes <= 24 ? 6 : 8;

  const handleRestart = () => {
    setElapsedSeconds(0);
    setIsPlaying(true);
  };

  return (
    <section id="simulador" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">
            01. Traduzindo o problema para a vida real
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Quantos litros saem da mangueira a cada segundo?
          </h1>
          <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-slate-600">
            Imagine uma mangueira enchendo um reservatório de{' '}
            <strong className="font-semibold text-slate-900">{formatIntBR(volumeM3)} m³</strong>{' '}
            ({formatIntBR(volumeM3)} caixas d’água de 1.000 litros juntas ={' '}
            <strong className="font-semibold text-slate-900">
              {formatIntBR(metrics.volumeL)} litros
            </strong>
            ) durante{' '}
            <strong className="font-semibold text-slate-900">
              {formatIntBR(timeMin)} minutos
            </strong>{' '}
            ({formatMinutesToHours(timeMin)}).
          </p>
        </div>

        {!isDefaultProblem && (
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              setElapsedSeconds(0);
            }}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            Voltar ao exemplo da aula (18 m³ · 500 min)
          </button>
        )}
      </div>

      {/* Two-Zone Sandbox Layout: Left Interactive Stage (65%) + Right Control Deck (35%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left Zone: Interactive Hydraulic Stage */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Simulação do reservatório</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="font-mono tabular-nums">
                {formatIntBR(currentLiters)} / {formatIntBR(metrics.volumeL)} L
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {formatBR(currentMinutes, 0)} / {formatIntBR(timeMin)} min
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap shrink-0"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? 'Pausar' : 'Continuar'}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                aria-label="Reiniciar simulação"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Visual Stage: Hose + 18 Modular 1.000L Tanks + 1-Second Bottle Meter */}
          <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            {/* Reservoir composed of 1 m³ (1.000 L) boxes */}
            <div className="md:col-span-7">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Cada bloco = 1 caixa d’água de <strong className="text-slate-700">1.000 L</strong>{' '}
                  (1 m³)
                </span>
                <span className="font-mono tabular-nums font-medium text-sky-700">
                  {formatBR(progress * 100, 0)}% cheio
                </span>
              </div>

              {/* Hose pouring into the reservoir */}
              <div className="relative mb-2 flex items-center">
                <svg
                  viewBox="0 0 320 46"
                  className="h-11 w-full overflow-visible"
                  role="img"
                  aria-label="Mangueira despejando água no reservatório"
                >
                  {/* Hose pipe */}
                  <path
                    d="M 0 18 L 145 18 Q 160 18 160 32 L 160 38"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Brass nozzle */}
                  <rect x="152" y="32" width="16" height="8" rx="2" fill="#D97706" />
                  {/* Animated water stream */}
                  <line
                    x1="160"
                    y1="40"
                    x2="160"
                    y2="56"
                    stroke="#0284C7"
                    strokeWidth={Math.min(10, Math.max(3, metrics.flowLS * 6))}
                    strokeDasharray="6 6"
                    className={isPlaying ? 'animate-water-flow' : ''}
                  />
                  {/* Label on hose */}
                  <text
                    x="12"
                    y="10"
                    className="fill-slate-500 text-[10px] font-medium"
                  >
                    Mangueira ({formatBR(metrics.flowLS, 2)} L/s)
                  </text>
                </svg>
              </div>

              {/* Tank Frame */}
              <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-3">
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: totalBoxes }).map((_, idx) => {
                    // Fill bottom-to-top visually by reversing row fill order
                    const reverseIdx = totalBoxes - 1 - idx;
                    const boxFill = Math.max(0, Math.min(1, filledBoxesExact - reverseIdx));
                    return (
                      <div
                        key={idx}
                        className="relative h-10 overflow-hidden rounded-md border border-slate-200 bg-white"
                        title={`Caixa ${reverseIdx + 1}: 1.000 litros`}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 bg-sky-500/85 transition-transform duration-150"
                          style={{
                            height: '100%',
                            transform: `scaleY(${boxFill})`,
                            transformOrigin: 'bottom',
                          }}
                        />
                        <span
                          className={`relative z-10 flex h-full items-center justify-center font-mono text-[10px] tabular-nums font-medium ${
                            boxFill > 0.55 ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          1m³
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                <span>Total: {formatIntBR(volumeM3)} caixas de 1.000 L</span>
                <span className="font-mono tabular-nums">
                  {formatIntBR(metrics.volumeL)} L no reservatório
                </span>
              </div>
            </div>

            {/* 1-Second Practical Comparison: 500 mL Water Bottle(s) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-5">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Na prática: a cada 1 segundo
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-sky-700">
                  {formatBR(metrics.flowLS, 2)} L/s{' '}
                  <span className="text-sm font-normal text-slate-500">
                    ({formatIntBR(metrics.flowMLs)} mL/s)
                  </span>
                </p>
              </div>

              {/* Visual 500 mL bottles */}
              <div className="my-5 flex items-end justify-center gap-3">
                {Array.from({ length: bottleCountDisplay }).map((_, bIdx) => {
                  const mlInThisBottle = Math.max(
                    0,
                    Math.min(500, metrics.flowMLs - bIdx * 500)
                  );
                  const fillPct = (mlInThisBottle / 500) * 100;
                  return (
                    <div key={bIdx} className="flex flex-col items-center">
                      <svg
                        viewBox="0 0 56 108"
                        className="h-24 w-12"
                        role="img"
                        aria-label={`Garrafinha de 500 mL com ${Math.round(mlInThisBottle)} mL`}
                      >
                        <defs>
                          <clipPath id={`bottle-clip-${bIdx}`}>
                            <path d="M18 16 L38 16 L46 30 L46 98 Q46 104 40 104 L16 104 Q10 104 10 98 L10 30 Z" />
                          </clipPath>
                        </defs>
                        {/* Cap */}
                        <rect x="20" y="2" width="16" height="8" rx="2" fill="#0284C7" />
                        {/* Neck */}
                        <rect x="21" y="10" width="14" height="7" fill="#E2E8F0" />
                        {/* Bottle body background */}
                        <path
                          d="M18 16 L38 16 L46 30 L46 98 Q46 104 40 104 L16 104 Q10 104 10 98 L10 30 Z"
                          fill="#FFFFFF"
                          stroke="#94A3B8"
                          strokeWidth="2"
                        />
                        {/* Water fill */}
                        <g clipPath={`url(#bottle-clip-${bIdx})`}>
                          <rect
                            x="8"
                            y={104 - (fillPct / 100) * 88}
                            width="40"
                            height={(fillPct / 100) * 88}
                            fill="#0EA5E9"
                            fillOpacity="0.85"
                          />
                        </g>
                        {/* 500 mL tick line */}
                        <line
                          x1="14"
                          y1="32"
                          x2="42"
                          y2="32"
                          stroke="#64748B"
                          strokeDasharray="2 2"
                          strokeWidth="1"
                        />
                      </svg>
                      <span className="mt-1 font-mono text-[11px] tabular-nums text-slate-600">
                        {Math.round(mlInThisBottle)} mL
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {describeBottleComparison(metrics.flowMLs)}
              </p>
            </div>
          </div>

          {/* Speed selector bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="text-xs font-medium text-slate-500">Velocidade da simulação</span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpeed(opt.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    speed === opt.value
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Zone: Control & Concept Deck */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Ajuste os dados do problema
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Arraste os controles para ver como o volume e o tempo mudam a vazão da mangueira.
              </p>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="volume-slider" className="text-sm font-medium text-slate-700">
                  Volume do tanque (V)
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                  {formatIntBR(volumeM3)} m³
                </span>
              </div>
              <input
                id="volume-slider"
                type="range"
                min={2}
                max={36}
                step={1}
                value={volumeM3}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-sky-600"
              />
              <div className="flex justify-between font-mono text-xs tabular-nums text-slate-500">
                <span>2 m³</span>
                <span className="text-sky-700">= {formatIntBR(metrics.volumeL)} litros</span>
                <span>36 m³</span>
              </div>
            </div>

            {/* Time Slider */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="time-slider" className="text-sm font-medium text-slate-700">
                  Tempo para encher (t)
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                  {formatIntBR(timeMin)} min
                </span>
              </div>
              <input
                id="time-slider"
                type="range"
                min={50}
                max={1000}
                step={50}
                value={timeMin}
                onChange={(e) => onTimeChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-sky-600"
              />
              <div className="flex justify-between font-mono text-xs tabular-nums text-slate-500">
                <span>50 min</span>
                <span className="text-amber-700">
                  {formatMinutesToHours(timeMin)} ({formatIntBR(metrics.timeS)} s)
                </span>
                <span>1.000 min</span>
              </div>
            </div>
          </div>

          {/* Live Formula Result Readout */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-medium text-slate-500">Vazão volumétrica calculada</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                {formatBR(metrics.flowLS, 2)} L/s
              </span>
              <span className="font-mono text-sm tabular-nums text-slate-500">
                ou {formatBR(metrics.flowLMin, 1)} L/min
              </span>
            </div>
            <p className="mt-2 font-mono text-xs tabular-nums text-slate-500">
              Q = {formatIntBR(metrics.volumeL)} L ÷ {formatIntBR(metrics.timeS)} s
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
