import Category, { ICategory } from "../models/Category";

export class CategoryService {
  static async getAllCategories(): Promise<ICategory[]> {
    return await Category.find({ isActive: true }).sort({ name: 1 });
  }

  static async getCategoryNames(): Promise<string[]> {
    const categories = await Category.find({ isActive: true }).select("name");
    return categories.map((cat) => cat.name);
  }

  static async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug, isActive: true });
  }

  static async getCategoryByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({ name, isActive: true });
  }

  static async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    if (!categoryData.name) {
      throw new Error("Le nom de la catégorie est requis.");
    }

    const existingCategory = await Category.findOne({ name: categoryData.name, isActive: true });
    if (existingCategory) {
      throw new Error("Une catégorie avec ce nom existe déjà.");
    }

    const category = new Category(categoryData);
    return await category.save();
  }

  static async updateCategory(id: string, categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Catégorie non trouvée.");
    }

    if (categoryData.name && categoryData.name !== category.name) {
      const existingCategory = await Category.findOne({ name: categoryData.name, isActive: true });
      if (existingCategory) {
        throw new Error("Une catégorie avec ce nom existe déjà.");
      }
    }

    Object.assign(category, categoryData);
    return await category.save();
  }

  static async deleteCategory(id: string): Promise<{ message: string }> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Catégorie non trouvée.");
    }

    await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return { message: "Catégorie supprimée avec succès." };
  }
}
