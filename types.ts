export enum CalculationType {
  SNOW = 'SNOW',
  WIND = 'WIND',
  DRIFT = 'DRIFT',
  SEISMIC = 'SEISMIC',
  THERMAL = 'THERMAL',
  LOADS = 'LOADS'
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

export enum SeismicZone {
  Z1 = '1',
  Z2 = '2',
  Z3 = '3',
  Z4 = '4'
}

export enum SoilCategory {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E'
}

export enum TopoCategory {
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T4 = 'T4'
}

export enum UsageClass {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV'
}

export enum ClimaticZone {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F'
}

export enum ThermalElementType {
  WALL = 'WALL',
  ROOF = 'ROOF',
  FLOOR = 'FLOOR',
  WINDOW = 'WINDOW',
  PARTITION = 'PARTITION'
}

export enum OccupancyCategory {
  CAT_A = 'CAT_A',
  CAT_A_BALCONY = 'CAT_A_BALCONY',
  CAT_B1 = 'CAT_B1',
  CAT_B2 = 'CAT_B2',
  CAT_C1 = 'CAT_C1',
  CAT_C2 = 'CAT_C2',
  CAT_C3 = 'CAT_C3',
  CAT_D1 = 'CAT_D1',
  CAT_D2 = 'CAT_D2',
  CAT_E1 = 'CAT_E1',
  CAT_F = 'CAT_F',
  CAT_G = 'CAT_G',
  CAT_H1 = 'CAT_H1',
  CAT_K = 'CAT_K'
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

export interface SeismicState {
  zone: SeismicZone;
  agCustom: number;
  f0: number;
  tcStar: number;
  soil: SoilCategory;
  topo: TopoCategory;
  vn: number;
  usageClass: UsageClass;
  qFactor: number;
  periodT1: number;
}

export interface ThermalState {
  climaticZone: ClimaticZone;
  degreeDays: number;
  elementType: ThermalElementType;
  scopeType: 'riqualificazione' | 'riferimento';
  existingR: number;
  insulationLambda: number;
  insulationThicknessCm: number;
}

export interface LoadsState {
  category: OccupancyCategory;
  slabPreset: string;
  g1: number; // Carichi permanenti strutturali [kN/m²]
  g2Finish: number; // Massetto, pavimento, intonaco, impianti [kN/m²]
  g2Partitions: number; // Incidenza tramezzi (§ 3.1.3.1 NTC 2018) [kN/m²]
  qkCustom?: number; // Eventuale override manuale qk
  areaInfluence: number; // Area d'influenza [m²] per coeff. riduzione alpha_A
}

export interface CalculationResult {
  mainValue: number | string;
  mainUnit?: string;
  details: { label: string; value: string | number; unit?: string; highlight?: boolean }[];
  chartData1: any[];
  chartData2: any[];
  secResult1: { label: string; value: number | string; unit: string };
  secResult2: { label: string; value: number | string; unit: string };
  stats?: { ls: number; weight: number; volume: number };
}
