const axios = require("axios");

class GeolocationService {
  static async geocodeAddress(address) {
    try {
      console.log(address);
      const encodedAddress = encodeURIComponent(address);
      console.log(encodedAddress);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );

      const data = response.data;

      if (!data || data.length === 0) {
        throw new Error("Adresse non trouvée");
      }

      const result = data[0];
      return {
        longitude: parseFloat(result.lon),
        latitude: parseFloat(result.lat),
        formattedAddress: result.display_name,
      };
    } catch (error) {
      console.error("Erreur géocodage:", error);
      throw new Error("Impossible de localiser l'adresse");
    }
  }
}

module.exports = GeolocationService;
