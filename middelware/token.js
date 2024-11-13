const crypto = require("crypto");

function generateDeviceFingerprint(req) {
  const userAgent = req.headers["user-agent"] || " ";
  const ip = req.ip || " ";
  const timezone = req.headers["timezone"] || " ";
  const fingerprintData = `${userAgent}-${ip}-${timezone}`;
  return crypto.createHash("sha256").update(fingerprintData).digest("hex");
}

function createToken(userId, secret, req) {
  // Défini le payload avec userId et l'expiration dans 24 heures
  const payload = {
    userId: userId,
    role: "user",
    issuedAt: Date.now(),
    scope: ["read", "write"],
    issuer: "authServer",
    deviceFingerprint: generateDeviceFingerprint(req),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };
  console.log(payload);
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64"
  );

  // Génére la signature avec HMAC-SHA256
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64");
  const encodedSignature = Buffer.from(signature).toString("base64");

  // Assemble le token complet
  return `${encodedPayload}.${encodedSignature}`;
}

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

async function mineToken(prefix, hash) {
  let nonce = 0;
  console.log("hash :", hash);

  // Boucle qui permet de definir le nonce et le nouveau hash
  while (!hash.startsWith(prefix)) {
    const data = `${hash}.${nonce}`;
    hash = crypto.createHash("sha256").update(data).digest("hex");
    nonce++;
  }
  return { nonce, hash };
}

module.exports = { createToken, verifyToken, mineToken };
