/**
 * Calcula los días restantes hasta la fecha de inicio
 * @param startDate - Fecha de inicio del curso
 * @returns Número de días (negativo si ya pasó, null si no hay fecha)
 */
export const calculateDaysUntilStart = (startDate: string | null): number | null => {
  if (!startDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Obtiene el color según días restantes
 * @param daysUntilStart - Días hasta inicio
 * @returns Color CSS: verde, amarillo, rojo, o gris
 */
export const getStartDateColor = (daysUntilStart: number | null): string => {
  if (daysUntilStart === null) return 'text-gray-400';
  if (daysUntilStart > 2) return 'text-green-600';
  if (daysUntilStart >= 1) return 'text-yellow-500';
  if (daysUntilStart === 0) return 'text-red-600 font-bold';
  return 'text-gray-500'; // Ya pasó
};
