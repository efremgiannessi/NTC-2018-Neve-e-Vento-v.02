export enum CalculationType {
  SNOW = 'SNOW',
  WIND = 'WIND',
  DRIFT = 'DRIFT'
}

export enum SnowZone {
  I_ALP = 'I-alp',
  I_MED = 'I-med',
  II = 'II',
  III = 'III'
}

export enum WindZone {
  Z1 = '1',
  Z2 = '2',
  Z3 = '3',
  Z4 = '4',
  Z5 = '5',
  Z6 = '6',
  Z7 = '7',
  Z8 = '8',
  Z9 = '9'
}

export enum RoughnessClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

export interface SnowState {
  zone: SnowZone;
  altitude: number;
  angle: number;
  ce: number;
  ct: number;
}

export interface WindState {
  zone: WindZone;
  roughness: RoughnessClass;
  height: number;
  distanceCoast: number;
  cp: number;
}

export interface DriftState {
  heightH: number;
  lengthB1: number;
  gamma: number;
  preset: string;
}

export interface CalculationResult {
  mainValue: number;
  details: { label: string; value: string | number; unit?: string; highlight?: boolean }[];
  chartData1: any[];
  chartData2: any[];
  secResult1: { label: string; value: number; unit: string };
  secResult2: { label: string; value: number; unit: string };
  stats?: { ls: number; weight: number; volume: number };
}
