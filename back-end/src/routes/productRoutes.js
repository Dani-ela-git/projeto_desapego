// routes/productRoutes.js 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Product = require('../models/products');
const { body, validationResult } = require('express-validator');

// Validações de produto
const productValidation = [
    body('title')
        .notEmpty().withMessage('Título é obrigatório')
        .isLength({ min: 5 }).withMessage('Título deve ter no mínimo 5 caracteres'),
    
    body('description')
        .notEmpty().withMessage('Descrição é obrigatória')
        .isLength({ min: 20 }).withMessage('Descrição deve ter no mínimo 20 caracteres'),
    
    body('category')
        .isIn(['food', 'clothes', 'electronics', 'books', 'furniture', 'others'])
        .withMessage('Categoria inválida'),
    
    body('location.latitude')
        .isNumeric().withMessage('Latitude inválida'),
    
    body('location.longitude')
        .isNumeric().withMessage('Longitude inválida')
];

// Criar produto
router.post('/products', 
    auth,
    upload.array('images', 5),
    productValidation,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, category, location, address } = req.body;
            
            const images = req.files?.map(file => ({
                url: file.path,
                publicId: file.filename
            })) || [];

            const product = new Product({
                title,
                description,
                category,
                images,
                user: req.user.id,
                location: {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude]
                },
                address: address || {}
            });

            await product.save();

            res.status(201).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

// Buscar produtos por proximidade
router.get('/products/nearby', async (req, res) => {
    try {
        const { lat, lon, maxDistance = 10 } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude e longitude são obrigatórias'
            });
        }

        const products = await Product.find({
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: maxDistance * 1000
                }
            },
            isAvailable: true
        }).populate('user', 'name phone')
        .limit(50);

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Buscar produtos do usuário
router.get('/products/my-products', auth, async (req, res) => {
    try {
        const products = await Product.find({
            user: req.user.id,
            isAvailable: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;