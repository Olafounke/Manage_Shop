import { Order, IOrder } from "../models/Order";
import { OrderGroup, IOrderGroup } from "../models/OrderGroup";
import { OrderAllocationService } from "./orderAllocationService";
import { EnrichedCart, InventoryUpdates } from "../../type/OrderAllocation";
import Stripe from "stripe";
import { environment } from "../../config/environment";
import mongoose from "mongoose";

export class OrderService {
  static async getUserOrders(userId: string): Promise<IOrderGroup[]> {
    return await OrderGroup.find({ user: userId }).populate("orders").sort({ createdAt: -1 });
  }

  static async getOrderById(id: string): Promise<IOrder> {
    const order = await Order.findById(id).populate("orderGroup");
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  static async getOrderGroupById(id: string): Promise<IOrderGroup> {
    const orderGroup = await OrderGroup.findById(id).populate("orders");
    if (!orderGroup) {
      throw new Error("OrderGroup not found");
    }
    return orderGroup;
  }

  static async getStoreOrders(storeId: string): Promise<IOrder[]> {
    return await Order.find({ storeId: storeId }).populate("orderGroup").sort({ createdAt: -1 });
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
    const savedOrder = await order.save();

    await this.updateOrderGroupStatus(order.orderGroup);

    return savedOrder;
  }

  private static async updateOrderGroupStatus(orderGroupId: mongoose.Types.ObjectId): Promise<void> {
    const orders = await Order.find({ orderGroup: orderGroupId });
    const orderGroup = await OrderGroup.findById(orderGroupId);

    if (!orderGroup || orders.length === 0) return;

    const allStatus = orders.map((order) => order.status);

    if (allStatus.every((status) => status === "SHIPPED")) {
      orderGroup.status = "COMPLETED";
    } else if (allStatus.some((status) => status === "SHIPPED")) {
      orderGroup.status = "PARTIALLY_SHIPPED";
    } else if (allStatus.every((status) => status === "CANCELLED")) {
      orderGroup.status = "CANCELLED";
    } else if (allStatus.every((status) => status === "VALIDATED")) {
      orderGroup.status = "VALIDATED";
    }

    await orderGroup.save();
  }

  static async createCheckoutSession(
    userId: string,
    cart: EnrichedCart
  ): Promise<{ id: string; url: string; orderGroupId: string }> {
    const stripe = new Stripe(environment.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-05-28.basil",
    });

    try {
      // Créer les Orders via la fonction dédiée
      const savedOrderGroup = await this.createAllOrders(userId, cart);

      // Créer la session Stripe
      const lineItems = cart.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.productName,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:80/user/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:80/user/cancel",
        metadata: {
          userId,
          orderGroupId: savedOrderGroup._id.toString(),
        },
      });

      return {
        id: session.id,
        url: session.url || "",
        orderGroupId: savedOrderGroup._id.toString(),
      };
    } catch (error: any) {
      console.error("Erreur lors de la création du checkout:", error);
      throw error;
    }
  }

  private static async createAllOrders(userId: string, cart: EnrichedCart): Promise<IOrderGroup> {
    try {
      if (!cart || cart.items.length === 0) {
        throw new Error("Panier vide");
      }

      // Allocation des différents stores pour chaque produit
      const allocations = OrderAllocationService.allocateOrderItems(cart);
      if (allocations.length === 0) {
        throw new Error("Aucun produit ne peut être alloué - stocks insuffisants");
      }

      // Création du OrderGroup de la commande
      const totalAmount = allocations.reduce((sum, alloc) => sum + alloc.subtotal, 0);
      const orderGroup = new OrderGroup({
        user: userId,
        userAddress: {
          fullAddress: cart.userAdress.fullAddress,
          longitude: cart.userAdress.longitude,
          latitude: cart.userAdress.latitude,
        },
        totalAmount: totalAmount,
        status: "PENDING",
      });
      const savedOrderGroup = await orderGroup.save();

      // Création des Orders individuelles par store
      const orderIds: string[] = [];
      for (const allocation of allocations) {
        const order = new Order({
          orderGroup: savedOrderGroup._id,
          user: userId,
          storeId: allocation.storeId,
          items: allocation.items,
          subtotal: allocation.subtotal,
          status: "PENDING",
        });

        const savedOrder = await order.save();
        orderIds.push(savedOrder._id.toString());
      }

      // Mise à jour de l'OrderGroup avec les références aux différents Orders
      savedOrderGroup.orders = orderIds.map((id) => id as any);
      await savedOrderGroup.save();

      return savedOrderGroup;
    } catch (error: any) {
      console.error("Erreur lors de la création des commandes:", error);
      throw error;
    }
  }

  static async verifyPayment(sessionId: string): Promise<{
    success: boolean;
    orderGroupId?: string;
    message?: string;
    inventoryUpdates?: InventoryUpdates;
  }> {
    const stripe = new Stripe(environment.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-05-28.basil",
    });

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session) {
        return { success: false, message: "Session de paiement non trouvée" };
      }

      if (session.payment_status === "paid") {
        const orderGroupId = session.metadata?.orderGroupId;
        if (orderGroupId) {
          const inventoryUpdates = await this.validatePayment(orderGroupId);
          return {
            success: true,
            orderGroupId,
            inventoryUpdates,
          };
        } else {
          return { success: false, message: "ID de groupe de commande manquant" };
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

  private static async validatePayment(orderGroupId: string): Promise<InventoryUpdates> {
    const orderGroup = await OrderGroup.findById(orderGroupId).populate("orders");
    if (!orderGroup) {
      throw new Error("Groupe de commande non trouvé");
    }

    orderGroup.status = "VALIDATED";
    await orderGroup.save();

    const inventoryUpdates: InventoryUpdates = [];

    const orders = await Order.find({ orderGroup: orderGroupId });
    for (const order of orders) {
      order.status = "VALIDATED";
      await order.save();

      for (const item of order.items) {
        inventoryUpdates.push({
          storeId: order.storeId,
          productId: item.productId.toString(),
          quantity: item.quantity,
        });
      }
    }

    return inventoryUpdates;
  }

  static async cancelOrdersByStore(storeId: string): Promise<{
    cancelledOrdersCount: number;
    cancelledOrderGroupsCount: number;
  }> {
    try {
      const ordersToCancel = await Order.find({
        storeId: storeId,
        status: { $nin: ["SHIPPED", "CANCELLED"] },
      });

      let cancelledOrdersCount = 0;
      const orderGroupIds = new Set<string>();

      for (const order of ordersToCancel) {
        order.status = "CANCELLED";
        await order.save();
        cancelledOrdersCount++;
        orderGroupIds.add(order.orderGroup.toString());
      }

      let cancelledOrderGroupsCount = 0;
      for (const orderGroupId of orderGroupIds) {
        await this.updateOrderGroupStatus(new mongoose.Types.ObjectId(orderGroupId));

        const orderGroup = await OrderGroup.findById(orderGroupId);
        if (orderGroup && orderGroup.status === "CANCELLED") {
          cancelledOrderGroupsCount++;
        }
      }

      return {
        cancelledOrdersCount,
        cancelledOrderGroupsCount,
      };
    } catch (error) {
      console.error(`Erreur lors de l'annulation des commandes pour le store ${storeId}:`, error);
      throw error;
    }
  }
}
