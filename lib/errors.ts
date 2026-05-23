/**
 * Custom error classes for authorization
 */

export class AuthenticationError extends Error {
  constructor(message: string = 'No autenticado. Por favor inicia sesión.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Acceso denegado. Se requieren permisos de administrador.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Type guard to check if an error is an authentication/authorization error
 */
export function isAuthError(error: unknown): error is AuthenticationError | AuthorizationError {
  return error instanceof AuthenticationError || error instanceof AuthorizationError;
}

/**
 * Get the appropriate HTTP status code for an error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAuthError(error)) {
    return 401;
  }
  return 500;
}
