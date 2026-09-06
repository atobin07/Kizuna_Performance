'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDate } from '@/lib/utils'

export interface CalorieLiftChartProps {
  data: { date: string; calories: number; liftWeight: number }[]
}

/** Daily calories (bars, left axis) against combined main-lift weight logged that day (line, right axis). */
export function CalorieLiftChart({ data }: CalorieLiftChartProps) {
  const hasData = data.some((d) => d.calories > 0 || d.liftWeight > 0)

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-md border border-border bg-white/[0.02] text-sm text-muted-foreground">
        No data yet — log food and lifts to see the comparison.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="#3D3A35" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => formatDate(d, { year: undefined })}
            stroke="#3D3A35"
            tick={{ fill: '#A6A199', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            yAxisId="calories"
            stroke="#3D3A35"
            tick={{ fill: '#C4922A', fontSize: 11 }}
            tickLine={false}
            width={48}
            domain={[0, 'auto']}
          />
          <YAxis
            yAxisId="lift"
            orientation="right"
            stroke="#3D3A35"
            tick={{ fill: '#8B2E2E', fontSize: 11 }}
            tickLine={false}
            width={48}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#0A0A0A',
              border: '1px solid #3D3A35',
              borderRadius: 8,
              color: '#F4F1EC',
              fontSize: 12,
            }}
            labelStyle={{ color: '#A6A199' }}
            labelFormatter={(d) => formatDate(String(d))}
            formatter={(v: number, name: string) =>
              name === 'calories' ? [`${v} kcal`, 'Calories'] : [`${v} lb`, 'Lift weight']
            }
          />
          <Bar yAxisId="calories" dataKey="calories" fill="#C4922A" radius={[3, 3, 0, 0]} maxBarSize={18} />
          <Line
            yAxisId="lift"
            type="monotone"
            dataKey="liftWeight"
            stroke="#8B2E2E"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-kin" /> Calories (left axis)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-aka" /> Combined lift weight (right axis)
        </span>
      </div>
    </div>
  )
}

export default CalorieLiftChart
