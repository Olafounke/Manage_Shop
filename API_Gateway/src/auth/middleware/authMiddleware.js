const tokenService = require("../services/tokenService");
const authService = require("../services/authService");

class AuthMiddleware {
  async authenticate(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Aucun token fourni" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token manquant" });

    const payload = tokenService.verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Token invalide" });

    req.user = payload;
    const user = await authService.getCurrentUser(payload.userId);
    if (user.store) {
      req.user.store = user.store;
    }
    next();
  }

  checkRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Accès non autorisé" });
      }

      next();
    };
  }

  checkSelfAccess(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const requestedUserId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole === "SUPER_ADMIN") {
      return next();
    }

    if (userId === requestedUserId) {
      return next();
    }

    return res.status(403).json({ error: "Vous n'avez pas la permission de modifier cet utilisateur" });
  }
}

module.exports = new AuthMiddleware();
