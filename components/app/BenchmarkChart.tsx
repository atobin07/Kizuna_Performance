'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDate } from '@/lib/utils'

export interface BenchmarkChartProps {
  data: { date: string; value: number; logged?: boolean }[]
  unit?: string
  movement?: string
}

// Solid gold dot for a saved value; hollow (open) dot when nothing was logged
// for that session — it sits on the scheduled target line.
function ProgressDot(props: {
  cx?: number
  cy?: number
  index?: number
  payload?: { logged?: boolean }
}) {
  const { cx, cy, index, payload } = props
  if (cx == null || cy == null) return <g key={index} />
  const logged = payload?.logged !== false
  return (
    <circle
      key={index}
      cx={cx}
      cy={cy}
      r={4}
      fill={logged ? '#C4922A' : '#0B0B0C'}
      stroke="#C4922A"
      strokeWidth={2}
    />
  )
}

/** Recharts line chart for a single movement's benchmark history. */
export function BenchmarkChart({ data, unit, movement }: BenchmarkChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-md border border-border bg-white/[0.02] text-sm text-muted-foreground">
        No history yet{movement ? ` for ${movement}` : ''}.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <CartesianGrid stroke="#3D3A35" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatDate(d, { year: undefined })}
          stroke="#3D3A35"
          tick={{ fill: '#A6A199', fontSize: 11 }}
          tickLine={false}
        />
        <YAxis
          stroke="#3D3A35"
          tick={{ fill: '#A6A199', fontSize: 11 }}
          tickLine={false}
          width={44}
          domain={['auto', 'auto']}
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
          formatter={(v: number | string) => [
            `${v}${unit ? ` ${unit}` : ''}`,
            movement ?? 'Value',
          ]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#C4922A"
          strokeWidth={2}
          dot={<ProgressDot />}
          activeDot={{ r: 5, fill: '#C4922A' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default BenchmarkChart
