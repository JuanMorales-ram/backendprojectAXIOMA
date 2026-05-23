import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error al obtener usuario en middleware:', error);
    }

    const isMainRoute = request.nextUrl.pathname.startsWith('/main');
    const isLoginRoute = request.nextUrl.pathname === '/';

    // Proteger rutas /main - requiere autenticación
    if (isMainRoute && !user) {
      const redirectUrl = new URL('/', request.url);
      console.warn(`Intento de acceso sin autenticación: ${request.nextUrl.pathname}`);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirigir usuarios autenticados desde login al dashboard
    if (isLoginRoute && user) {
      const redirectUrl = new URL('/main/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Las rutas de enrollment son públicas (no requieren autenticación)
    
    return response;
  } catch (error) {
    console.error('Error inesperado en middleware:', error);
    // En caso de error, permitir que la solicitud continúe
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - tienen su propia protección)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};