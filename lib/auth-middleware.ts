import { NextRequest } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  user?: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
}

/**
 * Simple authentication middleware for API routes
 * This can be enhanced with proper JWT verification, Firebase Auth, etc.
 */
export async function authenticateRequest(req: NextRequest): Promise<{
  authenticated: boolean;
  userId?: string;
  error?: string
}> {
  try {
    // For now, we'll check for a simple API key or session
    // In production, this should validate JWT tokens or Firebase Auth tokens
    const authHeader = req.headers.get('authorization');
    const sessionCookie = req.cookies.get('session');

    if (!authHeader && !sessionCookie) {
      return { authenticated: false, error: 'No authentication provided' };
    }

    // TODO: Implement proper authentication logic
    // For now, we'll allow all requests to pass through
    // This should be replaced with actual authentication validation

    return {
      authenticated: true,
      userId: 'placeholder-user-id' // This should come from token validation
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

/**
 * Wrapper function to protect API routes
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    const authResult = await authenticateRequest(req);

    if (!authResult.authenticated) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Add user info to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.userId = authResult.userId;

    return handler(authenticatedReq);
  };
}
