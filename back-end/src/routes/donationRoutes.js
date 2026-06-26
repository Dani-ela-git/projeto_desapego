//rotas relacionadas às doações, incluindo criação, 
// busca por proximidade e pesquisa por categoria ou palavra-chave

const express = require('express');
const router = express.Router();
const DonationController = require('../controllers/donationController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

// Validations
const donationValidation = [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('description').notEmpty().withMessage('Descrição é obrigatória'),
    body('category').isIn(['food', 'clothes', 'electronics', 'books', 'furniture', 'others']),
    body('distanceLimit').optional().isNumeric().withMessage('Limite de distância inválido')
    // location validado manualmente no controller pois vem via FormData
];

// Rotas
router.post('/donations', 
  auth, 
  upload.array('images', 5),
  donationValidation,
  DonationController.createDonation
);

router.get('/donations/nearby', DonationController.getNearbyDonations);
router.get('/donations/search', DonationController.searchDonations);
router.get('/donations/:id', DonationController.getDonationById);
router.delete('/donations/:id', auth, DonationController.deleteDonation);
module.exports = router;