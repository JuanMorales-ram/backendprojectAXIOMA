import { NextResponse } from 'next/server';
import { checkAndSendCourseReminders } from '@/app/supabase/dashboardActions';

/**
 * API Route para verificar y enviar recordatorios de cursos
 * Este endpoint debe ser llamado por un cron job diariamente
 * 
 * Vercel Cron: Se ejecuta automáticamente según vercel.json
 * Manual: GET /api/cron/check-reminders
 */
export async function GET(request: Request) {
  try {
    // Verificar autorización (opcional pero recomendado)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Si tienes CRON_SECRET configurado, verificar
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      );
    }

    const result = await checkAndSendCourseReminders();

    return NextResponse.json({
      success: result.success,
      message: `Course reminders checked successfully`,
      emailsSent: result.emailsSent,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in cron job:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check reminders',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// También permitir POST para compatibilidad
export async function POST(request: Request) {
  return GET(request);
}
