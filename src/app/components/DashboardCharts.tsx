'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface GroupChartProps {
  data: Array<{
    groupid: number;
    coursename: string;
    studentCount: number;
    maxStudents: number;
  }>;
}

export function GroupsBarChart({ data }: GroupChartProps) {
  const chartData = data.slice(0, 10).map((group) => ({
    name: `${group.coursename} (${group.groupid})`,
    Inscritos: group.studentCount,
    Capacidad: group.maxStudents,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Inscritos" fill="#0C2340" />
        <Bar dataKey="Capacidad" fill="#B15B29" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface CourseDistributionChartProps {
  data: Array<{
    coursename: string;
    studentCount: number;
  }>;
}

const COLORS = ['#0C2340', '#B15B29', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export function CourseDistributionPieChart({ data }: CourseDistributionChartProps) {
  // Use name field for Recharts compatibility
  const chartData = data.map(item => ({
    name: item.coursename,
    value: item.studentCount,
    coursename: item.coursename,
    studentCount: item.studentCount,
  }));

  const renderLabel = (entry: { name?: string; coursename?: string; percent?: number }) => {
    const label = entry.name || entry.coursename || '';
    return `${label}: ${((entry.percent || 0) * 100).toFixed(0)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface EnrollmentTrendChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

export function EnrollmentTrendLineChart({ data }: EnrollmentTrendChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    Inscripciones: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Inscripciones" stroke="#0C2340" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
