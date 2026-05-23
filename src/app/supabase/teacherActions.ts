'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';
import { TeacherData } from '../components/FormTeacher';

export const fetchTeachers = async (): Promise<TeacherData[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { data, error } = await supabaseAdmin.from('teacher').select('*');
  if (error) { console.error('Error fetching teachers:', error); return []; }
  return data;
};

export const addTeacher = async (teacher: TeacherData): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Excluir teacherid ya que es autogenerado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { teacherid, ...teacherData } = teacher;
  const { error } = await supabaseAdmin.from('teacher').insert([teacherData]);
  if (error) { 
    console.error('Error adding teacher:', error); 
    throw error;
  }
};

export const updateTeacher = async (teacher: TeacherData): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Excluir teacherid del update
  const { teacherid, ...teacherData } = teacher;
  const { error } = await supabaseAdmin.from('teacher').update(teacherData).eq('teacherid', teacherid);
  if (error) { 
    console.error('Error updating teacher:', error); 
    throw error;
  }
};

export const deleteTeacher = async (teacherid: number): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('teacher').delete().eq('teacherid', teacherid);
  if (error) { 
    console.error('Error deleting teacher:', error); 
    throw error;
  }
};
