const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { BCRYPT_ROUNDS } = require("../../config/environment");
const { userConnection } = require("../../config/connections");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN_STORE", "SUPER_ADMIN"],
      default: "USER",
    },
    store: {
      type: String,
      maxLength: 8,
      required: function () {
        return this.role === "ADMIN_STORE";
      },
      validate: {
        validator: function (storeId) {
          if (this.role !== "ADMIN_STORE") {
            return storeId == null;
          }
          return storeId && typeof storeId === "string" && storeId.length === 8;
        },
        message: "Le storeId doit être une chaîne de 8 caractères pour un ADMIN_STORE, ou null pour les autres rôles",
      },
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = userConnection.model("User", userSchema);

module.exports = User;
