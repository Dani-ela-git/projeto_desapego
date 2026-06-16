// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome da categoria é obrigatório'],
        unique: true,
        trim: true,
        enum: ['food', 'clothes', 'electronics', 'books', 'furniture', 'others']
    },
    
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    
    icon: {
        type: String,
        default: '📦'
    },
    
    description: {
        type: String,
        trim: true
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Dados iniciais para popular
categorySchema.statics.seed = async function() {
    const categories = [
        { name: 'food', displayName: 'Alimentos', icon: '🍎' },
        { name: 'clothes', displayName: 'Roupas', icon: '👕' },
        { name: 'electronics', displayName: 'Eletrônicos', icon: '💻' },
        { name: 'books', displayName: 'Livros', icon: '📚' },
        { name: 'furniture', displayName: 'Móveis', icon: '🪑' },
        { name: 'others', displayName: 'Outros', icon: '📦' }
    ];
    
    for (const cat of categories) {
        await this.findOneAndUpdate(
            { name: cat.name },
            cat,
            { upsert: true, new: true }
        );
    }
};

module.exports = mongoose.model('Category', categorySchema);