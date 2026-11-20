import { useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, XCircle, ArrowRight } from 'lucide-react';
import {
  PRACTICE_PROBLEMS,
  computeFlowMetrics,
  formatBR,
  formatIntBR,
  parseBrazilianNumber,
} from '../utils/mathFormat';

interface FieldValidation {
  status: 'idle' | 'correct' | 'wrong';
  message: string;
}

export function PracticeArena() {
  const [problemIdx, setProblemIdx] = useState(0);
  const [volumeInput, setVolumeInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [flowInput, setFlowInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const [vState, setVState] = useState<FieldValidation>({ status: 'idle', message: '' });
  const [tState, setTState] = useState<FieldValidation>({ status: 'idle', message: '' });
  const [qState, setQState] = useState<FieldValidation>({ status: 'idle', message: '' });

  const problem = PRACTICE_PROBLEMS[problemIdx];
  const expected = computeFlowMetrics(problem.volumeM3, problem.timeMin);

  const selectProblem = (index: number) => {
    setProblemIdx(index);
    setVolumeInput('');
    setTimeInput('');
    setFlowInput('');
    setShowHint(false);
    setVState({ status: 'idle', message: '' });
    setTState({ status: 'idle', message: '' });
    setQState({ status: 'idle', message: '' });
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedV = parseBrazilianNumber(volumeInput);
    const parsedT = parseBrazilianNumber(timeInput);
    const parsedQ = parseBrazilianNumber(flowInput);

    const isVCorrect = parsedV !== null && Math.abs(parsedV - expected.volumeL) < 0.01;
    const isTCorrect = parsedT !== null && Math.abs(parsedT - expected.timeS) < 0.01;
    const isQCorrect = parsedQ !== null && Math.abs(parsedQ - expected.flowLS) < 0.015;

    setVState(
      isVCorrect
        ? { status: 'correct', message: `Correto: ${formatIntBR(expected.volumeL)} litros.` }
        : {
            status: 'wrong',
            message: `Multiplique ${problem.volumeM3} m³ por 1.000 para converter em litros.`,
          }
    );

    setTState(
      isTCorrect
        ? { status: 'correct', message: `Correto: ${formatIntBR(expected.timeS)} segundos.` }
        : {
            status: 'wrong',
            message: `Multiplique ${problem.timeMin} minutos por 60 para converter em segundos.`,
          }
    );

    setQState(
      isQCorrect
        ? {
            status: 'correct',
            message: `Correto: ${formatBR(expected.flowLS, 2)} L/s (${formatIntBR(
              expected.flowMLs
            )} mL/s).`,
          }
        : {
            status: 'wrong',
            message: `Divida o volume em litros pelo tempo em segundos (Q = V ÷ t).`,
          }
    );

    if (isVCorrect && isTCorrect && isQCorrect) {
      setSolvedIds((prev) => (prev.includes(problem.id) ? prev : [...prev, problem.id]));
    }
  };

  const handleFillSolution = () => {
    setVolumeInput(formatIntBR(expected.volumeL));
    setTimeInput(formatIntBR(expected.timeS));
    setFlowInput(formatBR(expected.flowLS, 2));
    setVState({ status: 'correct', message: `Correto: ${formatIntBR(expected.volumeL)} litros.` });
    setTState({ status: 'correct', message: `Correto: ${formatIntBR(expected.timeS)} segundos.` });
    setQState({
      status: 'correct',
      message: `Correto: ${formatBR(expected.flowLS, 2)} L/s (${formatIntBR(
        expected.flowMLs
      )} mL/s).`,
    });
  };

  const allCorrect =
    vState.status === 'correct' && tState.status === 'correct' && qState.status === 'correct';

  return (
    <section id="praticar" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">05. Prática guiada</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Agora é a sua vez de resolver
          </h2>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Resolva os 5 desafios seguindo os mesmos 3 passos. Você pode usar vírgula ou ponto nos
            decimais (ex.: <span className="font-mono text-slate-900">0,6</span>).
          </p>
        </div>

        <div className="text-sm text-slate-600">
          <span className="font-mono font-semibold tabular-nums text-slate-900">
            {solvedIds.length}/{PRACTICE_PROBLEMS.length}
          </span>{' '}
          desafios concluídos
        </div>
      </div>

      {/* Problem Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5">
        {PRACTICE_PROBLEMS.map((item, idx) => {
          const isSolved = solvedIds.includes(item.id);
          const isActive = idx === problemIdx;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectProblem(idx)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isSolved && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              <span>
                {idx + 1}. {item.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Exercise Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Desafio {problemIdx + 1} de {PRACTICE_PROBLEMS.length}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{problem.volumeM3} m³</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{problem.timeMin} min</span>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-slate-900">{problem.title}</h3>
            <p className="mt-1.5 max-w-3xl text-base leading-relaxed text-slate-700">
              {problem.context}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-sky-600" />
            {showHint ? 'Esconder dica' : 'Dica (pulo do gato)'}
          </button>
        </div>

        {showHint && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
            <strong className="font-semibold">Dica:</strong> {problem.hint}
          </div>
        )}

        <form onSubmit={handleCheck} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Input 1: Volume in Liters */}
            <div className="space-y-2">
              <label htmlFor="input-volume" className="block text-sm font-medium text-slate-900">
                Passo 1 — Volume em litros (L)
              </label>
              <p className="text-xs text-slate-500">
                Converta {problem.volumeM3} m³ para litros (× 1.000)
              </p>
              <div className="relative">
                <input
                  id="input-volume"
                  type="text"
                  inputMode="decimal"
                  value={volumeInput}
                  onChange={(e) => {
                    setVolumeInput(e.target.value);
                    if (vState.status !== 'idle') setVState({ status: 'idle', message: '' });
                  }}
                  placeholder="Ex.: 18000"
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-12 font-mono text-sm tabular-nums text-slate-900 outline-none transition-colors focus:ring-2 ${
                    vState.status === 'correct'
                      ? 'border-emerald-500 bg-emerald-50/40 focus:ring-emerald-200'
                      : vState.status === 'wrong'
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-200'
                        : 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
                  }`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                  L
                </span>
              </div>
              {vState.status !== 'idle' && (
                <p
                  className={`flex items-start gap-1.5 text-xs ${
                    vState.status === 'correct' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {vState.status === 'correct' ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{vState.message}</span>
                </p>
              )}
            </div>

            {/* Input 2: Time in Seconds */}
            <div className="space-y-2">
              <label htmlFor="input-time" className="block text-sm font-medium text-slate-900">
                Passo 2 — Tempo em segundos (s)
              </label>
              <p className="text-xs text-slate-500">
                Converta {problem.timeMin} min para segundos (× 60)
              </p>
              <div className="relative">
                <input
                  id="input-time"
                  type="text"
                  inputMode="decimal"
                  value={timeInput}
                  onChange={(e) => {
                    setTimeInput(e.target.value);
                    if (tState.status !== 'idle') setTState({ status: 'idle', message: '' });
                  }}
                  placeholder="Ex.: 30000"
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-12 font-mono text-sm tabular-nums text-slate-900 outline-none transition-colors focus:ring-2 ${
                    tState.status === 'correct'
                      ? 'border-emerald-500 bg-emerald-50/40 focus:ring-emerald-200'
                      : tState.status === 'wrong'
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-200'
                        : 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
                  }`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                  s
                </span>
              </div>
              {tState.status !== 'idle' && (
                <p
                  className={`flex items-start gap-1.5 text-xs ${
                    tState.status === 'correct' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {tState.status === 'correct' ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{tState.message}</span>
                </p>
              )}
            </div>

            {/* Input 3: Flow rate in L/s */}
            <div className="space-y-2">
              <label htmlFor="input-flow" className="block text-sm font-medium text-slate-900">
                Passo 3 — Vazão em L/s (Q = V ÷ t)
              </label>
              <p className="text-xs text-slate-500">Divida os litros pelos segundos</p>
              <div className="relative">
                <input
                  id="input-flow"
                  type="text"
                  inputMode="decimal"
                  value={flowInput}
                  onChange={(e) => {
                    setFlowInput(e.target.value);
                    if (qState.status !== 'idle') setQState({ status: 'idle', message: '' });
                  }}
                  placeholder="Ex.: 0,6"
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-12 font-mono text-sm tabular-nums text-slate-900 outline-none transition-colors focus:ring-2 ${
                    qState.status === 'correct'
                      ? 'border-emerald-500 bg-emerald-50/40 focus:ring-emerald-200'
                      : qState.status === 'wrong'
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-200'
                        : 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
                  }`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                  L/s
                </span>
              </div>
              {qState.status !== 'idle' && (
                <p
                  className={`flex items-start gap-1.5 text-xs ${
                    qState.status === 'correct' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {qState.status === 'correct' ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{qState.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap shrink-0"
              >
                Conferir respostas
              </button>
              <button
                type="button"
                onClick={handleFillSolution}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                Ver resolução
              </button>
              <button
                type="button"
                onClick={() => selectProblem(problemIdx)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                Limpar
              </button>
            </div>

            {allCorrect && problemIdx < PRACTICE_PROBLEMS.length - 1 && (
              <button
                type="button"
                onClick={() => selectProblem(problemIdx + 1)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 whitespace-nowrap shrink-0"
              >
                Próximo desafio
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
