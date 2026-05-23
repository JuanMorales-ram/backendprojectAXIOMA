"use client";
import { useState, useEffect } from "react";
import Button from "@/app/components/Button";

export interface DataUsers {
  userid: string;
  username: string;
  password: string;
}

interface UsersFormEditProps {
  data?: DataUsers;
  type: string;
  onChange?: (updated: DataUsers) => void; // opcional para enviar cambios hacia afuera
  functionToExecute?: (info: DataUsers) => void;
}

export default function GroupFormEdit({
  data,
  type,
  onChange,
  functionToExecute,
}: UsersFormEditProps) {
  
  const [formData, setFormData] = useState<DataUsers>({
    userid: "",
    username: "",
    password: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [label, setLabel] = useState("");

  
  useEffect(() => {
    switch (type) {
        case "new":
          setLabel("Crear");
        break;
      case "edit":
        if (data != null) {
          setFormData(data);
        }
        setLabel("Actualizar");
        break;
    
      case "delete":
          if (data != null) {
          setFormData(data);
        }
        setLabel("Eliminar");
        break;
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    onChange?.({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className=" flex  gap-x-10 gap-y-6 text-[#0C2340] text-sm ">
      {/* Primera lista: 3 primeros campos */}
      <div className=" grid grid-cols-2 gap-x-4 gap-y-4">
        {type !== "new" && (
          <div className="flex flex-col w-[350px]">
            <label htmlFor="userid" className="mb-1 font-semibold">
              Id Usuario (Autogenerado)
            </label>
            <input
              type="text"
              id="userid"
              name="userid"
              disabled={true}
              value={formData.userid}
              onChange={handleChange}
              readOnly
              className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
            />
          </div>
        )}

        <div className="flex flex-col w-[350px]">
          <label htmlFor="username" className="mb-1 font-semibold">
            Usuario*
          </label>
          <input
            type="text"
            id="username"
            name="username"
            disabled={type == "Delete"}
            value={formData.username}
            onChange={handleChange}
            className="border border-[#0C2340] rounded-md px-3 py-2 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
          />
        </div>
     

       

        <div className="flex flex-col w-[350px]">
          <label htmlFor="password" className="mb-1 font-semibold">
            Contraseña*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            disabled={type == "delete"}
            onChange={handleChange}
            value={formData.password}
            className="border border-[#0C2340] rounded-md px-3 py-2 disabled:border-gray-400 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
          />
        </div>
        {type !== "delete" && (
          <div className="flex flex-col w-[350px]">
            <label htmlFor="passwordConfirm" className="mb-1 font-semibold">
              Repetir Contraseña*
            </label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              disabled={type == "delete"}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              value={passwordConfirm}
              className="border border-[#0C2340] rounded-md px-3 py-2 disabled:border-gray-400 placeholder:text-[#0C2340] placeholder:italic bg-[#F0F4F8]"
            />
          </div>
        )}
        
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
