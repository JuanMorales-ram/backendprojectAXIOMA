// components/Cards.tsx

"use client";
import { useState, useEffect } from "react";
import Button from "@/app/components/Button";

export interface TeacherData {
  teacherid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

interface TeacherFormProps {
  data?: TeacherData;
  type: string;
  onChange?: (updated: TeacherData) => void;
  functionToExecute?: (info: TeacherData) => void;
}

export default function TeacherFormEdit({
  data,
  type,
  onChange,
  functionToExecute,
}: TeacherFormProps) {
  const [formData, setFormData] = useState<TeacherData>({
    teacherid: 0,
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [label, setLabel] = useState("");

  // Efecto para cambiar el label cuando cambia el tipo
  useEffect(() => {
    switch (type) {
      case "new":
        setLabel("Crear");
        setFormData({
          teacherid: 0,
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
        });
        break;
      case "edit":
        setLabel("Actualizar");
        break;
      case "delete":
        setLabel("Eliminar");
        break;
      case "copy":
        setLabel("Copiar");
        break;
    }
  }, [type]);

  // Efecto separado para cargar data cuando está en modo edit, delete o copy
  useEffect(() => {
    if ((type === "edit" || type === "delete") && data != null) {
      setFormData(data);
    } else if (type === "copy" && data != null) {
      setFormData({
        ...data,
        teacherid: 0,
        firstname: data.firstname + " (Copia)",
      });
    }
  }, [data, type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Validar que firstname y lastname solo contengan letras y espacios
    if ((name === "firstname" || name === "lastname") && value) {
      const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
      if (!onlyLetters.test(value)) {
        return; // No actualizar si contiene caracteres inválidos
      }
    }
    
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);
    onChange?.(updatedData);
  };

  return (
    <div className=" flex  gap-x-10 gap-y-6 text-[#0C2340] text-sm ">
      <div className=" grid grid-cols-2 gap-x-4 gap-y-4">
        {type != "new" && (
          <div className="flex flex-col w-[350px]">
            <label htmlFor="teacherid" className="mb-1 font-semibold">
              Id Maestro (Autogenerado)
            </label>
            <input
              type="text"
              id="teacherid"
              name="teacherid"
              disabled={type === "delete"}
              value={formData.teacherid}
              onChange={handleChange}
              readOnly
              className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8] disabled:opacity-50"
            />
          </div>
        )}

        <div className="flex flex-col w-[350px]">
          <label htmlFor="firstname" className="mb-1 font-semibold">
            Nombres*
          </label>
          <input
            id="firstname"
            name="firstname"
            value={formData.firstname}
            disabled={type === "delete"}
            onChange={handleChange}
            required
            pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
            title="Solo se permiten letras y espacios"
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col w-[350px]">
          <label htmlFor="lastname" className="mb-1 font-semibold">
            Apellidos*
          </label>
          <input
            id="lastname"
            name="lastname"
            value={formData.lastname}
            disabled={type === "delete"}
            onChange={handleChange}
            required
            pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
            title="Solo se permiten letras y espacios"
            className="border border-[#0C2340] rounded-md px-3 py-2 text-[#0C2340] bg-[#F0F4F8] disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col w-[350px]">
          <label htmlFor="phone" className="mb-1 font-semibold">
            Telefono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            disabled={type === "delete"}
            onChange={handleChange}
            value={formData.phone}
            pattern="[0-9+\-\s()]+"
            title="Solo se permiten números, +, -, espacios y paréntesis"
            className="border border-[#0C2340] rounded-md px-3 py-2 disabled:opacity-50 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
          />
        </div>

        <div className="flex flex-col w-[350px] ">
          <label htmlFor="email" className="mb-1 font-semibold ">
            Correo*
          </label>
          <div className="flex items-center border border-[#0C2340] rounded-md px-3 py-2 bg-[#F0F4F8]">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled={type === "delete"}
              onChange={handleChange}
              required
              className="w-full bg-transparent outline-none text-[#0C2340] placeholder:italic disabled:opacity-50"
            />
          </div>
        </div>

        <div className=" flex col-span-2 justify-center items-center">
          <Button
            label={label}
            onClick={() => functionToExecute?.(formData)}
            className="bg-[#B15B29] h-15  text-2xl text-white font-semibold hover:bg-[#944a20] transition-colors !mt-5"
          />
        </div>
      </div>
    </div>
  );
}
