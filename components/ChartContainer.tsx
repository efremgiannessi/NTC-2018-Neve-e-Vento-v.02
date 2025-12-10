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
    <div className="backdrop-blur-md bg-gray-800/40 border border-white/10 shadow-2xl rounded-2xl p-5 break-inside-avoid">
      <h3 className="text-sm font-bold text-gray-300 mb-4 tracking-wide uppercase">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey={dataKeyX} 
                stroke="#9CA3AF" 
                fontSize={12} 
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#F3F4F6',
                  borderRadius: '0.75rem',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: color }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '0.25rem' }}
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKeyY} 
                stroke={color} 
                strokeWidth={3} 
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} 
              />
            </LineChart>
          ) : (
             <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey={dataKeyX} 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                 contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#F3F4F6',
                  borderRadius: '0.75rem',
                  backdropFilter: 'blur(4px)'
                }}
                 itemStyle={{ color: color }}
                 labelStyle={{ color: '#9CA3AF' }}
              />
              <defs>
                <linearGradient id={`gradient-${dataKeyY}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey={dataKeyY} 
                stroke={color} 
                fill={`url(#gradient-${dataKeyY})`} 
                strokeWidth={3}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;