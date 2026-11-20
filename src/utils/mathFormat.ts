export function formatBR(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Number(value.toFixed(maxDecimals));
  return rounded.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function formatIntBR(value: number): string {
  return Math.round(value).toLocaleString('pt-BR');
}

export function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h e ${m}min`;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export interface SimplificationSteps {
  volumeL: number;
  timeS: number;
  commonZeros: number;
  afterZerosNum: number;
  afterZerosDen: number;
  divisor: number;
  simplifiedNum: number;
  simplifiedDen: number;
  flowLS: number;
  flowMLs: number;
  flowLMin: number;
  flowM3Min: number;
}

export function computeFlowMetrics(volumeM3: number, timeMin: number): SimplificationSteps {
  const volumeL = Math.round(volumeM3 * 1000);
  const timeS = Math.round(timeMin * 60);

  let commonZeros = 0;
  let n = volumeL;
  let d = timeS;
  while (n > 0 && d > 0 && n % 10 === 0 && d % 10 === 0) {
    commonZeros++;
    n = Math.floor(n / 10);
    d = Math.floor(d / 10);
  }

  const afterZerosNum = n;
  const afterZerosDen = d;
  const divisor = gcd(afterZerosNum, afterZerosDen);
  const simplifiedNum = afterZerosNum / divisor;
  const simplifiedDen = afterZerosDen / divisor;

  const flowLS = volumeL / timeS;
  const flowMLs = flowLS * 1000;
  const flowLMin = volumeL / timeMin;
  const flowM3Min = volumeM3 / timeMin;

  return {
    volumeL,
    timeS,
    commonZeros,
    afterZerosNum,
    afterZerosDen,
    divisor,
    simplifiedNum,
    simplifiedDen,
    flowLS,
    flowMLs,
    flowLMin,
    flowM3Min,
  };
}

export function describeBottleComparison(flowMLs: number): string {
  const bottles = flowMLs / 500;
  if (Math.abs(flowMLs - 600) < 0.5) {
    return 'Um pouco mais que 1 garrafinha de água mineral de 500 mL cheia a cada segundo (500 mL + 100 mL).';
  }
  if (flowMLs < 480) {
    return `Menos que uma garrafinha de 500 mL por segundo (${formatBR(bottles * 100, 0)}% da garrafinha a cada segundo).`;
  }
  if (flowMLs <= 520) {
    return 'Praticamente 1 garrafinha inteira de 500 mL cheia a cada segundo.';
  }
  return `Equivale a ${formatBR(bottles, 2)} garrafinhas de 500 mL cheias a cada 1 segundo.`;
}

export function parseBrazilianNumber(input: string): number | null {
  const cleaned = input.trim().replace(/\s+/g, '');
  if (!cleaned) return null;

  // Handle formats like "18.000", "18000", "0,6", "0.6", "1.250,5"
  let normalized = cleaned;
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    // Dots are thousand separators, comma is decimal
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  } else if (hasDot) {
    // Check if dot looks like a thousands separator (e.g. 18.000 or 30.000)
    const parts = normalized.split('.');
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1) {
      normalized = parts.join('');
    } else if (parts.length > 2) {
      normalized = parts.join('');
    }
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export interface PracticeProblem {
  id: string;
  title: string;
  context: string;
  volumeM3: number;
  timeMin: number;
  hint: string;
}

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    id: 'reservatorio-aula',
    title: 'Reservatório da aula',
    context:
      'Uma mangueira encheu um reservatório de 18 m³ em 500 minutos. Qual é a vazão da mangueira em litros por segundo (L/s)?',
    volumeM3: 18,
    timeMin: 500,
    hint: 'Corte 3 zeros de 18.000 e 30.000 para ficar com 18 ÷ 30. Divida ambos por 6: 3 ÷ 5 = 0,6 L/s.',
  },
  {
    id: 'caixa-residencial',
    title: 'Caixa d’água do condomínio',
    context:
      'Uma tubulação abastece um reservatório de 12 m³ em 200 minutos. Quantos litros saem por segundo?',
    volumeM3: 12,
    timeMin: 200,
    hint: '12.000 L divididos por 12.000 s. Os dois números são iguais! Quanto dá um número dividido por ele mesmo?',
  },
  {
    id: 'caminhao-pipa',
    title: 'Abastecimento de caminhão-pipa',
    context:
      'Um caminhão-pipa com tanque de 9 m³ levou 100 minutos para encher completamente. Qual foi a vazão em L/s?',
    volumeM3: 9,
    timeMin: 100,
    hint: '9.000 L ÷ 6.000 s. Corte os 3 zeros e simplifique 9 ÷ 6 por 3 → 3 ÷ 2 = 1,5 L/s.',
  },
  {
    id: 'piscina-clube',
    title: 'Piscina da escola',
    context:
      'Uma piscina infantil de 24 m³ encheu em 800 minutos com uma mangueira contínua. Qual a vazão em L/s?',
    volumeM3: 24,
    timeMin: 800,
    hint: '24.000 L ÷ 48.000 s. Corte os 3 zeros: 24 ÷ 48 é exatamente a metade (1 ÷ 2 = 0,5 L/s).',
  },
  {
    id: 'horta-comunitaria',
    title: 'Irrigação da horta',
    context:
      'Um tanque de irrigação de 6 m³ foi preenchido em 250 minutos. Quantos litros entraram por segundo?',
    volumeM3: 6,
    timeMin: 250,
    hint: '6.000 L ÷ 15.000 s. Corte os 3 zeros: 6 ÷ 15. Divida por 3 → 2 ÷ 5 = 0,4 L/s.',
  },
];
