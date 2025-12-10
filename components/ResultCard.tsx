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
  const glassBase = "backdrop-blur-md bg-gray-800/40 border border-white/10 shadow-2xl rounded-2xl";

  if (isMain) {
    return (
      <div className={`${glassBase} p-6 border-t-4 border-t-indigo-500 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none mix-blend-overlay">
          <div className="w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1 relative z-10">{label}</p>
        <div className="flex items-baseline relative z-10">
          <h3 className="text-5xl font-bold text-white tracking-tight drop-shadow-lg">{value}</h3>
          <span className="ml-2 text-xl text-gray-300 font-medium">{unit}</span>
        </div>
        {icon && <div className="absolute -right-4 -bottom-6 text-9xl text-white/5 z-0 pointer-events-none transform rotate-12">{icon}</div>}
      </div>
    );
  }

  return (
    <div className={`${glassBase} p-6 border-t-4 border-t-gray-600/50 hover:bg-gray-800/50 transition-colors duration-300`}>
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline">
        <h3 className={`text-2xl font-bold ${colorClass} drop-shadow-md`}>{value}</h3>
        <span className="ml-2 text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
};

export default ResultCard;