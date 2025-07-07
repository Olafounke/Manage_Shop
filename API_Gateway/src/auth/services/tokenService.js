const crypto = require("crypto");
const { TOKEN_SECRET, TOKEN_EXPIRATION, PROOF_OF_WORK_DIFFICULTY } = require("../../config/environment");

class TokenService {
  async generateToken(userId, role, store, req) {
    const payload = {
      userId: userId,
      role: role,
      store: store,
      nonce: null,
      proofOfWork: null,
      deviceFingerprint: this.generateDeviceFingerprint(req),
      issuedAt: Date.now(),
      expiresIn: Date.now() + TOKEN_EXPIRATION,
    };

    // Génération du Proof of Work
    const { nonce, proofOfWork } = await this.mineProofOfWork(payload);
    payload.nonce = nonce;
    payload.proofOfWork = proofOfWork;

    // Encodage du payload
    const encodedPayload = this.encodePayload(payload);

    // Génération de la signature
    const signature = this.signToken(encodedPayload);

    const token = `${encodedPayload}.${signature}`;
    return token;
  }

  generateDeviceFingerprint(req) {
    const userAgent = req.headers["user-agent"] || " ";
    const ip = req.ip || " ";
    const timezone = req.headers["timezone"] || " ";
    const fingerprintData = `${userAgent}-${ip}-${timezone}`;
    return crypto.createHash("sha256").update(fingerprintData).digest("hex");
  }

  async mineProofOfWork(data, difficulty = PROOF_OF_WORK_DIFFICULTY) {
    const dataWithoutPoW = `${data.userId}|${data.role}|${data.deviceFingerprint}|${data.issuedAt}|${data.expiresIn}|`;
    let nonce = 0;
    let hash;

    while (true) {
      hash = crypto
        .createHash("sha256")
        .update(dataWithoutPoW + nonce)
        .digest("hex");

      if (hash.startsWith("0".repeat(difficulty))) {
        break;
      }
      nonce++;
    }

    return { nonce, proofOfWork: hash };
  }

  encodePayload(payload) {
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  signToken(encodedPayload) {
    return crypto.createHmac("sha256", TOKEN_SECRET).update(encodedPayload).digest("hex");
  }

  verifyToken(token) {
    try {
      if (!token.includes(".")) {
        throw new Error("Token invalide");
      }

      // Vérification de la signature
      const [encodedPayload, signature] = token.split(".");
      if (!this.verifySignature(encodedPayload, signature)) {
        throw new Error("Signature invalide");
      }
      // Décodage du payload
      const payload = this.decodePayload(encodedPayload);

      // Vérification de l'expiration
      if (Date.now() > payload.expiresIn) {
        throw new Error("Token expiré");
      }

      return payload;
    } catch (error) {
      throw new Error(`Erreur de vérification du token: ${error.message}`);
    }
  }

  verifySignature(encodedPayload, signature) {
    const expectedSignature = this.signToken(encodedPayload);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  decodePayload(encodedPayload) {
    return JSON.parse(Buffer.from(encodedPayload, "base64").toString());
  }
}

module.exports = new TokenService();
