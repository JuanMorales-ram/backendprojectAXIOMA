'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';

export interface TeacherCourse {
  teacherid: number;
  courseid: number;
}

export const fetchTeacherCourses = async (): Promise<TeacherCourse[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { data, error } = await supabaseAdmin.from('teachercourse').select('*');
  if (error) { console.error('Error fetching teacher courses:', error); return []; }
  return data;
};

export const addTeacherCourse = async (tc: TeacherCourse): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('teachercourse').insert([tc]);
  if (error) { console.error('Error adding teacher course:', error); }
};

export const deleteTeacherCourse = async (teacherid: number, courseid: number): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('teachercourse').delete().eq('teacherid', teacherid).eq('courseid', courseid);
  if (error) { console.error('Error deleting teacher course:', error); }
};
