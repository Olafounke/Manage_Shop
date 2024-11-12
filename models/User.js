const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//Modèle "User"
const userSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//Utilisation de uniqueValidator en plus du "unique:true" pour empecher la création de plusieurs même adresse mail

module.exports = mongoose.model("User", userSchema);
