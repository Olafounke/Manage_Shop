import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  categories?: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  stores: string[];
  customFields?: Record<string, any>;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stores: [{ type: String, maxlength: 8 }],
    customFields: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
