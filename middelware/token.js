const crypto = require("crypto");

async function createToken(userId, secret, req) {
  const payload = {
    userId: userId,
    role: "user",
    issuedAt: Date.now(),
    expiresIn: Date.now() + 24 * 60 * 60 * 1000,
    nonce: 0,
    proofOfWork: "",
    scope: ["read", "write"],
    issuer: "authServer",
    deviceFingerprint: generateDeviceFingerprint(req),
  };

  // Encodage initial du payload
  const preEncodedPayload = encodeToBase64(payload);

  // Minage du nonce et mise à jour dans le payload
  const { nonce, hash } = await mineNonce(preEncodedPayload);
  payload.nonce = nonce;
  payload.proofOfWork = hash;

  // Encodage du payload
  const encodedPayload = encodeToBase64(payload);

  // Génération de la signature
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64");

  // Encodage de la signature
  const encodedSignature = Buffer.from(signature).toString("base64");

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

  // Decodage du payload
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64").toString());

  // Vérifie si le token est expiré
  if (payload.expiresIn < Date.now()) {
    console.log("Le token a expiré. L'utilisateur doit se reconnecter.");
    return null;
  }

  // Vérifie si la proofOfWork est correct
  const { proofOfWork, proofOfWorkCheck } = verifyNonce(payload);
  if (proofOfWork !== proofOfWorkCheck) {
    console.log("Le token est invalide");
    return null;
  }

  // Validation du token avec renvoi du payload
  console.log("Token valide. ID utilisateur :", payload.userId);
  return payload;
}

function generateDeviceFingerprint(req) {
  const userAgent = req.headers["user-agent"] || " ";
  const ip = req.ip || " ";
  const timezone = req.headers["timezone"] || " ";
  const fingerprintData = `${userAgent}-${ip}-${timezone}`;
  return crypto.createHash("sha256").update(fingerprintData).digest("hex");
}

function encodeToBase64(params) {
  return Buffer.from(JSON.stringify(params)).toString("base64");
}

async function mineNonce(hash) {
  let nonce = 0;
  const prefix = "000";

  // Boucle qui permet de definir le nonce et le nouveau hash
  while (!hash.startsWith(prefix)) {
    const data = `${hash}.${nonce}`;
    hash = crypto.createHash("sha256").update(data).digest("hex");
    nonce++;
  }

  return { nonce, hash };
}

function verifyNonce(payload) {
  const nonce = payload.nonce;
  const proofOfWork = payload.proofOfWork;

  // Pre-encodage du payload pour retrouver la proofOfWork
  payload.nonce = 0;
  payload.proofOfWork = "";
  const preEncodedPayload = encodeToBase64(payload);

  // Boucle avec le nonce qui permet de verifier la proofOfWork
  let proofOfWorkCheck = preEncodedPayload;
  for (let currentNonce = 0; currentNonce < nonce; currentNonce++) {
    const data = `${proofOfWorkCheck}.${currentNonce}`;
    proofOfWorkCheck = crypto.createHash("sha256").update(data).digest("hex");
  }

  return { proofOfWork, proofOfWorkCheck };
}

module.exports = { createToken, verifyToken };
