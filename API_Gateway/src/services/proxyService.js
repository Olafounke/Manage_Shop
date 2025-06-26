const axios = require("axios");
const microservices = require("../config/microservices");

class ProxyService {
  static async forwardRequest(
    serviceName,
    endpoint,
    method,
    data = null,
    headers = {},
    userInfo = null,
    queryParams = null
  ) {
    const service = microservices[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} non configuré`);
    }

    let url = `${service.url}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
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
      }

      if (data && (method === "POST" || method === "PUT")) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
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

  static buildEndpoint(endpointTemplate, params = {}) {
    let endpoint = endpointTemplate;
    Object.keys(params).forEach((key) => {
      endpoint = endpoint.replace(`:${key}`, params[key]);
    });
    return endpoint;
  }
}

module.exports = ProxyService;
