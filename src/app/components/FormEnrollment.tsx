"use client";
import { useState, useEffect } from "react";
import Button from "@/app/components/Button";
import {
  fetchAvailableGroups,
  enrollStudent,
  GroupWithDetails,
  EnrollmentData,
} from "@/app/supabase/enrollmentActions";
import { academicLevelOptions, biblicalKnowledgeOptions } from "@/app/utils/studentRatings";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/phone-input.css';

export default function EnrollmentForm() {
  const [formData, setFormData] = useState<EnrollmentData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    academicrating: 0,
    biblicalrating: 0,
    groupid: 0,
  });

  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  // Cargar grupos disponibles al montar el componente
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const availableGroups = await fetchAvailableGroups();
      setGroups(availableGroups);
    } catch (error) {
      console.error("Error loading groups:", error);
      setMessage({
        type: "error",
        text: "Error al cargar los grupos disponibles",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "groupid") {
      const groupId = parseInt(value);
      setFormData({ ...formData, groupid: groupId });
      const group = groups.find((g) => g.groupid === groupId);
      setSelectedGroup(group || null);
    } else if (name === "academicrating" || name === "biblicalrating") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.firstname.trim()) {
      setMessage({ type: "error", text: "El nombre es requerido" });
      return false;
    }
    if (!formData.lastname.trim()) {
      setMessage({ type: "error", text: "Los apellidos son requeridos" });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setMessage({
        type: "error",
        text: "Ingrese un correo electrónico válido",
      });
      return false;
    }
    if (!formData.academicrating || formData.academicrating === 0) {
      setMessage({
        type: "error",
        text: "Debe seleccionar un nivel de educación",
      });
      return false;
    }
    if (!formData.biblicalrating || formData.biblicalrating === 0) {
      setMessage({
        type: "error",
        text: "Debe seleccionar un nivel de conocimiento bíblico",
      });
      return false;
    }
    if (!formData.groupid || formData.groupid === 0) {
      setMessage({ type: "error", text: "Debe seleccionar un grupo" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await enrollStudent(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: "¡Inscripción exitosa! Recibirás un correo de confirmación pronto.",
        });
        // Resetear formulario
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          academicrating: 0,
          biblicalrating: 0,
          groupid: 0,
        });
        setSelectedGroup(null);
        // Recargar grupos para actualizar disponibilidad
        await loadGroups();
      } else {
        setMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (error) {
      console.error("Error submitting enrollment:", error);
      setMessage({
        type: "error",
        text: "Error al procesar la inscripción. Intente nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0C2340] mb-2">
            Formulario de Inscripción
          </h1>
          <p className="text-[#0C2340]/70">
            Complete el formulario para inscribirse en un grupo
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombres */}
          <div className="flex flex-col">
            <label htmlFor="firstname" className="mb-2 font-semibold text-[#0C2340]">
              Nombres*
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
              placeholder="Ingrese sus nombres"
              disabled={submitting}
            />
          </div>

          {/* Apellidos */}
          <div className="flex flex-col">
            <label htmlFor="lastname" className="mb-2 font-semibold text-[#0C2340]">
              Apellidos*
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
              placeholder="Ingrese sus apellidos"
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-semibold text-[#0C2340]">
              Correo Electrónico*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
              placeholder="correo@ejemplo.com"
              disabled={submitting}
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col">
            <label htmlFor="phone" className="mb-2 font-semibold text-[#0C2340]">
              Teléfono (WhatsApp)
            </label>
            <PhoneInput
              international
              defaultCountry="CO"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value || "" })}
              disabled={submitting}
              className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
              placeholder="Ingrese número con WhatsApp"
            />
          </div>

          {/* Nivel de Educación */}
          <div className="flex flex-col">
            <label
              htmlFor="academicrating"
              className="mb-2 font-semibold text-[#0C2340]"
            >
              Nivel de Educación*
            </label>
            <select
              id="academicrating"
              name="academicrating"
              value={formData.academicrating}
              onChange={handleChange}
              required
              className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
              disabled={submitting}
            >
              <option value={0} disabled>
                Seleccione su nivel de educación
              </option>
              {academicLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conocimiento Bíblico */}
          <div className="flex flex-col">
            <label
              htmlFor="biblicalrating"
              className="mb-2 font-semibold text-[#0C2340]"
            >
              Conocimiento Bíblico*
            </label>
            <select
              id="biblicalrating"
              name="biblicalrating"
              value={formData.biblicalrating}
              onChange={handleChange}
              required
              className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
              disabled={submitting}
            >
              <option value={0} disabled>
                Seleccione su nivel
              </option>
              {biblicalKnowledgeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Grupo */}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="groupid" className="mb-2 font-semibold text-[#0C2340]">
              Seleccionar Grupo*
            </label>
            {loading ? (
              <div className="text-[#0C2340] p-4">Cargando grupos...</div>
            ) : groups.length === 0 ? (
              <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
                No hay grupos disponibles en este momento
              </div>
            ) : (
              <select
                id="groupid"
                name="groupid"
                value={formData.groupid}
                onChange={handleChange}
                className="border border-[#0C2340] rounded-md px-4 py-3 text-[#0C2340] bg-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#B15B29]"
                disabled={submitting}
              >
                <option value="0">Seleccione un grupo</option>
                {groups.map((group) => (
                  <option key={group.groupid} value={group.groupid}>
                    {group.course.coursename} - {group.classdays} {group.classtime} (
                    {group.current_students}/{group.numberofstudents} estudiantes)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Detalles del Grupo Seleccionado */}
          {selectedGroup && (
            <div className="md:col-span-2 bg-[#0C2340]/5 rounded-lg p-6 border border-[#0C2340]/20">
              <h3 className="text-lg font-bold text-[#0C2340] mb-4">
                Detalles del Grupo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#0C2340]">
                <div>
                  <p className="font-semibold">Curso:</p>
                  <p>{selectedGroup.course.coursename}</p>
                </div>
                <div>
                  <p className="font-semibold">Profesor:</p>
                  <p>
                    {selectedGroup.teacher.firstname}{" "}
                    {selectedGroup.teacher.lastname}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Horario:</p>
                  <p>
                    {selectedGroup.classdays} - {selectedGroup.classtime}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Lugares disponibles:</p>
                  <p>
                    {selectedGroup.numberofstudents -
                      (selectedGroup.current_students || 0)}{" "}
                    de {selectedGroup.numberofstudents}
                  </p>
                </div>
                {selectedGroup.start_deadline && (
                  <div className="md:col-span-2">
                    <p className="font-semibold">Fecha de inicio:</p>
                    <p>
                      {new Date(selectedGroup.start_deadline).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botón de Envío */}
        <div className="mt-8 flex justify-center">
          <Button
            label={submitting ? "Procesando..." : "Inscribirse"}
            onClick={handleSubmit}
            disabled={submitting || loading || groups.length === 0}
            className="bg-[#B15B29] text-white text-xl font-semibold px-12 py-4 hover:bg-[#944a20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <p className="text-center text-sm text-[#0C2340]/60 mt-6">
          * Campos obligatorios
        </p>
      </div>
    </div>
  );
}
