import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

interface ChartContainerProps {
  title: string;
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  color: string;
  type?: 'line' | 'area';
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, data, dataKeyX, dataKeyY, color, type = 'line' }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700 card break-inside-avoid">
      <h3 className="text-sm font-bold text-gray-300 mb-4">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={dataKeyX} stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                itemStyle={{ color: color }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line type="monotone" dataKey={dataKeyY} stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          ) : (
             <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={dataKeyX} stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                 itemStyle={{ color: color }}
                 labelStyle={{ color: '#9CA3AF' }}
              />
              <Area type="monotone" dataKey={dataKeyY} stroke={color} fill={color} fillOpacity={0.3} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;
