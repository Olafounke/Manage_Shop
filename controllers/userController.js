const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");

let userModel;

exports.init = (collection) => {
  userModel = new UserModel(collection);
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAll();
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des users" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userModel.getById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération du user" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = {
      name: req.body.name,
    };
    const createdUser = await userModel.create(newUser);
    res.status(201).json(createdUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'utilisateur" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedFields = {
      name: req.body.name,
    };
    const success = await userModel.updateById(id, updatedFields);
    if (!success) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    } else {
      res.json({ message: "Utilisateur mis à jour" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const success = await userModel.deleteById(id);
    if (!success) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    } else {
      res.status(200).json({ message: "Utilisateur supprimé" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};
