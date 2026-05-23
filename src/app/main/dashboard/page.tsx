"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DashboardStats, 
  GroupStats, 
  EnrollmentTrend, 
  CourseDistribution, 
  RecentActivity,
  fetchAllDashboardData
} from "@/app/supabase/dashboardActions";
import StatsCard from "@/app/components/StatsCard";
import InteractiveGroupsChart from "@/app/components/InteractiveGroupsChart";
import { 
  GroupsBarChart, 
  CourseDistributionPieChart, 
  EnrollmentTrendLineChart 
} from "@/app/components/DashboardCharts";


export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<CourseDistribution[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar todos los datos del dashboard en una sola llamada optimizada
      // Nota: Los recordatorios se envían automáticamente vía cron job
      // Ver: /api/cron/check-reminders (ejecutado diariamente)
      const data = await fetchAllDashboardData();

      setStats(data.stats);
      setGroupStats(data.groupStats);
      setEnrollmentTrends(data.enrollmentTrends);
      setCourseDistribution(data.courseDistribution);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-putty-50 p-8">
        <h1 className="text-tangaroa-950 text-5xl font-bold mb-8">Dashboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-putty-50 p-8"
    >
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-tangaroa-950 text-5xl font-bold mb-8"
      >
        Dashboard
      </motion.h1>

      {/* Stats Cards */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Estudiantes"
            value={stats.totalStudents}
            subtitle="Estudiantes activos"
            color="blue"
          />
          <StatsCard
            title="Total Profesores"
            value={stats.totalTeachers}
            subtitle="Profesores registrados"
            color="green"
          />
          <StatsCard
            title="Total Grupos"
            value={stats.totalGroups}
            subtitle="Grupos activos"
            color="orange"
          />
          <StatsCard
            title="Total Cursos"
            value={stats.totalCourses}
            subtitle="Cursos disponibles"
            color="purple"
          />
        </motion.div>
      )}

      {/* Interactive Groups Chart - Full Width */}
      {groupStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-tangaroa-950 mb-6">
            Grupos y Estudiantes Inscritos
          </h2>
          <p className="text-gray-600 mb-4">
            Haz clic en cualquier grupo para ver los estudiantes inscritos y la información detallada
          </p>
          <InteractiveGroupsChart data={groupStats} />
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
        {/* Groups Bar Chart */}
        {groupStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-tangaroa-950 mb-4">
              Capacidad de Grupos (Gráfico)
            </h2>
            <GroupsBarChart data={groupStats} />
          </motion.div>
        )}

        {/* Course Distribution Pie Chart */}
        {courseDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-tangaroa-950 mb-4">
              Distribución por Curso
            </h2>
            <CourseDistributionPieChart data={courseDistribution} />
          </motion.div>
        )}

        {/* Enrollment Trends Line Chart */}
        {enrollmentTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2"
          >
            <h2 className="text-2xl font-bold text-tangaroa-950 mb-4">
              Tendencia de Inscripciones
            </h2>
            <EnrollmentTrendLineChart data={enrollmentTrends} />
          </motion.div>
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-tangaroa-950 mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      activity.type === 'student' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {activity.type === 'student' ? 'Estudiante' : 'Grupo'}
                    </span>
                  </div>
                  <p className="text-tangaroa-950 mt-2">
                    {activity.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
