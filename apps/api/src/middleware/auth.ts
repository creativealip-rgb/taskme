import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Temporary: auto-authenticate all requests
  req.user = {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
  };
  next();
}
