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

    // Convertir les objets catégories en noms de catégories
    const productsWithCategoryNames = products.map((product) => {
      const productObj = product.toObject();
      if (productObj.categories && Array.isArray(productObj.categories)) {
        productObj.categories = productObj.categories.map((cat: any) => cat.name);
      }
      return productObj;
    });

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      products: productsWithCategoryNames,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getMyProducts(userId: string) {
    console.log("[ProductService-MS] Début de getMyProducts");
    console.log("[ProductService-MS] User ID reçu:", userId);

    if (!userId) {
      console.error("[ProductService-MS] Utilisateur non authentifié");
      throw new Error("Utilisateur non authentifié.");
    }

    const query = { owner: new mongoose.Types.ObjectId(userId) };
    console.log("[ProductService-MS] Query MongoDB:", query);

    const products = await Product.find(query).populate("categories", "name slug").sort({ createdAt: -1 });
    console.log("[ProductService-MS] Produits trouvés:", products);
    console.log("[ProductService-MS] Nombre de produits:", products.length);

    // Convertir les objets catégories en noms de catégories
    const productsWithCategoryNames = products.map((product) => {
      const productObj = product.toObject();
      if (productObj.categories && Array.isArray(productObj.categories)) {
        productObj.categories = productObj.categories.map((cat: any) => cat.name);
      }
      return productObj;
    });

    return productsWithCategoryNames;
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id).populate("categories", "name slug");
    if (!product) {
      throw new Error("Produit non trouvé.");
    }

    // Convertir les objets catégories en noms de catégories
    const productObj = product.toObject();
    if (productObj.categories && Array.isArray(productObj.categories)) {
      productObj.categories = productObj.categories.map((cat: any) => cat.name);
    }
    return productObj;
  }

  static async createProduct(productData: any, userId: string) {
    const { name, price, description, images, categories, customFields, storeId, initialQuantity = 0 } = productData;

    if (!userId) {
      throw new Error("Utilisateur non authentifié.");
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Le nom du produit est requis.");
    }

    if (typeof price !== "number" || price < 0) {
      throw new Error("Le prix doit être un nombre positif.");
    }

    // Convertir les noms de catégories en ObjectId
    let categoryObjectIds: mongoose.Types.ObjectId[] = [];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      try {
        // Récupérer toutes les catégories actives
        const allCategories = await CategoryService.getAllCategories();

        // Créer un map pour une recherche rapide
        const categoryMap = new Map(allCategories.map((cat) => [cat.name, cat._id]));

        // Convertir les noms en ObjectId
        categoryObjectIds = categories
          .map((categoryName) => {
            const categoryId = categoryMap.get(categoryName);
            if (!categoryId) {
              console.warn(`Catégorie non trouvée: ${categoryName}`);
              return null;
            }
            return categoryId;
          })
          .filter((id) => id !== null) as mongoose.Types.ObjectId[];
      } catch (error) {
        console.error("Erreur lors de la conversion des catégories:", error);
        throw new Error("Erreur lors du traitement des catégories.");
      }
    }

    const product = new Product({
      name,
      price,
      description,
      images,
      categories: categoryObjectIds,
      customFields,
      owner: new mongoose.Types.ObjectId(userId),
      stores: storeId ? [storeId] : [],
    });

    const savedProduct = await product.save();

    return {
      product: savedProduct,
      createInventory: {
        productId: (savedProduct._id as mongoose.Types.ObjectId).toString(),
        productName: savedProduct.name,
        quantity: initialQuantity,
        storeId: storeId,
      },
    };
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
    delete productData.stores;
    delete productData.totalInventory;
    delete productData.inStock;

    // Traiter les catégories si elles sont présentes
    if (productData.categories && Array.isArray(productData.categories)) {
      try {
        // Récupérer toutes les catégories actives
        const allCategories = await CategoryService.getAllCategories();

        // Créer un map pour une recherche rapide
        const categoryMap = new Map(allCategories.map((cat) => [cat.name, cat._id]));

        // Convertir les noms en ObjectId
        const categoryObjectIds = productData.categories
          .map((categoryName: string) => {
            const categoryId = categoryMap.get(categoryName);
            if (!categoryId) {
              console.warn(`Catégorie non trouvée: ${categoryName}`);
              return null;
            }
            return categoryId;
          })
          .filter((id: mongoose.Types.ObjectId | null) => id !== null) as mongoose.Types.ObjectId[];

        productData.categories = categoryObjectIds;
      } catch (error) {
        console.error("Erreur lors de la conversion des catégories:", error);
        throw new Error("Erreur lors du traitement des catégories.");
      }
    }

    Object.assign(product, productData);
    return await product.save();
  }

  static async deleteProduct(id: string, userId: string, userRole?: string, storeId?: string) {
    if (!userId) {
      throw new Error("Utilisateur non authentifié.");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Produit non trouvé.");
    }

    // Si l'utilisateur est un super admin, on supprime le produit
    if (userRole === "SUPER_ADMIN") {
      await product.deleteOne();
      return {
        action: "delete_complete",
        message: "Produit supprimé complètement.",
        storeToClean: product.stores,
      };
    }

    // Si l'utilisateur n'est pas propriétaire du produit
    if (userRole !== "SUPER_ADMIN" && product.owner.toString() !== userId) {
      if (storeId && product.stores.includes(storeId)) {
        const result = await this.removeStoreFromProduct(id, storeId);
        if (result.deleted) {
          return {
            action: "delete_complete",
            message: "Produit supprimé car plus aucun store ni owner.",
          };
        } else {
          return {
            action: "remove_store",
            message: "Produit retiré de votre inventaire.",
            storeToClean: storeId,
          };
        }
      }
      throw new Error("Non autorisé à supprimer ce produit.");
    }

    const storeCount = product.stores.length;

    // Si l'utilisateur est propriétaire du produit
    if (storeCount === 1) {
      await product.deleteOne();
      return {
        action: "delete_complete",
        message: "Produit supprimé complètement.",
        storeToClean: product.stores[0],
      };
    } else if (storeCount > 1) {
      const updatedStores = product.stores.filter((store) => store !== storeId);

      const updateData: any = { stores: updatedStores };

      if (product.owner.toString() === userId) {
        updateData.$unset = { owner: "" };
      }

      await Product.findByIdAndUpdate(id, updateData);

      return {
        action: "remove_store",
        message: "Produit retiré de votre inventaire.",
        storeToClean: storeId,
      };
    } else {
      await product.deleteOne();
      return {
        action: "delete_complete",
        message: "Produit supprimé (aucun store actif).",
      };
    }
  }

  static async addStoreToProduct(productId: string, storeId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Produit non trouvé.");
    }

    if (!product.stores.includes(storeId)) {
      product.stores.push(storeId);
      await product.save();
    }

    return product;
  }

  static async removeStoreFromProduct(productId: string, storeId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Produit non trouvé.");
    }

    product.stores = product.stores.filter((store) => store !== storeId);

    if (product.stores.length === 0 && !product.owner) {
      await product.deleteOne();
      return { deleted: true };
    }

    await product.save();
    return { deleted: false, product };
  }

  static async removeStoreFromAllProducts(storeId: string) {
    try {
      const updateResult = await Product.updateMany({ stores: storeId }, { $pull: { stores: storeId } });

      const deleteResult = await Product.deleteMany({
        stores: { $size: 0 },
        owner: { $exists: false },
      });

      return {
        modifiedCount: updateResult.modifiedCount,
        deletedCount: deleteResult.deletedCount,
      };
    } catch (error) {
      console.error("Erreur lors de la suppression du store des produits:", error);
      throw error;
    }
  }

  private static async buildQuery(queryParams: any) {
    const { search, category, minPrice, maxPrice } = queryParams;
    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      // Chercher la catégorie par nom au lieu du slug
      const categoryDoc = await CategoryService.getCategoryByName(category);
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
