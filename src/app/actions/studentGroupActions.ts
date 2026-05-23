'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function removeStudentFromGroup(studentId: number, groupId: number) {
  try {
    const { error } = await supabaseAdmin
      .from('studentgroup')
      .delete()
      .eq('groupid', groupId)
      .eq('studentid', studentId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removing student:', error);
    throw error;
  }
}

export async function addStudentsToGroup(studentIds: number[], groupId: number) {
  try {
    // Preparar datos para inserción
    const dataToInsert = studentIds.map(studentId => ({
      studentid: studentId,
      groupid: groupId,
    }));

    // Insertar todos los estudiantes
    const { error } = await supabaseAdmin
      .from('studentgroup')
      .insert(dataToInsert);

    if (error) throw error;

    // Verificar el total de estudiantes en el grupo
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('studentgroup')
      .select('studentid')
      .eq('groupid', groupId);

    if (verifyError) throw verifyError;

    const newCount = verifyData?.length ?? 0;

    return { success: true, totalStudents: newCount };
  } catch (error) {
    console.error('Error adding students:', error);
    throw error;
  }
}
