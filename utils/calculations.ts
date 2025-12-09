import { SnowState, WindState, DriftState, SnowZone, WindZone, RoughnessClass, CalculationResult } from '../types';

// --- Constants ---
const WIND_VBO: Record<WindZone, number> = {
  '1': 25, '2': 25, '3': 27, '4': 28, '5': 30, '6': 28, '7': 28, '8': 30, '9': 31
};

// --- Helper Functions ---
export const getQsk = (zone: SnowZone, alt: number): number => {
  if (zone === SnowZone.I_ALP) return alt <= 200 ? 1.50 : 1.39 * (1 + Math.pow(alt / 728, 2));
  if (zone === SnowZone.I_MED) return alt <= 200 ? 1.50 : 1.35 * (1 + Math.pow(alt / 602, 2));
  if (zone === SnowZone.II) return alt <= 200 ? 1.00 : 0.85 * (1 + Math.pow(alt / 481, 2));
  if (zone === SnowZone.III) return alt <= 200 ? 0.60 : 0.51 * (1 + Math.pow(alt / 481, 2));
  return 0;
};

const getCeWind = (z: number, rClass: RoughnessClass): number => {
  let kr = 0.19, z0 = 0.05, zmin = 2;
  
  switch (rClass) {
    case RoughnessClass.A: kr = 0.23; z0 = 0.70; zmin = 12; break;
    case RoughnessClass.B: kr = 0.22; z0 = 0.30; zmin = 8; break;
    case RoughnessClass.C: kr = 0.20; z0 = 0.10; zmin = 4; break;
    case RoughnessClass.D: kr = 0.19; z0 = 0.05; zmin = 2; break;
  }

  const zCalc = Math.max(z, zmin);
  const ln = Math.log(zCalc / z0);
  return Math.pow(kr, 2) * ln * (7 + ln);
};

// --- Main Calculation Functions ---

export const calculateSnow = (state: SnowState): CalculationResult => {
  const { zone, altitude, angle, ce, ct } = state;
  const qsk = getQsk(zone, altitude);
  
  // Shape coefficient mu1
  let mu1 = 0.8;
  if (angle > 30 && angle < 60) {
    mu1 = 0.8 * (60 - angle) / 30;
  } else if (angle >= 60) {
    mu1 = 0.0;
  }

  const qs = qsk * mu1 * ce * ct;

  // Chart Data 1: Qsk vs Altitude
  const chartData1 = [];
  for (let a = 0; a <= 1500; a += 100) {
    chartData1.push({ x: a, y: getQsk(zone, a), current: a === Math.round(altitude/100)*100 ? getQsk(zone, a) : null });
  }

  // Chart Data 2: Mu1 vs Angle
  const chartData2 = [];
  for (let a = 0; a <= 90; a += 5) {
    let m = a <= 30 ? 0.8 : (a >= 60 ? 0.0 : 0.8 * (60 - a) / 30);
    chartData2.push({ x: a, y: m, current: a === Math.round(angle/5)*5 ? m : null });
  }

  return {
    mainValue: Number(qs.toFixed(2)),
    secResult1: { label: 'Carico al Suolo (qsk)', value: Number(qsk.toFixed(2)), unit: 'kN/m²' },
    secResult2: { label: 'Coeff. Forma (μ1)', value: Number(mu1.toFixed(2)), unit: '-' },
    details: [
      { label: 'Zona Climatica', value: zone },
      { label: 'Altitudine', value: altitude, unit: 'm' },
      { label: 'Carico Suolo (qsk)', value: qsk.toFixed(2), unit: 'kN/m²' },
      { label: 'Inclinazione', value: angle, unit: '°' },
      { label: 'Coeff. μ1', value: mu1.toFixed(2) },
      { label: 'Coeff. Esposizione (Ce)', value: ce },
      { label: 'Coeff. Termico (Ct)', value: ct },
      { label: 'Carico Neve (qs)', value: qs.toFixed(2), unit: 'kN/m²', highlight: true },
    ],
    chartData1,
    chartData2
  };
};

export const calculateWind = (state: WindState): CalculationResult => {
  const { zone, roughness, height, cp } = state;
  const vb = WIND_VBO[zone];
  const qb = 0.5 * 1.25 * Math.pow(vb, 2) / 1000; // kinetic pressure in kN/m2
  const ce = getCeWind(height, roughness);
  const p = qb * ce * cp;

  // Chart Data: Pressure vs Height
  const chartData1 = [];
  const chartData2 = [];
  const maxH = Math.max(height * 1.5, 30);
  
  for (let h = 0; h <= maxH; h += 2) {
    const hEff = h === 0 ? 0.1 : h;
    const cVal = getCeWind(hEff, roughness);
    const pVal = qb * cVal * cp;
    chartData1.push({ x: h, y: pVal });
    chartData2.push({ x: h, y: cVal });
  }

  return {
    mainValue: Number(p.toFixed(3)),
    secResult1: { label: 'Velocità Base (Vb)', value: vb, unit: 'm/s' },
    secResult2: { label: 'Press. Cinetica (qb)', value: Number(qb.toFixed(3)), unit: 'kN/m²' },
    details: [
      { label: 'Zona Vento', value: `Zona ${zone}` },
      { label: 'Classe Rugosità', value: roughness },
      { label: 'Velocità Base (Vb)', value: vb, unit: 'm/s' },
      { label: 'Altezza Edificio (z)', value: height, unit: 'm' },
      { label: 'Press. Cinetica (qb)', value: qb.toFixed(3), unit: 'kN/m²' },
      { label: 'Coeff. Esposizione (Ce)', value: ce.toFixed(2) },
      { label: 'Coeff. Pressione (Cp)', value: cp },
      { label: 'Pressione Vento (p)', value: p.toFixed(3), unit: 'kN/m²', highlight: true },
    ],
    chartData1,
    chartData2
  };
};

export const calculateDrift = (driftState: DriftState, snowState: SnowState): CalculationResult => {
  const { heightH, lengthB1, gamma } = driftState;
  const { ce, ct, zone, altitude } = snowState;
  
  const qsk = getQsk(zone, altitude);
  const ls = Math.min(Math.max(2 * heightH, 5), 15, lengthB1);
  const mu2 = Math.max((gamma * heightH) / qsk, 0.8);
  const qMax = mu2 * qsk * ce * ct;
  const qFlat = 0.8 * qsk * ce * ct; // Base roof load (mu1=0.8 typically for flat)
  
  const weight = ((qMax + qFlat) / 2) * ls; 
  const volume = weight / gamma;

  // Chart 1: Load Distribution across length
  const chartData1 = [];
  const steps = 20;
  for(let i=0; i<=steps; i++) {
    const x = (lengthB1 / steps) * i;
    const load = x <= ls ? qMax - ((qMax - qFlat) / ls) * x : qFlat;
    chartData1.push({ x: Number(x.toFixed(1)), y: load });
  }

  // Chart 2: Weight vs Height variation
  const chartData2 = [];
  for(let th=0.5; th<=5; th+=0.5) {
     const t_ls = Math.min(Math.max(2*th, 5), 15, lengthB1);
     const t_mu2 = Math.max((gamma * th) / qsk, 0.8);
     const t_qMax = t_mu2 * qsk * ce * ct;
     const w = ((t_qMax + qFlat) / 2) * t_ls;
     chartData2.push({ x: th, y: Number((w * 100).toFixed(0))/100 }); // simpler number
  }

  return {
    mainValue: Number(qMax.toFixed(2)),
    secResult1: { label: 'Coeff. μ2', value: Number(mu2.toFixed(2)), unit: '-' },
    secResult2: { label: 'Lunghezza (ls)', value: Number(ls.toFixed(1)), unit: 'm' },
    stats: {
      ls: Number(ls.toFixed(1)),
      weight: Number((weight * 101.97).toFixed(0)), // approx kg
      volume: Number(volume.toFixed(2))
    },
    details: [
      { label: 'Dislivello (h)', value: heightH, unit: 'm' },
      { label: 'Lunghezza Copertura (b1)', value: lengthB1, unit: 'm' },
      { label: 'Densità Neve', value: gamma, unit: 'kN/m³' },
      { label: 'Carico Neve Base (qsk)', value: qsk.toFixed(2), unit: 'kN/m²' },
      { label: 'Lunghezza Accumulo (ls)', value: ls.toFixed(2), unit: 'm' },
      { label: 'Coeff. Accumulo (μ2)', value: mu2.toFixed(2) },
      { label: 'Carico Picco Accumulo', value: qMax.toFixed(2), unit: 'kN/m²', highlight: true },
    ],
    chartData1,
    chartData2
  };
};
