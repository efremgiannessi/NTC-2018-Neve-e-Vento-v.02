import React, { useState, useMemo, useEffect } from 'react';
import { Snowflake, Wind, Layers, Calculator, Printer, AlertTriangle, FileText, RotateCcw, FileSpreadsheet, Shield, Globe, Activity, Thermometer, MapPin, Search, Weight, X } from 'lucide-react';
import {
  CalculationType,
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
  SnowState,
  WindState,
  DriftState,
  SeismicState,
  ThermalState,
  LoadsState,
  CalculationResult
} from './types';
import {
  calculateSnow,
  calculateWind,
  calculateDrift,
  calculateSeismic,
  calculateThermal,
  calculateLoads,
  SEISMIC_ZONE_INFO,
  CLIMATIC_ZONE_INFO,
  TRANSMITTANCE_LIMITS,
  THERMAL_ELEMENT_LABELS,
  OCCUPANCY_LOADS_TABLE,
  PERMANENT_SLAB_PRESETS,
  getClimaticZoneFromGG
} from './utils/calculations';
import { ItalianLocality, INITIAL_LOCALITIES, loadAllItalianComuni, searchLocalitiesFromList } from './utils/italianLocations';
import ResultCard from './components/ResultCard';
import ChartContainer from './components/ChartContainer';

// --- Constants for Reset ---
const INITIAL_SNOW_STATE: SnowState = {
  zone: SnowZone.I_ALP,
  altitude: 200,
  angle: 15,
  ce: 1.0,
  ct: 1.0
};

const INITIAL_WIND_STATE: WindState = {
  zone: WindZone.Z1,
  roughness: RoughnessClass.B,
  height: 10,
  distanceCoast: 20,
  cp: 0.8
};

const INITIAL_DRIFT_STATE: DriftState = {
  preset: 'custom',
  heightH: 2.0,
  lengthB1: 10,
  gamma: 2.0
};

const INITIAL_SEISMIC_STATE: SeismicState = {
  zone: SeismicZone.Z2,
  agCustom: 0.25,
  f0: 2.40,
  tcStar: 0.32,
  soil: SoilCategory.B,
  topo: TopoCategory.T1,
  vn: 50,
  usageClass: UsageClass.II,
  qFactor: 2.5,
  periodT1: 0.35
};

const INITIAL_THERMAL_STATE: ThermalState = {
  climaticZone: ClimaticZone.E,
  degreeDays: 2400,
  elementType: ThermalElementType.WALL,
  scopeType: 'riqualificazione',
  existingR: 0.85,
  insulationLambda: 0.035,
  insulationThicknessCm: 10
};

const INITIAL_LOADS_STATE: LoadsState = {
  category: OccupancyCategory.CAT_A,
  slabPreset: 'laterocemento_20_4',
  g1: 3.20,
  g2Finish: 1.80,
  g2Partitions: 0.80,
  areaInfluence: 25
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculationType>(CalculationType.SNOW);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [localityQuery, setLocalityQuery] = useState<string>('');
  const [selectedLocality, setSelectedLocality] = useState<ItalianLocality | null>(null);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState<boolean>(false);
  const [allLocalities, setAllLocalities] = useState<ItalianLocality[]>(INITIAL_LOCALITIES);

  const [snowState, setSnowState] = useState<SnowState>(INITIAL_SNOW_STATE);
  const [windState, setWindState] = useState<WindState>(INITIAL_WIND_STATE);
  const [driftState, setDriftState] = useState<DriftState>(INITIAL_DRIFT_STATE);
  const [seismicState, setSeismicState] = useState<SeismicState>(INITIAL_SEISMIC_STATE);
  const [thermalState, setThermalState] = useState<ThermalState>(INITIAL_THERMAL_STATE);
  const [loadsState, setLoadsState] = useState<LoadsState>(INITIAL_LOADS_STATE);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    loadAllItalianComuni().then((list) => {
      if (list && list.length > 0) {
        setAllLocalities(list);
      }
    });
  }, []);

  const filteredLocalities = useMemo(() => {
    return searchLocalitiesFromList(allLocalities, localityQuery);
  }, [allLocalities, localityQuery]);

  const handleSelectLocality = (loc: ItalianLocality) => {
    setSelectedLocality(loc);
    setLocalityQuery(`${loc.name} (${loc.province})`);
    setShowLocalityDropdown(false);

    setSnowState(prev => ({
      ...prev,
      zone: loc.snowZone,
      altitude: Math.min(loc.altitude, 1500)
    }));

    setWindState(prev => ({
      ...prev,
      zone: loc.windZone,
      roughness: loc.roughness,
      distanceCoast: loc.distanceCoastKm
    }));

    setSeismicState(prev => ({
      ...prev,
      zone: loc.seismicZone,
      agCustom: loc.ag,
      f0: loc.f0,
      tcStar: loc.tcStar
    }));

    setThermalState(prev => ({
      ...prev,
      climaticZone: loc.climaticZone,
      degreeDays: loc.degreeDays
    }));
  };

  const handleClearLocality = () => {
    setSelectedLocality(null);
    setLocalityQuery('');
    setShowLocalityDropdown(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const titles: Record<CalculationType, string> = {
      [CalculationType.SNOW]: 'Carico Neve | NTC 2018',
      [CalculationType.WIND]: 'Pressione Vento | NTC 2018',
      [CalculationType.DRIFT]: 'Accumulo Neve | NTC 2018',
      [CalculationType.SEISMIC]: 'Zone Sismiche & Spettro | NTC 2018',
      [CalculationType.THERMAL]: 'Zone Climatiche & Trasmittanza | NTC Vigente',
      [CalculationType.LOADS]: 'Permanenti e Sovraccarichi Variabili | NTC 2018'
    };
    document.title = projectTitle ? `${projectTitle} - ${titles[activeTab]}` : titles[activeTab];
  }, [activeTab, projectTitle]);

  const result: CalculationResult = useMemo(() => {
    switch (activeTab) {
      case CalculationType.SNOW: return calculateSnow(snowState);
      case CalculationType.WIND: return calculateWind(windState);
      case CalculationType.DRIFT: return calculateDrift(driftState, snowState);
      case CalculationType.SEISMIC: return calculateSeismic(seismicState);
      case CalculationType.THERMAL: return calculateThermal(thermalState);
      case CalculationType.LOADS: return calculateLoads(loadsState);
      default: return calculateSnow(snowState);
    }
  }, [activeTab, snowState, windState, driftState, seismicState, thermalState, loadsState]);

  const handlePrint = () => window.print();

  const handleReset = () => {
    setSnowState(INITIAL_SNOW_STATE);
    setWindState(INITIAL_WIND_STATE);
    setDriftState(INITIAL_DRIFT_STATE);
    setSeismicState(INITIAL_SEISMIC_STATE);
    setThermalState(INITIAL_THERMAL_STATE);
    setLoadsState(INITIAL_LOADS_STATE);
    setSelectedLocality(null);
    setLocalityQuery('');
    setProjectTitle('');
    setActiveTab(CalculationType.SNOW);
  };

  const handleExcelExport = () => {
    const title = projectTitle || "Report_NTC_2018";
    const typeLabels: Record<CalculationType, string> = {
      [CalculationType.SNOW]: 'Carico Neve',
      [CalculationType.WIND]: 'Pressione Vento',
      [CalculationType.DRIFT]: 'Accumulo Neve',
      [CalculationType.SEISMIC]: 'Azione Sismica NTC 2018',
      [CalculationType.THERMAL]: 'Zone Climatiche e Trasmittanza',
      [CalculationType.LOADS]: 'Permanenti e Variabili NTC 2018'
    };
    const typeLabel = typeLabels[activeTab];
    const mainUnit = result.mainUnit || 'kN/m²';
    let tableRows = '';

    if (selectedLocality) {
      tableRows += `
      <tr>
        <td style="border: 1px solid #ccc; padding: 5px; background-color: #eef2ff; font-weight: bold;">Località di Riferimento</td>
        <td style="border: 1px solid #ccc; padding: 5px; font-weight: bold; text-align: right; background-color: #eef2ff;">${selectedLocality.name} (${selectedLocality.province}) - ${selectedLocality.region} (${selectedLocality.altitude} m s.l.m.)</td>
      </tr>`;
    }

    tableRows += result.details.map(row => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 5px; background-color: #f9f9f9;">${row.label}</td>
        <td style="border: 1px solid #ccc; padding: 5px; font-weight: bold; text-align: right;">${row.value} ${row.unit || ''}</td>
      </tr>`).join('');

    tableRows += `<tr>
      <td style="border: 2px solid #000; padding: 10px; background-color: #fff7ed; font-weight: bold;">RISULTATO PRINCIPALE</td>
      <td style="border: 2px solid #000; padding: 10px; background-color: #fff7ed; font-weight: bold; text-align: right; color: #9a3412; font-size: 14pt;">${result.mainValue} ${mainUnit}</td>
    </tr>`;

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h3>${title} - ${typeLabel}</h3>
        <p>Generato da NTC 2018 Calculator - Efrem Giannessi</p>
        <table border="1">${tableRows}</table>
      </body></html>`;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${typeLabel.replace(/\s+/g, '_')}.xls`;
    link.click();
  };

  const handleDriftPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let newState = { ...driftState, preset: val };
    if (val === 'shed') newState = { ...newState, heightH: 1.5, lengthB1: 5 };
    else if (val === 'res_balcony') newState = { ...newState, heightH: 3, lengthB1: 2 };
    else if (val === 'warehouse') newState = { ...newState, heightH: 4, lengthB1: 10 };
    else if (val === 'parapet') newState = { ...newState, heightH: 1, lengthB1: 6 };
    setDriftState(newState);
  };

  const handleSeismicZoneChange = (zone: SeismicZone) => {
    const agRef = SEISMIC_ZONE_INFO[zone].agRef;
    setSeismicState({
      ...seismicState,
      zone,
      agCustom: agRef
    });
  };

  const handleClimaticZoneChange = (climaticZone: ClimaticZone) => {
    const info = CLIMATIC_ZONE_INFO[climaticZone];
    const defaultGG = Math.round((info.ggMin + Math.min(info.ggMax, 3600)) / 2);
    setThermalState({
      ...thermalState,
      climaticZone,
      degreeDays: defaultGG
    });
  };

  const handleDegreeDaysChange = (gg: number) => {
    const detectedZone = getClimaticZoneFromGG(gg);
    setThermalState({
      ...thermalState,
      degreeDays: gg,
      climaticZone: detectedZone
    });
  };

  const handleSlabPresetChange = (presetKey: string) => {
    const preset = PERMANENT_SLAB_PRESETS[presetKey];
    if (preset && presetKey !== 'custom') {
      setLoadsState({
        ...loadsState,
        slabPreset: presetKey,
        g1: preset.g1,
        g2Finish: preset.g2Finish,
        g2Partitions: preset.g2Partitions
      });
    } else {
      setLoadsState({ ...loadsState, slabPreset: 'custom' });
    }
  };

  const inputClass = "w-full bg-gray-900/50 border border-white/10 text-white text-xs rounded block p-2 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all placeholder-gray-500 backdrop-blur-sm";
  const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1";

  const renderInputs = () => {
    if (activeTab === CalculationType.SNOW) {
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="border-l-2 border-orange-500 pl-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Neve</h2>
          </div>
          <div>
            <label className={labelClass}>Zona Climatica Neve</label>
            <select value={snowState.zone} onChange={(e) => setSnowState({...snowState, zone: e.target.value as SnowZone})} className={inputClass}>
              <option value={SnowZone.I_ALP}>Zona I - Alpina</option>
              <option value={SnowZone.I_MED}>Zona I - Mediterranea</option>
              <option value={SnowZone.II}>Zona II</option>
              <option value={SnowZone.III}>Zona III</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Altitudine ({snowState.altitude} m)</label>
            <input type="range" min="0" max="1500" value={snowState.altitude} onChange={(e) => setSnowState({...snowState, altitude: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
          </div>
          <div>
            <label className={labelClass}>Inclinazione ({snowState.angle}°)</label>
            <input type="range" min="0" max="80" value={snowState.angle} onChange={(e) => setSnowState({...snowState, angle: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div>
               <label className={labelClass}>Coeff. Ce</label>
               <input type="number" step="0.1" value={snowState.ce} onChange={(e) => setSnowState({...snowState, ce: parseFloat(e.target.value) || 0})} className={inputClass} />
             </div>
             <div>
               <label className={labelClass}>Coeff. Ct</label>
               <input type="number" step="0.1" value={snowState.ct} onChange={(e) => setSnowState({...snowState, ct: parseFloat(e.target.value) || 0})} className={inputClass} />
             </div>
          </div>
        </div>
      );
    } else if (activeTab === CalculationType.WIND) {
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="border-l-2 border-amber-500 pl-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Vento</h2>
          </div>
          <div>
            <label className={labelClass}>Zona Vento</label>
            <select value={windState.zone} onChange={(e) => setWindState({...windState, zone: e.target.value as WindZone})} className={inputClass}>
              {[1,2,3,4,5,6,7,8,9].map(z => <option key={z} value={String(z)}>Zona {z}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Classe Rugosità</label>
            <select value={windState.roughness} onChange={(e) => setWindState({...windState, roughness: e.target.value as RoughnessClass})} className={inputClass}>
              <option value={RoughnessClass.A}>A - Urbana densa</option>
              <option value={RoughnessClass.B}>B - Urbana/Sub</option>
              <option value={RoughnessClass.C}>C - Rurale</option>
              <option value={RoughnessClass.D}>D - Mare/Costiera</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Altezza ({windState.height} m)</label>
            <input type="range" min="1" max="100" value={windState.height} onChange={(e) => setWindState({...windState, height: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div>
               <label className={labelClass}>Dist. Costa (km)</label>
               <input type="number" value={windState.distanceCoast} onChange={(e) => setWindState({...windState, distanceCoast: parseFloat(e.target.value) || 0})} className={inputClass} />
             </div>
             <div>
               <label className={labelClass}>Coeff. Cp</label>
               <input type="number" step="0.1" value={windState.cp} onChange={(e) => setWindState({...windState, cp: parseFloat(e.target.value) || 0})} className={inputClass} />
             </div>
          </div>
        </div>
      );
    } else if (activeTab === CalculationType.DRIFT) {
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="border-l-2 border-orange-600 pl-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Accumulo</h2>
          </div>
          <div>
            <label className={labelClass}>Tipologia</label>
            <select value={driftState.preset} onChange={handleDriftPreset} className={inputClass}>
              <option value="custom">Personalizzato</option>
              <option value="shed">Shed Industriale</option>
              <option value="res_balcony">Balcone/Terrazzo</option>
              <option value="warehouse">Capannone</option>
              <option value="parapet">Parapetto</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Dislivello h ({driftState.heightH} m)</label>
            <input type="range" min="0.5" max="10" step="0.1" value={driftState.heightH} onChange={(e) => setDriftState({...driftState, heightH: parseFloat(e.target.value), preset: 'custom'})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600" />
          </div>
          <div>
             <label className={labelClass}>Lunghezza copertura (m)</label>
             <input type="number" value={driftState.lengthB1} onChange={(e) => setDriftState({...driftState, lengthB1: parseFloat(e.target.value) || 1, preset: 'custom'})} className={inputClass} />
          </div>
        </div>
      );
    } else if (activeTab === CalculationType.SEISMIC) {
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="border-l-2 border-red-500 pl-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Zone Sismiche NTC 2018</h2>
            <p className="text-[9px] text-gray-400">Cap. 3.2 NTC 2018 & OPCM 3274</p>
          </div>
          <div>
            <label className={labelClass}>Zona Sismica Italiana</label>
            <select value={seismicState.zone} onChange={(e) => handleSeismicZoneChange(e.target.value as SeismicZone)} className={inputClass}>
              <option value={SeismicZone.Z1}>Zona 1 - Alta Sismicità (0.35g)</option>
              <option value={SeismicZone.Z2}>Zona 2 - Media Sismicità (0.25g)</option>
              <option value={SeismicZone.Z3}>Zona 3 - Bassa Sismicità (0.15g)</option>
              <option value={SeismicZone.Z4}>Zona 4 - Molto Bassa (0.05g)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Cat. Sottosuolo</label>
              <select value={seismicState.soil} onChange={(e) => setSeismicState({...seismicState, soil: e.target.value as SoilCategory})} className={inputClass}>
                <option value={SoilCategory.A}>Cat. A - Roccia</option>
                <option value={SoilCategory.B}>Cat. B - Sabbie/Argille comp.</option>
                <option value={SoilCategory.C}>Cat. C - Depositi medi</option>
                <option value={SoilCategory.D}>Cat. D - Depositi sciolti</option>
                <option value={SoilCategory.E}>Cat. E - Alluvionali sup.</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Cat. Topografica</label>
              <select value={seismicState.topo} onChange={(e) => setSeismicState({...seismicState, topo: e.target.value as TopoCategory})} className={inputClass}>
                <option value={TopoCategory.T1}>T1 - Pianura (ST=1.0)</option>
                <option value={TopoCategory.T2}>T2 - Pendio (ST=1.2)</option>
                <option value={TopoCategory.T3}>T3 - Rilievo (ST=1.2)</option>
                <option value={TopoCategory.T4}>T4 - Cresta (ST=1.4)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Vita Nominale VN (anni)</label>
              <select value={seismicState.vn} onChange={(e) => setSeismicState({...seismicState, vn: parseInt(e.target.value)})} className={inputClass}>
                <option value={10}>10 - Opere provvisorie</option>
                <option value={50}>50 - Opere ordinarie</option>
                <option value={100}>100 - Grandi opere</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Classe d'Uso</label>
              <select value={seismicState.usageClass} onChange={(e) => setSeismicState({...seismicState, usageClass: e.target.value as UsageClass})} className={inputClass}>
                <option value={UsageClass.I}>Classe I (Cu = 0.7)</option>
                <option value={UsageClass.II}>Classe II (Cu = 1.0)</option>
                <option value={UsageClass.III}>Classe III (Cu = 1.5)</option>
                <option value={UsageClass.IV}>Classe IV (Cu = 2.0)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className={labelClass}>ag / g</label>
              <input type="number" step="0.01" min="0.01" max="0.60" value={seismicState.agCustom} onChange={(e) => setSeismicState({...seismicState, agCustom: parseFloat(e.target.value) || 0.05})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fattore F0</label>
              <input type="number" step="0.05" min="2.0" max="3.5" value={seismicState.f0} onChange={(e) => setSeismicState({...seismicState, f0: parseFloat(e.target.value) || 2.4})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>TC* (s)</label>
              <input type="number" step="0.02" min="0.15" max="0.80" value={seismicState.tcStar} onChange={(e) => setSeismicState({...seismicState, tcStar: parseFloat(e.target.value) || 0.30})} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Periodo Proprio T1 ({seismicState.periodT1.toFixed(2)} s)</label>
            <input type="range" min="0.05" max="2.50" step="0.05" value={seismicState.periodT1} onChange={(e) => setSeismicState({...seismicState, periodT1: parseFloat(e.target.value)})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
          </div>
          <div>
            <label className={labelClass}>Fattore di Comportamento q ({seismicState.qFactor.toFixed(1)})</label>
            <input type="range" min="1.0" max="6.0" step="0.1" value={seismicState.qFactor} onChange={(e) => setSeismicState({...seismicState, qFactor: parseFloat(e.target.value)})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
          </div>
        </div>
      );
    } else if (activeTab === CalculationType.THERMAL) {
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="border-l-2 border-emerald-500 pl-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Zone Climatiche & U</h2>
            <p className="text-[9px] text-gray-400">DPR 412/93 & DM 26/06/2015 Vigente</p>
          </div>
          <div>
            <label className={labelClass}>Zona Climatica (DPR 412/93)</label>
            <select value={thermalState.climaticZone} onChange={(e) => handleClimaticZoneChange(e.target.value as ClimaticZone)} className={inputClass}>
              <option value={ClimaticZone.A}>Zona A (≤ 600 GG) - Sud/Isole minori</option>
              <option value={ClimaticZone.B}>Zona B (601 - 900 GG) - Coste Sud</option>
              <option value={ClimaticZone.C}>Zona C (901 - 1400 GG) - Tirreno/Adriatico</option>
              <option value={ClimaticZone.D}>Zona D (1401 - 2100 GG) - Centro Italia</option>
              <option value={ClimaticZone.E}>Zona E (2101 - 3000 GG) - Nord/Interno</option>
              <option value={ClimaticZone.F}>Zona F (&gt; 3000 GG) - Alpina/Montagna</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Gradi Giorno ({thermalState.degreeDays} GG → Zona {thermalState.climaticZone})</label>
            <input type="range" min="300" max="4200" step="50" value={thermalState.degreeDays} onChange={(e) => handleDegreeDaysChange(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div>
            <label className={labelClass}>Ambito di Verifica Normativa</label>
            <select value={thermalState.scopeType} onChange={(e) => setThermalState({...thermalState, scopeType: e.target.value as 'riqualificazione' | 'riferimento'})} className={inputClass}>
              <option value="riqualificazione">Riqualificazione Energetica (App. B - Vigente)</option>
              <option value="riferimento">Edificio di Riferimento / Nuovo (App. A)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Elemento Edilizio / Chiusura</label>
            <select value={thermalState.elementType} onChange={(e) => setThermalState({...thermalState, elementType: e.target.value as ThermalElementType})} className={inputClass}>
              <option value={ThermalElementType.WALL}>Pareti Verticali Opache Esterne</option>
              <option value={ThermalElementType.ROOF}>Coperture Orizzontali / Inclinate</option>
              <option value={ThermalElementType.FLOOR}>Pavimenti / Solai verso Esterno</option>
              <option value={ThermalElementType.WINDOW}>Chiusure Trasparenti / Infissi (Uw)</option>
              <option value={ThermalElementType.PARTITION}>Divisori tra Unità / Vani freddi</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>R Struttura Base (m²K/W)</label>
              <input type="number" step="0.05" min="0.10" max="5.0" value={thermalState.existingR} onChange={(e) => setThermalState({...thermalState, existingR: parseFloat(e.target.value) || 0.2})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>λ Isolante (W/mK)</label>
              <input type="number" step="0.001" min="0.015" max="0.100" value={thermalState.insulationLambda} onChange={(e) => setThermalState({...thermalState, insulationLambda: parseFloat(e.target.value) || 0.035})} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Spessore Isolante Progetto ({thermalState.insulationThicknessCm} cm)</label>
            <input type="range" min="0" max="24" step="1" value={thermalState.insulationThicknessCm} onChange={(e) => setThermalState({...thermalState, insulationThicknessCm: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="border-l-2 border-cyan-500 pl-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Permanenti & Variabili</h2>
            <p className="text-[9px] text-gray-400">Cap. 3.1 NTC 2018 (Tab. 3.1.I e 3.1.II)</p>
          </div>
          <div>
            <label className={labelClass}>Destinazione d'Uso (Tab. 3.1.II NTC 2018)</label>
            <select
              value={loadsState.category}
              onChange={(e) => setLoadsState({ ...loadsState, category: e.target.value as OccupancyCategory })}
              className={inputClass}
            >
              {(Object.keys(OCCUPANCY_LOADS_TABLE) as OccupancyCategory[]).map((cat) => {
                const info = OCCUPANCY_LOADS_TABLE[cat];
                return (
                  <option key={cat} value={cat}>
                    {info.code} - {info.label} (qk = {info.qk.toFixed(2)} kN/m²)
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipologia Solaio (Preset G1 e G2)</label>
            <select
              value={loadsState.slabPreset}
              onChange={(e) => handleSlabPresetChange(e.target.value)}
              className={inputClass}
            >
              {Object.entries(PERMANENT_SLAB_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>G1 Strutturale (kN/m²)</label>
              <input
                type="number"
                step="0.10"
                min="0.10"
                max="15.0"
                value={loadsState.g1}
                onChange={(e) => setLoadsState({ ...loadsState, g1: parseFloat(e.target.value) || 0, slabPreset: 'custom' })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>G2 Finiture/Mass. (kN/m²)</label>
              <input
                type="number"
                step="0.10"
                min="0.00"
                max="10.0"
                value={loadsState.g2Finish}
                onChange={(e) => setLoadsState({ ...loadsState, g2Finish: parseFloat(e.target.value) || 0, slabPreset: 'custom' })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Incidenza Tramezzi G2,tr (§ 3.1.3.1 NTC 2018)</label>
            <select
              value={loadsState.g2Partitions}
              onChange={(e) => setLoadsState({ ...loadsState, g2Partitions: parseFloat(e.target.value), slabPreset: 'custom' })}
              className={inputClass}
            >
              <option value={0.0}>0.00 kN/m² - Assenza di tramezzi / Copertura</option>
              <option value={0.4}>0.40 kN/m² - Divisori leggeri / Cartongesso (≤ 1.00 kN/m)</option>
              <option value={0.8}>0.80 kN/m² - Tramezzi in laterizio forato (1.00 &lt; G2 ≤ 2.00 kN/m)</option>
              <option value={1.2}>1.20 kN/m² - Divisori pesanti / Doppio strato (2.00 &lt; G2 ≤ 3.00 kN/m)</option>
              <option value={1.6}>1.60 kN/m² - Divisori speciali (3.00 &lt; G2 ≤ 4.00 kN/m)</option>
              <option value={2.0}>2.00 kN/m² - Divisori molto pesanti (4.00 &lt; G2 ≤ 5.00 kN/m)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Area d'Influenza A ({loadsState.areaInfluence} m²)</label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={loadsState.areaInfluence}
              onChange={(e) => setLoadsState({ ...loadsState, areaInfluence: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      {/* Splash Screen Overlay */}
      <div className={`fixed inset-0 z-[100] bg-[#111827] flex flex-col items-center justify-center transition-all duration-1000 ease-out ${showSplash ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="relative mb-10">
            <div className="absolute inset-0 bg-orange-600/30 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl border border-orange-500/30 shadow-[0_0_50px_rgba(234,88,12,0.3)] ring-1 ring-white/10 transform scale-110">
                <Calculator size={80} className="text-orange-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.5)]" />
            </div>
        </div>
        <div className="text-center space-y-4">
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
                NTC <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">2018</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-400 font-bold text-xs sm:text-sm tracking-[0.4em] uppercase">
                <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-gray-600"></span>
                Engineering Calculator
                <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-gray-600"></span>
            </div>
        </div>
      </div>

      {/* Credits Banner - Screen Only */}
      <div className="w-full bg-black border-b border-white/5 py-1 px-4 text-center no-print">
        <p className="text-[9px] sm:text-[11px] text-gray-400 font-medium tracking-tight">
          Software progettato e sviluppato da{' '}
          <a href="https://www.efremgiannessi.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold hover:text-orange-400 transition-colors">
            Efrem Giannessi
          </a>
        </p>
      </div>

      {/* Header - Screen Only */}
      <header className="bg-gray-900/40 backdrop-blur-xl border-b border-white/5 no-print sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white p-1.5 rounded shadow shadow-orange-900/20"><Calculator size={18} /></div>
            <div>
              <h1 className="text-xs sm:text-base font-bold text-white leading-tight">NTC 2018 Calculator</h1>
              <span className="text-[7px] sm:text-[9px] text-gray-500 uppercase font-bold tracking-widest">Neve • Vento • Accumulo • Sismica • Clima & U • Carichi</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
             <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Online</span>
             </div>
          </div>
        </div>
      </header>

      {/* --- PRINT HEADER --- */}
      <div className="hidden print-only mb-4 border-b border-black pb-2">
         <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">Report di Calcolo NTC 2018</h1>
              <p className="text-xs font-bold">Sviluppato da: Efrem Giannessi (www.efremgiannessi.org)</p>
            </div>
            <div className="text-right text-[10px]">
              <p>Data: {new Date().toLocaleDateString('it-IT')}</p>
              <p>Progetto: {projectTitle || '-'}</p>
              {selectedLocality && <p>Località: {selectedLocality.name} ({selectedLocality.province}) - {selectedLocality.altitude}m s.l.m.</p>}
            </div>
         </div>
      </div>

      <main className="flex-grow max-w-[1600px] mx-auto px-4 py-3 sm:py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Sidebar / Inputs */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4 no-print">
          
          <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded p-2.5 shadow-lg space-y-2.5">
             <div>
               <label className={labelClass}>Nome Progetto</label>
               <input type="text" placeholder="Riferimento..." value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className={inputClass} />
             </div>

             {/* Ricerca Località Italiana - Auto-fill tutti i parametri NTC */}
             <div className="relative">
               <div className="flex items-center justify-between mb-1 ml-1">
                 <label className="flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                   <MapPin size={11} /> Cerca Comune Italiano
                 </label>
                 <span className="text-[8px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                   {allLocalities.length.toLocaleString('it-IT')} Comuni
                 </span>
               </div>
               <div className="relative">
                 <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 <input
                   type="text"
                   placeholder="Scrivi qualsiasi comune, CAP o prov. (es. Pontedera, Bronte, 56025)..."
                   value={localityQuery}
                   onFocus={() => setShowLocalityDropdown(true)}
                   onBlur={() => setTimeout(() => setShowLocalityDropdown(false), 180)}
                   onChange={(e) => {
                     setLocalityQuery(e.target.value);
                     setShowLocalityDropdown(true);
                   }}
                   className={`${inputClass} pl-8 pr-7 border-orange-500/30 focus:ring-orange-500`}
                 />
                 {localityQuery && (
                   <button
                     type="button"
                     onClick={handleClearLocality}
                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                     title="Cancella località"
                   >
                     <X size={13} />
                   </button>
                 )}
               </div>

               {showLocalityDropdown && filteredLocalities.length > 0 && (
                 <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-orange-500/40 rounded shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-white/5">
                   {filteredLocalities.map((loc) => (
                     <button
                       key={`${loc.name}-${loc.province}-${loc.cap || ''}`}
                       type="button"
                       onMouseDown={(e) => {
                         e.preventDefault();
                         handleSelectLocality(loc);
                       }}
                       className="w-full text-left px-2.5 py-2 hover:bg-orange-500/20 transition-colors flex items-center justify-between"
                     >
                       <div>
                         <span className="text-xs font-bold text-white">{loc.name}</span>{' '}
                         <span className="text-[10px] text-orange-400 font-semibold">({loc.province})</span>
                         <div className="text-[9px] text-gray-400">
                           {loc.region} {loc.cap ? `• CAP ${loc.cap}` : ''} • Alt. {loc.altitude} m
                         </div>
                       </div>
                       <div className="text-right text-[8px] font-mono text-gray-300 space-y-0.5">
                         <div>Neve: <span className="text-orange-400 font-bold">{loc.snowZone}</span> | Vento: <span className="text-amber-400 font-bold">Z{loc.windZone}</span></div>
                         <div>Sisma: <span className="text-red-400 font-bold">Z{loc.seismicZone} ({loc.ag}g)</span> | Clima: <span className="text-emerald-400 font-bold">{loc.climaticZone} ({loc.degreeDays}GG)</span></div>
                       </div>
                     </button>
                   ))}
                 </div>
               )}

               {selectedLocality && (
                 <div className="mt-2 bg-orange-500/10 border border-orange-500/30 rounded p-2 text-[9px] space-y-1">
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-orange-400 uppercase tracking-wider">
                       {selectedLocality.name} ({selectedLocality.province}) • {selectedLocality.altitude} m s.l.m.
                     </span>
                     <span className="text-[8px] bg-orange-600/30 text-orange-200 px-1.5 py-0.5 rounded font-bold">
                       PARAMETRI APPLICATI
                     </span>
                   </div>
                   <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-gray-300 font-mono text-[8px]">
                     <div>Neve: <strong className="text-white">Zona {selectedLocality.snowZone}</strong></div>
                     <div>Vento: <strong className="text-white">Zona {selectedLocality.windZone} (Rug. {selectedLocality.roughness})</strong></div>
                     <div>Sisma: <strong className="text-red-400">Z{selectedLocality.seismicZone} (ag={selectedLocality.ag}g)</strong></div>
                     <div>Clima: <strong className="text-emerald-400">Zona {selectedLocality.climaticZone} ({selectedLocality.degreeDays} GG)</strong></div>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* Navigation Tabs - 6 Engineering Modules (2x3 Grid) */}
          <div className="bg-black/40 border border-white/10 rounded p-1 grid grid-cols-3 gap-1 shadow-lg overflow-hidden">
            <button onClick={() => setActiveTab(CalculationType.SNOW)} className={`py-2 px-1 text-[8px] sm:text-[9px] font-bold rounded transition-all flex flex-col items-center justify-center gap-1 ${activeTab === CalculationType.SNOW ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              <Snowflake size={12} /> NEVE
            </button>
            <button onClick={() => setActiveTab(CalculationType.WIND)} className={`py-2 px-1 text-[8px] sm:text-[9px] font-bold rounded transition-all flex flex-col items-center justify-center gap-1 ${activeTab === CalculationType.WIND ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              <Wind size={12} /> VENTO
            </button>
            <button onClick={() => setActiveTab(CalculationType.DRIFT)} className={`py-2 px-1 text-[8px] sm:text-[9px] font-bold rounded transition-all flex flex-col items-center justify-center gap-1 ${activeTab === CalculationType.DRIFT ? 'bg-orange-800 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              <Layers size={12} /> ACCUMULO
            </button>
            <button onClick={() => setActiveTab(CalculationType.SEISMIC)} className={`py-2 px-1 text-[8px] sm:text-[9px] font-bold rounded transition-all flex flex-col items-center justify-center gap-1 ${activeTab === CalculationType.SEISMIC ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              <Activity size={12} /> SISMICA
            </button>
            <button onClick={() => setActiveTab(CalculationType.THERMAL)} className={`py-2 px-1 text-[8px] sm:text-[9px] font-bold rounded transition-all flex flex-col items-center justify-center gap-1 ${activeTab === CalculationType.THERMAL ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              <Thermometer size={12} /> CLIMA/U
            </button>
            <button onClick={() => setActiveTab(CalculationType.LOADS)} className={`py-2 px-1 text-[8px] sm:text-[9px] font-bold rounded transition-all flex flex-col items-center justify-center gap-1 ${activeTab === CalculationType.LOADS ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
              <Weight size={12} /> CARICHI
            </button>
          </div>

          <div className="bg-gray-800/40 border border-white/10 rounded p-3 sm:p-5 shadow-xl">
            {renderInputs()}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
             <button onClick={handleReset} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded flex flex-col items-center justify-center text-[9px] font-bold"><RotateCcw size={14} className="mb-0.5" /> RESET</button>
             <button onClick={handleExcelExport} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded flex flex-col items-center justify-center text-[9px] font-bold"><FileSpreadsheet size={14} className="mb-0.5" /> EXCEL</button>
             <button onClick={handlePrint} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-2 rounded flex flex-col items-center justify-center text-[9px] font-bold shadow shadow-orange-900/40"><Printer size={14} className="mb-0.5" /> STAMPA</button>
          </div>

          <div className="backdrop-blur-sm bg-orange-900/10 border-l-2 border-orange-500 p-2.5 rounded-r border-y border-r border-white/5">
            <div className="flex">
              <AlertTriangle className="text-orange-500 w-3.5 h-3.5 shrink-0" />
              <p className="ml-2 text-[9px] text-gray-400 leading-relaxed uppercase font-bold tracking-tight">
                Strumento indicativo per pre-dimensionamento. Validare con un professionista.
              </p>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6">
          
          {(projectTitle || selectedLocality) && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded p-2.5 flex flex-wrap items-center justify-between gap-2 no-print">
               {projectTitle && (
                 <div className="flex items-center gap-2">
                   <FileText size={14} className="text-orange-500" />
                   <h2 className="text-[11px] font-bold text-white truncate">{projectTitle}</h2>
                 </div>
               )}
               {selectedLocality && (
                 <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-300">
                   <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-bold">
                     <MapPin size={11} /> {selectedLocality.name} ({selectedLocality.province}) - {selectedLocality.altitude} m s.l.m.
                   </span>
                   <span className="bg-white/5 px-2 py-0.5 rounded font-mono text-[9px]">Neve: {selectedLocality.snowZone}</span>
                   <span className="bg-white/5 px-2 py-0.5 rounded font-mono text-[9px]">Vento: Z{selectedLocality.windZone}</span>
                   <span className="bg-red-500/10 text-red-300 px-2 py-0.5 rounded font-mono text-[9px]">Sisma: Z{selectedLocality.seismicZone} (ag={selectedLocality.ag}g)</span>
                   <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-mono text-[9px]">Clima: Zona {selectedLocality.climaticZone} ({selectedLocality.degreeDays} GG)</span>
                 </div>
               )}
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <ResultCard 
              label={
                activeTab === CalculationType.WIND ? "Pressione Vento" :
                activeTab === CalculationType.DRIFT ? "Carico Accumulo" :
                activeTab === CalculationType.SEISMIC ? "Accel. Progetto Sd(T1)" :
                activeTab === CalculationType.THERMAL ? "Trasmittanza Limite Ulim" :
                activeTab === CalculationType.LOADS ? "Carico Progetto SLU (qd)" :
                "Carico Neve Totale"
              }
              value={result.mainValue}
              unit={result.mainUnit || "kN/m²"}
              isMain={true}
              icon={
                activeTab === CalculationType.WIND ? <Wind /> :
                activeTab === CalculationType.SEISMIC ? <Activity /> :
                activeTab === CalculationType.THERMAL ? <Thermometer /> :
                activeTab === CalculationType.LOADS ? <Weight /> :
                <Snowflake />
              }
            />
            <ResultCard label={result.secResult1.label} value={result.secResult1.value} unit={result.secResult1.unit} />
            <ResultCard label={result.secResult2.label} value={result.secResult2.value} unit={result.secResult2.unit} />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 print:block print:space-y-3">
            <ChartContainer 
              title={
                activeTab === CalculationType.DRIFT ? "Profilo Carico" :
                activeTab === CalculationType.SEISMIC ? "Spettro Elastico Orizzontale Se(T) [g]" :
                activeTab === CalculationType.THERMAL ? "Trasmittanza U vs Spessore Isolante (cm)" :
                activeTab === CalculationType.LOADS ? "Combinazioni di Carico NTC 2018 [kN/m²]" :
                "Variazione Carico"
              }
              data={result.chartData1} dataKeyX="x" dataKeyY="y"
              color={
                activeTab === CalculationType.WIND ? "#fbbf24" :
                activeTab === CalculationType.DRIFT ? "#f97316" :
                activeTab === CalculationType.SEISMIC ? "#ef4444" :
                activeTab === CalculationType.THERMAL ? "#10b981" :
                activeTab === CalculationType.LOADS ? "#06b6d4" :
                "#ea580c"
              }
              type={activeTab === CalculationType.DRIFT || activeTab === CalculationType.SEISMIC || activeTab === CalculationType.LOADS ? 'area' : 'line'}
            />
            <ChartContainer 
              title={
                activeTab === CalculationType.WIND ? "Coeff. Esposizione" :
                activeTab === CalculationType.SEISMIC ? "Spettro di Progetto SLV Sd(T) [g]" :
                activeTab === CalculationType.THERMAL ? "Limiti Ulim per Zona Climatica A-F [W/m²K]" :
                activeTab === CalculationType.LOADS ? "Sovraccarichi Variabili qk per Categoria [kN/m²]" :
                "Coeff. Forma / Peso"
              }
              data={result.chartData2} dataKeyX="x" dataKeyY="y"
              color={
                activeTab === CalculationType.WIND ? "#f59e0b" :
                activeTab === CalculationType.DRIFT ? "#7c2d12" :
                activeTab === CalculationType.SEISMIC ? "#f97316" :
                activeTab === CalculationType.THERMAL ? "#059669" :
                activeTab === CalculationType.LOADS ? "#0891b2" :
                "#fb923c"
              }
              type={activeTab === CalculationType.THERMAL || activeTab === CalculationType.LOADS ? 'area' : 'line'}
            />
          </div>

          {/* Normative Reference Table for Permanent & Variable Loads (Cap. 3.1 NTC 2018) */}
          {activeTab === CalculationType.LOADS && (
            <div className="bg-gray-800/40 border border-white/10 rounded overflow-hidden shadow-xl break-inside-avoid">
              <div className="px-3 py-2 border-b border-white/10 bg-black/20 flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-200 uppercase tracking-widest">
                  Tabella 3.1.II & Tabella 2.5.I NTC 2018 — Sovraccarichi Variabili per Destinazione d'Uso e Coefficienti ψ
                </h3>
                <span className="text-[7px] font-bold bg-cyan-600 px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
                  CAP. 3.1 NTC 2018 VIGENTE
                </span>
              </div>
              <div className="p-3 overflow-x-auto">
                <table className="w-full text-[9px] sm:text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[8px] sm:text-[9px]">
                      <th className="py-2 px-2">Cat.</th>
                      <th className="py-2 px-2">Destinazione d'Uso</th>
                      <th className="py-2 px-2 text-center">qk [kN/m²]</th>
                      <th className="py-2 px-2 text-center">Qk [kN]</th>
                      <th className="py-2 px-2 text-center">Hk [kN/m]</th>
                      <th className="py-2 px-2 text-center">ψ0</th>
                      <th className="py-2 px-2 text-center">ψ1</th>
                      <th className="py-2 px-2 text-center">ψ2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(OCCUPANCY_LOADS_TABLE) as OccupancyCategory[]).map((cat) => {
                      const info = OCCUPANCY_LOADS_TABLE[cat];
                      const isActive = loadsState.category === cat;
                      return (
                        <tr
                          key={cat}
                          onClick={() => setLoadsState({ ...loadsState, category: cat })}
                          className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${isActive ? 'bg-cyan-500/15' : 'hover:bg-white/5'}`}
                        >
                          <td className={`py-2 px-2 font-black whitespace-nowrap ${isActive ? 'text-cyan-400' : 'text-white'}`}>
                            {info.code}
                          </td>
                          <td className="py-2 px-2">
                            <div className={`font-semibold ${isActive ? 'text-cyan-300' : 'text-gray-200'}`}>{info.label}</div>
                            <div className="text-[8px] text-gray-500 hidden sm:block">{info.description}</div>
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-cyan-400">{info.qk.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center font-mono text-gray-300">{info.Qk.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center font-mono text-gray-300">{info.Hk.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center font-mono text-gray-400">{info.psi0.toFixed(1)}</td>
                          <td className="py-2 px-2 text-center font-mono text-gray-400">{info.psi1.toFixed(1)}</td>
                          <td className="py-2 px-2 text-center font-mono text-gray-400">{info.psi2.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-3 pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[8px] sm:text-[9px] text-gray-400">
                  <div>
                    <strong className="text-cyan-400 uppercase">Pesi Unità di Volume Principali (Tab. 3.1.I NTC 2018):</strong> Calcestruzzo armato = 25.0 kN/m³ • Calcestruzzo ordinario = 24.0 kN/m³ • Acciaio = 78.5 kN/m³ • Muratura mattoni pieni = 18.0 kN/m³ • Muratura mattoni forati = 11.0 kN/m³ • Malta di cemento = 21.0 kN/m³ • Legno conifere/lamellare = 4.5–5.0 kN/m³.
                  </div>
                  <div>
                    <strong className="text-cyan-400 uppercase">Incidenza Divisori Interni G2,tr (§ 3.1.3.1 NTC 2018):</strong> Peso proprio parete ≤ 1.00 kN/m → 0.40 kN/m² • 1.00 &lt; G2 ≤ 2.00 kN/m → 0.80 kN/m² • 2.00 &lt; G2 ≤ 3.00 kN/m → 1.20 kN/m² • 3.00 &lt; G2 ≤ 4.00 kN/m → 1.60 kN/m² • 4.00 &lt; G2 ≤ 5.00 kN/m → 2.00 kN/m².
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Normative Reference Table for Thermal / Climatic Zones */}
          {activeTab === CalculationType.THERMAL && (
            <div className="bg-gray-800/40 border border-white/10 rounded overflow-hidden shadow-xl break-inside-avoid">
              <div className="px-3 py-2 border-b border-white/10 bg-black/20 flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-200 uppercase tracking-widest">
                  Tabella Trasmittanze Termiche Limite Ulim [W/m²K] & Zone Climatiche (DM 26/06/2015 - DPR 412/93)
                </h3>
                <span className="text-[7px] font-bold bg-emerald-600 px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
                  {thermalState.scopeType === 'riqualificazione' ? 'Riqualificazione (App. B)' : 'Edificio Riferimento (App. A)'}
                </span>
              </div>
              <div className="p-3 overflow-x-auto">
                <table className="w-full text-[9px] sm:text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[8px] sm:text-[9px]">
                      <th className="py-2 px-2">Elemento / Chiusura</th>
                      {(['A', 'B', 'C', 'D', 'E', 'F'] as ClimaticZone[]).map((z) => (
                        <th
                          key={z}
                          className={`py-2 px-2 text-center ${thermalState.climaticZone === z ? 'text-emerald-400 font-black bg-emerald-500/10 rounded-t' : ''}`}
                        >
                          Zona {z}
                          <div className="text-[7px] font-normal text-gray-500">
                            {z === 'A' ? '≤600 GG' : z === 'B' ? '601-900' : z === 'C' ? '901-1400' : z === 'D' ? '1401-2100' : z === 'E' ? '2101-3000' : '>3000 GG'}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(THERMAL_ELEMENT_LABELS) as ThermalElementType[]).map((el) => {
                      const isRowActive = thermalState.elementType === el;
                      return (
                        <tr
                          key={el}
                          onClick={() => setThermalState({ ...thermalState, elementType: el })}
                          className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${isRowActive ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                        >
                          <td className={`py-2 px-2 font-semibold ${isRowActive ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {THERMAL_ELEMENT_LABELS[el]}
                          </td>
                          {(['A', 'B', 'C', 'D', 'E', 'F'] as ClimaticZone[]).map((z) => {
                            const val = TRANSMITTANCE_LIMITS[thermalState.scopeType][el][z];
                            const isCellSelected = isRowActive && thermalState.climaticZone === z;
                            return (
                              <td
                                key={z}
                                className={`py-2 px-2 text-center font-mono ${
                                  isCellSelected
                                    ? 'bg-emerald-500 text-black font-black rounded shadow'
                                    : thermalState.climaticZone === z
                                    ? 'bg-emerald-500/5 text-emerald-300 font-bold'
                                    : 'text-gray-300'
                                }`}
                              >
                                {val.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="text-[8px] text-gray-400 mt-2">
                  <strong>Comuni di riferimento Zona {thermalState.climaticZone}:</strong> {CLIMATIC_ZONE_INFO[thermalState.climaticZone].cities} — <strong>Accensione impianti:</strong> {CLIMATIC_ZONE_INFO[thermalState.climaticZone].period} ({CLIMATIC_ZONE_INFO[thermalState.climaticZone].hours}).
                </p>
              </div>
            </div>
          )}

          {/* Normative Reference Table for Seismic Zones */}
          {activeTab === CalculationType.SEISMIC && (
            <div className="bg-gray-800/40 border border-white/10 rounded overflow-hidden shadow-xl break-inside-avoid">
              <div className="px-3 py-2 border-b border-white/10 bg-black/20 flex justify-between items-center">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-200 uppercase tracking-widest">
                  Classificazione Zone Sismiche Italiane (OPCM 3274 / NTC 2018)
                </h3>
                <span className="text-[7px] font-bold bg-red-600 px-1.5 py-0.5 rounded text-white tracking-widest">
                  PERICOLOSITÀ SISMICA
                </span>
              </div>
              <div className="p-3 overflow-x-auto">
                <table className="w-full text-[9px] sm:text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[8px] sm:text-[9px]">
                      <th className="py-2 px-2">Zona</th>
                      <th className="py-2 px-2">Pericolosità</th>
                      <th className="py-2 px-2">ag Riferimento (SLV)</th>
                      <th className="py-2 px-2">Aree e Regioni Principali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([SeismicZone.Z1, SeismicZone.Z2, SeismicZone.Z3, SeismicZone.Z4] as SeismicZone[]).map((z) => {
                      const info = SEISMIC_ZONE_INFO[z];
                      const isActive = seismicState.zone === z;
                      return (
                        <tr
                          key={z}
                          onClick={() => handleSeismicZoneChange(z)}
                          className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${isActive ? 'bg-red-500/15' : 'hover:bg-white/5'}`}
                        >
                          <td className={`py-2 px-2 font-black ${isActive ? 'text-red-400' : 'text-white'}`}>
                            Zona {z}
                          </td>
                          <td className={`py-2 px-2 font-semibold ${isActive ? 'text-red-300' : 'text-gray-300'}`}>
                            {info.riskLabel}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-orange-400">
                            {info.agRef.toFixed(2)} g
                          </td>
                          <td className="py-2 px-2 text-gray-400">
                            {info.regions}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Data Table */}
          <div className="bg-gray-800/40 border border-white/10 rounded overflow-hidden shadow-xl break-inside-avoid">
            <div className="px-3 py-2 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-200 uppercase tracking-widest">Dettagli di Calcolo</h3>
              <span className="text-[7px] font-bold bg-orange-600 px-1.5 py-0.5 rounded text-white tracking-widest">NTC 2018</span>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-[10px] sm:text-xs text-left">
                <tbody>
                  {result.details.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-2 text-gray-400 font-medium pl-1">{row.label}</td>
                      <td className={`py-2 text-right pr-1 ${row.highlight ? 'text-sm font-bold text-orange-500' : 'text-gray-200 font-semibold'}`}>
                        {row.value} <span className="text-[8px] text-gray-500 font-normal">{row.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Screen Footer */}
      <footer className="w-full py-12 px-4 mt-auto no-print relative z-10 bg-gradient-to-b from-transparent to-black/40">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* IP Security Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-900/10 mb-6 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Shield size={10} className="text-orange-500" />
            <span className="text-[9px] font-bold text-orange-500 tracking-widest uppercase">IP Security Protocol</span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-2">
            DEVELOPED BY <span className="text-orange-500">EFREM GIANNESSI</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase mb-8">
            Concrete Optimization Engineering Solutions
          </p>

          {/* Links Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.8)]"></div>
              <span className="text-[9px] font-bold text-gray-500 tracking-widest">2024-2025 ALL RIGHTS RESERVED</span>
            </div>
            <a href="https://www.efremgiannessi.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group cursor-pointer transition-colors">
              <Globe size={12} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
              <span className="text-[9px] font-bold text-gray-500 group-hover:text-orange-500 tracking-widest transition-colors">EFREMGIANNESSI.ORG</span>
            </a>
          </div>

          {/* Legal Box */}
          <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
             {/* Subtle glow effect behind legal box */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-50"></div>
             
             <p className="text-[8px] sm:text-[9px] text-gray-600 font-medium leading-loose tracking-wider uppercase max-w-3xl mx-auto">
               Legal: Core algorithms are the exclusive property of Efrem Giannessi. Unauthorized reproduction or reverse engineering is strictly prohibited and protected by international IP laws.
             </p>
          </div>

        </div>
      </footer>

      {/* --- PRINT FOOTER --- */}
      <div className="hidden print-only mt-6 pt-4 border-t border-gray-400 text-center">
         <p className="text-[9px] font-bold mb-1 uppercase">COPYRIGHT © 2025 EFREM GIANNESSI. TUTTI I DIRITTI RISERVATI.</p>
         <p className="text-[7px] text-gray-600 leading-tight max-w-xl mx-auto">
           Il presente report è stato generato tramite NTC 2018 Calculator. È vietata la riproduzione o ingegneria inversa senza autorizzazione.
           L'utilizzo dei dati è a responsabilità esclusiva dell'utente professionale. L'autore non si assume responsabilità per errori.
         </p>
         <p className="text-[7px] text-orange-700 mt-1 font-mono">https://www.efremgiannessi.org/</p>
      </div>
    </div>
  );
};

export default App;