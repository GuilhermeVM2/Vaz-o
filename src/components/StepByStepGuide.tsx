import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  computeFlowMetrics,
  formatBR,
  formatIntBR,
} from '../utils/mathFormat';

interface StepByStepGuideProps {
  volumeM3: number;
  timeMin: number;
}

export function StepByStepGuide({ volumeM3, timeMin }: StepByStepGuideProps) {
  const metrics = computeFlowMetrics(volumeM3, timeMin);
  const [activeStep, setActiveStep] = useState<number>(3);

  const steps = [
    {
      num: 1,
      title: 'Transformar o volume do tanque para litros (L)',
      rule: '1 m³ = 1.000 litros',
      explanation:
        'O exercício pede a resposta em litros por segundo (L/s), mas o tanque está em metros cúbicos (m³). Multiplicamos por 1.000.',
      formula: `Volume (V) = ${formatIntBR(volumeM3)} × 1.000`,
      result: `${formatIntBR(metrics.volumeL)} litros`,
    },
    {
      num: 2,
      title: 'Transformar o tempo de minutos para segundos (s)',
      rule: '1 minuto = 60 segundos',
      explanation:
        'O tempo foi dado em minutos, mas queremos saber quantos litros saem a cada 1 segundo. Multiplicamos por 60.',
      formula: `Tempo (t) = ${formatIntBR(timeMin)} × 60`,
      result: `${formatIntBR(metrics.timeS)} segundos`,
    },
    {
      num: 3,
      title: 'Dividir o volume total pelo tempo total',
      rule: 'Fórmula: Q = V ÷ t',
      explanation:
        'Com tudo em litros e segundos, dividimos toda a água pelo tempo total gasto para encher o tanque.',
      formula: `Q = ${formatIntBR(metrics.volumeL)} ÷ ${formatIntBR(metrics.timeS)}`,
      result: `${formatBR(metrics.flowLS, 2)} L/s`,
    },
  ];

  return (
    <section id="passos" className="scroll-mt-24 space-y-10">
      {/* Section Header + Step Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">02. Resolvendo em 3 passos curtos e limpos</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Do metro cúbico até litros por segundo
          </h2>
        </div>

        <div className="flex items-center gap-1 self-start rounded-lg bg-slate-100 p-1">
          {[1, 2, 3].map((stepNum) => (
            <button
              key={stepNum}
              type="button"
              onClick={() => setActiveStep(stepNum)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeStep === stepNum
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Passo {stepNum}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {steps.map((step) => {
          const isUnlocked = step.num <= activeStep;
          const isCurrent = step.num === activeStep;
          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(step.num);
                }
              }}
              className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-6 transition-all ${
                isCurrent
                  ? 'border-sky-500 bg-white ring-1 ring-sky-500/20'
                  : isUnlocked
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-sky-700">Passo {step.num}</span>
                  <span className="font-mono">{step.rule}</span>
                </div>

                <h3 className="mt-2.5 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.explanation}</p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="font-mono text-xs tabular-nums text-slate-500">{step.formula}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-xl font-bold tabular-nums text-slate-900">
                    = {step.result}
                  </span>
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Pronto
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step navigation helper */}
      {activeStep < 3 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.min(3, s + 1))}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Avançar para o Passo {activeStep + 1}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Quadro resumo para enxergar tudo de uma vez */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-700">03. Quadro resumo</p>
            <h3 className="mt-0.5 text-xl font-bold text-slate-900">
              Para enxergar tudo de uma vez
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Atualizado automaticamente conforme os controles do simulador
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">O que estamos medindo</th>
                <th className="px-4 py-3">Valor original</th>
                <th className="py-3 pl-4">Valor convertido / calculado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">Volume do tanque (V)</td>
                <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                  {formatIntBR(volumeM3)} m³
                </td>
                <td className="py-3.5 pl-4 font-mono font-semibold tabular-nums text-slate-900">
                  {formatIntBR(metrics.volumeL)} litros
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">Tempo para encher (t)</td>
                <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                  {formatIntBR(timeMin)} minutos
                </td>
                <td className="py-3.5 pl-4 font-mono font-semibold tabular-nums text-slate-900">
                  {formatIntBR(metrics.timeS)} segundos
                </td>
              </tr>
              <tr className="bg-sky-50/50">
                <td className="py-3.5 pr-4 font-semibold text-sky-900">Vazão volumétrica (Q)</td>
                <td className="px-4 py-3.5 font-mono tabular-nums text-sky-800">
                  {formatBR(metrics.flowM3Min, 3)} m³/min
                </td>
                <td className="py-3.5 pl-4 font-mono font-bold tabular-nums text-sky-900">
                  {formatBR(metrics.flowLS, 2)} L/s{' '}
                  <span className="font-normal text-sky-700">
                    (ou {formatBR(metrics.flowLMin, 1)} litros por minuto)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
