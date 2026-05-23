'use server';

import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { requireAdmin } from '../../../lib/authorization';
import { ClassGroup } from '../components/FormGroup';

export const fetchClassGroups = async (): Promise<ClassGroup[]> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { data, error } = await supabaseAdmin.from('classgroup').select('*');
  if (error) { console.error('Error fetching class groups:', error); return []; }
  return data;
};

export const addClassGroup = async (group: ClassGroup): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Excluir groupid ya que es autogenerado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { groupid, ...groupData } = group;
  
  // Convertir valores 0 a null para los campos opcionales
  const payload = {
    ...groupData,
    kangaroo_teacherid: groupData.kangaroo_teacherid || null,
    observer_teacherid: groupData.observer_teacherid || null,
    start_deadline: groupData.start_deadline || null,
  };
  
  const { error } = await supabaseAdmin.from('classgroup').insert([payload]);
  if (error) { 
    console.error('Error adding class group:', error); 
    throw error;
  }
};

export const updateClassGroup = async (group: ClassGroup): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  // Excluir groupid del update
  const { groupid, ...groupData } = group;
  
  // Convertir valores 0 a null para los campos opcionales
  const payload = {
    ...groupData,
    kangaroo_teacherid: groupData.kangaroo_teacherid || null,
    observer_teacherid: groupData.observer_teacherid || null,
    start_deadline: groupData.start_deadline || null,
  };
  
  const { error } = await supabaseAdmin
    .from('classgroup')
    .update(payload)
    .eq('groupid', groupid);
  if (error) { 
    console.error('Error updating class group:', error); 
    throw error;
  } else {
    console.log('Class group updated successfully');
  }
};

export const deleteClassGroup = async (groupid: number): Promise<void> => {
  // Verificar que el usuario sea administrador
  await requireAdmin();
  
  const { error } = await supabaseAdmin.from('classgroup').delete().eq('groupid', groupid);
  if (error) { 
    console.error('Error deleting class group:', error); 
    throw error;
  }
  }