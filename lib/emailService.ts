import { Resend } from 'resend';

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface EnrollmentEmailData {
  studentName: string;
  studentEmail: string;
  courseName: string;
  classSchedule: string;
  classDays: string;
  classTime: string;
  groupId: number;
  teacherName: string;
  teacherEmail: string;
  startDate?: string;
}

interface CourseReminderEmailData {
  teacherName: string;
  teacherEmail: string;
  courseName: string;
  groupId: number;
  startDate: string;
  classSchedule: string;
  classDays: string;
  classTime: string;
  studentCount: number;
  daysUntilStart: number; // 0 = hoy, 1 = mañana, 2 = pasado mañana
  students?: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
}

// Template HTML para el estudiante
const getStudentEmailTemplate = (data: EnrollmentEmailData) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #0C2340;
      background-color: #F0F4F8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #0C2340;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .success-badge {
      background-color: #10B981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #F0F4F8;
      border-left: 4px solid #B15B29;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-item {
      margin: 12px 0;
    }
    .info-label {
      font-weight: bold;
      color: #0C2340;
    }
    .info-value {
      color: #4B5563;
    }
    .footer {
      background-color: #F0F4F8;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6B7280;
    }
    .button {
      display: inline-block;
      background-color: #B15B29;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Inscripción Exitosa!</h1>
    </div>
    <div class="content">
      <div class="success-badge">✓ CONFIRMADO</div>
      
      <h2>¡Bienvenido(a) ${data.studentName}!</h2>
      
      <p>Tu inscripción ha sido procesada exitosamente. Estamos emocionados de tenerte en nuestro instituto.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #0C2340;">Detalles de tu Curso</h3>
        
        <div class="info-item">
          <span class="info-label">📚 Curso:</span>
          <span class="info-value">${data.courseName}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">👨‍🏫 Profesor:</span>
          <span class="info-value">${data.teacherName}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📅 Días de clase:</span>
          <span class="info-value">${data.classDays}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">⏰ Horario:</span>
          <span class="info-value">${data.classTime}</span>
        </div>
        
        ${data.startDate ? `
        <div class="info-item">
          <span class="info-label">🎯 Fecha de inicio:</span>
          <span class="info-value">${data.startDate}</span>
        </div>
        ` : ''}
        
        <div class="info-item">
          <span class="info-label">🔢 ID de Grupo:</span>
          <span class="info-value">#${data.groupId}</span>
        </div>
      </div>
      
      <p><strong>Próximos pasos:</strong></p>
      <ul>
        <li>Asegúrate de tener los materiales necesarios para la clase</li>
        <li>Llega 10 minutos antes el primer día</li>
        <li>Si tienes alguna pregunta, contacta a tu profesor</li>
      </ul>
      
      <p>¡Nos vemos en clase!</p>
    </div>
    <div class="footer">
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
      <p>© ${new Date().getFullYear()} Axioma Instituto. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

// Template HTML para el profesor
const getTeacherEmailTemplate = (data: EnrollmentEmailData) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #0C2340;
      background-color: #F0F4F8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #B15B29;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .notification-badge {
      background-color: #3B82F6;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .student-box {
      background-color: #F0F4F8;
      border: 2px solid #0C2340;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-item {
      margin: 10px 0;
    }
    .info-label {
      font-weight: bold;
      color: #0C2340;
    }
    .info-value {
      color: #4B5563;
    }
    .footer {
      background-color: #F0F4F8;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Nuevo Estudiante Inscrito</h1>
    </div>
    <div class="content">
      <div class="notification-badge">NUEVA INSCRIPCIÓN</div>
      
      <p>Hola <strong>${data.teacherName}</strong>,</p>
      
      <p>Te informamos que se ha inscrito un nuevo estudiante en tu grupo.</p>
      
      <div class="student-box">
        <h3 style="margin-top: 0; color: #0C2340;">Información del Estudiante</h3>
        
        <div class="info-item">
          <span class="info-label">👤 Nombre:</span>
          <span class="info-value">${data.studentName}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📧 Correo:</span>
          <span class="info-value">${data.studentEmail}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📚 Curso:</span>
          <span class="info-value">${data.courseName}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">🔢 Grupo ID:</span>
          <span class="info-value">#${data.groupId}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📅 Horario:</span>
          <span class="info-value">${data.classDays} - ${data.classTime}</span>
        </div>
      </div>
      
      <p><strong>Recuerda:</strong> Puedes revisar la lista completa de tus estudiantes en el panel de administración.</p>
    </div>
    <div class="footer">
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
      <p>© ${new Date().getFullYear()} Axioma Instituto. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

// Función principal para enviar emails de inscripción
export const sendEnrollmentEmails = async (
  data: EnrollmentEmailData
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 Enviando emails de inscripción...');

    // Verificar que Resend esté configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY no está configurada');
      return { success: false, error: 'API Key de Resend no configurada' };
    }

    // Verificar que FROM_EMAIL esté configurado
    const fromEmail = process.env.FROM_EMAIL || 'noreply@notifications.axiomainstitude.com';
    console.log('📤 Enviando desde:', fromEmail);

    // 1. Enviar email al estudiante
    console.log('📨 Enviando email al estudiante:', data.studentEmail);
    const studentEmailResult = await resend.emails.send({
      from: fromEmail,
      to: [data.studentEmail],
      subject: '¡Inscripción Exitosa! - Axioma Instituto',
      html: getStudentEmailTemplate(data),
    });

    if (studentEmailResult.error) {
      console.error('❌ Error enviando email al estudiante:', studentEmailResult.error);
      return { success: false, error: studentEmailResult.error.message };
    }

    console.log('✅ Email enviado al estudiante:', studentEmailResult.data?.id);

    // 2. Enviar email al profesor
    console.log('📨 Enviando email al profesor:', data.teacherEmail);
    const teacherEmailResult = await resend.emails.send({
      from: fromEmail,
      to: [data.teacherEmail],
      subject: '🎓 Nuevo Estudiante Inscrito - Axioma Instituto',
      html: getTeacherEmailTemplate(data),
    });

    if (teacherEmailResult.error) {
      console.error('❌ Error enviando email al profesor:', teacherEmailResult.error);
      // No fallar completamente si solo falla el email del profesor
      // Inscripción exitosa pero no se pudo notificar al profesor
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error inesperado enviando emails:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

// Función para enviar email de prueba
export const sendTestEmail = async (to: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'RESEND_API_KEY no configurada' };
    }

    const fromEmail = process.env.FROM_EMAIL || 'noreply@notifications.axiomainstitude.com';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Email de Prueba - Axioma Instituto',
      html: `
        <h1>¡Email de prueba exitoso!</h1>
        <p>Si recibes este email, la configuración de Resend está funcionando correctamente.</p>
        <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
      `,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

// Template para recordatorio de inicio de curso
const getCourseReminderTemplate = (data: CourseReminderEmailData) => {
  const urgencyColor = data.daysUntilStart === 0 ? '#DC2626' : data.daysUntilStart === 1 ? '#F59E0B' : '#10B981';
  const urgencyText = data.daysUntilStart === 0 
    ? '¡Hoy comienza el curso!' 
    : data.daysUntilStart === 1 
    ? '¡El curso comienza mañana!' 
    : `El curso comienza en ${data.daysUntilStart} días`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #0C2340;
      background-color: #F0F4F8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: ${urgencyColor};
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .urgency-badge {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      margin-top: 10px;
      font-size: 18px;
    }
    .content {
      padding: 30px;
    }
    .info-box {
      background-color: #F0F4F8;
      border-left: 4px solid ${urgencyColor};
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-item {
      margin: 12px 0;
    }
    .info-label {
      font-weight: bold;
      color: #0C2340;
    }
    .info-value {
      color: #4B5563;
    }
    .checklist {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .checklist h3 {
      margin-top: 0;
      color: #92400E;
    }
    .checklist ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .checklist li {
      margin: 8px 0;
      color: #78350F;
    }
    .footer {
      background-color: #0C2340;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background-color: #B15B29;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Recordatorio de Inicio de Curso</h1>
      <div class="urgency-badge">${urgencyText}</div>
    </div>
    
    <div class="content">
      <p>Estimado/a <strong>${data.teacherName}</strong>,</p>
      
      <p>Este es un recordatorio de que su curso está próximo a iniciar. Por favor, asegúrese de tener todo listo para recibir a sus estudiantes.</p>
      
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">📚 Curso:</span>
          <span class="info-value">${data.courseName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">📅 Fecha de Inicio:</span>
          <span class="info-value">${new Date(data.startDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🕒 Horario:</span>
          <span class="info-value">${data.classDays} a las ${data.classTime}</span>
        </div>
        <div class="info-item">
          <span class="info-label">👥 Estudiantes Inscritos:</span>
          <span class="info-value">${data.studentCount} estudiante${data.studentCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🏫 ID del Grupo:</span>
          <span class="info-value">#${data.groupId}</span>
        </div>
      </div>

      ${data.daysUntilStart <= 1 ? `
      <div class="checklist">
        <h3>✅ Checklist de Preparación:</h3>
        <ul>
          <li>Verificar materiales de clase preparados</li>
          <li>Confirmar acceso al aula/plataforma</li>
          <li>Revisar lista de estudiantes inscritos</li>
          <li>Preparar presentación de bienvenida</li>
          <li>Configurar herramientas tecnológicas necesarias</li>
        </ul>
      </div>
      ` : ''}

      ${data.students && data.students.length > 0 ? `
      <div class="info-box" style="background-color: #E0F2FE; border-left-color: #0EA5E9;">
        <h3 style="margin-top: 0; color: #075985;">📱 Lista de Estudiantes para WhatsApp</h3>
        <p style="margin-bottom: 15px; color: #0C4A6E;">
          Puedes crear un grupo de WhatsApp con tus estudiantes usando el botón de abajo:
        </p>
        
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          ${data.students.map((student, index) => `
            <div style="padding: 8px 0; border-bottom: ${index < data.students!.length - 1 ? '1px solid #E5E7EB' : 'none'};">
              <strong style="color: #0C2340;">${index + 1}. ${student.name}</strong><br>
              ${student.phone ? `
                <span style="color: #059669; font-size: 14px;">📱 ${student.phone}</span><br>
              ` : ''}
              <span style="color: #6B7280; font-size: 13px;">📧 ${student.email}</span>
            </div>
          `).join('')}
        </div>

        ${data.students.filter(s => s.phone).length > 0 ? `
        <p style="text-align: center; margin-top: 20px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola! Soy ${data.teacherName}, profesor del curso "${data.courseName}". 📚\n\nEstoy creando este grupo para compartir información importante sobre las clases.\n\n📅 Inicio: ${new Date(data.startDate).toLocaleDateString('es-ES')}\n🕒 Horario: ${data.classDays} a las ${data.classTime}\n\n¡Bienvenidos! 🎓`)}" 
             class="cta-button" 
             style="background-color: #25D366; text-decoration: none;">
            💬 Mensaje de WhatsApp para Grupo
          </a>
        </p>
        <p style="font-size: 13px; color: #6B7280; text-align: center; margin-top: 10px;">
          Click para abrir WhatsApp con un mensaje predefinido.<br>
          Copia los números de arriba y agrégalos manualmente al grupo.
        </p>
        ` : `
        <p style="color: #DC2626; font-size: 14px; text-align: center; margin-top: 10px;">
          ⚠️ Algunos estudiantes no proporcionaron número de WhatsApp
        </p>
        `}
      </div>
      ` : ''}

      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/main/groups" class="cta-button">
          Ver Detalles del Grupo
        </a>
      </p>

      <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactar al departamento administrativo.</p>
      
      <p style="margin-top: 30px;">
        Saludos cordiales,<br>
        <strong>Axioma Instituto</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Axioma Instituto. Todos los derechos reservados.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        Este es un mensaje automático. Por favor, no responder a este correo.
      </p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Envía recordatorio de inicio de curso al profesor
 */
export const sendCourseReminderEmail = async (data: CourseReminderEmailData) => {
  try {
    const fromEmail = process.env.FROM_EMAIL || 'noreply@notifications.axiomainstitude.com';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: data.teacherEmail,
      subject: `${data.daysUntilStart === 0 ? '🔴 ¡HOY!' : data.daysUntilStart === 1 ? '🟡 Mañana' : '🟢'} Inicio del curso: ${data.courseName}`,
      html: getCourseReminderTemplate(data),
    });

    console.log('✅ Course reminder email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error sending course reminder email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
