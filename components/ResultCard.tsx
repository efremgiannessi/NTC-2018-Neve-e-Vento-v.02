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
  if (isMain) {
    return (
      <div className={`bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-indigo-500 relative overflow-hidden card`}>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline relative z-10">
          <h3 className="text-4xl font-bold text-white">{value}</h3>
          <span className="ml-2 text-xl text-gray-400 font-medium">{unit}</span>
        </div>
        {icon && <div className="absolute -right-4 -bottom-6 text-9xl text-gray-700/20 z-0 pointer-events-none">{icon}</div>}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-gray-600 card">
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline">
        <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
        <span className="ml-2 text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
};

export default ResultCard;
