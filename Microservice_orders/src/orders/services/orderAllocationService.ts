import { EnrichedCart, StoreAllocation, CartItem, StoreWithDistance, UserLocation } from "../../type/OrderAllocation";

export class OrderAllocationService {
  static allocateOrderItems(cart: EnrichedCart): StoreAllocation[] {
    const allocations: StoreAllocation[] = [];
    const userLocation = {
      latitude: cart.userAdress.latitude,
      longitude: cart.userAdress.longitude,
    };

    for (const item of cart.items) {
      // Un seul store disponible => allocation directe
      if (item.stores.length === 1) {
        this.allocateToSingleStore(item, item.stores[0], item.quantity, allocations);
        continue;
      }

      // Plusieurs stores disponible => trie des stores par distance par rapport à l'utilisateur
      const sortedStores = this.sortStoresByDistance(item.stores, userLocation);

      // On cherche un store avec suffisamment de stock pour éviter de faire des allocations sur plusieurs stores
      const storeWithSufficientStock = this.findStoreWithSufficientStock(sortedStores, item.quantity);
      if (storeWithSufficientStock) {
        // Un store a assez de stock => allocation simple au store le plus proche
        this.allocateToSingleStore(item, storeWithSufficientStock, item.quantity, allocations);
      } else {
        // Aucun store n'a assez de stock => répartition sur plusieurs stores
        this.allocateToMultipleStores(item, sortedStores, allocations);
      }
    }
    return allocations;
  }

  private static allocateToSingleStore(
    item: CartItem,
    store: any,
    quantity: number,
    allocations: StoreAllocation[]
  ): void {
    let storeAllocation = allocations.find((alloc) => alloc.storeId === store.storeId);

    if (!storeAllocation) {
      storeAllocation = {
        storeId: store.storeId,
        storeName: store.storeName,
        items: [],
        subtotal: 0,
      };
      allocations.push(storeAllocation);
    }

    const totalPrice = quantity * item.price;
    storeAllocation.items.push({
      productId: item.productId,
      productName: item.productName,
      quantity: quantity,
      unitPrice: item.price,
      totalPrice: totalPrice,
    });

    storeAllocation.subtotal += totalPrice;
  }

  private static allocateToMultipleStores(
    item: CartItem,
    sortedStores: StoreWithDistance[],
    allocations: StoreAllocation[]
  ): void {
    let remainingQuantity = item.quantity;

    for (const store of sortedStores) {
      if (remainingQuantity === 0) break;

      const quantityToAllocate = Math.min(remainingQuantity, store.quantityAvailable);

      if (quantityToAllocate > 0) {
        this.allocateToSingleStore(item, store, quantityToAllocate, allocations);
        remainingQuantity -= quantityToAllocate;
      }
    }

    if (remainingQuantity > 0) {
      console.warn(`${remainingQuantity} unités du produit ${item.productName} n'ont pas pu être allouées`);
    }
  }

  private static sortStoresByDistance(stores: any[], userLocation: UserLocation): StoreWithDistance[] {
    return stores
      .map((store) => ({
        ...store,
        distance: this.calculateDistance(userLocation, {
          latitude: store.storeAdress.latitude,
          longitude: store.storeAdress.longitude,
        }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  private static findStoreWithSufficientStock(
    sortedStores: StoreWithDistance[],
    requiredQuantity: number
  ): StoreWithDistance | null {
    return sortedStores.find((store) => store.quantityAvailable >= requiredQuantity) || null;
  }

  private static calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const dLng = this.degreesToRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.latitude)) *
        Math.cos(this.degreesToRadians(point2.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
