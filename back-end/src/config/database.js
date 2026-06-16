// config/database.js
const mongoose = require('mongoose');
const Category = require('../models/Category');

const connectDB = async () => {
    try {
        // Usa MONGODB_URI ou MONGO_URI para compatibilidade
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!uri) {
            throw new Error('Variável de ambiente MONGODB_URI não definida');
        }
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('MongoDB conectado com sucesso!');
        
        // Popular categorias se estiver vazio
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            await Category.seed();
            console.log('📋 Categorias iniciais criadas');
        }
        
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;