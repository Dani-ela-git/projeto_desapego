// services/distanceService.js 
const { getDistance } = require('geolib');

class DistanceService {
    /**
     * Calcula a distância entre dois pontos geográficos em km
     * @param {number} lat1 - Latitude do ponto 1
     * @param {number} lon1 - Longitude do ponto 1
     * @param {number} lat2 - Latitude do ponto 2
     * @param {number} lon2 - Longitude do ponto 2
     * @returns {number} Distância em quilômetros
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const distance = getDistance(
            { latitude: lat1, longitude: lon1 },
            { latitude: lat2, longitude: lon2 }
        );
        return distance / 1000; // Converte metros para km
    }

    /**
     * Filtra doações por raio de distância
     */
    static filterDonationsByDistance(donations, userLocation, maxDistance) {
        return donations.filter(donation => {
            // Extrai coordenadas da doação (MongoDB guarda [lon, lat])
            const [donationLon, donationLat] = donation.location.coordinates;
            
            const distance = this.calculateDistance(
                userLocation.lat,
                userLocation.lon,
                donationLat,
                donationLon
            );
            
            // Verifica se está dentro do limite do usuário E do doador
            return distance <= maxDistance && distance <= donation.distanceLimit;
        });
    }

    /**
     * Adiciona distância calculada a cada doação
     */
    static enrichDonationsWithDistance(donations, userLocation) {
        return donations.map(donation => {
            const [donationLon, donationLat] = donation.location.coordinates;
            
            const distance = this.calculateDistance(
                userLocation.lat,
                userLocation.lon,
                donationLat,
                donationLon
            );
            
            return {
                ...donation.toObject(),
                distance: parseFloat(distance.toFixed(2))
            };
        });
    }
}

module.exports = DistanceService;