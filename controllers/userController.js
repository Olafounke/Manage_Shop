const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const dotenv = require("dotenv").config().parsed;
const { createToken, mineToken } = require("../middelware/token");

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
