'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { calculateDaysUntilStart } from '../utils/dateHelpers';

/**
 * Interface for overall dashboard statistics
 */
export interface DashboardStats {
  totalGroups: number;
  activeGroups: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  enrollmentFormStats: {
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
  };
}

/**
 * Interface for individual group statistics
 */
export interface GroupStats {
  groupid: number;
  coursename: string;
  teachername: string;
  studentCount: number;
  maxStudents: number;
  classdays: string;
  classtime: string;
  status: string;
  created_at: string | null;
  daysUntilStart: number | null; // Días hasta inicio (null si no hay fecha)
}

interface SupabaseGroupData {
  groupid: number;
  courseid: number;
  teacherid: number;
  numberofstudents: number;
  classdays: string;
  classtime: string;
  status: string;
  start_deadline: string | null;
  course: { coursename: string }[] | { coursename: string };
  teacher: { firstname: string; lastname: string; email: string }[] | { firstname: string; lastname: string; email: string };
}

interface SupabaseStudentData {
  studentid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  academicrating: number | null;
  biblicalrating: number | null;
  status: boolean;
}

interface SupabaseStudentGroupData {
  student: SupabaseStudentData[] | SupabaseStudentData;
}

/**
 * Interface for enrollment trend data points
 */
export interface EnrollmentTrend {
  date: string;
  count: number;
}

/**
 * Interface for course distribution data
 */
export interface CourseDistribution {
  coursename: string;
  studentCount: number;
}

/**
 * Fetches general dashboard statistics including totals for groups, students, teachers, and courses.
 * Also calculates enrollment form statistics based on students enrolled in groups.
 * 
 * @returns Promise with DashboardStats containing all metrics
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Use Promise.all for parallel execution of independent queries
    const [allGroupsResult, studentsResult, teachersResult, coursesResult, enrolledStudentsResult] = 
      await Promise.all([
        supabaseAdmin.from('classgroup').select('groupid, status'),
        supabaseAdmin.from('student').select('studentid, status'),
        supabaseAdmin.from('teacher').select('teacherid'),
        supabaseAdmin.from('course').select('courseid'),
        supabaseAdmin.from('studentgroup').select('studentid'),
      ]);

    const totalGroups = allGroupsResult.data?.length || 0;
    const activeGroups = allGroupsResult.data?.filter(g => g.status === 'activo').length || 0;
    const totalStudents = studentsResult.data?.length || 0;
    const totalTeachers = teachersResult.data?.length || 0;
    const totalCourses = coursesResult.data?.length || 0;

    // Enrollment form statistics
    // totalCompleted = students who are enrolled in at least one group
    const enrolledStudentIds = new Set(enrolledStudentsResult.data?.map(sg => sg.studentid) || []);
    const totalCompleted = enrolledStudentIds.size;
    
    // totalStarted = all students in the system (some may not have completed enrollment to a group yet)
    const totalStarted = totalStudents;
    const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

    return {
      totalGroups,
      activeGroups,
      totalStudents,
      totalTeachers,
      totalCourses,
      enrollmentFormStats: {
        totalStarted,
        totalCompleted,
        completionRate,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalGroups: 0,
      activeGroups: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      enrollmentFormStats: {
        totalStarted: 0,
        totalCompleted: 0,
        completionRate: 0,
      },
    };
  }
};

/**
 * Fetches detailed statistics for all groups including course name, teacher, and student counts.
 * 
 * @returns Promise with array of GroupStats containing detailed information for each group
 */
export const fetchGroupStats = async (): Promise<GroupStats[]> => {
  try {
    const { data: groups, error } = await supabaseAdmin
      .from('classgroup')
      .select(`
        groupid,
        courseid,
        teacherid,
        numberofstudents,
        classdays,
        classtime,
        status,
        start_deadline,
        course:courseid (
          coursename
        ),
        teacher:teacherid (
          firstname,
          lastname
        )
      `);

    if (error || !groups) {
      console.error('Error fetching group stats:', error);
      return [];
    }

    // Obtener conteo de estudiantes por grupo
    const { data: studentGroups } = await supabaseAdmin
      .from('studentgroup')
      .select('groupid');

    const studentCounts: { [key: number]: number } = {};
    if (studentGroups) {
      studentGroups.forEach((sg) => {
        studentCounts[sg.groupid] = (studentCounts[sg.groupid] || 0) + 1;
      });
    }

    // Mapear los datos
    const groupStats: GroupStats[] = (groups as SupabaseGroupData[]).map((group) => ({
      groupid: group.groupid,
      coursename: Array.isArray(group.course) ? group.course[0]?.coursename : group.course?.coursename,
      teachername: Array.isArray(group.teacher) 
        ? `${group.teacher[0]?.firstname} ${group.teacher[0]?.lastname}`
        : `${group.teacher?.firstname} ${group.teacher?.lastname}`,
      studentCount: studentCounts[group.groupid] || 0,
      maxStudents: group.numberofstudents,
      classdays: group.classdays || '',
      classtime: group.classtime || '',
      status: group.status,
      created_at: group.start_deadline,
      daysUntilStart: calculateDaysUntilStart(group.start_deadline),
    }));

    return groupStats;
  } catch (error) {
    console.error('Error fetching group stats:', error);
    return [];
  }
};

/**
 * Fetches enrollment trends showing the number of enrollments per day.
 * Useful for visualizing enrollment patterns over time.
 * 
 * @returns Promise with array of EnrollmentTrend data points
 */
export const fetchEnrollmentTrends = async (): Promise<EnrollmentTrend[]> => {
  try {
    // Usar studentgroup que tiene información de inscripción
    const { data: enrollments, error } = await supabaseAdmin
      .from('studentgroup')
      .select(`
        studentid,
        groupid,
        classgroup:groupid (
          start_deadline
        )
      `);

    if (error || !enrollments) {
      console.error('Error fetching enrollment trends:', error);
      return [];
    }

    // Agrupar por fecha de inicio del grupo
    const trendsMap: { [key: string]: number } = {};
    enrollments.forEach((enrollment: Record<string, unknown>) => {
      const classgroup = enrollment.classgroup as { start_deadline?: string } | undefined;
      if (classgroup?.start_deadline) {
        const date = new Date(classgroup.start_deadline).toISOString().split('T')[0];
        trendsMap[date] = (trendsMap[date] || 0) + 1;
      }
    });

    // Convertir a array y ordenar
    const trends: EnrollmentTrend[] = Object.entries(trendsMap).map(([date, count]) => ({
      date,
      count,
    }));

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching enrollment trends:', error);
    return [];
  }
};

/**
 * Fetches the distribution of students across different courses.
 * Shows how students are distributed among various courses in the system.
 * 
 * @returns Promise with array of CourseDistribution data
 */
export const fetchCourseDistribution = async (): Promise<CourseDistribution[]> => {
  try {
    // Obtener todos los grupos con información del curso
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('classgroup')
      .select(`
        groupid,
        courseid,
        course:courseid (
          coursename
        )
      `);

    if (groupsError || !groups) {
      console.error('Error fetching groups for distribution:', groupsError);
      return [];
    }

    // Obtener todos los studentgroup
    const { data: studentGroups, error: sgError } = await supabaseAdmin
      .from('studentgroup')
      .select('groupid');

    if (sgError || !studentGroups) {
      console.error('Error fetching student groups:', sgError);
      return [];
    }

    // Contar estudiantes por grupo
    const groupCounts: { [key: number]: number } = {};
    studentGroups.forEach((sg) => {
      groupCounts[sg.groupid] = (groupCounts[sg.groupid] || 0) + 1;
    });

    // Agrupar por curso
    const courseMap: { [key: string]: number } = {};
    (groups as SupabaseGroupData[]).forEach((group) => {
      const courseName = Array.isArray(group.course) 
        ? group.course[0]?.coursename 
        : group.course?.coursename;
      
      if (courseName) {
        const studentCount = groupCounts[group.groupid] || 0;
        courseMap[courseName] = (courseMap[courseName] || 0) + studentCount;
      }
    });

    // Convertir a array
    const distribution: CourseDistribution[] = Object.entries(courseMap).map(([coursename, studentCount]) => ({
      coursename,
      studentCount,
    }));

    return distribution.sort((a, b) => b.studentCount - a.studentCount);
  } catch (error) {
    console.error('Error fetching course distribution:', error);
    return [];
  }
};

/**
 * Interface for recent activity items
 */
export interface RecentActivity {
  id: number;
  type: 'student' | 'group';
  description: string;
  date: string;
}

/**
 * Fetches recent activity including new student enrollments and group creations.
 * Returns the 10 most recent activities sorted by date.
 * 
 * @returns Promise with array of RecentActivity items
 */
export const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
  try {
    const activities: RecentActivity[] = [];

    // Obtener inscripciones recientes usando studentgroup
    const { data: recentEnrollments } = await supabaseAdmin
      .from('studentgroup')
      .select(`
        studentid,
        groupid,
        student:studentid (
          studentid,
          firstname,
          lastname
        ),
        classgroup:groupid (
          start_deadline
        )
      `)
      .order('studentid', { ascending: false })
      .limit(5);

    if (recentEnrollments) {
      recentEnrollments.forEach((enrollment: Record<string, unknown>) => {
        const studentData = enrollment.student as { studentid: number; firstname: string; lastname: string } | { studentid: number; firstname: string; lastname: string }[] | undefined;
        const classgroupData = enrollment.classgroup as { start_deadline?: string } | undefined;
        
        if (studentData) {
          const student = Array.isArray(studentData) ? studentData[0] : studentData;
          const startDate = classgroupData?.start_deadline || new Date().toISOString();
          activities.push({
            id: student.studentid,
            type: 'student',
            description: `Nuevo estudiante inscrito: ${student.firstname} ${student.lastname}`,
            date: startDate,
          });
        }
      });
    }

    // Obtener grupos recientes
    const { data: recentGroups } = await supabaseAdmin
      .from('classgroup')
      .select(`
        groupid,
        start_deadline,
        course:courseid (
          coursename
        )
      `)
      .order('start_deadline', { ascending: false })
      .limit(5);

    if (recentGroups) {
      (recentGroups as SupabaseGroupData[]).forEach((group) => {
        const courseName = Array.isArray(group.course) 
          ? group.course[0]?.coursename 
          : group.course?.coursename;
        
        activities.push({
          id: group.groupid,
          type: 'group',
          description: `Grupo creado: ${courseName}`,
          date: group.start_deadline || '',
        });
      });
    }

    // Ordenar por fecha
    return activities
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

/**
 * Interface for group details with students
 */
export interface GroupDetailWithStudents {
  groupid: number;
  coursename: string;
  teachername: string;
  teacheremail: string;
  classdays: string;
  classtime: string;
  status: string;
  maxStudents: number;
  start_deadline: string | null;
  students: Array<{
    studentid: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string | null;
    academicrating: number | null;
    biblicalrating: number | null;
    status: boolean;
  }>;
}

/**
 * Fetch detailed information about a specific group including all enrolled students
 */
export const fetchGroupDetails = async (groupId: number): Promise<GroupDetailWithStudents | null> => {
  try {
    // Obtener información del grupo
    const { data: groupData, error: groupError } = await supabaseAdmin
      .from('classgroup')
      .select(`
        groupid,
        classdays,
        classtime,
        status,
        numberofstudents,
        start_deadline,
        course:courseid (
          coursename
        ),
        teacher:teacherid (
          firstname,
          lastname,
          email
        )
      `)
      .eq('groupid', groupId)
      .single();

    if (groupError || !groupData) {
      console.error('Error fetching group:', groupError);
      return null;
    }

    // Obtener estudiantes del grupo
    const { data: studentsData, error: studentsError } = await supabaseAdmin
      .from('studentgroup')
      .select(`
        student:studentid (
          studentid,
          firstname,
          lastname,
          email,
          phone,
          academicrating,
          biblicalrating,
          status
        )
      `)
      .eq('groupid', groupId);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return null;
    }

    // Formatear datos
    const course = Array.isArray(groupData.course) ? groupData.course[0] : groupData.course;
    const teacher = Array.isArray(groupData.teacher) ? groupData.teacher[0] : groupData.teacher;
    
    const students = studentsData
      .map((item: SupabaseStudentGroupData) => {
        const student = Array.isArray(item.student) ? item.student[0] : item.student;
        return student;
      })
      .filter((s: SupabaseStudentData | undefined): s is SupabaseStudentData => s != null);

    return {
      groupid: groupData.groupid,
      coursename: course?.coursename || 'Sin curso',
      teachername: teacher ? `${teacher.firstname} ${teacher.lastname}` : 'Sin profesor',
      teacheremail: teacher?.email || '',
      classdays: groupData.classdays || '',
      classtime: groupData.classtime || '',
      status: groupData.status || '',
      maxStudents: groupData.numberofstudents || 0,
      start_deadline: groupData.start_deadline,
      students: students,
    };
  } catch (error) {
    console.error('Error in fetchGroupDetails:', error);
    return null;
  }
};

/**
 * Verifica cursos próximos a iniciar y envía recordatorios a profesores
 * Envía emails cuando faltan 2 días, 1 día, o el día del inicio
 */
export const checkAndSendCourseReminders = async (): Promise<{
  success: boolean;
  emailsSent: number;
  errors: string[];
}> => {
  try {
    const { sendCourseReminderEmail } = await import('../../../lib/emailService');
    
    // Checking for upcoming courses

    // Obtener todos los grupos activos con sus fechas de inicio
    const { data: groups, error } = await supabaseAdmin
      .from('classgroup')
      .select(`
        groupid,
        courseid,
        teacherid,
        numberofstudents,
        classdays,
        classtime,
        status,
        start_deadline,
        course:courseid(coursename),
        teacher:teacherid(teacherid, firstname, lastname, email)
      `)
      .eq('status', 'activo')
      .not('start_deadline', 'is', null);

    if (error || !groups) {
      console.error('Error fetching groups for reminders:', error);
      return { success: false, emailsSent: 0, errors: [error?.message || 'Unknown error'] };
    }

    const emailsSent: number[] = [];
    const errors: string[] = [];

    // Procesar cada grupo
    for (const group of groups as SupabaseGroupData[]) {
      const daysUntil =  calculateDaysUntilStart(group.start_deadline);
      
      // Solo enviar recordatorios para cursos que empiezan en 0, 1 o 2 días
      if (daysUntil === null || daysUntil < 0 || daysUntil > 2) {
        continue;
      }

      // Obtener conteo y lista de estudiantes con teléfonos
      const { data: studentsData } = await supabaseAdmin
        .from('studentgroup')
        .select(`
          student:studentid(
            studentid,
            firstname,
            lastname,
            email,
            phone
          )
        `)
        .eq('groupid', group.groupid);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const students = studentsData?.map((item: any) => {
        const student = Array.isArray(item.student) ? item.student[0] : item.student;
        return student ? {
          name: `${student.firstname} ${student.lastname}`,
          email: student.email,
          phone: student.phone || undefined
        } : null;
      }).filter((s: { name: string; email: string; phone?: string } | null): s is { name: string; email: string; phone?: string } => s !== null) || [];

      const teacher = Array.isArray(group.teacher) ? group.teacher[0] : group.teacher;
      const course = Array.isArray(group.course) ? group.course[0] : group.course;

      if (!teacher?.email) {
        errors.push(`Group ${group.groupid}: No teacher email found`);
        continue;
      }

      // Verificar si ya se envió recordatorio hoy (para evitar duplicados)
      // Por ahora, enviaremos el email directamente
      // Aquí podrías implementar un sistema de tracking en la base de datos
      
      console.log(`📧 Sending reminder for group ${group.groupid} (${daysUntil} days until start)`);

      const emailResult = await sendCourseReminderEmail({
        teacherName: `${teacher.firstname} ${teacher.lastname}`,
        teacherEmail: teacher.email,
        courseName: course?.coursename || 'Curso sin nombre',
        groupId: group.groupid,
        startDate: group.start_deadline!,
        classSchedule: `${group.classdays} - ${group.classtime}`,
        classDays: group.classdays || 'No especificado',
        classTime: group.classtime || 'No especificado',
        studentCount: students.length,
        daysUntilStart: daysUntil,
        students: students as Array<{ name: string; email: string; phone?: string }>,
      });

      if (emailResult.success) {
        emailsSent.push(group.groupid);
        console.log(`✅ Reminder sent for group ${group.groupid}`);
      } else {
        errors.push(`Group ${group.groupid}: ${emailResult.error}`);
        console.error(`❌ Failed to send reminder for group ${group.groupid}:`, emailResult.error);
      }
    }

    console.log(`✅ Course reminders check complete. Sent: ${emailsSent.length}, Errors: ${errors.length}`);

    return {
      success: true,
      emailsSent: emailsSent.length,
      errors,
    };
  } catch (error) {
    console.error('Error in checkAndSendCourseReminders:', error);
    return {
      success: false,
      emailsSent: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Función optimizada que obtiene todos los datos del dashboard en una sola llamada
 * Reduce las peticiones HTTP de 5 a 1
 */
export const fetchAllDashboardData = async () => {
  try {
    const [
      statsData,
      groupData,
      trendsData,
      distributionData,
      activityData
    ] = await Promise.all([
      fetchDashboardStats(),
      fetchGroupStats(),
      fetchEnrollmentTrends(),
      fetchCourseDistribution(),
      fetchRecentActivity(),
    ]);

    return {
      stats: statsData,
      groupStats: groupData,
      enrollmentTrends: trendsData,
      courseDistribution: distributionData,
      recentActivity: activityData,
    };
  } catch (error) {
    console.error('Error fetching all dashboard data:', error);
    throw error;
  }
};
