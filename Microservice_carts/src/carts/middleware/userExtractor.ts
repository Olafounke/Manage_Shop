import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const extractUserFromHeader = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const userInfoHeader = req.headers["x-user-info"];

  if (userInfoHeader) {
    try {
      const userInfo = JSON.parse(userInfoHeader as string);
      req.user = userInfo;
    } catch (error) {
      console.error("Erreur parsing user info:", error);
    }
  }

  next();
};
