const dotenv = require("dotenv").config().parsed;
const { verifyToken } = require("./token");

//Middelware d'authentification
module.exports = (req, res, next) => {
  try {
    // Récupération du token envoyé par le front-end
    const token = req.headers.authorization;

    // Verification du token
    const payload = verifyToken(token, dotenv.SECRET_KEY);
    if (payload === null) {
      console.log("token expiré ou token invalide");
      return res.status(403).json({ message: "Token invalide" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
