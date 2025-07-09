const microservices = require("../../config/microservices");
const Store = require("../models/storeModel");
const authService = require("../../auth/services/authService");
const ProxyService = require("./proxyService");
const GeolocationService = require("./geolocationService");
const productService = require("./productService");
const orderService = require("./orderService");
const transfertService = require("./transfertService");
const crypto = require("crypto");

class StoreService {
  static RESERVED_PORTS = [3000, 3001, 3002, 3003, 3005, 5432, 80, 443, 27017, 22, 21, 25, 53, 8080, 9000];

  static STORE_PORT_START = 8001;
  static STORE_PORT_END = 8999;

  static async getAllStores() {
    try {
      const stores = await Store.find({}).sort({ port: 1 });
      return stores;
    } catch (error) {
      console.error("Erreur lors de la récupération des stores:", error);
      throw new Error("Impossible de récupérer les informations des stores");
    }
  }

  static async getStoreById(storeId) {
    try {
      const store = await Store.findOne({ storeId });
      console.log("store", store);
      const { port } = await this.getStorePort(storeId);
      console.log("port", port);

      const result = await ProxyService.forwardRequest(
        "stores",
        microservices.stores.endpoints.getStoreById,
        "GET",
        null,
        {},
        null,
        null,
        port,
        store.storeNameSlug
      );
      console.log("result", result);
      return result;
    } catch (error) {
      console.error("Erreur lors de la récupération du store:", error);
      throw new Error(`Impossible de récupérer le store: ${error.message}`);
    }
  }

  static async createStore(storeName, storeAddress, userId = null) {
    try {
      const { usedPorts, usedStoreIds, usedStoreNames, usedStoreNameSlugs } = await this.getUsedStoreData();

      const port = this.findAvailablePort(usedPorts);

      const storeNameSlug = this.generateStoreNameSlug(storeName.trim());
      const isStoreNameOrSlugTaken = this.isStoreNameOrSlugTaken(
        storeName.trim(),
        storeNameSlug,
        usedStoreNames,
        usedStoreNameSlugs
      );
      if (isStoreNameOrSlugTaken) {
        throw new Error("Un store avec ce nom existe déjà");
      }

      const storeId = await this.generateUniqueStoreId(usedStoreIds);

      let latitude = null;
      let longitude = null;

      try {
        const storeAddressNormalized = storeAddress.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const geocodeResult = await GeolocationService.geocodeAddress(storeAddressNormalized.trim());
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        console.log(`Adresse géocodée pour le store ${storeName}: ${latitude}, ${longitude}`);
      } catch (geocodeError) {
        console.warn(`Impossible de géocoder l'adresse "${storeAddress}":`, geocodeError.message);
      }

      const result = await this.createStoreInDatabase(
        port,
        storeId,
        storeName,
        storeNameSlug,
        storeAddress,
        userId,
        longitude,
        latitude
      );

      if (result.success && userId) {
        return await this.updateUserRoleAndAssignStore(userId, storeId, result);
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de la création du store:", error);
      return {
        success: false,
        error: "Erreur interne lors de la création du store",
        details: error.message,
      };
    }
  }

  static async updateStoreById(storeId, storeName, storeAddress, userId) {
    try {
      const body = {};
      const { port, oldUserId } = await this.getStorePort(storeId);
      const store = await this.getStoreById(storeId);

      if (storeName) {
        const { usedStoreNames, usedStoreNameSlugs } = await this.getUsedStoreData();
        const storeNameSlug = this.generateStoreNameSlug(storeName.trim());
        const isStoreNameOrSlugTaken = this.isStoreNameOrSlugTaken(
          storeName.trim(),
          storeNameSlug,
          usedStoreNames,
          usedStoreNameSlugs
        );

        if (isStoreNameOrSlugTaken) {
          throw new Error("Un store avec ce nom existe déjà");
        }
        body.storeName = storeName;
      }

      if (storeAddress) {
        body.storeAddress = storeAddress;
        try {
          const geocodeResult = await GeolocationService.geocodeAddress(storeAddress.trim());
          body.latitude = geocodeResult.latitude;
          body.longitude = geocodeResult.longitude;
          console.log(`Nouvelle adresse géocodée pour le store ${storeId}: ${body.latitude}, ${body.longitude}`);
        } catch (geocodeError) {
          console.warn(`Impossible de géocoder la nouvelle adresse "${storeAddress}":`, geocodeError.message);
        }
      }

      if (userId && userId !== oldUserId) {
        body.userId = userId;
      }

      const result = await ProxyService.forwardRequest(
        "stores",
        microservices.stores.endpoints.updateStoreById,
        "PUT",
        body,
        {},
        null,
        null,
        port,
        store.nameSlug
      );

      if (result) {
        await Store.findOneAndUpdate({ storeId }, body);

        if (userId && userId !== oldUserId) {
          try {
            if (oldUserId) {
              await authService.updateRoleOnly(oldUserId, {
                role: "USER",
                store: null,
              });
            }

            await authService.updateRoleOnly(userId, {
              role: "ADMIN_STORE",
              store: storeId,
            });
          } catch (userUpdateError) {
            console.error("Erreur lors de la mise à jour des rôles utilisateurs:", userUpdateError);
          }
        }
      }
      return result;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du store:", error);
      throw new Error(`Impossible de mettre à jour le store: ${error.message}`);
    }
  }

  static async deleteStoreById(storeId) {
    try {
      const store = await Store.findOne({ storeId });

      if (!store) {
        throw new Error(`Store avec l'ID ${storeId} non trouvé`);
      }

      if (store.status === "deleting") {
        throw new Error(`Store ${storeId} est déjà en cours de suppression`);
      }

      await Store.findOneAndUpdate(
        { storeId },
        {
          status: "deleting",
          updatedAt: new Date(),
        }
      );

      if (store.userId) {
        try {
          await authService.updateRoleOnly(store.userId, {
            role: "USER",
            store: null,
          });
        } catch (userUpdateError) {
          console.error("Erreur lors de la mise à jour de l'utilisateur:", userUpdateError);
        }
      }

      await transfertService.rejectAllStoreTransferts(storeId);

      await orderService.cancelStoreOrders(storeId);

      await productService.removeStoreFromProducts(storeId);

      return {
        success: true,
        message: `Store ${storeId} marqué pour suppression - le worker va s'en occuper`,
        storeId: storeId,
      };
    } catch (error) {
      console.error("Erreur lors de la suppression du store:", error);
      throw new Error(`Impossible de supprimer le store: ${error.message}`);
    }
  }

  static async getStorePort(storeId) {
    const store = await Store.findOne({ storeId });

    if (!store) {
      throw new Error(`Store avec l'ID ${storeId} non trouvé`);
    }

    if (store.status !== "deployed") {
      throw new Error(`Store ${storeId} n'est pas encore déployé (status: ${store.status})`);
    }

    return { port: store.port, oldUserId: store.userId };
  }

  static async getUsedStoreData() {
    const stores = await this.getAllStores();
    const { usedPorts, usedStoreIds, usedStoreNames, usedStoreNameSlugs } = stores.reduce(
      (acc, store) => {
        acc.usedPorts.push(store.port);
        acc.usedStoreIds.push(store.storeId);
        acc.usedStoreNames.push(store.storeName);
        acc.usedStoreNameSlugs.push(store.storeNameSlug);
        return acc;
      },
      { usedPorts: [], usedStoreIds: [], usedStoreNames: [], usedStoreNameSlugs: [] }
    );

    return { usedPorts, usedStoreIds, usedStoreNames, usedStoreNameSlugs };
  }

  static findAvailablePort(usedPorts) {
    try {
      const allUsedPorts = [...this.RESERVED_PORTS, ...usedPorts];

      for (let port = this.STORE_PORT_START; port <= this.STORE_PORT_END; port++) {
        if (!allUsedPorts.includes(port)) {
          return port;
        }
      }

      throw new Error(`Aucun port disponible dans la plage ${this.STORE_PORT_START}-${this.STORE_PORT_END}`);
    } catch (error) {
      console.error("Erreur lors de la recherche de port disponible:", error);
      throw error;
    }
  }

  static generateStoreNameSlug(storeName) {
    return storeName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static isStoreNameOrSlugTaken(storeName, storeNameSlug, usedStoreNames, usedStoreNameSlugs) {
    return usedStoreNames.includes(storeName.trim()) || usedStoreNameSlugs.includes(storeNameSlug);
  }

  static async generateUniqueStoreId(usedStoreIds) {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const storeId = crypto.randomBytes(4).toString("hex").substring(0, 8);

      if (!usedStoreIds.includes(storeId)) {
        return storeId;
      }

      attempts++;
    }

    throw new Error("Impossible de générer un ID unique après " + maxAttempts + " tentatives");
  }

  static async createStoreInDatabase(
    storePort,
    storeId,
    storeName,
    storeNameSlug,
    storeAddress,
    userId,
    longitude,
    latitude
  ) {
    try {
      const newStore = new Store({
        storeId: storeId,
        storeName: storeName,
        storeNameSlug: storeNameSlug,
        storeAddress: storeAddress,
        latitude: latitude,
        longitude: longitude,
        userId: userId,
        port: storePort,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedStore = await newStore.save();

      console.log(`Magasin ${storeName} ajouté (pending) - Worker va déployer automatiquement`);

      return {
        success: true,
        message: "Store créé avec succès",
        storeId: storeId,
        scriptOutput: `Magasin ${storeName} ajouté avec succès. Status: pending. Le worker va le déployer automatiquement.`,
      };
    } catch (error) {
      console.error("Erreur lors de la création du store en base:", error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return {
          success: false,
          error: `Erreur de duplication`,
          details: `Un store avec le même ${field} existe déjà`,
        };
      }

      return {
        success: false,
        error: "Erreur lors de la création du store en base",
        details: error.message,
      };
    }
  }

  static async updateUserRoleAndAssignStore(userId, storeId, storeCreationResult) {
    try {
      await authService.updateRoleOnly(userId, {
        role: "ADMIN_STORE",
        store: storeId,
      });

      console.log(`Utilisateur ${userId} mis à jour avec le rôle ADMIN_STORE et assigné au store ${storeId}`);

      return {
        ...storeCreationResult,
        message: "Store créé avec succès et utilisateur mis à jour",
      };
    } catch (userUpdateError) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", userUpdateError);
      return {
        ...storeCreationResult,
        message: "Store créé mais erreur lors de la mise à jour de l'utilisateur",
        userError: userUpdateError.message,
      };
    }
  }

  static async handleUserStoreChanges(userId, currentUser, userData) {
    const currentIsAdmin = currentUser.role === "ADMIN_STORE";
    const newIsAdmin = userData.role === "ADMIN_STORE";
    const currentStore = currentUser.store;
    const newStore = userData.store;
    console.log("currentIsAdmin", currentIsAdmin);
    console.log("newIsAdmin", newIsAdmin);
    console.log("currentStore", currentStore);
    console.log("newStore", newStore);

    // L'utilisateur était ADMIN_STORE et ne l'est plus
    if (currentIsAdmin && (!newIsAdmin || !newStore)) {
      if (currentStore) {
        // Passage de userId à null
        await this.updateStoreUser(null, { store: currentStore });
        await this.updateLocalStoreUser(null, { store: currentStore });
      }
    }

    // L'utilisateur devient ADMIN_STORE avec un nouveau store
    else if (newIsAdmin && newStore) {
      // Si c'était déjà un ADMIN_STORE avec le même store, ne rien faire
      if (currentIsAdmin && currentStore === newStore) {
        return;
      }

      const newStoreData = await Store.findOne({ storeId: newStore });
      console.log("newStoreData", newStoreData);
      if (!newStoreData) {
        throw new Error(`Store avec l'ID ${newStore} non trouvé`);
      }
      if (newStoreData.userId && newStoreData.userId !== userId) {
        throw new Error(`Un utilisateur est déjà assigné au store ${newStore}`);
      }

      // Si c'était un ADMIN_STORE avec un autre store
      if (currentIsAdmin && currentStore && currentStore !== newStore) {
        // Passage de userId à null
        await this.updateStoreUser(null, { store: currentStore });
        await this.updateLocalStoreUser(null, { store: currentStore });
      }

      // Assigner le nouveau store
      console.log("updateStoreUser", userId, { store: newStore });
      await this.updateStoreUser(userId, { store: newStore });
      await this.updateLocalStoreUser(userId, { store: newStore });
    }
  }

  static async updateStoreUser(userId, userData) {
    if (!userData.store) {
      throw new Error("Store ID requis pour la mise à jour");
    }

    const store = await Store.findOne({ storeId: userData.store });
    if (!store) {
      throw new Error(`Store avec l'ID ${userData.store} non trouvé`);
    }
    console.log("store", store);
    const { port } = await this.getStorePort(userData.store);

    const body = { userId: userId };
    console.log("body", body);
    console.log("port", port);

    try {
      const result = await ProxyService.forwardRequest(
        "stores",
        microservices.stores.endpoints.updateStoreById,
        "PUT",
        body,
        {},
        null,
        null,
        port,
        store.storeNameSlug
      );
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la BDD du store ${userData.store}:`, error);
      throw error;
    }
  }

  static async updateLocalStoreUser(userId, userData) {
    if (!userData.store) {
      throw new Error("Store ID requis pour la mise à jour locale");
    }

    try {
      await Store.findOneAndUpdate({ storeId: userData.store }, { userId: userId, updatedAt: new Date() });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour locale du store ${userData.store}:`, error);
      throw error;
    }
  }
}

module.exports = StoreService;
