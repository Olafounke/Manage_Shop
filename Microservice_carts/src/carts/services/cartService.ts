import { Cart, ICart } from "../models/Cart";
import mongoose from "mongoose";

export class CartService {
  static async getUserCart(userId: string): Promise<ICart | null> {
    return await Cart.findOne({ owner: userId });
  }

  static async addToCart(
    userId: string,
    productId: string,
    productName: string,
    quantity: number,
    price: number
  ): Promise<ICart> {
    try {
      let cart = await Cart.findOne({ owner: userId });

      if (!cart) {
        cart = new Cart({
          owner: new mongoose.Types.ObjectId(userId),
          items: [
            {
              product: new mongoose.Types.ObjectId(productId),
              productName,
              quantity,
              price,
            },
          ],
        });
      } else {
        const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({
            product: new mongoose.Types.ObjectId(productId),
            productName,
            quantity,
            price,
          });
        }
      }

      return await cart.save();
    } catch (error) {
      throw new Error("Erreur lors de l'ajout au panier");
    }
  }

  static async updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    const cart = await Cart.findOne({ owner: userId });

    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex === -1) {
      throw new Error("Produit non trouvé dans le panier");
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    return await cart.save();
  }

  static async removeFromCart(userId: string, productId: string): Promise<ICart> {
    const cart = await Cart.findOne({ owner: userId });

    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    return await cart.save();
  }

  static async clearCart(userId: string): Promise<ICart> {
    const cart = await Cart.findOne({ owner: userId });

    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    cart.items = [];
    return await cart.save();
  }
}
