'use client';

import { useState } from 'react';
import { addCurrentUserAsAdmin, checkIfUserIsAdmin } from '@/app/supabase/adminSetup';
import Button from '@/app/components/Button';

export default function AdminSetupPage() {
  const [result, setResult] = useState<{ success: boolean; error?: string; userId?: string; userEmail?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<{ isAdmin: boolean; error?: string; userId?: string; userEmail?: string; adminData?: { created_at?: string } } | null>(null);

  const handleAddAdmin = async () => {
    setLoading(true);
    const res = await addCurrentUserAsAdmin();
    setResult(res);
    setLoading(false);
  };

  const handleCheckAdmin = async () => {
    setLoading(true);
    const res = await checkIfUserIsAdmin();
    setCheckResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-tangaroa-950 mb-6">
            🔧 Configuración de Administrador
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Esta página te permite configurar tu usuario actual como administrador
              para que las políticas RLS de Supabase te permitan acceder a los datos.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones:</h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-1">
                <li>Haz clic en Verificar Estado para ver si ya eres administrador</li>
                <li>Si no eres administrador, haz clic en Agregar como Administrador</li>
                <li>Una vez agregado, recarga la página principal</li>
                <li>Elimina esta página después de configurar</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              label={loading ? 'Procesando...' : 'Verificar Estado'}
              onClick={handleCheckAdmin}
              className="bg-blue-600 text-white hover:bg-blue-700"
            />
            
            <Button
              label={loading ? 'Procesando...' : 'Agregar como Administrador'}
              onClick={handleAddAdmin}
              className="bg-green-600 text-white hover:bg-green-700"
            />
          </div>

          {checkResult && (
            <div className={`p-4 rounded mb-4 ${
              checkResult.isAdmin 
                ? 'bg-green-100 border border-green-400' 
                : 'bg-yellow-100 border border-yellow-400'
            }`}>
              <h3 className="font-bold mb-2">
                {checkResult.isAdmin ? '✅ Estado: Administrador' : '⚠️ Estado: No es administrador'}
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>User ID:</strong> {checkResult.userId}</p>
                <p><strong>Email:</strong> {checkResult.userEmail}</p>
                {checkResult.adminData && (
                  <p><strong>Fecha de registro:</strong> {checkResult.adminData.created_at}</p>
                )}
                {checkResult.error && (
                  <p className="text-red-600"><strong>Error:</strong> {checkResult.error}</p>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded ${
              result.success 
                ? 'bg-green-100 border border-green-400' 
                : 'bg-red-100 border border-red-400'
            }`}>
              <h3 className="font-bold mb-2">
                {result.success ? '✅ Resultado: Éxito' : '❌ Resultado: Error'}
              </h3>
              <div className="text-sm space-y-1">
                {result.success ? (
                  <>
                    <p className="text-green-700">
                      ¡Usuario agregado como administrador exitosamente!
                    </p>
                    <p><strong>User ID:</strong> {result.userId}</p>
                    <p><strong>Email:</strong> {result.userEmail}</p>
                    <p className="mt-3 font-semibold text-green-900">
                      Ahora puedes acceder a todas las funciones del sistema.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-red-700">
                      <strong>Error:</strong> {result.error}
                    </p>
                    {result.error?.includes('duplicate') && (
                      <p className="mt-2 text-yellow-700">
                        ℹ️ Este usuario ya está registrado como administrador.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-50 rounded p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔍 Información técnica:</h3>
            <p className="text-sm text-gray-600">
              Tu usuario debe estar en la tabla <code className="bg-gray-200 px-1 rounded">admin_users</code>
              con el <code className="bg-gray-200 px-1 rounded">user_id</code> correspondiente
              para que las políticas RLS te permitan acceder a los datos.
            </p>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h3>
            <p className="text-sm text-yellow-800">
              Después de configurar tu usuario como administrador, puedes eliminar
              esta página para mantener la seguridad. El archivo está en:
            </p>
            <code className="text-xs bg-yellow-100 block mt-2 p-2 rounded">
              src/app/main/admin-setup/page.tsx
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}