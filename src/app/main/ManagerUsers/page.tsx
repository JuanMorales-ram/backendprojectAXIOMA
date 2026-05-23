'use client';

import Cards from "@/app/components/Cards";
import CardPlusButton from "@/app/components/CardPlusButton";
import React, { useEffect, useState } from 'react';
import FormAuthUsers, { AuthUserData } from "@/app/components/FormAuthUsers";
import Modal from "@/app/components/Modal";
import SearchBar from "@/app/components/SearchBar";
import ReloadButton from "@/app/components/ReloadButton";
import PlusButton from "@/app/components/PlusButton";
import {
  fetchAuthUsers,
  addAuthUser,
  updateAuthUserPassword,
  deleteAuthUser,
  AuthUser
} from "@/app/supabase/authUserActions";
import { addAdminUser } from "@/app/supabase/adminUserActions";

export default function Home() {
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [typeOfModal, setTypeOfModal] = useState("");
  const [functionToExecute, setFunctionToExecute] = useState<(info: AuthUserData) => void>(() => () => { });
  const [rows, setRows] = useState<AuthUser[]>([]);
  const [filteredRows, setFilteredRows] = useState<AuthUser[]>([]);
  const [actualInfo, setActualInfo] = useState<AuthUserData>({
    id: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuthUsers();
      setRows(data);
      setFilteredRows(data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInfoToModal = (user: AuthUser) => {
    setActualInfo({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      password: ""
    });
  };

  const handleOpenModal = (action: boolean, type: string) => {
    setTypeOfModal(type);
    setIsModalOpenEdit(action);
    setError(null);

    switch (type) {
      case 'new':
        setActualInfo({ id: "", email: "", password: "" });
        setFunctionToExecute(() => async (info: AuthUserData) => {
          if (!info.email || !info.password) {
            setError('Email y contraseña son requeridos');
            return;
          }

          setLoading(true);
          const result = await addAuthUser(info.email, info.password);
          setLoading(false);

          if (result.success && result.userId) {
            setLoading(true);

            // Crear el registro en admin_users
            const adminResult = await addAdminUser({
              user_id: result.userId,
              username: info.email,
              password: info.password,
              Rol: true 
            });

            setLoading(false);

            if (!adminResult.success) {
              setError(`Error al crear usuario en base de datos: ${adminResult.error}`);
              return;
            }

            await loadUsers();
            setIsModalOpenEdit(false);
          } else {
            setError(result.error || 'Error al crear usuario');
          }
        });
        break;

      case 'edit':
        setFunctionToExecute(() => async (info: AuthUserData) => {
          if (!info.password) {
            setError('La nueva contraseña es requerida');
            return;
          }

          setLoading(true);
          const result = await updateAuthUserPassword(info.id, info.password);
          setLoading(false);

          if (result.success) {
            await loadUsers();
            setIsModalOpenEdit(false);
          } else {
            setError(result.error || 'Error al actualizar contraseña');
          }
        });
        break;

      case 'delete':
        setFunctionToExecute(() => async (info: AuthUserData) => {
          setLoading(true);
          const result = await deleteAuthUser(info.id);
          setLoading(false);

          if (result.success) {
            await loadUsers();
            setIsModalOpenEdit(false);
          } else {
            setError(result.error || 'Error al eliminar usuario');
          }
        });
        break;
    }
  };

  const handleNew = () => handleOpenModal(true, 'new');

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (user: AuthUser) => {
    if (user.email_confirmed_at) return "✅ Confirmado";
    return "⏳ Pendiente";
  };

  return (
    <div className="p-10 flex flex-col gap-6">
      <div className="w-full flex h-fit justify-between ">
        <SearchBar
          className=""
          placeholder="Buscar usuario por email"
          data={rows}
          onFilter={setFilteredRows}
        />

        <div className=" flex gap-x-2 items-center ">
          <p className="text-tangaroa-950 font-bold">Nuevo Usuario</p>

          <PlusButton
            OpenOnPlusModal={() => handleOpenModal(true, "new")}
            className=" "
          ></PlusButton>

          <ReloadButton onClick={loadUsers} />
        </div>

      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-tangaroa-950"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        {filteredRows.map((user) => (
          <Cards
            OpenOnEditModal={() => { handleOpenModal(true, "edit") }}
            onEditButton={() => handleInfoToModal(user)}
            OpenOnDeletetModal={() => { handleOpenModal(true, "delete") }}
            key={user.id}
            label={user.email}
            data={[
              { label: "ID", value: user.id.substring(0, 8) + "..." },
              {
                label: "Estado",
                value: getStatusText(user)
              },
              {
                label: "Creado",
                value: formatDate(user.created_at)
              },
              {
                label: "Último acceso",
                value: formatDate(user.last_sign_in_at)
              },
            ]}
          />
        ))}

      </div>

      {filteredRows.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
          <p className="text-gray-400">Crea el primer usuario haciendo clic en Nuevo Usuario</p>
        </div>
      )}

      <Modal isOpen={isModalOpenEdit} onClose={() => setIsModalOpenEdit(false)}>
        <FormAuthUsers
          data={actualInfo}
          onChange={setActualInfo}
          type={typeOfModal}
          functionToExecute={functionToExecute}
        />
      </Modal>
    </div>
  );
}
