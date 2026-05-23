'use client';

import { useState } from 'react';
import { GroupStats, GroupDetailWithStudents, fetchGroupDetails } from '@/app/supabase/dashboardActions';
import { getStartDateColor, calculateDaysUntilStart } from '@/app/utils/dateHelpers';
import { getAcademicLevelText, getBiblicalKnowledgeText } from '@/app/utils/studentRatings';
import Modal from './Modal';

interface InteractiveGroupsChartProps {
  data: GroupStats[];
}

export default function InteractiveGroupsChart({ data }: InteractiveGroupsChartProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupDetailWithStudents | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGroupClick = async (groupId: number) => {
    setLoading(true);
    setIsModalOpen(true);
    
    try {
      const groupDetails = await fetchGroupDetails(groupId);
      setSelectedGroup(groupDetails);
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  // Calcular porcentaje de ocupación para la barra de progreso
  const getOccupancyPercentage = (studentCount: number, maxStudents: number) => {
    return (studentCount / maxStudents) * 100;
  };

  // Determinar color según ocupación
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((group) => {
          const occupancyPercentage = getOccupancyPercentage(group.studentCount, group.maxStudents);
          const occupancyColor = getOccupancyColor(occupancyPercentage);
          const isActive = group.status === 'activo';

          return (
            <div
              key={group.groupid}
              onClick={() => handleGroupClick(group.groupid)}
              className={`
                bg-white rounded-lg shadow-md p-5 cursor-pointer 
                transform transition-all duration-200 hover:scale-105 hover:shadow-lg
                border-2 ${isActive ? 'border-[#0C2340]' : 'border-gray-300'}
              `}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#0C2340] mb-1">
                    {group.coursename}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Grupo #{group.groupid}
                  </p>
                </div>
                <span
                  className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  `}
                >
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Teacher */}
              <div className="mb-3">
                <p className="text-sm text-gray-500">Profesor</p>
                <p className="text-sm font-semibold text-[#0C2340]">
                  {group.teachername}
                </p>
              </div>

              {/* Schedule */}
              <div className="mb-4">
                <p className="text-sm text-gray-500">Horario</p>
                <p className="text-sm font-semibold text-[#0C2340]">
                  {group.classdays} - {group.classtime}
                </p>
              </div>

              {/* Start Date with Color Indicator */}
              {group.created_at && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Fecha de Inicio</p>
                  <p className={`text-sm font-bold ${getStartDateColor(group.daysUntilStart)}`}>
                    {new Date(group.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {group.daysUntilStart !== null && group.daysUntilStart >= 0 && (
                      <span className="text-xs ml-2">
                        ({group.daysUntilStart === 0 ? '¡Hoy!' : `en ${group.daysUntilStart} día${group.daysUntilStart !== 1 ? 's' : ''}`})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Students Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Estudiantes
                  </span>
                  <span className="text-sm font-bold text-[#B15B29]">
                    {group.studentCount}/{group.maxStudents}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${occupancyColor} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {occupancyPercentage.toFixed(0)}% ocupado
                </p>
              </div>

              {/* Click hint */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500 italic">
                  Click para ver estudiantes inscritos
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with Group Details */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C2340]"></div>
              </div>
            ) : selectedGroup ? (
              <div>
                {/* Group Header */}
                <div className="bg-[#0C2340] text-white p-6 rounded-t-lg">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedGroup.coursename}
                  </h2>
                  <p className="text-sm opacity-90">Grupo #{selectedGroup.groupid}</p>
                </div>

                {/* Group Info */}
                <div className="bg-[#F0F4F8] p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Profesor</p>
                      <p className="text-lg text-[#0C2340]">
                        {selectedGroup.teachername}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedGroup.teacheremail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Horario</p>
                      <p className="text-lg text-[#0C2340]">
                        {selectedGroup.classdays}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedGroup.classtime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Capacidad</p>
                      <p className="text-lg text-[#0C2340]">
                        {selectedGroup.students.length} / {selectedGroup.maxStudents} estudiantes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Estado</p>
                      <p className="text-lg text-[#0C2340] capitalize">
                        {selectedGroup.status}
                      </p>
                    </div>
                    {selectedGroup.start_deadline && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-gray-600">Fecha de Inicio</p>
                        <p className={`text-lg font-bold ${getStartDateColor(calculateDaysUntilStart(selectedGroup.start_deadline))}`}>
                          {new Date(selectedGroup.start_deadline).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {(() => {
                            const days = calculateDaysUntilStart(selectedGroup.start_deadline);
                            if (days !== null && days >= 0) {
                              return (
                                <span className="text-sm ml-2">
                                  ({days === 0 ? '¡Hoy comienza!' : days === 1 ? '¡Mañana!' : `Faltan ${days} días`})
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Students List */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0C2340] mb-4">
                    Estudiantes Inscritos ({selectedGroup.students.length})
                  </h3>

                  {selectedGroup.students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay estudiantes inscritos en este grupo</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedGroup.students.map((student, index) => (
                        <div
                          key={student.studentid}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-[#0C2340] text-white rounded-full flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-[#0C2340]">
                                    {student.firstname} {student.lastname}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    ID: {student.studentid}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-13">
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="text-sm text-[#0C2340]">
                                    {student.email}
                                  </p>
                                </div>
                                {student.phone && (
                                  <div>
                                    <p className="text-xs text-gray-500">Teléfono</p>
                                    <p className="text-sm text-[#0C2340]">
                                      {student.phone}
                                    </p>
                                  </div>
                                )}
                                {student.academicrating !== null && (
                                  <div>
                                    <p className="text-xs text-gray-500">Nivel de Educación</p>
                                    <p className="text-sm font-semibold text-[#B15B29]">
                                      {getAcademicLevelText(student.academicrating)}
                                    </p>
                                  </div>
                                )}
                                {student.biblicalrating !== null && (
                                  <div>
                                    <p className="text-xs text-gray-500">Conocimiento Bíblico</p>
                                    <p className="text-sm font-semibold text-[#B15B29]">
                                      {getBiblicalKnowledgeText(student.biblicalrating)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <span
                                className={`
                                  px-2 py-1 rounded-full text-xs font-semibold
                                  ${student.status 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                  }
                                `}
                              >
                                {student.status ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="bg-[#0C2340] text-white px-6 py-2 rounded-md hover:bg-[#0a1a2e] transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-500">
                <p>Error al cargar la información del grupo</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
