import React, { useState, useMemo, useEffect } from 'react';
import { Snowflake, Wind, Layers, Calculator, Printer, AlertTriangle, FileText, Info, RotateCcw, FileSpreadsheet } from 'lucide-react';
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
      <td style="border: 2px solid #000; padding: 10px; background-color: #e0e7ff; font-weight: bold;">RISULTATO PRINCIPALE</td>
      <td style="border: 2px solid #000; padding: 10px; background-color: #e0e7ff; font-weight: bold; text-align: right; color: #312e81; font-size: 14pt;">${result.mainValue} kN/m²</td>
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

  const inputClass = "w-full bg-gray-900/50 border border-white/10 text-white text-sm rounded-lg block p-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-500 backdrop-blur-sm";
  const labelClass = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1";

  const renderInputs = () => {
    if (activeTab === CalculationType.SNOW) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="border-l-4 border-blue-500 pl-3">
            <h2 className="text-lg font-bold text-white">Parametri Neve</h2>
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
            <input type="range" min="0" max="1500" value={snowState.altitude} onChange={(e) => setSnowState({...snowState, altitude: parseInt(e.target.value)})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div>
            <label className={labelClass}>Inclinazione ({snowState.angle}°)</label>
            <input type="range" min="0" max="80" value={snowState.angle} onChange={(e) => setSnowState({...snowState, angle: parseInt(e.target.value)})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-4 animate-fade-in">
          <div className="border-l-4 border-teal-500 pl-3">
            <h2 className="text-lg font-bold text-white">Parametri Vento</h2>
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
            <input type="range" min="1" max="100" value={windState.height} onChange={(e) => setWindState({...windState, height: parseInt(e.target.value)})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-4 animate-fade-in">
          <div className="border-l-4 border-purple-500 pl-3">
            <h2 className="text-lg font-bold text-white">Accumulo Neve</h2>
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
            <input type="range" min="0.5" max="10" step="0.1" value={driftState.heightH} onChange={(e) => setDriftState({...driftState, heightH: parseFloat(e.target.value), preset: 'custom'})} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
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
      <div className="w-full bg-gray-900 border-b border-white/5 py-2 px-4 text-center no-print">
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium tracking-tight">
          Software progettato e sviluppato da{' '}
          <a href="https://www.efremgiannessi.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline">
            Efrem Giannessi
          </a>
        </p>
      </div>

      {/* Header - Screen Only */}
      <header className="bg-gray-900/40 backdrop-blur-xl border-b border-white/5 no-print sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg"><Calculator size={20} /></div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-white leading-tight">NTC 2018 Calculator</h1>
              <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Neve • Vento • Accumulo</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
             <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-400">ONLINE</span>
             </div>
          </div>
        </div>
      </header>

      {/* --- PRINT HEADER --- */}
      <div className="hidden print-only mb-6 border-b border-black pb-4">
         <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Report di Calcolo NTC 2018</h1>
              <p className="text-sm font-bold">Sviluppato da: Efrem Giannessi (www.efremgiannessi.org)</p>
            </div>
            <div className="text-right text-xs">
              <p>Data: {new Date().toLocaleDateString('it-IT')}</p>
              <p>Progetto: {projectTitle || '-'}</p>
            </div>
         </div>
      </div>

      <main className="flex-grow max-w-[1600px] mx-auto px-4 py-4 sm:py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Sidebar / Inputs */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4 sm:space-y-6 no-print">
          
          <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
             <label className={labelClass}>Nome Progetto</label>
             <input type="text" placeholder="Riferimento..." value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className={inputClass} />
          </div>

          {/* Navigation Tabs - Mobile Optimized */}
          <div className="bg-gray-900/80 border border-white/10 rounded-xl p-1 flex shadow-xl overflow-hidden">
            <button onClick={() => setActiveTab(CalculationType.SNOW)} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${activeTab === CalculationType.SNOW ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>
              <Snowflake size={14} /> NEVE
            </button>
            <button onClick={() => setActiveTab(CalculationType.WIND)} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${activeTab === CalculationType.WIND ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400'}`}>
              <Wind size={14} /> VENTO
            </button>
            <button onClick={() => setActiveTab(CalculationType.DRIFT)} className={`flex-1 py-3 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${activeTab === CalculationType.DRIFT ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}>
              <Layers size={14} /> ACCUMULO
            </button>
          </div>

          <div className="bg-gray-800/40 border border-white/10 rounded-xl p-4 sm:p-6 shadow-2xl">
            {renderInputs()}
          </div>

          <div className="grid grid-cols-3 gap-2">
             <button onClick={handleReset} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold"><RotateCcw size={16} className="mb-1" /> RESET</button>
             <button onClick={handleExcelExport} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold"><FileSpreadsheet size={16} className="mb-1" /> EXCEL</button>
             <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-900/40"><Printer size={16} className="mb-1" /> STAMPA</button>
          </div>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
          
          {/* Mobile Title View */}
          {projectTitle && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex items-center gap-3 no-print">
               <FileText size={18} className="text-blue-400" />
               <h2 className="text-sm font-bold text-white truncate">{projectTitle}</h2>
            </div>
          )}

          {/* Results Grid - Responsive Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <ResultCard 
              label={activeTab === CalculationType.WIND ? "Pressione Vento" : activeTab === CalculationType.DRIFT ? "Carico Accumulo" : "Carico Neve Totale"}
              value={result.mainValue} unit="kN/m²" isMain={true} icon={activeTab === CalculationType.WIND ? <Wind /> : <Snowflake />}
            />
            <ResultCard label={result.secResult1.label} value={result.secResult1.value} unit={result.secResult1.unit} />
            <ResultCard label={result.secResult2.label} value={result.secResult2.value} unit={result.secResult2.unit} />
          </div>

          {/* Charts Area - Mobile Optimized */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 print:block print:space-y-4">
            <ChartContainer 
              title={activeTab === CalculationType.DRIFT ? "Profilo Carico" : "Variazione Carico"}
              data={result.chartData1} dataKeyX="x" dataKeyY="y"
              color={activeTab === CalculationType.WIND ? "#2DD4BF" : activeTab === CalculationType.DRIFT ? "#A855F7" : "#60A5FA"}
              type={activeTab === CalculationType.DRIFT ? 'area' : 'line'}
            />
            <ChartContainer 
              title={activeTab === CalculationType.WIND ? "Coeff. Esposizione" : "Coeff. Forma / Peso"}
              data={result.chartData2} dataKeyX="x" dataKeyY="y"
              color={activeTab === CalculationType.WIND ? "#818CF8" : activeTab === CalculationType.DRIFT ? "#EC4899" : "#34D399"}
            />
          </div>

          {/* Detailed Data Table */}
          <div className="bg-gray-800/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl break-inside-avoid">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-200 uppercase tracking-widest">Dettagli di Calcolo</h3>
              <span className="text-[8px] font-bold bg-white/10 px-2 py-1 rounded text-gray-400">NTC 2018</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <tbody>
                  {result.details.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 text-gray-400 font-medium pl-1">{row.label}</td>
                      <td className={`py-2.5 text-right pr-1 ${row.highlight ? 'text-lg font-bold text-white' : 'text-gray-200 font-semibold'}`}>
                        {row.value} <span className="text-[10px] text-gray-500 font-normal">{row.unit}</span>
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
      <footer className="bg-gray-900/60 border-t border-white/5 py-6 mt-auto no-print">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-500">&copy; 2025 • Efrem Giannessi • Strumento per Ingegneria Civile</p>
        </div>
      </footer>

      {/* --- PRINT FOOTER --- */}
      <div className="hidden print-only mt-8 pt-6 border-t border-gray-400 text-center">
         <p className="text-[10px] font-bold mb-2">COPYRIGHT © 2025 EFREM GIANNESSI. TUTTI I DIRITTI RISERVATI.</p>
         <p className="text-[8px] text-gray-600 leading-tight max-w-2xl mx-auto">
           Il presente report è stato generato tramite NTC 2018 Calculator. È vietata la riproduzione o ingegneria inversa senza autorizzazione.
           L'utilizzo dei dati è a responsabilità esclusiva dell'utente professionale. L'autore non si assume responsabilità per errori.
         </p>
         <p className="text-[8px] text-blue-800 mt-2 font-mono">https://www.efremgiannessi.org/</p>
      </div>
    </div>
  );
};

export default App;