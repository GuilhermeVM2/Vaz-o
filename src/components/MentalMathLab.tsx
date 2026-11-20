import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, Scissors, Divide, Equal } from 'lucide-react';
import { computeFlowMetrics, formatBR, formatIntBR } from '../utils/mathFormat';

interface MentalMathLabProps {
  volumeM3: number;
  timeMin: number;
}

function splitTrailingZeros(num: number, zerosToSplit: number): { prefix: string; zeros: string } {
  const raw = String(num);
  if (zerosToSplit <= 0 || zerosToSplit >= raw.length) {
    return { prefix: formatIntBR(num), zeros: '' };
  }
  const prefixNum = Number(raw.slice(0, raw.length - zerosToSplit));
  const zerosStr = raw.slice(raw.length - zerosToSplit);
  // Format with Brazilian dot separator if 3 zeros were split off
  return {
    prefix: formatIntBR(prefixNum),
    zeros: zerosToSplit === 3 ? `.${zerosStr}` : zerosStr,
  };
}

export function MentalMathLab({ volumeM3, timeMin }: MentalMathLabProps) {
  const metrics = computeFlowMetrics(volumeM3, timeMin);
  // stage: 0 = original big numbers, 1 = zeros crossed out, 2 = simplified fraction, 3 = final decimal
  const [stage, setStage] = useState<number>(0);
  const [proofStep, setProofStep] = useState<number>(2);

  useEffect(() => {
    setStage(0);
  }, [volumeM3, timeMin]);

  const numParts = splitTrailingZeros(metrics.volumeL, metrics.commonZeros);
  const denParts = splitTrailingZeros(metrics.timeS, metrics.commonZeros);

  const canCutZeros = metrics.commonZeros > 0;
  const canSimplify = metrics.divisor > 1;

  const handleAdvance = () => {
    if (stage === 0) {
      if (canCutZeros) {
        setStage(1);
      } else if (canSimplify) {
        setStage(2);
      } else {
        setStage(3);
      }
    } else if (stage === 1) {
      if (canSimplify) {
        setStage(2);
      } else {
        setStage(3);
      }
    } else if (stage === 2) {
      setStage(3);
    } else {
      setStage(0);
    }
  };

  return (
    <section id="atalho" className="scroll-mt-24 space-y-6">
      <div>
        <p className="text-sm font-medium text-sky-700">04. O “pulo do gato”</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Como fazer de cabeça e conferir a resposta
        </h2>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          Na hora de dividir números grandes como{' '}
          <span className="font-mono font-medium text-slate-900">
            {formatIntBR(metrics.volumeL)} ÷ {formatIntBR(metrics.timeS)}
          </span>
          , não se assuste. Clique nos passos abaixo para simplificar a fração até ela ficar fácil
          de resolver de cabeça.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Interactive Simplification Stage */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Simplificação interativa
              </h3>
              <button
                type="button"
                onClick={() => setStage(0)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Recomeçar corte
              </button>
            </div>

            {/* Interactive Fraction Canvas */}
            <div className="my-6 flex flex-wrap items-center justify-center gap-6 rounded-xl bg-slate-50 px-6 py-8">
              {/* Stage 0 / 1: Original with slashable zeros */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
                  {numParts.prefix}
                  {numParts.zeros && (
                    <span
                      className={`transition-all duration-200 ${
                        stage >= 1
                          ? 'text-rose-500 line-through decoration-2 decoration-rose-500'
                          : 'text-slate-900'
                      }`}
                    >
                      {numParts.zeros}
                    </span>
                  )}
                </span>
                <div className="my-2 h-0.5 w-full min-w-[96px] bg-slate-400" />
                <span className="font-mono text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
                  {denParts.prefix}
                  {denParts.zeros && (
                    <span
                      className={`transition-all duration-200 ${
                        stage >= 1
                          ? 'text-rose-500 line-through decoration-2 decoration-rose-500'
                          : 'text-slate-900'
                      }`}
                    >
                      {denParts.zeros}
                    </span>
                  )}
                </span>
              </div>

              {/* After zero cancellation */}
              {stage >= 1 && canCutZeros && (
                <>
                  <span className="font-mono text-2xl text-slate-400">=</span>
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-2xl font-semibold tabular-nums text-sky-700 sm:text-3xl">
                      {formatIntBR(metrics.afterZerosNum)}
                    </span>
                    <div className="my-2 h-0.5 w-full min-w-[56px] bg-sky-300" />
                    <span className="font-mono text-2xl font-semibold tabular-nums text-sky-700 sm:text-3xl">
                      {formatIntBR(metrics.afterZerosDen)}
                    </span>
                  </div>
                </>
              )}

              {/* After GCD simplification */}
              {stage >= 2 && canSimplify && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[11px] font-medium text-amber-700">
                      ÷ {formatIntBR(metrics.divisor)}
                    </span>
                    <span className="font-mono text-2xl text-slate-400">=</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-2xl font-bold tabular-nums text-amber-700 sm:text-3xl">
                      {formatIntBR(metrics.simplifiedNum)}
                    </span>
                    <div className="my-2 h-0.5 w-full min-w-[44px] bg-amber-300" />
                    <span className="font-mono text-2xl font-bold tabular-nums text-amber-700 sm:text-3xl">
                      {formatIntBR(metrics.simplifiedDen)}
                    </span>
                  </div>
                </>
              )}

              {/* Final result */}
              {stage >= 3 && (
                <>
                  <span className="font-mono text-2xl text-slate-400">=</span>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
                    <span className="font-mono text-2xl font-bold tabular-nums text-emerald-800 sm:text-3xl">
                      {formatBR(metrics.flowLS, 2)} L/s
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Step-by-step explanation list */}
            <ol className="space-y-2.5 text-sm">
              <li
                className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${
                  stage === 1 ? 'bg-sky-50 text-slate-900' : 'text-slate-600'
                }`}
              >
                <span className="font-mono text-xs font-semibold text-sky-700">1.</span>
                <span>
                  <strong className="font-semibold text-slate-900">Corte os zeros iguais:</strong>{' '}
                  {canCutZeros
                    ? `corte ${metrics.commonZeros} ${
                        metrics.commonZeros === 1 ? 'zero' : 'zeros'
                      } de cima com ${metrics.commonZeros} de baixo. A conta vira ${formatIntBR(
                        metrics.afterZerosNum
                      )} ÷ ${formatIntBR(metrics.afterZerosDen)}.`
                    : 'Não há zeros iguais no final para cortar neste caso.'}
                </span>
              </li>

              <li
                className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${
                  stage === 2 ? 'bg-amber-50 text-slate-900' : 'text-slate-600'
                }`}
              >
                <span className="font-mono text-xs font-semibold text-amber-700">2.</span>
                <span>
                  <strong className="font-semibold text-slate-900">Simplifique a fração:</strong>{' '}
                  {canSimplify
                    ? `dividindo os dois números por ${formatIntBR(
                        metrics.divisor
                      )}, sobra apenas ${formatIntBR(metrics.simplifiedNum)} ÷ ${formatIntBR(
                        metrics.simplifiedDen
                      )}.`
                    : 'A fração já está na forma mais simples possível.'}
                </span>
              </li>

              <li
                className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${
                  stage === 3 ? 'bg-emerald-50 text-slate-900' : 'text-slate-600'
                }`}
              >
                <span className="font-mono text-xs font-semibold text-emerald-700">3.</span>
                <span>
                  <strong className="font-semibold text-slate-900">Divida fácil:</strong>{' '}
                  {formatIntBR(metrics.simplifiedNum)} dividido por{' '}
                  {formatIntBR(metrics.simplifiedDen)} dá{' '}
                  <strong className="font-mono text-emerald-800">
                    {formatBR(metrics.flowLS, 2)} L/s
                  </strong>
                  , sem sofrer com número gigante.
                </span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleAdvance}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap shrink-0"
            >
              {stage === 0 && canCutZeros && (
                <>
                  <Scissors className="h-4 w-4" />
                  Cortar os {metrics.commonZeros} zeros iguais
                </>
              )}
              {((stage === 0 && !canCutZeros) || stage === 1) && canSimplify && (
                <>
                  <Divide className="h-4 w-4" />
                  Simplificar por {formatIntBR(metrics.divisor)}
                </>
              )}
              {(stage === 2 ||
                (stage === 1 && !canSimplify) ||
                (stage === 0 && !canCutZeros && !canSimplify)) && (
                <>
                  <Equal className="h-4 w-4" />
                  Ver resultado final
                </>
              )}
              {stage === 3 && (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Repetir passo a passo
                </>
              )}
            </button>

            {stage < 3 && (
              <button
                type="button"
                onClick={() => setStage(3)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                Mostrar tudo
              </button>
            )}
          </div>
        </div>

        {/* Right: Interactive Prova Real */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Prova real (caminho de volta)
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Conferência
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Para ter certeza de que o cálculo está certo, faça o caminho contrário: parta da vazão
              por segundo e veja se chega de volta ao volume original do tanque.
            </p>

            <div className="mt-5 space-y-4">
              {/* Step A: Per minute */}
              <div
                onClick={() => setProofStep(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setProofStep(1);
                  }
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  proofStep >= 1
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-medium text-slate-500">
                  1. Quanto sai em 1 minuto (60 segundos)?
                </p>
                <p className="mt-1.5 font-mono text-base font-semibold tabular-nums text-slate-900">
                  {formatBR(metrics.flowLS, 2)} L/s × 60 s ={' '}
                  <span className="text-sky-700">{formatBR(metrics.flowLMin, 1)} L/min</span>
                </p>
              </div>

              {/* Step B: Total time */}
              <div
                onClick={() => setProofStep(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setProofStep(2);
                  }
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  proofStep >= 2
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-medium text-slate-600">
                  2. E em {formatIntBR(timeMin)} minutos inteiros?
                </p>
                <p className="mt-1.5 font-mono text-base font-semibold tabular-nums text-slate-900">
                  {formatBR(metrics.flowLMin, 1)} × {formatIntBR(timeMin)} ={' '}
                  <span className="text-emerald-800">{formatIntBR(metrics.volumeL)} litros</span>
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Igual a {formatIntBR(volumeM3)} m³ — bateu exato!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
            Dica de ouro: sempre que o resultado da prova real devolver exatamente os{' '}
            <strong className="font-semibold text-slate-700">{formatIntBR(volumeM3)} m³</strong>{' '}
            do enunciado, você tem 100% de certeza de que acertou a questão.
          </div>
        </div>
      </div>
    </section>
  );
}
