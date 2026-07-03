// Augments Express's Request type with the authenticated user's id,
// populated by the auth middleware after verifying the JWT.
export interface AuthUser {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
