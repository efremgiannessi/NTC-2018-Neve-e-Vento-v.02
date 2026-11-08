import {
  SnowState,
  WindState,
  DriftState,
  SeismicState,
  ThermalState,
  SnowZone,
  WindZone,
  RoughnessClass,
  SeismicZone,
  SoilCategory,
  TopoCategory,
  UsageClass,
  ClimaticZone,
  ThermalElementType,
  OccupancyCategory,
  LoadsState,
  CalculationResult
} from '../types';

// --- Constants ---
const WIND_VBO: Record<WindZone, number> = {
  '1': 25, '2': 25, '3': 27, '4': 28, '5': 30, '6': 28, '7': 28, '8': 30, '9': 31
};

export const SEISMIC_ZONE_INFO: Record<SeismicZone, { agRef: number; riskLabel: string; description: string; regions: string }> = {
  [SeismicZone.Z1]: {
    agRef: 0.35,
    riskLabel: 'Alta Sismicità',
    description: 'Zona più pericolosa: probabilità elevata di forti terremoti (ag = 0.35g)',
    regions: 'Appennino Centro-Meridionale, Friuli, Calabria, Sicilia Orientale'
  },
  [SeismicZone.Z2]: {
    agRef: 0.25,
    riskLabel: 'Media Sismicità',
    description: 'Forti terremoti possibili ma di intensità inferiore (ag = 0.25g)',
    regions: 'Veneto, Emilia-Romagna, Toscana, Marche, Umbria, Lazio, Abruzzo, Campania, Basilicata, Sicilia'
  },
  [SeismicZone.Z3]: {
    agRef: 0.15,
    riskLabel: 'Bassa Sismicità',
    description: 'Sismicità modesta o scuotimenti ridotti (ag = 0.15g)',
    regions: 'Lombardia, Piemonte, Liguria, Puglia, Trentino-Alto Adige'
  },
  [SeismicZone.Z4]: {
    agRef: 0.05,
    riskLabel: 'Molto Bassa',
    description: 'Pericolosità sismica minima sul territorio nazionale (ag = 0.05g)',
    regions: 'Sardegna, Valle d’Aosta, aree pianeggianti Piemonte/Lombardia/Veneto/Puglia'
  }
};

export const CLIMATIC_ZONE_INFO: Record<ClimaticZone, { ggMin: number; ggMax: number; hours: string; period: string; cities: string }> = {
  [ClimaticZone.A]: { ggMin: 0, ggMax: 600, hours: '6 ore/giorno', period: '1 Dicembre - 15 Marzo', cities: 'Lampedusa, Linosa, Porto Empedocle' },
  [ClimaticZone.B]: { ggMin: 601, ggMax: 900, hours: '8 ore/giorno', period: '1 Dicembre - 31 Marzo', cities: 'Catania, Messina, Palermo, Reggio Calabria, Siracusa, Trapani' },
  [ClimaticZone.C]: { ggMin: 901, ggMax: 1400, hours: '10 ore/giorno', period: '15 Novembre - 31 Marzo', cities: 'Bari, Cagliari, Caserta, Catanzaro, Lecce, Napoli, Ragusa, Salerno, Taranto' },
  [ClimaticZone.D]: { ggMin: 1401, ggMax: 2100, hours: '12 ore/giorno', period: '1 Novembre - 15 Aprile', cities: 'Ancona, Firenze, Foggia, Genova, Livorno, Lucca, Matera, Pescara, Pisa, Roma, Siena, Terni' },
  [ClimaticZone.E]: { ggMin: 2101, ggMax: 3000, hours: '14 ore/giorno', period: '15 Ottobre - 15 Aprile', cities: 'Bergamo, Bologna, Bolzano, Brescia, Como, L’Aquila, Milano, Modena, Padova, Parma, Perugia, Torino, Treviso, Trieste, Udine, Venezia, Verona' },
  [ClimaticZone.F]: { ggMin: 3001, ggMax: 6000, hours: 'Nessun limite', period: 'Tutto l’anno', cities: 'Belluno, Cuneo, Sondrio, Trento e comuni alpini/appenninici oltre 3000 GG' }
};

export const TRANSMITTANCE_LIMITS: Record<
  'riqualificazione' | 'riferimento',
  Record<ThermalElementType, Record<ClimaticZone, number>>
> = {
  riqualificazione: {
    [ThermalElementType.WALL]: { A: 0.40, B: 0.40, C: 0.36, D: 0.32, E: 0.28, F: 0.26 },
    [ThermalElementType.ROOF]: { A: 0.32, B: 0.32, C: 0.32, D: 0.26, E: 0.24, F: 0.22 },
    [ThermalElementType.FLOOR]: { A: 0.42, B: 0.42, C: 0.38, D: 0.32, E: 0.29, F: 0.28 },
    [ThermalElementType.WINDOW]: { A: 3.00, B: 3.00, C: 2.00, D: 1.80, E: 1.40, F: 1.00 },
    [ThermalElementType.PARTITION]: { A: 0.80, B: 0.80, C: 0.80, D: 0.80, E: 0.80, F: 0.80 }
  },
  riferimento: {
    [ThermalElementType.WALL]: { A: 0.43, B: 0.43, C: 0.34, D: 0.29, E: 0.26, F: 0.24 },
    [ThermalElementType.ROOF]: { A: 0.35, B: 0.35, C: 0.33, D: 0.26, E: 0.22, F: 0.20 },
    [ThermalElementType.FLOOR]: { A: 0.44, B: 0.44, C: 0.38, D: 0.29, E: 0.26, F: 0.24 },
    [ThermalElementType.WINDOW]: { A: 3.00, B: 3.00, C: 2.20, D: 1.80, E: 1.40, F: 1.10 },
    [ThermalElementType.PARTITION]: { A: 0.80, B: 0.80, C: 0.80, D: 0.80, E: 0.80, F: 0.80 }
  }
};

export const THERMAL_ELEMENT_LABELS: Record<ThermalElementType, string> = {
  [ThermalElementType.WALL]: 'Pareti Verticali Opache Esterne',
  [ThermalElementType.ROOF]: 'Coperture Orizzontali / Inclinate',
  [ThermalElementType.FLOOR]: 'Pavimenti / Solai verso Esterno',
  [ThermalElementType.WINDOW]: 'Chiusure Trasparenti / Infissi (Uw)',
  [ThermalElementType.PARTITION]: 'Divisori tra Unità / Vani non Riscaldati'
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

export const getClimaticZoneFromGG = (gg: number): ClimaticZone => {
  if (gg <= 600) return ClimaticZone.A;
  if (gg <= 900) return ClimaticZone.B;
  if (gg <= 1400) return ClimaticZone.C;
  if (gg <= 2100) return ClimaticZone.D;
  if (gg <= 3000) return ClimaticZone.E;
  return ClimaticZone.F;
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
    chartData1.push({ x: a, y: Number(getQsk(zone, a).toFixed(2)), current: a === Math.round(altitude/100)*100 ? getQsk(zone, a) : null });
  }

  // Chart Data 2: Mu1 vs Angle
  const chartData2 = [];
  for (let a = 0; a <= 90; a += 5) {
    let m = a <= 30 ? 0.8 : (a >= 60 ? 0.0 : 0.8 * (60 - a) / 30);
    chartData2.push({ x: a, y: Number(m.toFixed(2)), current: a === Math.round(angle/5)*5 ? m : null });
  }

  return {
    mainValue: Number(qs.toFixed(2)),
    mainUnit: 'kN/m²',
    secResult1: { label: 'Carico al Suolo (qsk)', value: Number(qsk.toFixed(2)), unit: 'kN/m²' },
    secResult2: { label: 'Coeff. Forma (μ1)', value: Number(mu1.toFixed(2)), unit: '-' },
    details: [
      { label: 'Zona Climatica Neve', value: zone },
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
    chartData1.push({ x: h, y: Number(pVal.toFixed(3)) });
    chartData2.push({ x: h, y: Number(cVal.toFixed(2)) });
  }

  return {
    mainValue: Number(p.toFixed(3)),
    mainUnit: 'kN/m²',
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
    chartData1.push({ x: Number(x.toFixed(1)), y: Number(load.toFixed(2)) });
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
    mainUnit: 'kN/m²',
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

export const calculateSeismic = (state: SeismicState): CalculationResult => {
  const { zone, agCustom, f0, tcStar, soil, topo, vn, usageClass, qFactor, periodT1 } = state;

  const cuMap: Record<UsageClass, number> = {
    [UsageClass.I]: 0.7,
    [UsageClass.II]: 1.0,
    [UsageClass.III]: 1.5,
    [UsageClass.IV]: 2.0
  };
  const cu = cuMap[usageClass];
  const vr = Math.max(vn * cu, 35);
  const tr = Math.max(Math.round(-vr / Math.log(1 - 0.10)), 30); // SLV Pvr = 10%

  const ag = Math.max(agCustom, 0.01); // in g

  // Tab. 3.2.IV NTC 2018 - Amplificazione Stratigrafica
  let ss = 1.0;
  let cc = 1.0;
  switch (soil) {
    case SoilCategory.A:
      ss = 1.0;
      cc = 1.0;
      break;
    case SoilCategory.B:
      ss = Math.min(Math.max(1.0, 1.40 - 0.40 * f0 * ag), 1.20);
      cc = 1.10 * Math.pow(tcStar, -0.20);
      break;
    case SoilCategory.C:
      ss = Math.min(Math.max(1.0, 1.70 - 0.60 * f0 * ag), 1.50);
      cc = 1.05 * Math.pow(tcStar, -0.33);
      break;
    case SoilCategory.D:
      ss = Math.min(Math.max(0.90, 2.40 - 1.50 * f0 * ag), 1.80);
      cc = 1.25 * Math.pow(tcStar, -0.50);
      break;
    case SoilCategory.E:
      ss = Math.min(Math.max(1.0, 2.00 - 1.10 * f0 * ag), 1.60);
      cc = 1.15 * Math.pow(tcStar, -0.40);
      break;
  }

  // Tab. 3.2.V NTC 2018 - Amplificazione Topografica
  const stMap: Record<TopoCategory, number> = {
    [TopoCategory.T1]: 1.0,
    [TopoCategory.T2]: 1.2,
    [TopoCategory.T3]: 1.2,
    [TopoCategory.T4]: 1.4
  };
  const st = stMap[topo];
  const s = ss * st;

  const tc = cc * tcStar;
  const tb = tc / 3;
  const td = 4.0 * ag + 1.6;

  const getSe = (t: number): number => {
    const eta = 1.0; // Smorzamento convenzionale 5%
    if (t < tb) {
      return ag * s * eta * f0 * (t / tb + (1 / (eta * f0)) * (1 - t / tb));
    } else if (t < tc) {
      return ag * s * eta * f0;
    } else if (t < td) {
      return ag * s * eta * f0 * (tc / t);
    } else {
      return ag * s * eta * f0 * ((tc * td) / (t * t));
    }
  };

  const getSd = (t: number): number => {
    const q = Math.max(qFactor, 1.0);
    if (t < tb) {
      return ag * s * (1 + (t / tb) * (f0 / q - 1));
    } else if (t < tc) {
      return (ag * s * f0) / q;
    } else if (t < td) {
      return Math.max(((ag * s * f0) / q) * (tc / t), 0.2 * ag);
    } else {
      return Math.max(((ag * s * f0) / q) * ((tc * td) / (t * t)), 0.2 * ag);
    }
  };

  const seT1 = getSe(periodT1);
  const sdT1 = getSd(periodT1);
  const pga = ag * s;

  const chartData1 = [];
  const chartData2 = [];
  for (let t = 0; t <= 4.0; t += 0.1) {
    const tRound = Number(t.toFixed(1));
    chartData1.push({ x: tRound, y: Number(getSe(tRound).toFixed(3)) });
    chartData2.push({ x: tRound, y: Number(getSd(tRound).toFixed(3)) });
  }

  return {
    mainValue: Number(sdT1.toFixed(3)),
    mainUnit: 'g (Sd)',
    secResult1: { label: 'Spettro Elastico Se(T1)', value: Number(seT1.toFixed(3)), unit: 'g' },
    secResult2: { label: 'PGA al Suolo (ag·S)', value: Number(pga.toFixed(3)), unit: 'g' },
    details: [
      { label: 'Zona Sismica (OPCM 3274)', value: `Zona ${zone} (${SEISMIC_ZONE_INFO[zone].riskLabel})` },
      { label: 'Vita Nominale (VN) / Classe Uso', value: `${vn} anni / Classe ${usageClass} (Cu=${cu})` },
      { label: 'Periodo Riferimento (VR) / Ritorno SLV (TR)', value: `${vr.toFixed(0)} anni / ${tr} anni` },
      { label: 'Accelerazione Suolo Rigido (ag)', value: ag.toFixed(3), unit: 'g' },
      { label: 'Fattore Amplificazione (F0) / TC*', value: `${f0.toFixed(2)} / ${tcStar.toFixed(2)} s` },
      { label: 'Cat. Sottosuolo / Topografica', value: `Cat. ${soil} (SS=${ss.toFixed(2)}) / ${topo} (ST=${st.toFixed(1)})` },
      { label: 'Coeff. Globale S (SS·ST)', value: s.toFixed(2) },
      { label: 'Periodi Spettrali TB / TC / TD', value: `${tb.toFixed(2)}s / ${tc.toFixed(2)}s / ${td.toFixed(2)}s` },
      { label: 'Periodo Proprio T1 / Fattore q', value: `${periodT1.toFixed(2)} s / q = ${qFactor.toFixed(1)}` },
      { label: 'Accelerazione Elastica Se(T1)', value: seT1.toFixed(3), unit: 'g' },
      { label: 'Accelerazione di Progetto Sd(T1)', value: sdT1.toFixed(3), unit: 'g', highlight: true }
    ],
    chartData1,
    chartData2
  };
};

export const calculateThermal = (state: ThermalState): CalculationResult => {
  const { climaticZone, degreeDays, elementType, scopeType, existingR, insulationLambda, insulationThicknessCm } = state;

  const uLim = TRANSMITTANCE_LIMITS[scopeType][elementType][climaticZone];
  const rInsulation = insulationThicknessCm > 0 ? (insulationThicknessCm / 100) / Math.max(insulationLambda, 0.005) : 0;
  const rTotal = Math.max(existingR + rInsulation, 0.1);
  const uProject = 1 / rTotal;

  const rRequired = 1 / uLim;
  const rDeficit = Math.max(0, rRequired - existingR);
  const minThicknessCm = Math.max(0, rDeficit * insulationLambda * 100);
  const isVerified = uProject <= uLim;

  // Chart 1: U_project vs Insulation Thickness (0 to 20 cm)
  const chartData1 = [];
  for (let s = 0; s <= 20; s += 1) {
    const rTot = Math.max(existingR + (s / 100) / Math.max(insulationLambda, 0.005), 0.1);
    chartData1.push({ x: `${s}cm`, y: Number((1 / rTot).toFixed(3)), limit: uLim });
  }

  // Chart 2: U_lim across Climatic Zones A-F for the selected element
  const zones: ClimaticZone[] = [ClimaticZone.A, ClimaticZone.B, ClimaticZone.C, ClimaticZone.D, ClimaticZone.E, ClimaticZone.F];
  const chartData2 = zones.map(z => ({
    x: `Zona ${z}`,
    y: TRANSMITTANCE_LIMITS[scopeType][elementType][z]
  }));

  const zoneInfo = CLIMATIC_ZONE_INFO[climaticZone];

  return {
    mainValue: Number(uLim.toFixed(2)),
    mainUnit: 'W/m²K',
    secResult1: { label: 'Trasmittanza Progetto (U)', value: Number(uProject.toFixed(3)), unit: isVerified ? 'W/m²K (OK)' : 'W/m²K (NO)' },
    secResult2: { label: 'Spessore Isolante Min.', value: Number(minThicknessCm.toFixed(1)), unit: 'cm' },
    details: [
      { label: 'Zona Climatica (DPR 412/93)', value: `Zona ${climaticZone} (${degreeDays} GG)` },
      { label: 'Esercizio Impianti Termici', value: `${zoneInfo.period} (${zoneInfo.hours})` },
      { label: 'Ambito Normativo (DM 26/06/2015)', value: scopeType === 'riqualificazione' ? 'Riqualificazione Energetica (App. B)' : 'Edificio di Riferimento / Nuovo (App. A)' },
      { label: 'Elemento Edilizio', value: THERMAL_ELEMENT_LABELS[elementType] },
      { label: 'Resistenza Struttura Base (R0)', value: existingR.toFixed(2), unit: 'm²K/W' },
      { label: 'Conducibilità Isolante (λ) / Spessore', value: `${insulationLambda.toFixed(3)} W/mK / ${insulationThicknessCm} cm` },
      { label: 'Resistenza Termica Totale (Rtot)', value: rTotal.toFixed(2), unit: 'm²K/W' },
      { label: 'Spessore Minimo Isolante Richiesto', value: minThicknessCm.toFixed(1), unit: 'cm' },
      { label: 'Trasmittanza Calcolata (Uprog)', value: uProject.toFixed(3), unit: 'W/m²K' },
      { label: 'Verifica Normativa (Uprog ≤ Ulim)', value: isVerified ? 'VERIFICATO (CONFORME)' : 'NON VERIFICATO (SUPERIORE AL LIMITE)', highlight: true },
      { label: 'Trasmittanza Limite Vigente (Ulim)', value: uLim.toFixed(2), unit: 'W/m²K', highlight: true }
    ],
    chartData1,
    chartData2
  };
};

export interface OccupancyLoadInfo {
  code: string;
  label: string;
  description: string;
  qk: number; // Distribuito [kN/m²]
  Qk: number; // Concentrato [kN]
  Hk: number; // Orizzontale lineare su parapetti/pareti [kN/m]
  psi0: number;
  psi1: number;
  psi2: number;
}

export const OCCUPANCY_LOADS_TABLE: Record<OccupancyCategory, OccupancyLoadInfo> = {
  [OccupancyCategory.CAT_A]: {
    code: 'Cat. A',
    label: 'Ambienti ad uso residenziale',
    description: 'Abitazioni, camere e corridoi di alberghi, ospedali, caserme (esclusi balconi e scale comuni)',
    qk: 2.00,
    Qk: 2.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.5,
    psi2: 0.3
  },
  [OccupancyCategory.CAT_A_BALCONY]: {
    code: 'Cat. A (Balconi/Scale)',
    label: 'Balconi, ballatoi e scale comuni (Residenziale)',
    description: 'Sbalzi, terrazze, scale comuni in edifici residenziali e per uffici (Tab. 3.1.II NTC 2018)',
    qk: 4.00,
    Qk: 2.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.5,
    psi2: 0.3
  },
  [OccupancyCategory.CAT_B1]: {
    code: 'Cat. B1',
    label: 'Uffici non aperti al pubblico',
    description: 'Studi professionali, uffici direzionali e amministrativi senza accesso pubblico',
    qk: 2.00,
    Qk: 2.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.5,
    psi2: 0.3
  },
  [OccupancyCategory.CAT_B2]: {
    code: 'Cat. B2',
    label: 'Uffici aperti al pubblico',
    description: 'Sportelli bancari, uffici postali, uffici pubblici, sale attesa ambulatori',
    qk: 3.00,
    Qk: 2.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.5,
    psi2: 0.3
  },
  [OccupancyCategory.CAT_C1]: {
    code: 'Cat. C1',
    label: 'Ambienti con tavoli (Scuole, Ristoranti)',
    description: 'Aule scolastiche, caffè, ristoranti, mense, sale di lettura, sale ricevimento',
    qk: 3.00,
    Qk: 3.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.7,
    psi2: 0.6
  },
  [OccupancyCategory.CAT_C2]: {
    code: 'Cat. C2',
    label: 'Ambienti con sedili fissi (Cinema, Teatri, Chiese)',
    description: 'Sale convegni, cinema, teatri, chiese, tribune con posti fissi, aule magne',
    qk: 4.00,
    Qk: 4.00,
    Hk: 2.00,
    psi0: 0.7,
    psi1: 0.7,
    psi2: 0.6
  },
  [OccupancyCategory.CAT_C3]: {
    code: 'Cat. C3',
    label: 'Ambienti privi di ostacoli (Musei, Palestre, Sale Ballo)',
    description: 'Sale museali, sale esposizioni, aree d’accesso di edifici pubblici, alberghi, ospedali, stazioni, palestre',
    qk: 5.00,
    Qk: 5.00,
    Hk: 3.00,
    psi0: 0.7,
    psi1: 0.7,
    psi2: 0.6
  },
  [OccupancyCategory.CAT_D1]: {
    code: 'Cat. D1',
    label: 'Negozi e commercio al dettaglio',
    description: 'Attività commerciali al minuto, botteghe, negozi di quartiere',
    qk: 4.00,
    Qk: 4.00,
    Hk: 2.00,
    psi0: 0.7,
    psi1: 0.7,
    psi2: 0.6
  },
  [OccupancyCategory.CAT_D2]: {
    code: 'Cat. D2',
    label: 'Centri commerciali, grandi magazzini, mercati',
    description: 'Grandi superfici di vendita, ipermercati, gallerie commerciali',
    qk: 5.00,
    Qk: 5.00,
    Hk: 2.00,
    psi0: 0.7,
    psi1: 0.7,
    psi2: 0.6
  },
  [OccupancyCategory.CAT_E1]: {
    code: 'Cat. E1',
    label: 'Biblioteche, archivi, magazzini, depositi, laboratori',
    description: 'Aree per accumulo di merci, archivi cartacei, biblioteche (valori minimi; da valutare caso per caso)',
    qk: 6.00,
    Qk: 7.00,
    Hk: 1.00,
    psi0: 1.0,
    psi1: 0.9,
    psi2: 0.8
  },
  [OccupancyCategory.CAT_F]: {
    code: 'Cat. F',
    label: 'Rimesse e parcheggi per veicoli leggeri (≤ 30 kN)',
    description: 'Autorimesse, box auto, corsie di manovra per autovetture con peso a pieno carico ≤ 30 kN',
    qk: 2.50,
    Qk: 20.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.7,
    psi2: 0.6
  },
  [OccupancyCategory.CAT_G]: {
    code: 'Cat. G',
    label: 'Transito e parcheggio veicoli medi (30 < P ≤ 160 kN)',
    description: 'Accessi per automezzi di soccorso, furgoni pesanti, zone di carico/scarico',
    qk: 5.00,
    Qk: 90.00,
    Hk: 1.00,
    psi0: 0.7,
    psi1: 0.5,
    psi2: 0.3
  },
  [OccupancyCategory.CAT_H1]: {
    code: 'Cat. H1',
    label: 'Coperture accessibili per sola manutenzione',
    description: 'Tetti e coperture piane o inclinate non praticabili se non per ispezione e manutenzione',
    qk: 0.50,
    Qk: 1.20,
    Hk: 1.00,
    psi0: 0.0,
    psi1: 0.0,
    psi2: 0.0
  },
  [OccupancyCategory.CAT_K]: {
    code: 'Cat. K',
    label: 'Coperture per usi speciali (Impianti, Eliporti)',
    description: 'Coperture tecniche ospitanti macchinari, UTA, impianti tecnologici o piazzole',
    qk: 3.00,
    Qk: 20.00,
    Hk: 1.00,
    psi0: 1.0,
    psi1: 0.9,
    psi2: 0.8
  }
};

export const PERMANENT_SLAB_PRESETS: Record<string, { label: string; g1: number; g2Finish: number; g2Partitions: number }> = {
  laterocemento_20_4: { label: 'Solaio Laterocemento 20+4 cm (G1=3.20, G2=1.80)', g1: 3.20, g2Finish: 1.80, g2Partitions: 0.80 },
  laterocemento_24_5: { label: 'Solaio Laterocemento 24+5 cm (G1=3.70, G2=1.80)', g1: 3.70, g2Finish: 1.80, g2Partitions: 0.80 },
  soletta_ca_20: { label: 'Soletta Piena C.A. sp. 20 cm (G1=5.00, G2=1.80)', g1: 5.00, g2Finish: 1.80, g2Partitions: 0.80 },
  legno_lamellare: { label: 'Solaio in Legno e Tavolato + Cappa (G1=1.40, G2=1.40)', g1: 1.40, g2Finish: 1.40, g2Partitions: 0.80 },
  acciaio_grecata: { label: 'Solaio Acciaio e Lamiera Grecata Collaborante (G1=2.30, G2=1.50)', g1: 2.30, g2Finish: 1.50, g2Partitions: 0.80 },
  copertura_leggera: { label: 'Copertura Leggera / Tetto (G1=1.00, G2=0.80, Tramezzi=0)', g1: 1.00, g2Finish: 0.80, g2Partitions: 0.00 },
  custom: { label: 'Personalizzato (Inserimento Manuale G1 e G2)', g1: 3.20, g2Finish: 1.80, g2Partitions: 0.80 }
};

export const calculateLoads = (state: LoadsState): CalculationResult => {
  const { category, g1, g2Finish, g2Partitions, areaInfluence } = state;
  const catInfo = OCCUPANCY_LOADS_TABLE[category];
  const qk = catInfo.qk;
  const g2Total = g2Finish + g2Partitions;
  const gTotal = g1 + g2Total;

  // Riduzione per area d'influenza (§ 3.1.4.1 NTC 2018)
  const canReduceArea = [
    OccupancyCategory.CAT_A,
    OccupancyCategory.CAT_B1,
    OccupancyCategory.CAT_B2,
    OccupancyCategory.CAT_C1,
    OccupancyCategory.CAT_C2,
    OccupancyCategory.CAT_C3,
    OccupancyCategory.CAT_D1,
    OccupancyCategory.CAT_D2
  ].includes(category);

  const alphaA = canReduceArea && areaInfluence > 10
    ? Math.min(1.0, Math.max(0.6, (5 / 7) * catInfo.psi0 + 10 / (7 * areaInfluence)))
    : 1.0;

  const qkEff = qk * alphaA;

  // Combinazioni NTC 2018 (§ 2.5.3)
  const qdSLU = 1.3 * g1 + 1.5 * g2Total + 1.5 * qkEff;
  const qdSLERara = g1 + g2Total + qkEff;
  const qdSLEFreq = g1 + g2Total + catInfo.psi1 * qkEff;
  const qdSLEQP = g1 + g2Total + catInfo.psi2 * qkEff;

  // Chart 1: Combinazioni di Carico a confronto
  const chartData1 = [
    { x: 'G1+G2', y: Number(gTotal.toFixed(2)) },
    { x: 'SLE QP', y: Number(qdSLEQP.toFixed(2)) },
    { x: 'SLE Freq.', y: Number(qdSLEFreq.toFixed(2)) },
    { x: 'SLE Rara', y: Number(qdSLERara.toFixed(2)) },
    { x: 'SLU Fond.', y: Number(qdSLU.toFixed(2)) }
  ];

  // Chart 2: Confronto qk tra le principali categorie NTC 2018
  const chartData2 = [
    { x: 'Cat. H1', y: 0.50 },
    { x: 'Cat. A/B1', y: 2.00 },
    { x: 'Cat. F', y: 2.50 },
    { x: 'Cat. B2/C1', y: 3.00 },
    { x: 'Cat. C2/D1', y: 4.00 },
    { x: 'Cat. C3/D2', y: 5.00 },
    { x: 'Cat. E1', y: 6.00 }
  ];

  return {
    mainValue: Number(qdSLU.toFixed(2)),
    mainUnit: 'kN/m² (SLU)',
    secResult1: { label: `Variabile qk (${catInfo.code})`, value: Number(qkEff.toFixed(2)), unit: 'kN/m²' },
    secResult2: { label: 'SLE Quasi-Perm. (Sisma)', value: Number(qdSLEQP.toFixed(2)), unit: 'kN/m²' },
    details: [
      { label: 'Destinazione d’Uso (Tab. 3.1.II NTC 2018)', value: `${catInfo.code} - ${catInfo.label}` },
      { label: 'Permanente Strutturale (G1)', value: g1.toFixed(2), unit: 'kN/m²' },
      { label: 'Permanente Portato Finiture/Massetti (G2,fin)', value: g2Finish.toFixed(2), unit: 'kN/m²' },
      { label: 'Incidenza Tramezzi Divisori (§ 3.1.3.1 - G2,tr)', value: g2Partitions.toFixed(2), unit: 'kN/m²' },
      { label: 'Totale Permanenti (G1 + G2)', value: gTotal.toFixed(2), unit: 'kN/m²' },
      { label: 'Variabile Distribuito Caratteristico (qk)', value: qk.toFixed(2), unit: 'kN/m²' },
      { label: 'Variabile Concentrato (Qk) / Parapetti (Hk)', value: `${catInfo.Qk.toFixed(2)} kN / ${catInfo.Hk.toFixed(2)} kN/m` },
      { label: 'Coeff. Combinazione ψ0 / ψ1 / ψ2 (Tab. 2.5.I)', value: `${catInfo.psi0.toFixed(1)} / ${catInfo.psi1.toFixed(1)} / ${catInfo.psi2.toFixed(1)}` },
      { label: `Coeff. Riduzione Area αA (A = ${areaInfluence} m²)`, value: alphaA.toFixed(2) },
      { label: 'Combinazione SLE Quasi-Permanente (G1+G2+ψ2·qk)', value: qdSLEQP.toFixed(2), unit: 'kN/m²' },
      { label: 'Combinazione SLE Rara / Caratteristica (G1+G2+qk)', value: qdSLERara.toFixed(2), unit: 'kN/m²' },
      { label: 'Combinazione Fondamentale SLU (1.3·G1+1.5·G2+1.5·qk)', value: qdSLU.toFixed(2), unit: 'kN/m²', highlight: true }
    ],
    chartData1,
    chartData2
  };
};


