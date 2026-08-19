import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(request, response, next) {
  try {
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return response.status(401).json({ message: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return response.status(401).json({ message: 'User account not found' });

    request.user = user;
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired authentication token' });
  }
}

export async function optionalAuth(request, _response, next) {
  try {
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (token && process.env.JWT_SECRET) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      request.user = await User.findById(payload.sub);
    }
  } catch {
    // Anonymous assistant requests are valid; an invalid token is ignored here.
  }
  next();
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission for this action' });
    }
    next();
  };
}
