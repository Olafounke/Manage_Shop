import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    store: string;
  };
}

export const extractUserFromHeader = (req: AuthRequest, res: Response, next: NextFunction): void => {
  console.log("[UserExtractor-MS] Début de l'extraction user");
  console.log("[UserExtractor-MS] Headers reçus:", req.headers);

  const userInfoHeader = req.headers["x-user-info"];
  console.log("[UserExtractor-MS] Header x-user-info:", userInfoHeader);

  if (userInfoHeader) {
    try {
      const userInfo = JSON.parse(userInfoHeader as string);
      console.log("[UserExtractor-MS] User info parsé:", userInfo);
      req.user = userInfo;
      console.log("[UserExtractor-MS] User info assigné à req.user:", req.user);
    } catch (error) {
      console.error("[UserExtractor-MS] Erreur parsing user info:", error);
    }
  } else {
    console.log("[UserExtractor-MS] Aucun header x-user-info trouvé");
  }

  next();
};
