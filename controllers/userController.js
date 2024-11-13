const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const dotenv = require("dotenv").config().parsed;

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

exports.createUser = (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        name: req.body.name,
        password: hash,
      });

      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  //Recherche du nom en BDD
  User.findOne({ name: req.body.name })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      //Comparaison du mot de passe avec celui en BDD
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }

          // Création du token
          const token = createToken(
            user._id.toString(),
            dotenv.SECRET_KEY,
            req
          );

          // Minage du token
          const result = mineToken("000", token).then((result) => {
            console.log("Nonce:", result.nonce, "Hash:", result.hash);
            // Hashage du token miner
            const finalToken = crypto
              .createHmac("sha256", dotenv.SECRET_KEY)
              .update(result.hash)
              .digest("base64");
            console.log(finalToken);

            //Renvoi du response avec le token
            res.status(200).json({
              token: finalToken,
            });
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
