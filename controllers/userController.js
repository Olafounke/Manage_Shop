const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

async function mineToken(prefix) {
  let nonce = 0;
  let hash = "";

  while (!hash.startsWith(prefix)) {
    const data = `token:${nonce}`;
    hash = crypto.createHash("sha256").update(data).digest("hex");
    nonce++;
  }

  return { nonce, hash };
}

exports.createUser = (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        name: req.body.name,
        password: hash,
      });

      const result = mineToken("0000", hash).then((result) => {
        console.log("Nonce:", result.nonce, "Hash:", result.hash);
      });

      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
