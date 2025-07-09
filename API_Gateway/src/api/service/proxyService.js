const axios = require("axios");
const FormData = require("form-data");
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
    storeNameSlug = null,
    files = null
  ) {
    console.log(`[ProxyService] Début de forwardRequest pour ${serviceName}`);
    console.log(`[ProxyService] Endpoint: ${endpoint}`);
    console.log(`[ProxyService] Method: ${method}`);
    console.log(`[ProxyService] UserInfo:`, userInfo);
    console.log(`[ProxyService] Data:`, data);
    console.log(`[ProxyService] QueryParams:`, queryParams);
    console.log(`[ProxyService] Files:`, files);

    const service = microservices[serviceName];
    console.log(`[ProxyService] Service:`, service);
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
          ...headers,
        },
      };

      // Ne pas forcer le Content-Type pour les uploads de fichiers
      if (!files && !headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }

      if (userInfo) {
        config.headers["x-user-info"] = JSON.stringify(userInfo);
        console.log(`[ProxyService] Header x-user-info ajouté:`, config.headers["x-user-info"]);
      }

      // Gestion des fichiers multipart
      if (files) {
        // Si data est une requête complète (req), on utilise son stream
        if (data && data.pipe && typeof data.pipe === "function") {
          config.data = data;
          console.log(`[ProxyService] Stream de requête transmis directement`);
        } else {
          // Fallback pour les autres cas
          console.log(`[ProxyService] Données transmises sans stream`);
        }

        // Supprimer le Content-Type pour laisser multer le gérer
        delete config.headers["Content-Type"];
      } else if (data && (method === "POST" || method === "PUT" || method === "DELETE")) {
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

  static async forwardFileUpload(serviceName, endpoint, req, res, userInfo = null) {
    console.log(`[ProxyService] Début de forwardFileUpload pour ${serviceName}`);

    const service = microservices[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} non configuré`);
    }

    const targetUrl = `${service.url}${endpoint}`;
    console.log(`[ProxyService] URL cible: ${targetUrl}`);

    try {
      const formData = new FormData();

      // Ajouter les fichiers
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file, index) => {
          formData.append("images", file.buffer, {
            filename: file.originalname || `image-${index}.jpg`,
            contentType: file.mimetype || "image/jpeg",
          });
        });
      } else if (req.file) {
        formData.append("image", req.file.buffer, {
          filename: req.file.originalname || "image.jpg",
          contentType: req.file.mimetype || "image/jpeg",
        });
      }

      // Ajouter les autres données du body
      Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "object") {
          formData.append(key, JSON.stringify(req.body[key]));
        } else {
          formData.append(key, req.body[key]);
        }
      });

      const config = {
        method: "POST",
        url: targetUrl,
        data: formData,
        headers: {
          ...formData.getHeaders(),
          "x-user-info": userInfo ? JSON.stringify(userInfo) : undefined,
        },
      };

      console.log(`[ProxyService] Envoi de la requête vers ${targetUrl}`);
      const response = await axios(config);

      console.log(`[ProxyService] Réponse reçue:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[ProxyService] Erreur lors de l'upload:`, error);
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.error || error.response.data?.message || "Erreur du microservice",
        };
      }
      throw {
        status: 500,
        message: "Erreur de connexion au microservice",
      };
    }
  }
}

module.exports = ProxyService;
