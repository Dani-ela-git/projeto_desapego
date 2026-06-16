const Donation = require('../models/Donation');
const DistanceService = require('../services/distanceService');
const { validationResult } = require('express-validator');

class DonationController {
    /**
     * Cria uma nova doação
     */
    static async createDonation(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, category, location, distanceLimit } = req.body;

            // Processar imagens (via Multer)
            const images = req.files?.map(file => ({
                url: file.path,
                publicId: file.filename
            })) || [];

            const donation = new Donation({
                title,
                description,
                category,
                images,
                donor: req.user.id,
                location: {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude],
                    address: location.address
                },
                distanceLimit: distanceLimit || 10,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
            });

            await donation.save();

            res.status(201).json({
                success: true,
                data: donation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Busca doações próximas ao usuário
     */
    static async getNearbyDonations(req, res) {
        try {
            const { lat, lon, maxDistance = 10 } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude e longitude são obrigatórias'
                });
            }

            // Buscar doações ativas próximas usando MongoDB geo query
            const donations = await Donation.find({
                'location.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        },
                        $maxDistance: maxDistance * 1000 // converte km para metros
                    }
                },
                available: true,
                expiresAt: { $gt: new Date() }
            }).populate('donor', 'name email');

            // Enriquecer com distância calculada
            const enrichedDonations = DistanceService.enrichDonationsWithDistance(
                donations,
                { lat: parseFloat(lat), lon: parseFloat(lon) }
            );

            // Ordenar por distância
            enrichedDonations.sort((a, b) => a.distance - b.distance);

            res.json({
                success: true,
                count: enrichedDonations.length,
                data: enrichedDonations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Busca doações com filtros avançados
     */
    static async searchDonations(req, res) {
        try {
            const {
                lat, lon,
                category,
                keyword,
                maxDistance = 10,
                page = 1,
                limit = 20
            } = req.query;

            const filter = {
                available: true,
                expiresAt: { $gt: new Date() }
            };

            // Filtros
            if (category) filter.category = category;
            if (keyword) {
                filter.$or = [
                    { title: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ];
            }

            // Se tiver localização, busca por proximidade
            if (lat && lon) {
                filter['location.coordinates'] = {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        },
                        $maxDistance: maxDistance * 1000
                    }
                };
            }

            const skip = (page - 1) * limit;

            const [donations, total] = await Promise.all([
                Donation.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .populate('donor', 'name email')
                    .sort({ createdAt: -1 }),
                Donation.countDocuments(filter)
            ]);

            // Calcular distância se tiver localização
            let responseData = donations;
            if (lat && lon) {
                responseData = DistanceService.enrichDonationsWithDistance(
                    donations,
                    { lat: parseFloat(lat), lon: parseFloat(lon) }
                );
            }

            res.json({
                success: true,
                data: responseData,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getDonationById(req, res) {
        try {
            const donation = await Donation.findById(req.params.id)
                .populate('donor', 'name email phone');

            if (!donation) {
                return res.status(404).json({
                    success: false,
                    message: 'Doação não encontrada'
                });
            }

            res.json({
                success: true,
                data: donation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = DonationController;