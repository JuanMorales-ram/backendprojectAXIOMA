'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { sendEnrollmentEmails } from '../../../lib/emailService';

export interface EnrollmentData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  academicrating: number;
  biblicalrating: number;
  groupid: number;
}

export interface GroupWithDetails {
  groupid: number;
  courseid: number;
  teacherid: number;
  classdays: string;
  classtime: string;
  status: string;
  numberofstudents: number;
  start_deadline: string | null;
  course: {
    coursename: string;
  };
  teacher: {
    firstname: string;
    lastname: string;
    email: string;
  };
  kangaroo_teacher?: {
    firstname: string;
    lastname: string;
  };
  observer_teacher?: {
    firstname: string;
    lastname: string;
  };
  current_students?: number;
}

interface SupabaseGroupResponse {
  groupid: number;
  courseid: number;
  teacherid: number;
  classdays: string;
  classtime: string;
  status: string;
  numberofstudents: number;
  start_deadline: string | null;
  kangaroo_teacherid?: number | null;
  observer_teacherid?: number | null;
  course: { coursename: string }[];
  teacher: { firstname: string; lastname: string; email: string }[];
}

// Obtener grupos disponibles con detalles completos
export const fetchAvailableGroups = async (): Promise<GroupWithDetails[]> => {
  try {
    // Obtener grupos con estatus activo
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('classgroup')
      .select(`
        groupid,
        courseid,
        teacherid,
        classdays,
        classtime,
        status,
        numberofstudents,
        start_deadline,
        kangaroo_teacherid,
        observer_teacherid,
        course:courseid (
          coursename
        ),
        teacher:teacherid (
          firstname,
          lastname,
          email
        )
      `)
      .eq('status', 'activo');

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      return [];
    }

    // Contar estudiantes actuales por grupo
    const { data: studentCounts, error: countError } = await supabaseAdmin
      .from('studentgroup')
      .select('groupid');

    if (countError) {
      console.error('Error counting students:', countError);
      return [];
    }

    // Crear un mapa de conteo de estudiantes por grupo
    const countsMap = studentCounts.reduce((acc: { [key: number]: number }, item) => {
      acc[item.groupid] = (acc[item.groupid] || 0) + 1;
      return acc;
    }, {});

    // Enriquecer los grupos con el conteo actual y filtrar los disponibles
    const enrichedGroups = (groups as SupabaseGroupResponse[])
      .map((group) => ({
        ...group,
        course: Array.isArray(group.course) ? group.course[0] : group.course,
        teacher: Array.isArray(group.teacher) ? group.teacher[0] : group.teacher,
        current_students: countsMap[group.groupid] || 0,
      }))
      .filter((group) => 
        group.current_students < group.numberofstudents
      ) as GroupWithDetails[];

    return enrichedGroups;
  } catch (error) {
    console.error('Unexpected error fetching available groups:', error);
    return [];
  }
};

// Verificar si un email ya está inscrito en un grupo
export const checkEmailInGroup = async (email: string): Promise<{
  isEnrolled: boolean;
  groupId?: number;
}> => {
  try {
    // Buscar estudiante por email
    const { data: students, error: studentError } = await supabaseAdmin
      .from('student')
      .select('studentid')
      .eq('email', email);

    // Si hay error o no hay estudiantes, no está inscrito
    if (studentError) {
      console.error('Error checking student:', studentError);
      return { isEnrolled: false };
    }

    if (!students || students.length === 0) {
      return { isEnrolled: false };
    }

    // Obtener el primer estudiante (debería ser único por email)
    const student = students[0];

    // Verificar si el estudiante está en algún grupo
    const { data: enrollments, error: enrollmentError } = await supabaseAdmin
      .from('studentgroup')
      .select('groupid')
      .eq('studentid', student.studentid);

    if (enrollmentError) {
      console.error('Error checking enrollment:', enrollmentError);
      return { isEnrolled: false };
    }

    // Si tiene inscripciones, retornar el primer grupo
    if (enrollments && enrollments.length > 0) {
      return { isEnrolled: true, groupId: enrollments[0].groupid };
    }

    return { isEnrolled: false };
  } catch (error) {
    console.error('Error checking email enrollment:', error);
    return { isEnrolled: false };
  }
};

// Inscribir estudiante a un grupo
export const enrollStudent = async (enrollmentData: EnrollmentData): Promise<{
  success: boolean;
  message: string;
  studentId?: number;
}> => {
  try {
    console.log('🔍 Iniciando inscripción para:', enrollmentData.email);
    
    // 1. Verificar si el email ya está inscrito
    const emailCheck = await checkEmailInGroup(enrollmentData.email);
    console.log('📧 Resultado verificación email:', emailCheck);
    
    if (emailCheck.isEnrolled) {
      console.log('⚠️ Email ya inscrito en grupo:', emailCheck.groupId);
      return {
        success: false,
        message: `Este correo ya está inscrito en un grupo (ID: ${emailCheck.groupId})`,
      };
    }

    // 2. Verificar que el grupo tenga espacio disponible
    const { data: group, error: groupError } = await supabaseAdmin
      .from('classgroup')
      .select('groupid, numberofstudents')
      .eq('groupid', enrollmentData.groupid)
      .single();

    if (groupError || !group) {
      return {
        success: false,
        message: 'El grupo seleccionado no existe',
      };
    }

    // Contar estudiantes actuales en el grupo
    const { data: currentStudents, error: countError } = await supabaseAdmin
      .from('studentgroup')
      .select('studentid')
      .eq('groupid', enrollmentData.groupid);

    if (countError) {
      return {
        success: false,
        message: 'Error al verificar disponibilidad del grupo',
      };
    }

    if (currentStudents && currentStudents.length >= group.numberofstudents) {
      return {
        success: false,
        message: 'El grupo seleccionado ya está lleno',
      };
    }

    // 3. Crear el estudiante
    const { firstname, lastname, email, phone, academicrating, biblicalrating } = enrollmentData;
    
    const { data: newStudent, error: studentError } = await supabaseAdmin
      .from('student')
      .insert([{
        firstname,
        lastname,
        email,
        phone,
        academicrating,
        biblicalrating,
        status: true, // Estado por defecto (true = activo)
      }])
      .select('studentid')
      .single();

    if (studentError || !newStudent) {
      console.error('❌ Error creating student:');
      console.error('Error code:', studentError?.code);
      console.error('Error message:', studentError?.message);
      console.error('Error details:', studentError?.details);
      console.error('Error hint:', studentError?.hint);
      console.error('Full error object:', JSON.stringify(studentError, null, 2));
      
      // Detectar error de email duplicado
      if (studentError?.code === '23505' || studentError?.message?.includes('student_email_unique')) {
        return {
          success: false,
          message: 'Este correo electrónico ya está registrado en el sistema',
        };
      }
      
      return {
        success: false,
        message: `Error al crear el registro del estudiante: ${studentError?.message || 'Error desconocido'}`,
      };
    }

    // 4. Asociar estudiante con el grupo
    const { error: enrollmentError } = await supabaseAdmin
      .from('studentgroup')
      .insert([{
        studentid: newStudent.studentid,
        groupid: enrollmentData.groupid,
      }]);

    if (enrollmentError) {
      console.error('Error enrolling student in group:', enrollmentError);
      // Intentar eliminar el estudiante creado si falla la inscripción
      await supabaseAdmin
        .from('student')
        .delete()
        .eq('studentid', newStudent.studentid);
      
      return {
        success: false,
        message: 'Error al inscribir al estudiante en el grupo',
      };
    }

    // 5. Enviar emails de confirmación
    // Enviar emails de confirmación
    
    // Obtener detalles del grupo para los emails
    const { data: groupDetails, error: groupDetailsError } = await supabaseAdmin
      .from('classgroup')
      .select(`
        classdays,
        classtime,
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
      .eq('groupid', enrollmentData.groupid)
      .single();

    console.log('📦 Detalles del grupo obtenidos:', groupDetails ? '✅ Sí' : '❌ No');
    if (groupDetailsError) {
      console.error('❌ Error obteniendo detalles del grupo:', groupDetailsError);
    }

    if (!groupDetailsError && groupDetails) {
      console.log('✅ Grupo encontrado, preparando emails...');
      console.log('✅ Grupo encontrado, preparando emails...');
      const course = Array.isArray(groupDetails.course) ? groupDetails.course[0] : groupDetails.course;
      const teacher = Array.isArray(groupDetails.teacher) ? groupDetails.teacher[0] : groupDetails.teacher;
      
      console.log('📚 Curso:', course.coursename);
      console.log('👨‍🏫 Profesor:', `${teacher.firstname} ${teacher.lastname}`);
      console.log('📧 Email profesor:', teacher.email);
      console.log('📧 Email estudiante:', enrollmentData.email);
      
      const emailResult = await sendEnrollmentEmails({
        studentName: `${enrollmentData.firstname} ${enrollmentData.lastname}`,
        studentEmail: enrollmentData.email,
        courseName: course.coursename,
        classSchedule: `${groupDetails.classdays} - ${groupDetails.classtime}`,
        classDays: groupDetails.classdays,
        classTime: groupDetails.classtime,
        groupId: enrollmentData.groupid,
        teacherName: `${teacher.firstname} ${teacher.lastname}`,
        teacherEmail: teacher.email,
        startDate: groupDetails.start_deadline 
          ? new Date(groupDetails.start_deadline).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : undefined,
      });

      if (emailResult.success) {
        // Emails enviados exitosamente
      } else {
        console.error('❌ Error enviando emails:', emailResult.error);
        // No fallar la inscripción si los emails fallan
      }
    } else {
      console.error('⚠️ No se pudo obtener detalles del grupo para emails');
    }

    // Inscripción completada exitosamente

    return {
      success: true,
      message: 'Inscripción exitosa',
      studentId: newStudent.studentid,
    };
  } catch (error) {
    console.error('Unexpected error during enrollment:', error);
    return {
      success: false,
      message: 'Error inesperado durante la inscripción',
    };
  }
};

// Obtener detalles de inscripción para confirmación
export const getEnrollmentDetails = async (studentId: number, groupId: number) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('studentgroup')
      .select(`
        studentid,
        groupid,
        student:studentid (
          firstname,
          lastname,
          email
        ),
        classgroup:groupid (
          classdays,
          classtime,
          course:courseid (
            coursename
          ),
          teacher:teacherid (
            firstname,
            lastname,
            email
          )
        )
      `)
      .eq('studentid', studentId)
      .eq('groupid', groupId)
      .single();

    if (error) {
      console.error('Error fetching enrollment details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching enrollment details:', error);
    return null;
  }
};
