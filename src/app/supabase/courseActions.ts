'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';

export interface Course {
  courseid?: number;
  coursename: string;
}

export const fetchCourses = async (): Promise<Course[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { data, error } = await supabaseAdmin.from('course').select('*');
  if (error) { console.error('Error fetching courses:', error); return []; }
  return data;
};

export const addCourse = async (course: Course): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Solo enviamos las columnas necesarias; omitimos courseid para que lo genere el servidor
  const payload = { coursename: course.coursename };
  const { error } = await supabaseAdmin.from('course').insert([payload]);
  if (error) { 
    console.error('Error adding course:', error); 
    throw error;
  }
};

export const updateCourse = async (course: Course): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  if (course.courseid == null) {
    console.error('Error updating course: courseid is required');
    throw new Error('courseid is required for update');
  }
  // Evitamos enviar courseid en el set para no sobrescribir la PK
  const payload = { coursename: course.coursename };
  const { error } = await supabaseAdmin
    .from('course')
    .update(payload)
    .eq('courseid', course.courseid);
  if (error) { 
    console.error('Error updating course:', error); 
    throw error;
  } else {
    console.log('Course updated successfully');
  }
};

export const deleteCourse = async (courseid: number): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('course').delete().eq('courseid', courseid);
  if (error) { 
    console.error('Error deleting course:', error); 
    throw error;
  }
};