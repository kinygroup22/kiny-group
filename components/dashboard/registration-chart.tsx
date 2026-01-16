// components/dashboard/registration-chart.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Calendar, TrendingUp, BarChart3, UserPlus } from "lucide-react";

// Define the type for registration data
export interface RegistrationData {
  date: string;
  count: number;
}

interface RegistrationChartProps {
  data: RegistrationData[];
}

export function RegistrationChart({ data }: RegistrationChartProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Get the current theme and corresponding colors
  const getThemeColors = () => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        return {
          primary: 'oklch(0.78 0.08 68)', // #e3ba94 - lighter gold for dark mode
          grid: 'oklch(0.245 0.035 250)', // border color for dark mode
          text: 'oklch(0.945 0.008 85)', // foreground for dark mode
          cardBg: 'oklch(0.22 0.025 250)', // card for dark mode
          cardBorder: 'oklch(0.245 0.035 250)', // border for dark mode
        };
      }
    }
    return {
      primary: 'oklch(0.74 0.08 68)', // gold-400 for light mode
      grid: 'oklch(0.885 0.012 250)', // border color for light mode
      text: 'oklch(0.18 0.025 250)', // foreground for light mode
      cardBg: 'oklch(0.995 0.001 250)', // card for light mode
      cardBorder: 'oklch(0.885 0.012 250)', // border for light mode
    };
  };

  const colors = getThemeColors();

  // Format data for display
  const formatData = () => {
    if (viewMode === 'daily') {
      return data.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }));
    } else if (viewMode === 'monthly') {
      // Group by month
      const monthlyData: { [key: string]: number } = {};
      
      data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += item.count;
      });
      
      return Object.entries(monthlyData).map(([month, count]) => ({
        date: month,
        count,
        displayDate: month
      }));
    } else {
      // Group by year
      const yearlyData: { [key: string]: number } = {};
      
      data.forEach(item => {
        const year = new Date(item.date).getFullYear().toString();
        
        if (!yearlyData[year]) {
          yearlyData[year] = 0;
        }
        yearlyData[year] += item.count;
      });
      
      return Object.entries(yearlyData).map(([year, count]) => ({
        date: year,
        count,
        displayDate: year
      }));
    }
  };

  const chartData = formatData();

  // Calculate total registrations in the selected period
  const totalRegistrations = chartData.reduce((sum, item) => sum + item.count, 0);

  // Calculate average registrations
  const averageRegistrations = chartData.length > 0 
    ? Math.round(totalRegistrations / chartData.length) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={viewMode === 'daily' ? 'default' : 'outline'} 
                 className="cursor-pointer" 
                 onClick={() => setViewMode('daily')}>
            Daily
          </Badge>
          <Badge variant={viewMode === 'monthly' ? 'default' : 'outline'} 
                 className="cursor-pointer" 
                 onClick={() => setViewMode('monthly')}>
            Monthly
          </Badge>
          <Badge variant={viewMode === 'yearly' ? 'default' : 'outline'} 
                 className="cursor-pointer" 
                 onClick={() => setViewMode('yearly')}>
            Yearly
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={chartType === 'bar' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartType('bar')}
            className="h-8"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Bar
          </Button>
          <Button 
            variant={chartType === 'line' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartType('line')}
            className="h-8"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Line
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{totalRegistrations}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average per {viewMode === 'daily' ? 'day' : viewMode === 'monthly' ? 'month' : 'year'}</p>
                <p className="text-2xl font-bold">{averageRegistrations}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={colors.grid}
                opacity={0.3}
              />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: colors.text }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: colors.text }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.cardBg, 
                  borderColor: colors.cardBorder,
                  borderRadius: '6px',
                  color: colors.text
                }}
                labelStyle={{ color: colors.text }}
              />
              <Bar 
                dataKey="count" 
                fill={colors.primary} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={colors.grid}
                opacity={0.3}
              />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: colors.text }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: colors.text }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.cardBg, 
                  borderColor: colors.cardBorder,
                  borderRadius: '6px',
                  color: colors.text
                }}
                labelStyle={{ color: colors.text }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={colors.primary} 
                strokeWidth={2}
                dot={{ fill: colors.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}