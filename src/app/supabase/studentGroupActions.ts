'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';

export interface StudentGroup {
  studentid: number;
  groupid: number;
}

export const fetchStudentGroups = async (): Promise<StudentGroup[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();

  const { data, error } = await supabaseAdmin.from('studentgroup').select('*');
  if (error) { console.error('Error fetching student groups:', error); return []; }
  return data;
};

export const addStudentGroup = async (sg: StudentGroup): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();

  const { error } = await supabaseAdmin.from('studentgroup').insert([sg]);
  if (error) { console.error('Error adding student group:', error); }
};

export const deleteStudentGroup = async (studentid: number, groupid: number): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();

  const { error } = await supabaseAdmin.from('studentgroup').delete().eq('studentid', studentid).eq('groupid', groupid);
  if (error) { console.error('Error deleting student group:', error); }
};

// Obtener estudiantes que no están en ningún grupo
export const fetchAvailableStudents = async (): Promise<{
  studentid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
}[]> => {
  await requireAdmin();

  // Obtener todos los estudiantes
  const { data: allStudents, error: allError } = await supabaseAdmin
    .from('student')
    .select('studentid, firstname, lastname, email, phone')
    .order('lastname');

  if (allError) {
    console.error('Error fetching students:', allError);
    return [];
  }

  // Obtener estudiantes ya enrolados en algún grupo
  const { data: enrolledStudents, error: enrolledError } = await supabaseAdmin
    .from('studentgroup')
    .select('studentid');

  if (enrolledError) {
    console.error('Error fetching enrolled students:', enrolledError);
    return [];
  }

  const enrolledIds = new Set(enrolledStudents?.map(sg => sg.studentid) || []);

  // Filtrar estudiantes que no están enrolados
  return (allStudents || []).filter(s => !enrolledIds.has(s.studentid));
};
