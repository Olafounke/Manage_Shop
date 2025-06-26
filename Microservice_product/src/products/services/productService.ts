import Product, { IProduct } from "../models/Product";
import { CategoryService } from "./categoryService";
import mongoose from "mongoose";

export class ProductService {
  static async getAllProducts(queryParams: any) {
    const { query } = await this.buildQuery(queryParams);
    const { skip, page, limit } = this.getPaginationParams(queryParams);

    const products = await Product.find(query)
      .populate("categories", "name slug")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getMyProducts(userId: string) {
    if (!userId) {
      throw new Error("Utilisateur non authentifié.");
    }

    const query = { owner: new mongoose.Types.ObjectId(userId) };

    const products = await Product.find(query).populate("categories", "name slug").sort({ createdAt: -1 });

    return products;
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id).populate("categories", "name slug");
    if (!product) {
      throw new Error("Produit non trouvé.");
    }
    return product;
  }

  static async createProduct(productData: any, userId: string) {
    const { name, price, description, images, categories, customFields } = productData;

    if (!userId) {
      throw new Error("Utilisateur non authentifié.");
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Le nom du produit est requis.");
    }

    if (typeof price !== "number" || price < 0) {
      throw new Error("Le prix doit être un nombre positif.");
    }

    const product = new Product({
      name,
      price,
      description,
      images,
      categories,
      customFields,
      owner: new mongoose.Types.ObjectId(userId),
    });

    return await product.save();
  }

  static async updateProduct(id: string, productData: any, userId: string, userRole?: string) {
    if (!userId) {
      throw new Error("Utilisateur non authentifié.");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Produit non trouvé.");
    }

    if (userRole !== "SUPER_ADMIN" && product.owner.toString() !== userId) {
      throw new Error("Non autorisé à modifier ce produit.");
    }

    delete productData.owner;
    Object.assign(product, productData);
    return await product.save();
  }

  static async deleteProduct(id: string, userId: string, userRole?: string) {
    if (!userId) {
      throw new Error("Utilisateur non authentifié.");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Produit non trouvé.");
    }

    if (userRole !== "SUPER_ADMIN" && product.owner.toString() !== userId) {
      throw new Error("Non autorisé à supprimer ce produit.");
    }

    await product.deleteOne();
    return { message: "Produit supprimé." };
  }

  private static async buildQuery(queryParams: any) {
    const { search, category, minPrice, maxPrice } = queryParams;
    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      const categoryDoc = await CategoryService.getCategoryBySlug(category);
      if (categoryDoc) {
        query.categories = categoryDoc._id;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    return { query };
  }

  private static getPaginationParams(queryParams: any) {
    const { page = 1, limit = 12 } = queryParams;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    return {
      skip,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };
  }
}
