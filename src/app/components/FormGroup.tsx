"use client";
import { useState, useEffect } from "react";
import Button from "@/app/components/Button";

export interface ClassGroup {
  groupid: number;
  courseid: number;
  teacherid: number;
  kangaroo_teacherid?: number | null;
  observer_teacherid?: number | null;
  numberofstudents: number;
  classdays: string;
  classtime: string;
  start_deadline?: string | null;
  status: string;
}

interface OptionItem { value: number; label: string }

interface GroupFormEditProps {
  data?: ClassGroup;
  type: string;
  onChange?: (updated: ClassGroup) => void; // opcional para enviar cambios hacia afuera
  functionToExecute?: (info: ClassGroup) => void;
  coursesOptions?: OptionItem[];
  teachersOptions?: OptionItem[];
}

export default function GroupFormEdit({
  data,
  type,
  onChange,
  functionToExecute,
  coursesOptions = [],
  teachersOptions = [],
}: GroupFormEditProps) {
  
  const [formData, setFormData] = useState<ClassGroup>({
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
  
  const [label, setLabel] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const weekDays = [
    { value: "lunes", label: "Lun" },
    { value: "martes", label: "Mar" },
    { value: "miércoles", label: "Mié" },
    { value: "jueves", label: "Jue" },
    { value: "viernes", label: "Vie" },
    { value: "sábado", label: "Sáb" },
    { value: "domingo", label: "Dom" },
  ];

  
  // Efecto para cambiar el label cuando cambia el tipo
  useEffect(() => {
    switch (type) {
        case "new":
          setLabel("Crear");
          setFormData({
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
          setSelectedDays([]);
        break;
      case "edit":
        setLabel("Actualizar");
        break;
    
      case "delete":
        setLabel("Eliminar");
        break;
    }
  }, [type]);

  // Efecto separado para cargar data cuando está en modo edit o delete
  useEffect(() => {
    if ((type === "edit" || type === "delete") && data != null) {
      setFormData(data);
      // Parsear días seleccionados si vienen como string separado por comas
      if (data.classdays) {
        setSelectedDays(data.classdays.split(',').map(d => d.trim()));
      }
    }
  }, [data, type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ["numberofstudents", "courseid", "teacherid", "kangaroo_teacherid", "observer_teacherid"] as const;
    
    let processedValue: string | number | null = value;
    
    if ((numericFields as readonly string[]).includes(name)) {
      if (value === "" || value === "0") {
        processedValue = name === "numberofstudents" ? 0 : null;
      } else {
        const numValue = parseInt(value as string, 10);
        // Evitar números negativos en numberofstudents
        if (name === "numberofstudents" && numValue < 0) {
          processedValue = 0;
        } else {
          processedValue = numValue;
        }
      }
    }
    
    const updatedData = {
      ...formData,
      [name]: processedValue,
    } as ClassGroup;
    setFormData(updatedData);
    onChange?.(updatedData); // notificar cambios
  };

  const handleDayToggle = (day: string) => {
    if (type === "delete") return;
    
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    
    const updated = {
      ...formData,
      classdays: newSelectedDays.join(', '),
    };
    setFormData(updated);
    onChange?.(updated);
  };

  const incrementStudents = () => {
    if (type === "delete") return;
    const updated = {
      ...formData,
      numberofstudents: formData.numberofstudents + 1,
    };
    setFormData(updated);
    onChange?.(updated);
  };

  const decrementStudents = () => {
    if (type === "delete") return;
    const updated = {
      ...formData,
      numberofstudents: Math.max(0, formData.numberofstudents - 1),
    };
    setFormData(updated);
    onChange?.(updated);
  };
  return (
    <div className="flex gap-x-10 gap-y-6 text-[#0C2340] text-sm">
      {/* Grid principal con todos los campos */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {type != "new" && (
          <div className="flex flex-col w-[350px]">
            <label htmlFor="groupid" className="mb-1 font-semibold">
              Id grupo (Autogenerado)
            </label>
            <input
              type="text"
              id="groupid"
              name="groupid"
              disabled
              value={formData.groupid}
              onChange={handleChange}
              readOnly
              className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
            />
          </div>
        )}

        {/* Selector de días de la semana */}
        <div className="flex flex-col w-[350px]">
          <label className="mb-1 font-semibold">
            Días de clase*
          </label>
          <div className="flex gap-2 flex-wrap">
            {weekDays.map((day) => (
              <button
                key={day.value}
                type="button"
                disabled={type === "delete"}
                onClick={() => handleDayToggle(day.value)}
                className={`px-3 py-2 rounded-md border transition-colors ${
                  selectedDays.includes(day.value)
                    ? 'bg-[#B15B29] text-white border-[#B15B29]'
                    : 'bg-[#F0F4F8] text-[#0C2340] border-[#0C2340]'
                } ${type === "delete" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#944a20] hover:text-white'}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hora de clase */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="classtime" className="mb-1 font-semibold">
            Hora de clase*
          </label>
          <input
            type="time"
            id="classtime"
            name="classtime"
            value={formData.classtime}
            disabled={type === "delete"}
            onChange={handleChange}
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          />
        </div>

        {/* Curso */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="courseid" className="mb-1 font-semibold">
            Curso*
          </label>
          <select
            id="courseid"
            name="courseid"
            value={formData.courseid || 0}
            disabled={type === "delete"}
            onChange={handleChange}
            required
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          >
            <option value={0} disabled>
              Selecciona un curso
            </option>
            {coursesOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="status" className="mb-1 font-semibold">
            Estado*
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            disabled={type === "delete"}
            onChange={handleChange}
            required
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          >
            <option value="" disabled>
              Selecciona un estado
            </option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {/* Maestro principal */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="teacherid" className="mb-1 font-semibold">
            Maestro Principal*
          </label>
          <select
            id="teacherid"
            name="teacherid"
            value={formData.teacherid || 0}
            disabled={type === "delete"}
            onChange={handleChange}
            required
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          >
            <option value={0} disabled>
              Selecciona un maestro
            </option>
            {teachersOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kanguro */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="kangaroo_teacherid" className="mb-1 font-semibold">
            Maestro Kanguro
          </label>
          <select
            id="kangaroo_teacherid"
            name="kangaroo_teacherid"
            value={formData.kangaroo_teacherid || 0}
            disabled={type === "delete"}
            onChange={handleChange}
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          >
            <option value={0}>
              Sin asignar
            </option>
            {teachersOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Observador */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="observer_teacherid" className="mb-1 font-semibold">
            Maestro Observador
          </label>
          <select
            id="observer_teacherid"
            name="observer_teacherid"
            value={formData.observer_teacherid || 0}
            disabled={type === "delete"}
            onChange={handleChange}
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          >
            <option value={0}>
              Sin asignar
            </option>
            {teachersOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de inicio */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="start_deadline" className="mb-1 font-semibold">
            Fecha de inicio*
          </label>
          <input
            type="date"
            id="start_deadline"
            name="start_deadline"
            value={formData.start_deadline || ""}
            disabled={type === "delete"}
            onChange={handleChange}
            required
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          />
        </div>

        {/* Número de estudiantes */}
        <div className="flex flex-col w-[350px]">
          <label htmlFor="numberofstudents" className="mb-1 font-semibold">
            Número de estudiantes*
          </label>
          <div className="flex items-center border border-[#0C2340] rounded-md px-3 py-2 bg-[#F0F4F8]">
            <span
              onClick={decrementStudents}
              className={`text-[#0C2340] font-bold text-xl px-2 ${
                type === "delete" ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:text-[#B15B29]"
              }`}
            >
              −
            </span>
            <input
              type="number"
              id="numberofstudents"
              name="numberofstudents"
              value={formData.numberofstudents}
              disabled={type === "delete"}
              onChange={handleChange}
              min="0"
              required
              className="w-full text-center bg-transparent outline-none text-[#0C2340] placeholder:italic disabled:opacity-50"
            />
            <span
              onClick={incrementStudents}
              className={`text-[#0C2340] font-bold text-xl px-2 ${
                type === "delete" ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:text-[#B15B29]"
              }`}
            >
              +
            </span>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex col-span-2 justify-center items-center">
          <Button
            label={label}
            onClick={() => {
              // Validar que se hayan seleccionado días (solo para new y edit)
              if (type !== "delete" && selectedDays.length === 0) {
                alert("Por favor, selecciona al menos un día de clase");
                return;
              }
              // Validar que classtime no esté vacío
              if (type !== "delete" && !formData.classtime) {
                alert("Por favor, ingresa la hora de clase");
                return;
              }
              // Validar fecha de inicio
              if (type !== "delete" && !formData.start_deadline) {
                alert("Por favor, selecciona la fecha de inicio");
                return;
              }
              functionToExecute?.(formData);
            }}
            className="bg-[#B15B29] h-15 text-2xl text-white font-semibold hover:bg-[#944a20] transition-colors !mt-5"
          />
        </div>
      </div>
    </div>
  );
}
