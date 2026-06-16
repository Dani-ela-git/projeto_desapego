// routes/authRoutes.js 
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Validações de registro com CPF
const registerValidation = [
    body('name')
        .notEmpty().withMessage('Nome é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
    
    body('cpf')
        .notEmpty().withMessage('CPF é obrigatório')
        .custom(async (cpf) => {
            // Remove formatação para validar
            const cleaned = cpf.replace(/[^\d]/g, '');
            
            // Valida CPF
            if (!User.validateCPF(cpf)) {
                throw new Error('CPF inválido');
            }
            
            // Verifica se CPF já existe
            const user = await User.findByCPF(cpf);
            if (user) {
                throw new Error('CPF já cadastrado');
            }
            return true;
        }),
    
    body('password')
        .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    
    body('phone')
        .notEmpty().withMessage('Telefone é obrigatório')
        .custom((value) => {
            const cleaned = value.replace(/[^\d]/g, '');
            if (cleaned.length < 10 || cleaned.length > 11) {
                throw new Error('Telefone inválido');
            }
            return true;
        }),
    
    body('age')
        .isInt({ min: 18, max: 120 }).withMessage('Idade deve ser entre 18 e 120 anos')
];

// Rota de REGISTRO
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Verifica erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, cpf, password, phone, age, location } = req.body;
        
        // Cria o usuário (o middleware pre-save formata o CPF e criptografa a senha)
        const user = new User({
            name,
            cpf,
            password,
            phone,
            age,
            location: location || {}
        });
        
        await user.save();
        
        // Gerar token JWT
        const token = jwt.sign(
            { id: user._id, cpf: user.cpf },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                cpf: user.cpf,
                phone: user.phone,
                age: user.age
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao cadastrar usuário'
        });
    }
});

// Rota de LOGIN (usando CPF)
router.post('/login', async (req, res) => {
    try {
        const { cpf, password } = req.body;
        
        // Valida se CPF foi enviado
        if (!cpf) {
            return res.status(400).json({
                success: false,
                message: 'CPF é obrigatório'
            });
        }
        
        // Busca usuário pelo CPF (inclui senha)
        const user = await User.findByCPF(cpf).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'CPF ou senha inválidos'
            });
        }
        
        // Verifica se o usuário está ativo
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Usuário inativo. Entre em contato com o suporte.'
            });
        }
        
        // Compara a senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'CPF ou senha inválidos'
            });
        }
        
        // Atualiza último login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        
        // Gera token JWT
        const token = jwt.sign(
            { id: user._id, cpf: user.cpf },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                cpf: user.cpf,
                phone: user.phone,
                age: user.age,
                location: user.location
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer login'
        });
    }
});

// Rota para verificar se o CPF já existe (útil no front-end)
router.post('/check-cpf', async (req, res) => {
    try {
        const { cpf } = req.body;
        
        if (!cpf) {
            return res.status(400).json({
                success: false,
                message: 'CPF é obrigatório'
            });
        }
        
        const user = await User.findByCPF(cpf);
        
        res.json({
            success: true,
            exists: !!user,
            message: user ? 'CPF já cadastrado' : 'CPF disponível'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;