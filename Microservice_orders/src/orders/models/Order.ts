import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: "PENDING" | "VALIDATED" | "PREPARED" | "SHIPPED" | "CANCELLED";
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["PENDING", "VALIDATED", "SHIPPED", "CANCELLED"],
      default: "PENDING",
    },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  this.total = this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  next();
});

export const Order = mongoose.model<IOrder>("Order", orderSchema);
