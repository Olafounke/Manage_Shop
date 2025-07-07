import mongoose, { Schema, Document } from "mongoose";

export interface ITransfert extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  transfertDate: Date;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transfertSchema = new Schema<ITransfert>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    fromStoreId: { type: String, required: true },
    fromStoreName: { type: String, required: true },
    toStoreId: { type: String, required: true },
    toStoreName: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    transfertDate: { type: Date, default: Date.now },
    responseDate: { type: Date },
  },
  { timestamps: true }
);

transfertSchema.index({ fromStoreId: 1, status: 1 });
transfertSchema.index({ toStoreId: 1, status: 1 });
transfertSchema.index({ productId: 1 });
transfertSchema.index({ transfertDate: -1 });
transfertSchema.index({ status: 1, transfertDate: -1 });

export const Transfert = mongoose.model<ITransfert>("Transfert", transfertSchema);
