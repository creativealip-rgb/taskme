import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}
