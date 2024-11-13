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

      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  //Recherche de l'email en BDD
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

          const result = mineToken("0000").then((result) => {
            console.log("Nonce:", result.nonce, "Hash:", result.hash);
            //Renvoi du response avec le token
            res.status(200).json({
              token: result.hash,
            });
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
