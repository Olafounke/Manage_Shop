const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const tokenService = require("./tokenService");
const { BCRYPT_ROUNDS } = require("../../config/environment");

class AuthService {
  async register(userData, req) {
    try {
      const user = new User({
        ...userData,
        password: await bcrypt.hash(userData.password, BCRYPT_ROUNDS),
      });
      await user.save();

      return {
        message: "Utilisateur créé avec succès",
        userId: user._id,
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }

  async login(email, password, req) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const token = await tokenService.generateToken(user._id, user.role, user.store, req);

      await user.save();

      return {
        token: token,
      };
    } catch (error) {
      throw new Error(`Erreur d'authentification: ${error.message}`);
    }
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).select("email firstName lastName _id role store");
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user;
  }

  async getAllUsers() {
    try {
      const users = await User.find({}).select("email firstName lastName _id role store createdAt updatedAt");
      return users;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
  }

  async updateUser(userId, userData) {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
      }

      const updatedUser = await User.findByIdAndUpdate(userId, { ...userData }, { new: true });
      if (!updatedUser) {
        throw new Error("Utilisateur non trouvé");
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  async updateRoleOnly(userId, userData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, { ...userData }, { new: true });
      if (!updatedUser) {
        throw new Error("Utilisateur non trouvé");
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        throw new Error("Utilisateur non trouvé");
      }

      return deletedUser;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
