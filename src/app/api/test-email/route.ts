import { NextResponse } from 'next/server';
import { sendTestEmail } from '../../../../lib/emailService';
import { requireAdmin } from '@/lib/authorization';
import { getErrorStatusCode } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log('🧪 Enviando email de prueba a:', email);
    const result = await sendTestEmail(email);

    if (result.success) {
      console.log('✅ Email de prueba enviado exitosamente');
      return NextResponse.json({ 
        message: 'Email de prueba enviado exitosamente. Revisa tu bandeja de entrada.',
        success: true 
      });
    } else {
      console.error('❌ Error enviando email de prueba:', result.error);
      return NextResponse.json(
        { error: result.error || 'Error desconocido' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    const statusCode = getErrorStatusCode(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// Para pruebas rápidas desde el navegador - requiere autenticación
export async function GET() {
  try {
    // Verificar que el usuario sea administrador
    await requireAdmin();
    
    return NextResponse.json({
      message: 'Endpoint de prueba de emails',
      usage: 'POST /api/test-email con body: { "email": "tu@email.com" }',
      example: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'tu@email.com' }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    const statusCode = getErrorStatusCode(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
