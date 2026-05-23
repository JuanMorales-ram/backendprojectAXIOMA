"use client";

import { useState, useEffect } from 'react';
import { Users, X, UserMinus, UserPlus, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { removeStudentFromGroup, addStudentsToGroup } from '@/app/actions/studentGroupActions';

interface Student {
  studentid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  status: boolean;
}

interface AvailableStudent {
  studentid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
}

interface ManageGroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupName: string;
}

export default function ManageGroupStudentsModal({
  isOpen,
  onClose,
  groupId,
  groupName,
}: ManageGroupStudentsModalProps) {
  const [currentTab, setCurrentTab] = useState<'current' | 'available'>('current');
  const [currentStudents, setCurrentStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && groupId) {
      loadData();
    }
  }, [isOpen, groupId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { fetchGroupDetails } = await import('@/app/supabase/dashboardActions');
      const { fetchAvailableStudents } = await import('@/app/supabase/studentGroupActions');

      const [groupDetails, available] = await Promise.all([
        fetchGroupDetails(groupId),
        fetchAvailableStudents(),
      ]);

      if (groupDetails && groupDetails.students) {
        setCurrentStudents(groupDetails.students);
      }

      setAvailableStudents(available);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('¿Estás seguro de desvincular este estudiante del grupo?')) {
      return;
    }

    setRemoving(studentId);
    try {
      await removeStudentFromGroup(studentId, groupId);

      setCurrentStudents(prev => prev.filter(s => s.studentid !== studentId));
      alert('✅ Estudiante desvinculado exitosamente');
    } catch (error) {
      console.error('Error removing student:', error);
      alert('❌ Error al desvincular estudiante');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddSelectedStudents = async () => {
    if (selectedToAdd.size === 0) {
      alert('Selecciona al menos un estudiante para añadir');
      return;
    }

    if (!confirm(`¿Añadir ${selectedToAdd.size} estudiante(s) al grupo?`)) {
      return;
    }

    setAdding(0);
    try {
      const studentIdArray = Array.from(selectedToAdd);
      const result = await addStudentsToGroup(studentIdArray, groupId);

      await loadData();
      alert(`✅ Añadidos. Total en BD para el grupo: ${result.totalStudents}`);
      setSelectedToAdd(new Set());
      setCurrentTab('current');
    } catch (error) {
      console.error('Error adding students:', error);
      alert('❌ Error al añadir estudiantes');
    } finally {
      setAdding(null);
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedToAdd(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const filteredAvailableStudents = availableStudents.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstname.toLowerCase().includes(searchLower) ||
      student.lastname.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0C2340] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={28} />
            <div>
              <h2 className="text-2xl font-bold">Gestionar Estudiantes</h2>
              <p className="text-sm opacity-90">{groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setCurrentTab('current')}
            className={`flex-1 py-3 px-6 font-semibold transition-colors ${
              currentTab === 'current'
                ? 'bg-white border-b-2 border-[#B15B29] text-[#B15B29]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            Estudiantes del grupo ({currentStudents.length})
          </button>
          <button
            onClick={() => setCurrentTab('available')}
            className={`flex-1 py-3 px-6 font-semibold transition-colors ${
              currentTab === 'available'
                ? 'bg-white border-b-2 border-[#B15B29] text-[#B15B29]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus size={18} className="inline mr-2" />
            Añadir estudiantes ({availableStudents.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C2340]"></div>
            </div>
          ) : currentTab === 'current' ? (
            /* Current Students Tab */
            currentStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No hay estudiantes inscritos en este grupo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentStudents.map((student) => (
                  <motion.div
                    key={student.studentid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0C2340] text-lg">
                        {student.firstname} {student.lastname}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p>📧 {student.email}</p>
                        {student.phone && <p>📱 {student.phone}</p>}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            student.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {student.status ? '✓ Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveStudent(student.studentid)}
                      disabled={removing === student.studentid}
                      className={`
                        ml-4 px-4 py-2 rounded-lg font-semibold
                        flex items-center gap-2 transition-colors
                        ${
                          removing === student.studentid
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }
                      `}
                    >
                      <UserMinus size={18} />
                      {removing === student.studentid ? 'Desvinculando...' : 'Desvincular'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Available Students Tab */
            <>
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15B29] focus:border-transparent"
                />
              </div>

              {filteredAvailableStudents.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {availableStudents.length === 0
                      ? 'Todos los estudiantes ya están en un grupo'
                      : 'No se encontraron estudiantes'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{filteredAvailableStudents.length}</span> estudiante{filteredAvailableStudents.length !== 1 ? 's' : ''} disponible{filteredAvailableStudents.length !== 1 ? 's' : ''}
                    </p>
                    {selectedToAdd.size > 0 && (
                      <button
                        onClick={handleAddSelectedStudents}
                        disabled={adding !== null}
                        className={`
                          px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors
                          ${adding !== null
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                          }
                        `}
                      >
                        <Check size={18} />
                        Añadir {selectedToAdd.size} seleccionado{selectedToAdd.size !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {filteredAvailableStudents.map((student) => (
                      <motion.div
                        key={student.studentid}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => toggleStudentSelection(student.studentid)}
                        className={`
                          bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer
                          ${selectedToAdd.has(student.studentid) ? 'ring-2 ring-[#B15B29] bg-[#B15B29]/10' : ''}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            ${selectedToAdd.has(student.studentid)
                              ? 'bg-[#B15B29] text-white'
                              : 'bg-gray-200 text-gray-500'
                            }
                          `}>
                            {selectedToAdd.has(student.studentid) ? (
                              <Check size={18} />
                            ) : (
                              <span className="text-sm font-semibold">{student.firstname[0]}{student.lastname[0]}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#0C2340] text-lg">
                              {student.firstname} {student.lastname}
                            </h3>
                            <div className="text-sm text-gray-600">
                              <p>📧 {student.email}</p>
                              {student.phone && <p>📱 {student.phone}</p>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStudentSelection(student.studentid);
                          }}
                          className={`
                            px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors
                            ${selectedToAdd.has(student.studentid)
                              ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                              : 'bg-[#B15B29] text-white hover:bg-[#944a20]'
                            }
                          `}
                        >
                          <UserPlus size={18} />
                          {selectedToAdd.has(student.studentid) ? 'Quitar' : 'Seleccionar'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#0C2340] text-white rounded-lg hover:bg-[#1a3a5f] transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}