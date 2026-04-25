import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';

export interface AuthPayload {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'recruiter';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null;
  if (!header?.startsWith('Bearer ') && !queryToken) {
    return next(new AppError('No token provided', 401));
  }

  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : queryToken;
  if (!process.env.JWT_SECRET) {
    return next(new AppError('JWT_SECRET is not configured', 500));
  }
  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as unknown as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
