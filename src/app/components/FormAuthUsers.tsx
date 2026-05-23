"use client";
import { useState, useEffect } from "react";
import Button from "@/app/components/Button";

export interface AuthUserData {
  id: string;
  email: string;
  password?: string; // Solo para crear/editar
  created_at?: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface AuthUserFormProps {
  data?: AuthUserData;
  type: string;
  onChange?: (updated: AuthUserData) => void;
  functionToExecute?: (info: AuthUserData) => void;
}

export default function AuthUserForm({
  data,
  type,
  onChange,
  functionToExecute,
}: AuthUserFormProps) {
  
  const [formData, setFormData] = useState<AuthUserData>({
    id: "",
    email: "",
    password: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [label, setLabel] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  
  useEffect(() => {
    setErrors([]);
    switch (type) {
      case "new":
        setLabel("Crear Usuario");
        setFormData({
          id: "",
          email: "",
          password: "",
        });
        break;
      case "edit":
        if (data != null) {
          setFormData({
            ...data,
            password: "", // No mostramos la contraseña actual
          });
        }
        setLabel("Cambiar Contraseña");
        break;
      case "Delete":
      case "delete":
        if (data != null) {
          setFormData(data);
        }
        setLabel("Eliminar Usuario");
        break;
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedData: AuthUserData = { ...formData, [name]: value };
    setFormData(updatedData);
    onChange?.(updatedData);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (type === "new" || type === "edit") {
      if (type === "new" && !formData.email.trim()) {
        newErrors.push("El email es requerido");
      }
      
      if (type === "new" && !formData.password?.trim()) {
        newErrors.push("La contraseña es requerida");
      }

      if (type === "edit" && !formData.password?.trim()) {
        newErrors.push("La nueva contraseña es requerida");
      }

      if (formData.password && formData.password.length < 6) {
        newErrors.push("La contraseña debe tener al menos 6 caracteres");
      }

      if (formData.password !== passwordConfirm) {
        newErrors.push("Las contraseñas no coinciden");
      }

      if (type === "new" && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.push("El formato del email no es válido");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (type !== "delete" && !validateForm()) {
      return;
    }
    functionToExecute?.(formData);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <div className="flex gap-x-10 gap-y-6 text-[#0C2340] text-sm">
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 min-w-[400px]">
        
        {/* Mostrar información del usuario existente */}
        {type !== "new" && (
          <>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">ID de Usuario</label>
              <input
                type="text"
                value={formData.id}
                disabled={true}
                readOnly
                className="border border-[#0C2340] rounded-md px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled={true}
                readOnly
                className="border border-[#0C2340] rounded-md px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            {formData.created_at && (
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">Fecha de Creación</label>
                <input
                  type="text"
                  value={formatDate(formData.created_at)}
                  disabled={true}
                  readOnly
                  className="border border-[#0C2340] rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>
            )}

            {formData.last_sign_in_at && (
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">Último Inicio de Sesión</label>
                <input
                  type="text"
                  value={formatDate(formData.last_sign_in_at)}
                  disabled={true}
                  readOnly
                  className="border border-[#0C2340] rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>
            )}
          </>
        )}

        {/* Campos para crear nuevo usuario */}
        {type === "new" && (
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-semibold">
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
            />
          </div>
        )}

        {/* Campos de contraseña para crear/editar */}
        {(type === "new" || type === "edit") && (
          <>
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-1 font-semibold">
                {type === "edit" ? "Nueva Contraseña*" : "Contraseña*"}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleChange}
                value={formData.password || ""}
                placeholder="Mínimo 6 caracteres"
                className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="passwordConfirm" className="mb-1 font-semibold">
                Repetir Contraseña*
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                onChange={(e) => setPasswordConfirm(e.target.value)}
                value={passwordConfirm}
                placeholder="Confirma tu contraseña"
                className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
              />
            </div>
          </>
        )}

        {/* Mostrar errores */}
        {errors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mensaje de confirmación para eliminar */}
        {type === "delete" && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>⚠️ <strong>¿Estás seguro?</strong></p>
            <p>Esta acción eliminará permanentemente al usuario <strong>{formData.email}</strong></p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
        )}
        
        <div className="flex justify-center items-center mt-4">
          <Button
            label={label}
            onClick={handleSubmit}
            className={`h-15 text-2xl font-semibold transition-colors !mt-5 ${
              type === "delete" 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-[#B15B29] text-white hover:bg-[#944a20]"
            }`}
          />
        </div>
      </div>
    </div>
  );
}