'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Color palette
const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  chart1: '#8b5cf6',
  chart2: '#06b6d4',
  chart3: '#10b981',
  chart4: '#f59e0b',
  chart5: '#ef4444',
};

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

function ChartCard({ title, description, children, className, action }: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// Pipeline Value Chart (Area)
interface PipelineData {
  month: string;
  value: number;
  deals: number;
}

interface PipelineChartProps {
  data: PipelineData[];
  className?: string;
}

export function PipelineChart({ data, className }: PipelineChartProps) {
  return (
    <ChartCard
      title="Pipeline Value"
      description="Total deal value over time"
      className={className}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.chart1} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.chart1} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.month}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: <span className="font-semibold text-foreground">${payload[0].value?.toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Deals: <span className="font-semibold text-foreground">{payload[0].payload.deals}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.chart1}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Lead Sources Chart (Pie)
interface LeadSourceData {
  name: string;
  value: number;
}

interface LeadSourcesChartProps {
  data: LeadSourceData[];
  className?: string;
}

export function LeadSourcesChart({ data, className }: LeadSourcesChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <ChartCard
      title="Lead Sources"
      description="Where your leads come from"
      className={className}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const percent = ((payload[0].value as number) / total * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].value} leads ({percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Activity Chart (Bar)
interface ActivityData {
  day: string;
  tasks: number;
  calls: number;
  emails: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  className?: string;
}

export function ActivityChart({ data, className }: ActivityChartProps) {
  return (
    <ChartCard
      title="Weekly Activity"
      description="Tasks, calls, and emails this week"
      className={className}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <p className="text-sm font-medium mb-2">{label}</p>
                      {payload.map((item, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {item.name}: <span className="font-semibold text-foreground">{item.value}</span>
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="tasks" fill={COLORS.chart1} radius={[4, 4, 0, 0]} />
            <Bar dataKey="calls" fill={COLORS.chart2} radius={[4, 4, 0, 0]} />
            <Bar dataKey="emails" fill={COLORS.chart3} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.chart1 }} />
          <span className="text-sm text-muted-foreground">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.chart2 }} />
          <span className="text-sm text-muted-foreground">Calls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.chart3 }} />
          <span className="text-sm text-muted-foreground">Emails</span>
        </div>
      </div>
    </ChartCard>
  );
}

// Conversion Funnel
interface FunnelData {
  stage: string;
  count: number;
  conversion?: number;
}

interface ConversionFunnelProps {
  data: FunnelData[];
  className?: string;
}

export function ConversionFunnel({ data, className }: ConversionFunnelProps) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <ChartCard
      title="Conversion Funnel"
      description="Lead to deal conversion rates"
      className={className}
    >
      <div className="space-y-4 py-4">
        {data.map((item, index) => {
          const width = (item.count / maxCount) * 100;
          return (
            <div key={item.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.stage}</span>
                <span className="text-muted-foreground">
                  {item.count} {item.conversion && `(${item.conversion}%)`}
                </span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

// Mini sparkline for inline stats
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = COLORS.chart1, height = 40 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#sparklineGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
