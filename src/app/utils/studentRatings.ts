// Mapeo de valoraciones académicas
export const ACADEMIC_LEVELS = {
  1: "Educación básica (primaria o secundaria)",
  2: "Bachillerato completo",
  3: "Técnico o tecnólogo",
  4: "Profesional universitario",
  5: "Posgrado (especialización, maestría, doctorado)"
} as const;

// Mapeo de conocimientos bíblicos
export const BIBLICAL_KNOWLEDGE = {
  1: "Nunca he leído la Biblia",
  2: "Conozco algunas historias bíblicas",
  3: "He leído toda la Biblia alguna vez",
  4: "He hecho cursos o estudios bíblicos antes",
  5: "Tengo formación teológica formal"
} as const;

// Función para obtener el texto de nivel académico
export function getAcademicLevelText(value: number): string {
  return ACADEMIC_LEVELS[value as keyof typeof ACADEMIC_LEVELS] || "No especificado";
}

// Función para obtener el texto de conocimiento bíblico
export function getBiblicalKnowledgeText(value: number): string {
  return BIBLICAL_KNOWLEDGE[value as keyof typeof BIBLICAL_KNOWLEDGE] || "No especificado";
}

// Opciones para select en formularios
export const academicLevelOptions = Object.entries(ACADEMIC_LEVELS).map(([value, label]) => ({
  value: parseInt(value),
  label
}));

export const biblicalKnowledgeOptions = Object.entries(BIBLICAL_KNOWLEDGE).map(([value, label]) => ({
  value: parseInt(value),
  label
}));
