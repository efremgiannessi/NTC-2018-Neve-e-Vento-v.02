import React, { useState, useMemo, useEffect } from 'react';
import { Snowflake, Wind, Layers, Calculator, Printer, AlertTriangle, FileText, Info, RotateCcw, FileSpreadsheet, Shield, Globe } from 'lucide-react';
import { CalculationType, SnowZone, WindZone, RoughnessClass, SnowState, WindState, DriftState, CalculationResult } from './types';
import { calculateSnow, calculateWind, calculateDrift } from './utils/calculations';
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculationType>(CalculationType.SNOW);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [snowState, setSnowState] = useState<SnowState>(INITIAL_SNOW_STATE);
  const [windState, setWindState] = useState<WindState>(INITIAL_WIND_STATE);
  const [driftState, setDriftState] = useState<DriftState>(INITIAL_DRIFT_STATE);

  useEffect(() => {
    const titles = {
      [CalculationType.SNOW]: 'Carico Neve | NTC 2018',
      [CalculationType.WIND]: 'Pressione Vento | NTC 2018',
      [CalculationType.DRIFT]: 'Accumulo Neve | NTC 2018'
    };
    document.title = projectTitle ? `${projectTitle} - ${titles[activeTab]}` : titles[activeTab];
  }, [activeTab, projectTitle]);

  const result: CalculationResult = useMemo(() => {
    switch (activeTab) {
      case CalculationType.SNOW: return calculateSnow(snowState);
      case CalculationType.WIND: return calculateWind(windState);
      case CalculationType.DRIFT: return calculateDrift(driftState, snowState);
      default: return calculateSnow(snowState);
    }
  }, [activeTab, snowState, windState, driftState]);

  const handlePrint = () => window.print();

  const handleReset = () => {
    if (window.confirm("Sei sicuro di voler resettare tutti i campi? I dati inseriti andranno persi.")) {
      setSnowState(INITIAL_SNOW_STATE);
      setWindState(INITIAL_WIND_STATE);
      setDriftState(INITIAL_DRIFT_STATE);
      setProjectTitle('');
      setActiveTab(CalculationType.SNOW);
    }
  };

  const handleExcelExport = () => {
    const title = projectTitle || "Report_NTC_2018";
    const typeLabel = activeTab === CalculationType.SNOW ? 'Carico Neve' : activeTab === CalculationType.WIND ? 'Pressione Vento' : 'Accumulo Neve';
    let tableRows = result.details.map(row => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 5px; background-color: #f9f9f9;">${row.label}</td>
        <td style="border: 1px solid #ccc; padding: 5px; font-weight: bold; text-align: right;">${row.value} ${row.unit || ''}</td>
      </tr>`).join('');

    tableRows += `<tr>
      <td style="border: 2px solid #000; padding: 10px; background-color: #fff7ed; font-weight: bold;">RISULTATO PRINCIPALE</td>
      <td style="border: 2px solid #000; padding: 10px; background-color: #fff7ed; font-weight: bold; text-align: right; color: #9a3412; font-size: 14pt;">${result.mainValue} kN/m²</td>
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
    link.download = `${title.replace(/\s+/g, '_')}_${typeLabel}.xls`;
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
            <label className={labelClass}>Zona Climatica</label>
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
               <input type="number" step="0.1" value={snowState.ce} onChange={(e) => setSnowState({...snowState, ce: parseFloat(e.target.value)})} className={inputClass} />
             </div>
             <div>
               <label className={labelClass}>Coeff. Ct</label>
               <input type="number" step="0.1" value={snowState.ct} onChange={(e) => setSnowState({...snowState, ct: parseFloat(e.target.value)})} className={inputClass} />
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
               <input type="number" value={windState.distanceCoast} onChange={(e) => setWindState({...windState, distanceCoast: parseFloat(e.target.value)})} className={inputClass} />
             </div>
             <div>
               <label className={labelClass}>Coeff. Cp</label>
               <input type="number" step="0.1" value={windState.cp} onChange={(e) => setWindState({...windState, cp: parseFloat(e.target.value)})} className={inputClass} />
             </div>
          </div>
        </div>
      );
    } else {
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
             <input type="number" value={driftState.lengthB1} onChange={(e) => setDriftState({...driftState, lengthB1: parseFloat(e.target.value), preset: 'custom'})} className={inputClass} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      
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
              <span className="text-[7px] sm:text-[9px] text-gray-500 uppercase font-bold tracking-widest">Neve • Vento • Accumulo</span>
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
            </div>
         </div>
      </div>

      <main className="flex-grow max-w-[1600px] mx-auto px-4 py-3 sm:py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Sidebar / Inputs */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4 no-print">
          
          <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded p-2 shadow-lg">
             <label className={labelClass}>Nome Progetto</label>
             <input type="text" placeholder="Riferimento..." value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className={inputClass} />
          </div>

          {/* Navigation Tabs - Mobile Optimized */}
          <div className="bg-black/40 border border-white/10 rounded p-0.5 flex shadow-lg overflow-hidden">
            <button onClick={() => setActiveTab(CalculationType.SNOW)} className={`flex-1 py-2 text-[9px] sm:text-[10px] font-bold rounded transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${activeTab === CalculationType.SNOW ? 'bg-orange-600 text-white shadow' : 'text-gray-400'}`}>
              <Snowflake size={12} /> NEVE
            </button>
            <button onClick={() => setActiveTab(CalculationType.WIND)} className={`flex-1 py-2 text-[9px] sm:text-[10px] font-bold rounded transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${activeTab === CalculationType.WIND ? 'bg-amber-600 text-white shadow' : 'text-gray-400'}`}>
              <Wind size={12} /> VENTO
            </button>
            <button onClick={() => setActiveTab(CalculationType.DRIFT)} className={`flex-1 py-2 text-[9px] sm:text-[10px] font-bold rounded transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${activeTab === CalculationType.DRIFT ? 'bg-orange-800 text-white shadow' : 'text-gray-400'}`}>
              <Layers size={12} /> ACCUMULO
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
          
          {projectTitle && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded p-2 flex items-center gap-2 no-print">
               <FileText size={14} className="text-orange-500" />
               <h2 className="text-[11px] font-bold text-white truncate">{projectTitle}</h2>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <ResultCard 
              label={activeTab === CalculationType.WIND ? "Pressione Vento" : activeTab === CalculationType.DRIFT ? "Carico Accumulo" : "Carico Neve Totale"}
              value={result.mainValue} unit="kN/m²" isMain={true} icon={activeTab === CalculationType.WIND ? <Wind /> : <Snowflake />}
            />
            <ResultCard label={result.secResult1.label} value={result.secResult1.value} unit={result.secResult1.unit} />
            <ResultCard label={result.secResult2.label} value={result.secResult2.value} unit={result.secResult2.unit} />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 print:block print:space-y-3">
            <ChartContainer 
              title={activeTab === CalculationType.DRIFT ? "Profilo Carico" : "Variazione Carico"}
              data={result.chartData1} dataKeyX="x" dataKeyY="y"
              color={activeTab === CalculationType.WIND ? "#fbbf24" : activeTab === CalculationType.DRIFT ? "#f97316" : "#ea580c"}
              type={activeTab === CalculationType.DRIFT ? 'area' : 'line'}
            />
            <ChartContainer 
              title={activeTab === CalculationType.WIND ? "Coeff. Esposizione" : "Coeff. Forma / Peso"}
              data={result.chartData2} dataKeyX="x" dataKeyY="y"
              color={activeTab === CalculationType.WIND ? "#f59e0b" : activeTab === CalculationType.DRIFT ? "#7c2d12" : "#fb923c"}
            />
          </div>

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