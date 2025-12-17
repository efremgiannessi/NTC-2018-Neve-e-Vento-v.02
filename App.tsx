import React, { useState, useMemo, useEffect } from 'react';
import { Snowflake, Wind, Layers, Calculator, Printer, AlertTriangle, FileText, Info, RotateCcw, FileSpreadsheet, Download } from 'lucide-react';
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
  // --- State ---
  const [activeTab, setActiveTab] = useState<CalculationType>(CalculationType.SNOW);
  const [projectTitle, setProjectTitle] = useState<string>('');
  
  const [snowState, setSnowState] = useState<SnowState>(INITIAL_SNOW_STATE);
  const [windState, setWindState] = useState<WindState>(INITIAL_WIND_STATE);
  const [driftState, setDriftState] = useState<DriftState>(INITIAL_DRIFT_STATE);

  // --- Dynamic Title Effect (SEO/UX) ---
  useEffect(() => {
    const titles = {
      [CalculationType.SNOW]: 'Carico Neve | NTC 2018',
      [CalculationType.WIND]: 'Pressione Vento | NTC 2018',
      [CalculationType.DRIFT]: 'Accumulo Neve | NTC 2018'
    };
    document.title = projectTitle ? `${projectTitle} - ${titles[activeTab]}` : titles[activeTab];
  }, [activeTab, projectTitle]);

  // --- Calculations ---
  const result: CalculationResult = useMemo(() => {
    switch (activeTab) {
      case CalculationType.SNOW:
        return calculateSnow(snowState);
      case CalculationType.WIND:
        return calculateWind(windState);
      case CalculationType.DRIFT:
        return calculateDrift(driftState, snowState);
      default:
        return calculateSnow(snowState);
    }
  }, [activeTab, snowState, windState, driftState]);

  // --- Handlers ---
  const handlePrint = () => {
    window.print();
  };

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
    // Generate an HTML table for Excel (preserves formatting better than CSV without heavy libraries)
    const title = projectTitle || "Report_NTC_2018";
    const typeLabel = activeTab === CalculationType.SNOW ? 'Carico Neve' : activeTab === CalculationType.WIND ? 'Pressione Vento' : 'Accumulo Neve';
    
    let tableRows = result.details.map(row => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 5px; background-color: #f9f9f9;">${row.label}</td>
        <td style="border: 1px solid #ccc; padding: 5px; font-weight: bold; text-align: right;">${row.value} ${row.unit || ''}</td>
      </tr>
    `).join('');

    // Add main result row
    tableRows += `
      <tr>
        <td style="border: 2px solid #000; padding: 10px; background-color: #e0e7ff; font-weight: bold;">RISULTATO PRINCIPALE</td>
        <td style="border: 2px solid #000; padding: 10px; background-color: #e0e7ff; font-weight: bold; text-align: right; color: #312e81; font-size: 14pt;">${result.mainValue} kN/m²</td>
      </tr>
    `;

    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${typeLabel}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
        </style>
      </head>
      <body>
        <h3>${title} - ${typeLabel}</h3>
        <p>Generato da NTC 2018 Calculator - Efrem Giannessi</p>
        <table>
          <thead>
            <tr style="background-color: #1f2937; color: white;">
              <th style="border: 1px solid #000; padding: 8px;">Parametro</th>
              <th style="border: 1px solid #000; padding: 8px;">Valore</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <br/>
        <p style="font-size: 10px; color: #666;">Disclaimer: Valori indicativi per pre-dimensionamento.</p>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${typeLabel}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // --- Render Helpers ---
  const inputClass = "w-full bg-gray-900/50 border border-white/10 text-white text-sm rounded-lg block p-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder-gray-500 backdrop-blur-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5 ml-1";
  
  const renderInputSection = () => {
    if (activeTab === CalculationType.SNOW) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h2 className="text-xl font-bold text-white drop-shadow-md">Parametri Neve</h2>
            <p className="text-xs text-gray-400">Rif. NTC 2018 §3.4</p>
          </div>

          <div>
            <label className={labelClass}>Zona Climatica</label>
            <select 
              value={snowState.zone} 
              onChange={(e) => setSnowState({...snowState, zone: e.target.value as SnowZone})}
              className={inputClass}
            >
              <option value={SnowZone.I_ALP}>Zona I - Alpina</option>
              <option value={SnowZone.I_MED}>Zona I - Mediterranea</option>
              <option value={SnowZone.II}>Zona II</option>
              <option value={SnowZone.III}>Zona III</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Altitudine (m s.l.m.)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="0" max="1500" 
                value={snowState.altitude} 
                onChange={(e) => setSnowState({...snowState, altitude: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
              />
              <input 
                type="number" 
                value={snowState.altitude}
                onChange={(e) => setSnowState({...snowState, altitude: parseInt(e.target.value)})}
                className={`${inputClass} w-24 text-center font-mono`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Inclinazione (°)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="0" max="80" 
                value={snowState.angle} 
                onChange={(e) => setSnowState({...snowState, angle: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
              />
              <input 
                type="number" 
                value={snowState.angle}
                onChange={(e) => setSnowState({...snowState, angle: parseInt(e.target.value)})}
                className={`${inputClass} w-24 text-center font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className={labelClass}>Coeff. Ce</label>
               <select 
                 value={snowState.ce}
                 onChange={(e) => setSnowState({...snowState, ce: parseFloat(e.target.value)})}
                 className={inputClass}
               >
                 <option value={1.0}>1.0</option>
                 <option value={0.8}>0.8</option>
                 <option value={1.2}>1.2</option>
               </select>
             </div>
             <div>
               <label className={labelClass}>Coeff. Ct</label>
               <input 
                 type="number" step="0.1"
                 value={snowState.ct}
                 onChange={(e) => setSnowState({...snowState, ct: parseFloat(e.target.value)})}
                 className={inputClass}
               />
             </div>
          </div>
        </div>
      );
    } else if (activeTab === CalculationType.WIND) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="border-l-4 border-teal-500 pl-4 py-1">
            <h2 className="text-xl font-bold text-white drop-shadow-md">Parametri Vento</h2>
            <p className="text-xs text-gray-400">Rif. NTC 2018 §3.3</p>
          </div>
          
           <div>
            <label className={labelClass}>Zona Vento</label>
            <select 
              value={windState.zone} 
              onChange={(e) => setWindState({...windState, zone: e.target.value as WindZone})}
              className={inputClass}
            >
              {[1,2,3,4,5,6,7,8,9].map(z => <option key={z} value={String(z)}>Zona {z}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Classe Rugosità</label>
            <select 
              value={windState.roughness}
              onChange={(e) => setWindState({...windState, roughness: e.target.value as RoughnessClass})}
              className={inputClass}
            >
              <option value={RoughnessClass.A}>A - Urbana densa</option>
              <option value={RoughnessClass.B}>B - Urbana/Sub</option>
              <option value={RoughnessClass.C}>C - Rurale</option>
              <option value={RoughnessClass.D}>D - Mare/Costiera</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Altezza Edificio (m)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="1" max="100" 
                value={windState.height} 
                onChange={(e) => setWindState({...windState, height: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-colors"
              />
              <input 
                type="number" 
                value={windState.height}
                onChange={(e) => setWindState({...windState, height: parseInt(e.target.value)})}
                className={`${inputClass} w-24 text-center font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className={labelClass}>Dist. Costa (km)</label>
               <input 
                 type="number" 
                 value={windState.distanceCoast}
                 onChange={(e) => setWindState({...windState, distanceCoast: parseFloat(e.target.value)})}
                 className={inputClass}
               />
             </div>
             <div>
               <label className={labelClass}>Coeff. Cp</label>
               <input 
                 type="number" step="0.1"
                 value={windState.cp}
                 onChange={(e) => setWindState({...windState, cp: parseFloat(e.target.value)})}
                 className={inputClass}
               />
             </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h2 className="text-xl font-bold text-white drop-shadow-md">Accumulo Neve</h2>
            <p className="text-xs text-gray-400">Salto di quota (NTC §3.4.4)</p>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-sm p-4 rounded-xl border border-blue-500/20 flex gap-3 items-start">
             <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
             <p className="text-sm text-blue-200 leading-snug">
               Il calcolo dell'accumulo dipende dai parametri Neve (zona/altitudine). Assicurati di aver impostato correttamente la scheda "Neve".
             </p>
          </div>

          <div>
            <label className={labelClass}>Tipologia</label>
            <select 
              value={driftState.preset}
              onChange={handleDriftPreset}
              className={inputClass}
            >
              <option value="custom">Personalizzato</option>
              <option value="shed">Shed Industriale</option>
              <option value="res_balcony">Balcone/Terrazzo</option>
              <option value="warehouse">Capannone</option>
              <option value="parapet">Parapetto</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Dislivello h (m)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="0.5" max="10" step="0.1"
                value={driftState.heightH} 
                onChange={(e) => setDriftState({...driftState, heightH: parseFloat(e.target.value), preset: 'custom'})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors"
              />
              <input 
                type="number" step="0.1"
                value={driftState.heightH}
                onChange={(e) => setDriftState({...driftState, heightH: parseFloat(e.target.value), preset: 'custom'})}
                className={`${inputClass} w-24 text-center font-mono`}
              />
            </div>
          </div>

          <div>
             <label className={labelClass}>Lunghezza copertura b1 (m)</label>
             <input 
               type="number" 
               value={driftState.lengthB1}
               onChange={(e) => setDriftState({...driftState, lengthB1: parseFloat(e.target.value), preset: 'custom'})}
               className={inputClass}
             />
          </div>

           <div>
             <label className={labelClass}>Peso spec. Neve γ (kN/m³)</label>
             <input 
               type="number" step="0.1"
               value={driftState.gamma}
               onChange={(e) => setDriftState({...driftState, gamma: parseFloat(e.target.value)})}
               className={inputClass}
             />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Developer Credits Banner - Screen Only */}
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-white/10 py-3 px-4 text-center no-print relative z-50 shadow-md">
        <p className="text-sm md:text-base text-gray-300 font-medium tracking-wide">
          Software progettato e sviluppato da{' '}
          <a 
            href="https://www.efremgiannessi.org" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
          >
            Efrem Giannessi
          </a>
        </p>
      </div>

      {/* Header - Screen */}
      <header className="bg-gray-900/60 backdrop-blur-xl border-b border-white/10 z-20 sticky top-0 no-print transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-900/50 border border-white/10">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-none tracking-tight drop-shadow-sm">NTC 2018 Calculator</h1>
              <span className="text-xs text-gray-400 font-medium tracking-[0.2em] uppercase">Neve | Vento | Accumulo</span>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Stato Sistema</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </span>
              <span className="text-sm font-semibold text-gray-200 tracking-tight">Online & Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- PRINT ONLY HEADER --- */}
      <div className="hidden print-only mb-6 border-b-2 border-gray-800 pb-4">
         <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Report di Calcolo - NTC 2018</h1>
              <p className="text-base text-gray-700 font-semibold mb-2">
                 Software progettato e sviluppato da <a href="https://www.efremgiannessi.org/" className="text-blue-800 underline">Efrem Giannessi</a>
              </p>
              <p className="text-sm text-gray-600">
                <a href="https://www.efremgiannessi.org/" className="underline">https://www.efremgiannessi.org/</a>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Data: {new Date().toLocaleDateString('it-IT')}</p>
              <p className="text-sm text-gray-600">Tipologia: {activeTab === CalculationType.SNOW ? 'Carico Neve' : activeTab === CalculationType.WIND ? 'Pressione Vento' : 'Accumulo Neve'}</p>
            </div>
         </div>
      </div>

      <main className="flex-grow max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-0">
        
        {/* Sidebar Controls */}
        <aside className="lg:col-span-3 space-y-6 no-print">
          
          {/* Project Title Input */}
          <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
               Nome Progetto / Riferimento
             </label>
             <input 
               type="text" 
               placeholder="Es. Capannone Rossi"
               value={projectTitle}
               onChange={(e) => setProjectTitle(e.target.value)}
               className={inputClass}
             />
          </div>

          {/* Tabs */}
          <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex shadow-2xl">
            <button 
              onClick={() => setActiveTab(CalculationType.SNOW)}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${activeTab === CalculationType.SNOW ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Snowflake size={16} /> Neve
            </button>
            <button 
              onClick={() => setActiveTab(CalculationType.WIND)}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${activeTab === CalculationType.WIND ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 ring-1 ring-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Wind size={16} /> Vento
            </button>
            <button 
              onClick={() => setActiveTab(CalculationType.DRIFT)}
              className={`flex-1 py-2.5 text-sm font-medium text-center transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${activeTab === CalculationType.DRIFT ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 ring-1 ring-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Layers size={16} /> Accumulo
            </button>
          </div>

          {/* Input Panel */}
          <div className="backdrop-blur-md bg-gray-800/40 border border-white/10 rounded-2xl shadow-2xl p-6">
            {renderInputSection()}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={handleReset}
               className="col-span-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 px-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 text-xs font-medium"
               title="Resetta tutti i campi"
             >
               <RotateCcw size={18} /> 
               Reset
             </button>
             
             <button 
               onClick={handleExcelExport}
               className="col-span-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 px-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 text-xs font-medium"
               title="Esporta in Excel"
             >
               <FileSpreadsheet size={18} /> 
               Excel
             </button>

             <button 
                onClick={handlePrint}
                className="col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/30 border border-white/10 flex items-center justify-center gap-2 group"
              >
                <Printer size={18} className="group-hover:scale-110 transition-transform" /> 
                Stampa Report / PDF
              </button>
          </div>

           {/* Disclaimer */}
           <div className="backdrop-blur-sm bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-xl border-y border-r border-yellow-500/10">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="text-yellow-500 w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-yellow-100/90 leading-relaxed">
                  Strumento indicativo per pre-dimensionamento. I valori devono essere validati da un ingegnere abilitato.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <section className="lg:col-span-9 space-y-8">
          
          {/* Project Title Display (if set) */}
          {projectTitle && (
            <div className="backdrop-blur-md bg-gray-800/40 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 animate-fade-in break-after-avoid">
               <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                  <FileText size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{projectTitle}</h2>
                  <p className="text-xs text-gray-400">Riferimento Progetto</p>
               </div>
            </div>
          )}

          {/* Main Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultCard 
              label={activeTab === CalculationType.WIND ? "Pressione Vento (p)" : activeTab === CalculationType.DRIFT ? "Carico Accumulo (max)" : "Carico Neve Totale (qs)"}
              value={result.mainValue}
              unit="kN/m²"
              isMain={true}
              icon={activeTab === CalculationType.WIND ? <Wind /> : <Snowflake />}
            />
            <ResultCard 
              label={result.secResult1.label}
              value={result.secResult1.value}
              unit={result.secResult1.unit}
              colorClass="text-gray-100"
            />
            <ResultCard 
              label={result.secResult2.label}
              value={result.secResult2.value}
              unit={result.secResult2.unit}
              colorClass="text-gray-100"
            />
          </div>

          {/* Stats for Drift (Conditional) */}
          {activeTab === CalculationType.DRIFT && result.stats && (
            <div className="backdrop-blur-md bg-gray-800/40 border border-purple-500/30 rounded-2xl shadow-2xl p-5 animate-fade-in break-inside-avoid">
               <h4 className="text-sm font-bold text-purple-300 uppercase mb-4 flex items-center gap-2 tracking-wider">
                 <FileText size={16} /> Statistiche Accumulo
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-400 uppercase tracking-wide">Lunghezza (ls)</p>
                   <p className="text-xl font-bold text-white mt-1">{result.stats.ls} m</p>
                 </div>
                 <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-400 uppercase tracking-wide">Peso Cuneo</p>
                   <p className="text-xl font-bold text-white mt-1">{result.stats.weight} kg/m</p>
                 </div>
                 <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-400 uppercase tracking-wide">Volume Neve</p>
                   <p className="text-xl font-bold text-white mt-1">{result.stats.volume} m³/m</p>
                 </div>
               </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-6">
            <ChartContainer 
              title={activeTab === CalculationType.SNOW ? "Variazione Carico vs Altitudine" : activeTab === CalculationType.WIND ? "Pressione vs Altezza" : "Profilo di Carico"}
              data={result.chartData1}
              dataKeyX="x"
              dataKeyY="y"
              color={activeTab === CalculationType.WIND ? "#2DD4BF" : activeTab === CalculationType.DRIFT ? "#A855F7" : "#60A5FA"}
              type={activeTab === CalculationType.DRIFT ? 'area' : 'line'}
            />
            <ChartContainer 
              title={activeTab === CalculationType.SNOW ? "Coeff. Forma vs Inclinazione" : activeTab === CalculationType.WIND ? "Coeff. Esposizione (Ce)" : "Peso Totale vs Altezza Accumulo"}
              data={result.chartData2}
              dataKeyX="x"
              dataKeyY="y"
              color={activeTab === CalculationType.WIND ? "#818CF8" : activeTab === CalculationType.DRIFT ? "#EC4899" : "#34D399"}
            />
          </div>

          {/* Detailed Table */}
          <div className="backdrop-blur-md bg-gray-800/40 border border-white/10 rounded-2xl shadow-2xl overflow-hidden break-inside-avoid">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Dettagli di Calcolo</h3>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-gray-300 border border-white/5 tracking-widest">NTC 2018</span>
            </div>
            <div className="p-6">
              <table className="min-w-full text-sm text-left text-gray-300">
                <tbody>
                  {result.details.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors print:border-gray-300">
                      <td className="py-3 text-gray-400 font-medium print:text-black pl-2">{row.label}</td>
                      <td className={`py-3 text-right pr-2 ${row.highlight ? 'text-xl font-bold text-white print:text-black drop-shadow-sm' : 'text-gray-200 print:text-black font-semibold'}`}>
                        {row.value} {row.unit && <span className="text-gray-500 text-xs ml-1 print:text-gray-700 font-normal">{row.unit}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900/80 backdrop-blur-md border-t border-white/10 py-8 mt-auto no-print">
        <div className="max-w-[1600px] mx-auto px-4 text-center flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-2">&copy; {new Date().getFullYear()} - Strumento Professionale per Ingegneria Civile</p>
          <div className="flex justify-center gap-4 text-xs text-gray-600 mb-4">
            <span>v2.1.0</span>
            <span>•</span>
            <span>Made with React & Tailwind</span>
          </div>
          
          <a href="https://app.netlify.com/projects/ntc-2018-neve-vento-v02/deploys" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
            <img src="https://api.netlify.com/api/v1/badges/78d4a1c9-860c-4a41-a5d6-1626fd9f6cd4/deploy-status" alt="Netlify Status" />
          </a>
        </div>
      </footer>

      {/* --- PRINT ONLY FOOTER --- */}
      <div className="hidden print-only mt-auto pt-8 border-t border-gray-300 text-center">
         <p className="text-xs font-bold text-gray-800 mb-1">COPYRIGHT © 2025 EFREM GIANNESSI. TUTTI I DIRITTI RISERVATI.</p>
         <p className="text-[10px] text-gray-600 leading-tight mx-auto max-w-4xl">
           Il presente report è stato generato automaticamente tramite il software NTC 2018 Calculator. È severamente vietata la riproduzione,
           distribuzione, modifica o ingegneria inversa del software senza autorizzazione esplicita. L'utilizzo dei dati e dei calcoli
           contenuti in questo documento è a totale discrezione e responsabilità dell'utente professionale. L'autore non si assume
           responsabilità per eventuali errori o imprecisioni nei calcoli automatici.
         </p>
         <p className="text-[10px] text-gray-600 mt-1 font-mono">https://www.efremgiannessi.org/</p>
      </div>
    </div>
  );
};

export default App;