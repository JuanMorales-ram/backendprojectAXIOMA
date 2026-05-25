# 📚 Axioma Institut - Sistema de Gestión Educativo

Sistema web completo para la gestión de estudiantes, cursos, profesores y grupos de estudio en instituciones educativas eclesiasticas. Construido con **Next.js 16**, **React 19**, **TypeScript** y **Supabase** como base de datos.

---

##  Tabla de Contenidos

- [Características Principales]
- [Requisitos Previos]
- [Instalación]
- [Configuración de Variables de Entorno]
- [Configuración de Supabase]
- [Estructura del Proyecto]
- [Comandos Disponibles]
- [Roles de Usuario]
- [Guía de Despliegue]
- [Testing]

---

##  Características Principales

-  Autenticación y autorización con Supabase
-  Gestión de estudiantes y profesores
-  Administración de cursos y grupos de estudio
-  Dashboard con estadísticas visuales
-  Sistema de notificaciones por email
-  Roles de usuario con permisos diferenciados
-  Interfaz responsiva con Tailwind CSS
-  Animaciones suaves con Framer Motion
-  Gráficos interactivos con Recharts
-  Testing automatizado con Jest

---

##  Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Requisito | Versión Mínima | Descripción |
|-----------|---------------|----|
| **Node.js** | v18.0.0+ | Runtime de JavaScript |
| **npm** | v9.0.0+ | Gestor de paquetes |
| **Supabase** | Proyecto activo | Base de datos PostgreSQL |
| **Git** | Cualquier versión | Control de versiones |

---

##  Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/JuanMorales-ram/backendprojectAXIOMA.git
cd bakEnd_project-main
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` con tus credenciales (ver sección [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno))

### 4. Configurar la Base de Datos

Ejecuta el script de configuración de Supabase (ver sección [Configuración de Supabase](#configuración-de-supabase))

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

##  Configuración de Variables de Entorno

El archivo `.env.local` es **crítico** para el funcionamiento de la aplicación. Sin él, el proyecto no podrá correr.

### Crear el Archivo

```bash
# En la raíz del proyecto
touch .env.local
```

### Variables Requeridas

| Variable | Descripción | Fuente |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (backend only) | Dashboard Supabase → Settings → API → Service role secret |
| `RESEND_API_KEY` | Clave API para envío de emails | [Consola de Resend](https://resend.com) |
| `FROM_EMAIL` | Email remitente verificado | Tu dominio verificado en Resend |

### Ejemplo de `.env.local`

```env
# ============================================
# SUPABASE - Variables Públicas (Cliente)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# ============================================
# SUPABASE - Variables Privadas (Backend Only)
#  NUNCA exponer estas claves al cliente
# ============================================
SUPABASE_SERVICE_ROLE_KEY=""

# ============================================
# EMAIL - Resend Configuration
# ============================================
RESEND_API_KEY=re_MPeE2sfk_EVJfbLdjCU7posYQQivXNR7mT
FROM_EMAIL=noreplay@notifications.axiomaistitude.com
```

###  Notas Importantes

- **NUNCA** commitear `.env.local` a Git (está en `.gitignore`)
- Las variables con prefijo `NEXT_PUBLIC_` se exponen al cliente (seguras, públicas)
- Las variables sin prefijo solo están disponibles en el servidor (seguras, privadas)
- `SUPABASE_SERVICE_ROLE_KEY` tiene permisos totales: **mantenerla en secreto**

---

##  Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto (gratuito o de pago)
3. Espera a que se inicialice (2-3 minutos)
4. Crear base de datos llamada "backend"

### 2. Obtener Credenciales

1. Accede a **Settings → API**
2. Copia las siguientes claves:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Crear Tablas y Esquemas

Ejecuta el siguiente script SQL en el editor SQL de Supabase:

#### Tabla de Usuarios de Autenticación (Automática)

```sql
-- Supabase crea automáticamente auth.users
-- No requiere configuración manual
```

#### Tabla de Usuarios Administrativos

```sql
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_admin" ON public.admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Estudiantes

```sql
CREATE TABLE public.student (
  studentId UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  academicrating NUMERIC(3,2),
  bibliographic NUMERIC(3,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_select_all" ON public.student
  FOR SELECT USING (true);

CREATE POLICY "students_insert_admin" ON public.student
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "students_update_admin" ON public.student
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "students_delete_admin" ON public.student
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Profesores

```sql
CREATE TABLE public.teacher (
  teacherId UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.teacher ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_select_all" ON public.teacher
  FOR SELECT USING (true);

CREATE POLICY "teachers_insert_admin" ON public.teacher
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "teachers_update_admin" ON public.teacher
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "teachers_delete_admin" ON public.teacher
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Cursos

```sql
CREATE TABLE public.course (
  courseId UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coursename VARCHAR(255) NOT NULL,
  coursename_detail VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.course ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_all" ON public.course
  FOR SELECT USING (true);

CREATE POLICY "courses_insert_admin" ON public.course
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "courses_update_admin" ON public.course
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "courses_delete_admin" ON public.course
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Grupos de Estudiantes

```sql
CREATE TABLE public.classgroup (
  groupId UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  groupname VARCHAR(100) NOT NULL,
  courseId UUID NOT NULL REFERENCES public.course(courseId) ON DELETE CASCADE,
  classname VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.classgroup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classgroups_select_all" ON public.classgroup
  FOR SELECT USING (true);

CREATE POLICY "classgroups_insert_admin" ON public.classgroup
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "classgroups_update_admin" ON public.classgroup
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "classgroups_delete_admin" ON public.classgroup
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Estudiantes en Grupos

```sql
CREATE TABLE public.studentgroup (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID NOT NULL REFERENCES public.student(studentId) ON DELETE CASCADE,
  groupId UUID NOT NULL REFERENCES public.classgroup(groupId) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(studentId, groupId)
);

ALTER TABLE public.studentgroup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studentgroups_select_all" ON public.studentgroup
  FOR SELECT USING (true);

CREATE POLICY "studentgroups_insert_admin" ON public.studentgroup
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "studentgroups_delete_admin" ON public.studentgroup
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Cursos Asignados a Profesores

```sql
CREATE TABLE public.teachercourse (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacherId UUID NOT NULL REFERENCES public.teacher(teacherId) ON DELETE CASCADE,
  courseId UUID NOT NULL REFERENCES public.course(courseId) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(teacherId, courseId)
);

ALTER TABLE public.teachercourse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachercourse_select_all" ON public.teachercourse
  FOR SELECT USING (true);

CREATE POLICY "teachercourse_insert_admin" ON public.teachercourse
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "teachercourse_delete_admin" ON public.teachercourse
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

#### Tabla de Inscripciones de Estudiantes

```sql
CREATE TABLE public.enrollment (
  enrollmentId UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID NOT NULL REFERENCES public.student(studentId) ON DELETE CASCADE,
  courseId UUID NOT NULL REFERENCES public.course(courseId) ON DELETE CASCADE,
  enrollmentDate TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  UNIQUE(studentId, courseId)
);

ALTER TABLE public.enrollment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_all" ON public.enrollment
  FOR SELECT USING (true);

CREATE POLICY "enrollments_insert_admin" ON public.enrollment
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "enrollments_delete_admin" ON public.enrollment
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

### 4. Crear Usuario Administrador Inicial

Después de configurar Supabase, crea el primer administrador:

```bash
npm run create-admin
```

Este comando:
1. Te pedirá el email del administrador
2. Te pedirá una contraseña
3. Creará el usuario en `auth.users`
4. Lo registrará en `admin_users`

---

##  Estructura del Proyecto

```
axioma-inst/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes React reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Cards.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── FormStudents.tsx
│   │   │   ├── FormTeacher.tsx
│   │   │   ├── FormGroup.tsx
│   │   │   ├── DashboardCharts.tsx
│   │   │   └── __tests__/
│   │   ├── api/                 # Rutas de API
│   │   │   ├── auth/
│   │   │   ├── cron/
│   │   │   └── test-email/
│   │   ├── supabase/            # Acciones de BD
│   │   │   ├── studentActions.ts
│   │   │   ├── teacherActions.ts
│   │   │   ├── courseActions.ts
│   │   │   ├── enrollmentActions.ts
│   │   │   └── ...
│   │   ├── main/                # Rutas principales
│   │   │   ├── admin-setup/
│   │   │   ├── dashboard/
│   │   │   ├── Students/
│   │   │   ├── Teacher/
│   │   │   ├── groups/
│   │   │   └── curseManagement/
│   │   ├── layout.tsx           # Layout principal
│   │   ├── page.tsx             # Página de inicio
│   │   └── globals.css          # Estilos globales
│   ├── middleware.ts            # Middleware de autenticación
│   └── utils/                   # Funciones utilitarias
├── lib/
│   ├── supabaseAdmin.ts        # Cliente Supabase admin
│   ├── supabaseServer.ts       # Cliente Supabase server
│   ├── supabaseBrowser.ts      # Cliente Supabase browser
│   ├── authorization.ts        # Control de acceso
│   ├── emailService.ts         # Servicio de emails
│   └── errors.ts               # Tipos de errores
├── public/                      # Archivos estáticos
├── __tests__/                   # Tests de integración
├── .env.local                   # Variables de entorno (NO COMMITEAR)
├── next.config.ts              # Configuración de Next.js
├── tsconfig.json               # Configuración de TypeScript
├── jest.config.js              # Configuración de Jest
└── package.json                # Dependencias del proyecto
```

---

##  Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo (puerto 3000) con Turbopack |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Inicia el servidor en modo producción |
| `npm run lint` | Ejecuta ESLint para detectar errores |
| `npm run test` | Ejecuta todos los tests |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:coverage` | Genera reporte de cobertura de tests |
| `npm run create-admin` | Crea un nuevo usuario administrador |

---

##  Roles de Usuario

El sistema implementa control de acceso basado en roles (RBAC).

### Roles Disponibles

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Admin** | Todos | Acceso total al sistema, gestión de usuarios y datos |
| **Teacher** | Lectura de cursos y estudiantes | Visualización de información de sus cursos |
| **Student** | Lectura de su información | Acceso a información personal y calificaciones |

### Verificación de Permisos

El sistema usa Row Level Security (RLS) de PostgreSQL:

```typescript
// Verificar si el usuario es administrador
import { requireAdmin } from '@/lib/authorization';

export async function tuFuncion() {
  await requireAdmin(); // Lanzará error si no es admin
  // Continúa si es admin
}
```

---



##  Guía de Despliegue

### Opción 1: Desplegar en Vercel (Recomendado)

#### Requisitos
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub

#### Pasos

1. **Conectar Repositorio**
   ```bash
   # Push tu código a GitHub
   git push origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Selecciona "Import Git Repository"
   - Elige tu repositorio

3. **Configurar Variables de Entorno**
   - En Vercel Dashboard → Settings → Environment Variables
   - Agrega todas las variables de `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `RESEND_API_KEY`
     - `FROM_EMAIL`

4. **Desplegar**
   - Vercel desplegará automáticamente
   - Obtén la URL de tu aplicación

### Opción 2: Desplegar en tu Servidor

#### Requisitos
- Servidor Linux/Unix con Node.js v18+
- PM2 o similar para gestionar procesos

#### Pasos

1. **Preparar el Servidor**
   ```bash
   # Instalar Node.js (si no está)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Instalar PM2
   sudo npm install -g pm2
   ```

2. **Clonar y Configurar**
   ```bash
   cd /var/www
   git clone https://github.com/tu-usuario/axioma-inst.git
   cd axioma-inst

   npm install
   ```

3. **Crear `.env.local`**
   ```bash
   nano .env.local
   # Pega tus variables de entorno
   ```

4. **Compilar**
   ```bash
   npm run build
   ```

5. **Iniciar con PM2**
   ```bash
   pm2 start npm --name "axioma-inst" -- start
   pm2 save
   pm2 startup
   ```

6. **Configurar Nginx (Opcional)**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Certificado SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```

---

##  Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Modo watch (vuelve a ejecutar al cambiar archivos)
npm run test:watch

# Cobertura de código
npm run test:coverage
```

### Archivos de Test

Los tests se encuentran en:
- `__tests__/integration/` - Tests de integración
- `src/app/components/__tests__/` - Tests de componentes

### Ejemplo de Test

```typescript
// __tests__/integration/crud-operations.test.tsx
describe('CRUD Operations', () => {
  it('should create a student', () => {
    // Implementación del test
  });
});
```

---

##  Seguridad

### Buenas Prácticas Implementadas

-  Row Level Security (RLS) en todas las tablas
-  Validación de usuarios autenticados
-  Control de acceso basado en roles (RBAC)
-  Headers de seguridad HTTP configurados
-  Content Security Policy (CSP)
-  Protección contra ataques comunes
-  Variables sensibles en `.env.local` (no en Git)

### Headers de Seguridad

```
X-DNS-Prefetch-Control: on
Strict-Transport-Security: max-age=63072000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

##  Configuración de Emails

### Resend Setup

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta y verifica tu email
3. Obtén tu API Key
4. Verifica un dominio (para producción)
5. Agrega credenciales a `.env.local`:

```env
RESEND_API_KEY=re_tu_clave_aqui
FROM_EMAIL=noreply@tudominio.com
```

### Envío de Emails en el Código

```typescript
import { resend } from '@/lib/emailService';

await resend.emails.send({
  from: process.env.FROM_EMAIL!,
  to: destinatario@email.com,
  subject: 'Asunto',
  html: '<h1>Contenido HTML</h1>'
});
```

---

##  Troubleshooting

### Error: "No authenticated user"
- Verifica que estés logueado
- Comprueba que las cookies de sesión no estén expiradas
- Limpia el cache del navegador

### Error: "SUPABASE_SERVICE_ROLE_KEY is missing"
- Verifica que `.env.local` esté en la raíz del proyecto
- Comprueba que la variable esté correctamente configurada
- Reinicia el servidor (`npm run dev`)

### Error: "RLS violation"
- Verifica que el usuario tenga permisos en la tabla
- Comprueba las políticas de RLS en Supabase
- Asegúrate de estar usando el cliente correcto (admin vs. user)

### La Base de Datos no conecta
- Verifica `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Comprueba que el proyecto Supabase esté activo
- Prueba la conexión en Supabase Dashboard

### Los Emails no se envían
- Verifica que `RESEND_API_KEY` sea válido
- Comprueba que el email desde sea verificado en Resend
- Mira los logs en la consola para errores específicos

---

##  Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Next.js** | 16.2.6 | Framework React full-stack |
| **React** | 19.0.0 | Librería de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos CSS |
| **Supabase** | SDK 2.106.0 | Base de datos PostgreSQL |
| **Framer Motion** | 12.23.24 | Animaciones |
| **Recharts** | 3.4.1 | Gráficos interactivos |
| **Lucide React** | 0.487.0 | Iconos |
| **Jest** | 30.2.0 | Testing |
| **ESLint** | 9.x | Linting |
| **Resend** | 6.5.2 | Servicio de emails |

---

##  Licencia

Este proyecto está bajo licencia MIT.

---

##  Autor

**Axioma Institut**

Proyecto de gestión educativa para instituciones académicas.

---


##  Checklist de Despliegue

Antes de desplegar a producción, verifica:

- [ ] Variables de `.env.local` correctamente configuradas
- [ ] Base de datos Supabase creada y con tablas inicializadas
- [ ] Primer usuario administrador creado
- [ ] Tests pasando: `npm run test`
- [ ] Sin errores de linting: `npm run lint`
- [ ] Build compila sin errores: `npm run build`
- [ ] Certificado SSL configurado (HTTPS)
- [ ] Backups de BD configurados
- [ ] Monitoreo de errores en producción
- [ ] Variables de entorno en producción son diferentes a desarrollo

---

**¡Listo para desplegar tu aplicación! **
