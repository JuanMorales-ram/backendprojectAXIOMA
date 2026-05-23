"use client";
import SearchBar from "@/app/components/SearchBar";
import GroupTable from "@/app/components/Table";
import ReloadButton from "@/app/components/ReloadButton";
import PlusButton from "@/app/components/PlusButton";
import Modal from "@/app/components/Modal";
import FormEditGroup from "@/app/components/FormGroup";
import ManageGroupStudentsModal from "@/app/components/ManageGroupStudentsModal";

import { ClassGroup } from "@/app/components/FormGroup";

import React, { useState, useEffect } from "react";

import {
  fetchClassGroups,
  addClassGroup,
  updateClassGroup,
  deleteClassGroup,
} from "@/app/supabase/classGroupActions";
import { fetchCourses, Course } from "@/app/supabase/courseActions";
import { fetchTeachers } from "@/app/supabase/teacherActions";
import { TeacherData } from "@/app/components/FormTeacher";
import { fetchGroupStats } from "@/app/supabase/dashboardActions";


export default function Home() {
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [typeOfModal, setTypeOfModal] = useState("");
  const [functionToExecute, setFunctionToExecute] = useState<() => void>(
    () => () => {}
  );
  const [rows, setRows] = useState<ClassGroup[]>([]);
  const [filteredRows, setFilteredRows] = useState<ClassGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [actualInfo, setActualInfo] = useState<ClassGroup>({
    groupid: 0,
    courseid: 0,
    teacherid: 0,
    kangaroo_teacherid: null,
    observer_teacherid: null,
    numberofstudents: 0,
    classdays: "",
    classtime: "",
    start_deadline: null,
    status: "",
  });

  const handleInfoToModal = (info: ClassGroup) => {
    setActualInfo(info);
  };

  const handleOpenModal = (action: boolean, type: string) => {
    setTypeOfModal(type);
    setIsModalOpenEdit(action);
    
    // Reset actualInfo when creating new
    if (type === "new") {
      setActualInfo({
        groupid: 0,
        courseid: 0,
        teacherid: 0,
        kangaroo_teacherid: null,
        observer_teacherid: null,
        numberofstudents: 0,
        classdays: "",
        classtime: "",
        start_deadline: null,
        status: "",
      });
    }
    
    switch (type) {
      case "new":
        setFunctionToExecute(() => async (info: ClassGroup) => {
          try {
            await addClassGroup(info);
            const classGroups = await fetchClassGroups();
            setRows(classGroups);
            setFilteredRows(classGroups);
            setIsModalOpenEdit(false);
          } catch (error) {
            console.error('Error al crear grupo:', error);
            alert('Error al crear el grupo. Verifica los datos.');
          }
        });
        break;
      case "edit":
        setFunctionToExecute(() => async (info: ClassGroup) => {
          try {
            await updateClassGroup(info);
            const classGroups = await fetchClassGroups();
            setRows(classGroups);
            setFilteredRows(classGroups);
            setIsModalOpenEdit(false);
          } catch (error) {
            console.error('Error al actualizar grupo:', error);
            alert('Error al actualizar el grupo. Verifica los datos.');
          }
        });
        break;
      case "delete":
        setFunctionToExecute(() => async (info: ClassGroup) => {
          try {
            await deleteClassGroup(info.groupid);
            const classGroups = await fetchClassGroups();
            setRows(classGroups);
            setFilteredRows(classGroups);
            setIsModalOpenEdit(false);
          } catch (error: unknown) {
            console.error('Error al eliminar grupo:', error);
            
            let errorString = '';
            if (error instanceof Error) {
              errorString = error.message;
            } else if (typeof error === 'string') {
              errorString = error;
            }
            
            if (errorString.includes('23503') || errorString.includes('foreign key') || errorString.includes('violates')) {
              alert(
                '❌ No se puede eliminar este grupo\n\n' +
                '📋 Razón: El grupo tiene estudiantes inscritos\n\n' +
                '✅ Solución:\n' +
                '1. Usa el ícono 👥 para desvincular estudiantes del grupo\n' +
                '2. Una vez sin estudiantes, podrás eliminar el grupo\n\n' +
                '💡 Alternativa: Marca el grupo como "inactivo" en lugar de eliminarlo'
              );
            } else {
              alert('Error al eliminar el grupo.');
            }
          }
        });
        break;
      case "copy":
        setFunctionToExecute(() => async (info: ClassGroup) => {
          try {
            // Note: Groups don't have a name field to modify with "(Copia)" suffix
            // The new group will be distinguished by its auto-generated ID
            const newGroup = {
              ...info,
              groupid: 0, // ID will be auto-generated by the database (excluded in addClassGroup)
            };
            await addClassGroup(newGroup);
            const classGroups = await fetchClassGroups();
            setRows(classGroups);
            setFilteredRows(classGroups);
            setIsModalOpenEdit(false);
          } catch (error) {
            console.error('Error al copiar grupo:', error);
            alert('Error al copiar el grupo. Verifica los datos.');
          }
        });
        break;
    }
  };

  const headers = [
    "Id grupo",
    "Curso",
    "Maestro Principal",
    "Maestro Kanguro",
    "Observador",
    "Días",
    "Hora",
    "Fecha Inicio",
    "Estudiantes",
    "Incritos",
    "Estado",
    "Acciones",
  ];


  const [groupStatsById, setGroupStatsById] = useState<
    Record<number, { maxStudents: number; studentCount: number }>
  >({});

  const loadClassGroups = async () => {
    setRows([]); // Clear previous rows
    const classGroups = await fetchClassGroups();
    setRows(classGroups);
    setFilteredRows(classGroups);

    // Obtener conteos reales de inscritos por grupo
    const stats = await fetchGroupStats();
    const map: Record<number, { maxStudents: number; studentCount: number }> = {};
    stats.forEach((s) => {
      map[s.groupid] = { maxStudents: s.maxStudents, studentCount: s.studentCount };
    });
    setGroupStatsById(map);
  };

  
  const loadCoursesAndTeachers = async () => {
    const [c, t] = await Promise.all([fetchCourses(), fetchTeachers()]);
    setCourses(c);
    setTeachers(t);
  };

  // Función para obtener el nombre del curso por ID
  const getCourseName = (courseid: number): string => {
    const course = courses.find(c => c.courseid === courseid);
    return course ? course.coursename : `ID: ${courseid}`;
  };

  // Función para obtener el nombre completo del maestro por ID
  const getTeacherName = (teacherid: number | null | undefined): string => {
    if (!teacherid) return '-';
    const teacher = teachers.find(t => t.teacherid === teacherid);
    return teacher ? `${teacher.firstname} ${teacher.lastname}` : `ID: ${teacherid}`;
  };

  // Función para formatear la fecha
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formattedRows = filteredRows.map((group) => {
    const stats = groupStatsById[group.groupid];

    return {
      groupid: group.groupid,
      coursename: getCourseName(group.courseid),
      teachername: getTeacherName(group.teacherid),
      kangaroo: getTeacherName(group.kangaroo_teacherid),
      observer: getTeacherName(group.observer_teacherid),
      classdays: group.classdays || '-',
      classtime: group.classtime || '-',
      start_deadline: formatDate(group.start_deadline),
      numberofstudents: stats?.maxStudents ?? group.numberofstudents,
      enrolledStudents: stats?.studentCount ?? 0,
      status: group.status || '-',
    };
  });


  useEffect(() => {
    loadClassGroups();
    loadCoursesAndTeachers();
  }, []);

  return (
    <>
      <div className="w-full flex h-fit justify-between ">
  <SearchBar 
    className="" 
    placeholder="Buscar grupo" 
    data={rows}
    onFilter={setFilteredRows}
  />
        <div className="flex gap-x-2 items-center ">
          <p className=" text-tangaroa-950 font-bold  ">Nuevo Grupo</p>
          <PlusButton
            OpenOnPlusModal={() => handleOpenModal(true, "new")}
            className=" "
          ></PlusButton>
          <ReloadButton onClick={() => loadClassGroups()}></ReloadButton>
        </div>
      </div>
      <div>
         {filteredRows.length === 0 ? (
          // Skeleton loader
          <div className="animate-pulse bg-gray-200 rounded-lg space-y-4 mt-10 h-22 w-full"></div>
        ) : (
        <GroupTable
          headers={headers}
          rows={formattedRows}
          OpenOnEditModal={() => {
            handleOpenModal(true, "edit");
          }}
          onEditButton={(formattedRow) => {
            // Encontrar el grupo original usando el groupid
            const originalGroup = filteredRows.find(g => g.groupid === formattedRow.groupid);
            if (originalGroup) {
              handleInfoToModal(originalGroup);
            }
          }}
          OpenOnDeletetModal={() => {
            handleOpenModal(true, "delete");
          }}
          onCopyButton={(formattedRow) => {
            const originalGroup = filteredRows.find(g => g.groupid === formattedRow.groupid);
            if (originalGroup) {
              handleInfoToModal(originalGroup);
              handleOpenModal(true, "copy");
            }
          }}
          onManageStudents={(formattedRow) => {
            setSelectedGroupForStudents({
              id: formattedRow.groupid,
              name: formattedRow.coursename
            });
            setIsStudentsModalOpen(true);
          }}
        />
        )}
        <Modal
          isOpen={isModalOpenEdit}
          onClose={() => handleOpenModal(false, "edit")}
        >
          <FormEditGroup
            data={actualInfo}
            onChange={setActualInfo}
            type={typeOfModal}
            functionToExecute={functionToExecute}
            coursesOptions={courses.map((c) => ({ value: c.courseid ?? 0, label: c.coursename }))}
            teachersOptions={teachers.map((t) => ({ value: t.teacherid, label: `${t.firstname} ${t.lastname}` }))}
          ></FormEditGroup>
        </Modal>

        {/* Modal de gestión de estudiantes */}
        {selectedGroupForStudents && (
          <ManageGroupStudentsModal
            isOpen={isStudentsModalOpen}
            onClose={() => {
              setIsStudentsModalOpen(false);
              setSelectedGroupForStudents(null);
              loadClassGroups(); // Recargar para actualizar conteos
            }}
            groupId={selectedGroupForStudents.id}
            groupName={selectedGroupForStudents.name}
          />
        )}
      </div>
    </>
  );
}
