import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('token')?.value;

  // Liste des chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = [
    '/', 
    '/register', 
    '/login', 
    '/forgot-password',
    '/whats-new',
    '/docs',
    '/legal/terms',
    '/legal/privacy'
  ];
  
  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path);

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
  if (!token && !isPublicPath) {
    // Rediriger vers la page de connexion au lieu de la page d'accueil
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 