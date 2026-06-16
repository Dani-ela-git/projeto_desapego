// routes/userRoutes.js 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Buscar perfil do usuário logado
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -__v');
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
    try {
        const allowedUpdates = ['name', 'phone', 'age', 'location'];
        const updates = {};
        
        // Filtra apenas campos permitidos
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -__v');
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Buscar usuários por nome (para pesquisa)
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Termo de busca é obrigatório'
            });
        }
        
        const users = await User.find({
            name: { $regex: q, $options: 'i' }
        }).select('name cpf phone location')
        .limit(10);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;