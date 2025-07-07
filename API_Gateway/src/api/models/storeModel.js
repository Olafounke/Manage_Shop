const mongoose = require("mongoose");
const { storeConnection } = require("../../config/connections");

const storeSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
      unique: true,
      maxLength: 8,
    },
    storeName: {
      type: String,
      required: true,
      unique: true,
    },
    storeNameSlug: {
      type: String,
      required: true,
      unique: true,
    },
    storeAddress: {
      type: String,
      required: true,
    },
    latitude: {
      type: mongoose.Schema.Types.Decimal128,
      required: false,
      default: null,
    },
    longitude: {
      type: mongoose.Schema.Types.Decimal128,
      required: false,
      default: null,
    },
    userId: {
      type: String,
      required: false,
    },
    port: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "deployed", "failed", "deleting"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "stores_config",
  }
);

storeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = storeConnection.model("Store", storeSchema);
