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
    <div className="backdrop-blur-md bg-gray-800/40 border border-white/10 shadow-xl rounded p-4 break-inside-avoid">
      <h3 className="text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">{title}</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey={dataKeyX} 
                stroke="#6B7280" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#F3F4F6',
                  borderRadius: '0.25rem',
                  fontSize: '10px',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                }}
                itemStyle={{ color: color, padding: '2px 0' }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '0.125rem' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKeyY} 
                stroke={color} 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }} 
              />
            </LineChart>
          ) : (
             <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey={dataKeyX} 
                stroke="#6B7280" 
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                 contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#F3F4F6',
                  borderRadius: '0.25rem',
                  fontSize: '10px',
                  backdropFilter: 'blur(4px)'
                }}
                 itemStyle={{ color: color, padding: '2px 0' }}
                 labelStyle={{ color: '#9CA3AF' }}
              />
              <defs>
                <linearGradient id={`gradient-${dataKeyY}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey={dataKeyY} 
                stroke={color} 
                fill={`url(#gradient-${dataKeyY})`} 
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;