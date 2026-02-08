import React from 'react';

interface ResultCardProps {
  label: string;
  value: number | string;
  unit: string;
  isMain?: boolean;
  colorClass?: string;
  icon?: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, unit, isMain, colorClass = "text-gray-200", icon }) => {
  // Glassmorphism common classes
  const glassBase = "backdrop-blur-md bg-gray-800/40 border border-white/10 shadow-xl rounded transition-all duration-300";

  if (isMain) {
    return (
      <div className={`${glassBase} p-4 sm:p-5 border-t-2 border-t-orange-500 relative overflow-hidden group hover:bg-gray-800/60`}>
        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none mix-blend-overlay">
          <div className="w-24 h-24 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 relative z-10">{label}</p>
        <div className="flex items-baseline relative z-10">
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-lg">{value}</h3>
          <span className="ml-1.5 text-base sm:text-lg text-orange-500/80 font-bold">{unit}</span>
        </div>
        {icon && <div className="absolute -right-2 -bottom-4 text-7xl text-white/5 z-0 pointer-events-none transform rotate-12 group-hover:rotate-6 transition-transform">{icon}</div>}
      </div>
    );
  }

  return (
    <div className={`${glassBase} p-4 sm:p-5 border-t-2 border-t-gray-600/30 hover:bg-gray-800/60 hover:border-t-orange-500/50`}>
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
      <div className="flex items-baseline">
        <h3 className={`text-xl font-bold ${colorClass} drop-shadow-md`}>{value}</h3>
        <span className="ml-1.5 text-[10px] text-gray-500 font-bold uppercase">{unit}</span>
      </div>
    </div>
  );
};

export default ResultCard;