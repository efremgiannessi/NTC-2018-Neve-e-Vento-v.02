import { SnowZone, WindZone, RoughnessClass, SeismicZone, ClimaticZone } from '../types';

export interface ItalianLocality {
  name: string;
  province: string;
  region: string;
  altitude: number;
  snowZone: SnowZone;
  windZone: WindZone;
  roughness: RoughnessClass;
  distanceCoastKm: number;
  seismicZone: SeismicZone;
  ag: number;
  f0: number;
  tcStar: number;
  climaticZone: ClimaticZone;
  degreeDays: number;
  cap?: string;
}

interface RawComuneNTC {
  n: string;
  p: string;
  r: string;
  a: number;
  sz: SnowZone;
  wz: WindZone;
  sm: SeismicZone;
  ag: number;
  f0: number;
  tc: number;
  cz: ClimaticZone;
  gg: number;
  cap?: string;
}

// Initial fallback capoluoghi loaded synchronously before the 7,912 municipalities JSON finishes loading
export const INITIAL_LOCALITIES: ItalianLocality[] = [
  { name: "Roma", province: "RM", region: "Lazio", altitude: 21, snowZone: SnowZone.III, windZone: WindZone.Z3, roughness: RoughnessClass.A, distanceCoastKm: 24, seismicZone: SeismicZone.Z3, ag: 0.125, f0: 2.52, tcStar: 0.33, climaticZone: ClimaticZone.D, degreeDays: 1415, cap: "00100" },
  { name: "Milano", province: "MI", region: "Lombardia", altitude: 122, snowZone: SnowZone.I_ALP, windZone: WindZone.Z1, roughness: RoughnessClass.A, distanceCoastKm: 120, seismicZone: SeismicZone.Z3, ag: 0.075, f0: 2.60, tcStar: 0.28, climaticZone: ClimaticZone.E, degreeDays: 2404, cap: "20100" },
  { name: "Napoli", province: "NA", region: "Campania", altitude: 17, snowZone: SnowZone.III, windZone: WindZone.Z3, roughness: RoughnessClass.A, distanceCoastKm: 2, seismicZone: SeismicZone.Z2, ag: 0.168, f0: 2.38, tcStar: 0.34, climaticZone: ClimaticZone.C, degreeDays: 1034, cap: "80100" },
  { name: "Torino", province: "TO", region: "Piemonte", altitude: 239, snowZone: SnowZone.I_ALP, windZone: WindZone.Z1, roughness: RoughnessClass.A, distanceCoastKm: 110, seismicZone: SeismicZone.Z3, ag: 0.058, f0: 2.64, tcStar: 0.27, climaticZone: ClimaticZone.E, degreeDays: 2617, cap: "10100" },
  { name: "Palermo", province: "PA", region: "Sicilia", altitude: 14, snowZone: SnowZone.III, windZone: WindZone.Z4, roughness: RoughnessClass.D, distanceCoastKm: 1, seismicZone: SeismicZone.Z2, ag: 0.175, f0: 2.44, tcStar: 0.34, climaticZone: ClimaticZone.B, degreeDays: 751, cap: "90100" },
  { name: "Genova", province: "GE", region: "Liguria", altitude: 20, snowZone: SnowZone.II, windZone: WindZone.Z7, roughness: RoughnessClass.A, distanceCoastKm: 1, seismicZone: SeismicZone.Z3, ag: 0.082, f0: 2.56, tcStar: 0.28, climaticZone: ClimaticZone.D, degreeDays: 1435, cap: "16100" },
  { name: "Bologna", province: "BO", region: "Emilia-Romagna", altitude: 54, snowZone: SnowZone.I_MED, windZone: WindZone.Z2, roughness: RoughnessClass.A, distanceCoastKm: 75, seismicZone: SeismicZone.Z3, ag: 0.166, f0: 2.42, tcStar: 0.31, climaticZone: ClimaticZone.E, degreeDays: 2259, cap: "40100" },
  { name: "Firenze", province: "FI", region: "Toscana", altitude: 50, snowZone: SnowZone.II, windZone: WindZone.Z3, roughness: RoughnessClass.A, distanceCoastKm: 75, seismicZone: SeismicZone.Z2, ag: 0.132, f0: 2.46, tcStar: 0.30, climaticZone: ClimaticZone.D, degreeDays: 1821, cap: "50100" },
  { name: "Bari", province: "BA", region: "Puglia", altitude: 5, snowZone: SnowZone.II, windZone: WindZone.Z3, roughness: RoughnessClass.D, distanceCoastKm: 1, seismicZone: SeismicZone.Z3, ag: 0.072, f0: 2.58, tcStar: 0.36, climaticZone: ClimaticZone.C, degreeDays: 1185, cap: "70100" },
  { name: "Catania", province: "CT", region: "Sicilia", altitude: 7, snowZone: SnowZone.III, windZone: WindZone.Z4, roughness: RoughnessClass.D, distanceCoastKm: 1, seismicZone: SeismicZone.Z2, ag: 0.245, f0: 2.41, tcStar: 0.37, climaticZone: ClimaticZone.B, degreeDays: 833, cap: "95100" },
  { name: "Venezia", province: "VE", region: "Veneto", altitude: 2, snowZone: SnowZone.I_ALP, windZone: WindZone.Z2, roughness: RoughnessClass.D, distanceCoastKm: 1, seismicZone: SeismicZone.Z3, ag: 0.095, f0: 2.56, tcStar: 0.33, climaticZone: ClimaticZone.E, degreeDays: 2345, cap: "30100" },
  { name: "Pisa", province: "PI", region: "Toscana", altitude: 4, snowZone: SnowZone.III, windZone: WindZone.Z3, roughness: RoughnessClass.B, distanceCoastKm: 10, seismicZone: SeismicZone.Z3, ag: 0.125, f0: 2.47, tcStar: 0.29, climaticZone: ClimaticZone.D, degreeDays: 1694, cap: "56100" }
];

let cachedAllLocalities: ItalianLocality[] | null = null;

export const loadAllItalianComuni = async (): Promise<ItalianLocality[]> => {
  if (cachedAllLocalities) return cachedAllLocalities;
  try {
    const res = await fetch('/comuni_ntc.json');
    if (!res.ok) return INITIAL_LOCALITIES;
    const rawList: RawComuneNTC[] = await res.json();
    cachedAllLocalities = rawList.map(item => {
      const isCoastal = item.a <= 15 && ['7', '8', '9', '4', '5', '6'].includes(item.wz);
      return {
        name: item.n,
        province: item.p,
        region: item.r,
        altitude: item.a,
        snowZone: item.sz,
        windZone: item.wz,
        roughness: isCoastal ? RoughnessClass.D : item.a > 600 ? RoughnessClass.C : RoughnessClass.B,
        distanceCoastKm: isCoastal ? 2 : item.a > 500 ? 60 : 25,
        seismicZone: item.sm,
        ag: item.ag,
        f0: item.f0,
        tcStar: item.tc,
        climaticZone: item.cz,
        degreeDays: item.gg,
        cap: item.cap || ''
      };
    });
    return cachedAllLocalities;
  } catch {
    return INITIAL_LOCALITIES;
  }
};

export const searchLocalitiesFromList = (list: ItalianLocality[], query: string): ItalianLocality[] => {
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, 15);

  const exactMatches: ItalianLocality[] = [];
  const startsWithMatches: ItalianLocality[] = [];
  const containsMatches: ItalianLocality[] = [];

  for (let i = 0; i < list.length; i++) {
    const loc = list[i];
    const nameLower = loc.name.toLowerCase();
    const provLower = loc.province.toLowerCase();
    const cap = loc.cap || '';

    if (nameLower === q || provLower === q || cap === q) {
      exactMatches.push(loc);
    } else if (nameLower.startsWith(q) || cap.startsWith(q)) {
      startsWithMatches.push(loc);
    } else if (nameLower.includes(q) || loc.region.toLowerCase().includes(q)) {
      containsMatches.push(loc);
    }

    if (exactMatches.length + startsWithMatches.length >= 30) {
      break;
    }
  }

  return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 25);
};
