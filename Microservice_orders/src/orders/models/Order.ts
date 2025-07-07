import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderGroup: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  storeId: string;
  items: IOrderItem[];
  subtotal: number;
  status: "PENDING" | "VALIDATED" | "PREPARED" | "SHIPPED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const orderSchema = new Schema<IOrder>(
  {
    orderGroup: { type: Schema.Types.ObjectId, ref: "OrderGroup", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    storeId: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "VALIDATED", "PREPARED", "SHIPPED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.totalPrice = item.quantity * item.unitPrice;
  });
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  next();
});

export const Order = mongoose.model<IOrder>("Order", orderSchema);
