const dotenv = require("dotenv").config().parsed;
const crypto = require("crypto");

function verifyToken(token, secret) {
  // Séparation du token
  const [encodedPayload, encodedSignature] = token.split(".");

  // Recalcule de la signature
  const signatureCheck = Buffer.from(
    crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64")
  ).toString("base64");

  // Verification de la signature
  if (signatureCheck !== encodedSignature) {
    console.log("Signature invalide !");
    return null;
  }

  // Vérifie si le token est expiré
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64").toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    console.log("Le token a expiré. L'utilisateur doit se reconnecter.");
    return null;
  }

  // Validation du token avec renvoi du payload
  console.log("Token valide. ID utilisateur :", payload.userId);
  return payload;
}

//Middelware d'authentification
module.exports = (req, res, next) => {
  try {
    // Récupération du token envoyé par le front-end
    const token = req.headers.authorization;

    // Verification du token
    const payload = verifyToken(token, dotenv.SECRET_KEY);
    console.log("auth :", payload);

    if (payload === null) {
      console.log("token expiré ou token invalide");
      return res.status(403).json({ message: "Token invalide" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
