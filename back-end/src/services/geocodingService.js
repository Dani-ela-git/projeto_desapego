const NodeGeocoder = require('node-geocoder');

class GeocodingService {
  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
      formatter: null
    });
  }

  /**
   * Converte endereço em coordenadas
   */
  async geocodeAddress(address) {
    try {
      const [result] = await this.geocoder.geocode(address);
      if (!result) throw new Error('Endereço não encontrado');
      
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress
      };
    } catch (error) {
      throw new Error(`Erro ao geocodificar: ${error.message}`);
    }
  }

  /**
   * Converte coordenadas em endereço
   */
  async reverseGeocode(lat, lon) {
    try {
      const [result] = await this.geocoder.reverse({ lat, lon });
      return result;
    } catch (error) {
      throw new Error(`Erro ao fazer reverse geocoding: ${error.message}`);
    }
  }
}

module.exports = new GeocodingService();