'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';
import { StudentData } from '@/app/components/FormStudents';

export const fetchStudents = async (): Promise<StudentData[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { data, error } = await supabaseAdmin.from('student').select('*');
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  return data;
};

export const addStudent = async (student: StudentData): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Excluir studentid ya que es autogenerado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { studentid, ...studentData } = student;
  const { error } = await supabaseAdmin.from('student').insert([studentData]);
  if (error) { 
    console.error('Error adding student:', error); 
    throw error;
  }
};

export const updateStudent = async (student: StudentData): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Excluir studentid del update
  const { studentid, ...studentData } = student;
  const { error } = await supabaseAdmin
    .from('student')
    .update(studentData)
    .eq('studentid', studentid);
  if (error) {
    console.error('Error updating student:', error);
    throw error;
  } else {
    console.log('Student updated successfully');
  }
};

export const deleteStudent = async (studentId: number): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('student').delete().eq('studentid', studentId);
  if (error) { 
    console.error('Error deleting student:', error); 
    throw error;
  }
};
