const axios = require("axios");
const microservices = require("../../config/microservices");

class ProxyService {
  static async forwardRequest(
    serviceName,
    endpoint,
    method,
    data = null,
    headers = {},
    userInfo = null,
    queryParams = null,
    customPort = null,
    storeNameSlug = null
  ) {
    console.log(`[ProxyService] Début de forwardRequest pour ${serviceName}`);
    console.log(`[ProxyService] Endpoint: ${endpoint}`);
    console.log(`[ProxyService] Method: ${method}`);
    console.log(`[ProxyService] UserInfo:`, userInfo);
    console.log(`[ProxyService] Data:`, data);
    console.log(`[ProxyService] QueryParams:`, queryParams);

    const service = microservices[serviceName];
    if (!service) {
      console.error(`[ProxyService] Service ${serviceName} non configuré`);
      throw new Error(`Service ${serviceName} non configuré`);
    }

    let url;

    if (serviceName === "stores" && customPort) {
      url = `http://ms-store-${storeNameSlug}:${customPort}${endpoint}`;
      console.log("[ProxyService] URL pour store:", url);
    } else if (service.url) {
      url = `${service.url}${endpoint}`;
      console.log(`[ProxyService] URL construite: ${url}`);
    } else {
      console.error(`[ProxyService] Configuration URL manquante pour le service ${serviceName}`);
      throw new Error(`Configuration URL manquante pour le service ${serviceName}`);
    }

    if (queryParams && Object.keys(queryParams).length > 0) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
      console.log(`[ProxyService] URL avec queryParams: ${url}`);
    }

    try {
      const config = {
        method,
        url,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (userInfo) {
        config.headers["x-user-info"] = JSON.stringify(userInfo);
        console.log(`[ProxyService] Header x-user-info ajouté:`, config.headers["x-user-info"]);
      }

      if (data && (method === "POST" || method === "PUT")) {
        config.data = data;
        console.log(`[ProxyService] Data ajoutée pour ${method}:`, data);
      }

      console.log(`[ProxyService] Configuration de la requête:`, config);
      console.log(`[ProxyService] Envoi de la requête vers ${url}`);

      const response = await axios(config);

      console.log(`[ProxyService] Réponse reçue avec status: ${response.status}`);
      console.log(`[ProxyService] Data de réponse:`, response.data);
      console.log(`[ProxyService] Type de data:`, typeof response.data);
      console.log(`[ProxyService] Taille de data:`, Array.isArray(response.data) ? response.data.length : "Non array");

      return response.data;
    } catch (error) {
      console.error(`[ProxyService] Erreur lors de l'appel à ${url}:`, error);
      if (error.response) {
        console.error(`[ProxyService] Status de l'erreur:`, error.response.status);
        console.error(`[ProxyService] Data de l'erreur:`, error.response.data);
        console.error(`[ProxyService] Headers de l'erreur:`, error.response.headers);
        throw {
          status: error.response.status,
          message: error.response.data?.error || error.response.data?.message || "Erreur du microservice",
        };
      }
      console.error(`[ProxyService] Erreur de connexion:`, error.message);
      throw {
        status: 500,
        message: "Erreur de connexion au microservice",
      };
    }
  }

  static buildEndpoint(endpointTemplate, params = {}) {
    let endpoint = endpointTemplate;
    Object.keys(params).forEach((key) => {
      endpoint = endpoint.replace(`:${key}`, params[key]);
    });
    return endpoint;
  }
}

module.exports = ProxyService;
