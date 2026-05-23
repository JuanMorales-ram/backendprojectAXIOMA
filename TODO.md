# TODO - Implementar columna “Incritos” en Grupos

- [ ] Revisar `src/app/main/groups/page.tsx` para entender cómo se construyen headers y rows.
- [x] Obtener `studentCount` real por grupo usando `fetchGroupStats()` desde `src/app/supabase/dashboardActions.ts`.
- [x] Agregar header `Incritos`.
- [x] Incluir en `formattedRows` un campo para el conteo real (inscritos) y asegurar compatibilidad con `GroupTable`.
- [ ] Verificar visualmente/mediante ejecución que la tabla renderiza la nueva columna correctamente.


