import { Request, Response, NextFunction } from "express";
import { authService, JWTPayload } from "../services/AuthService";
import { UserRole } from "../models/User";

// Extend Express Request so downstream routes get req.user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// verifyToken 
// Attaches decoded JWT payload to req.user. Rejects if no/invalid token.
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
}

// requireRole
// Use after verifyToken. Pass one or more allowed roles.
// Example: router.patch("/status", verifyToken, requireRole("admin"), handler)
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
      return;
    }

    next();
  };
}