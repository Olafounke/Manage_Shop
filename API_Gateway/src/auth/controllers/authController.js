const authService = require("../services/authService");
const User = require("../models/userModel");

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const user = await authService.register({ email, password, firstName, lastName, role }, req);

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        ...user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const authResult = await authService.login(email, password, req);

      res.json(authResult);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const user = await authService.getCurrentUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.status(200).json({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllUsers(req, res) {
    User.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  }

  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const userData = req.body;

      await authService.updateUser(userId, userData);

      res.status(200).json({
        message: "Utilisateur mis à jour avec succès",
      });
    } catch (error) {
      res.status(error.message.includes("non trouvé") ? 404 : 500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      await authService.deleteUser(userId);

      res.status(200).json({
        message: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      res.status(error.message.includes("non trouvé") ? 404 : 500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
