import mongoose, { Schema, Document } from "mongoose";

export interface IOrderGroup extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userAddress: {
    fullAddress: string;
    longitude: number;
    latitude: number;
  };
  totalAmount: number;
  status: "PENDING" | "VALIDATED" | "PARTIALLY_SHIPPED" | "COMPLETED" | "CANCELLED";
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const orderGroupSchema = new Schema<IOrderGroup>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userAddress: {
      fullAddress: { type: String, required: true },
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "VALIDATED", "PARTIALLY_SHIPPED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

export const OrderGroup = mongoose.model<IOrderGroup>("OrderGroup", orderGroupSchema);
