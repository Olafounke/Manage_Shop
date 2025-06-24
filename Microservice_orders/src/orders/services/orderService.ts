import { Order, IOrder } from "../models/Order";
import Stripe from "stripe";
import { environment } from "../../config/environment";

export class OrderService {
  static async getUserOrders(userId: string): Promise<IOrder[]> {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async getOrderById(orderId: string, userId: string, userRole: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error("Commande non trouvée");
    }

    if (order.user.toString() === userId || userRole === "ADMIN_STORE" || userRole === "SUPER_ADMIN") {
      return order;
    }

    throw new Error("Accès refusé : vous n'avez pas les permissions pour voir cette commande");
  }

  static async getOrdersForStoreAdmin(storeIds: string[]): Promise<IOrder[]> {
    return await Order.find({
      "items.store": { $in: storeIds },
    }).sort({ createdAt: -1 });
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<IOrder> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Commande non trouvée");
    }

    const validStatuses = ["VALIDATED", "PREPARED", "SHIPPED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new Error("Statut invalide");
    }

    order.status = status as any;
    return await order.save();
  }

  static async createCheckoutSession(userId: string, cart: any): Promise<{ id: string; orderId: string }> {
    const stripe = new Stripe(environment.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-05-28.basil",
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Panier vide");
    }

    const orderItems = cart.items.map((item: any) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    const order = new Order({
      user: userId,
      items: orderItems,
      total: cart.total,
      status: "PENDING",
    });

    const savedOrder = await order.save();

    const lineItems = cart.items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:4200/user/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:4200/user/cancel",
      metadata: {
        userId,
        cartId: cart._id.toString(),
        orderId: (savedOrder._id as any).toString(),
      },
    });

    return { id: session.id, orderId: (savedOrder._id as any).toString() };
  }

  static async verifyPayment(sessionId: string): Promise<{ success: boolean; orderId?: string; message?: string }> {
    const stripe = new Stripe(environment.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-05-28.basil",
    });

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session) {
        return { success: false, message: "Session de paiement non trouvée" };
      }
      console.log(session);
      if (session.payment_status === "paid") {
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await this.updateOrderStatus(orderId, "VALIDATED");
          return { success: true, orderId };
        } else {
          return { success: false, message: "ID de commande manquant dans les métadonnées" };
        }
      } else if (session.payment_status === "unpaid") {
        return { success: false, message: "Le paiement n'a pas été effectué" };
      } else {
        return { success: false, message: "Statut de paiement inconnu" };
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification du paiement:", error);
      return { success: false, message: "Erreur lors de la vérification du paiement" };
    }
  }
}
