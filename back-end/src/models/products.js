// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título do produto é obrigatório'],
        trim: true,
        minlength: [5, 'Título deve ter no mínimo 5 caracteres'],
        maxlength: [100, 'Título deve ter no máximo 100 caracteres']
    },
    
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true,
        minlength: [20, 'Descrição deve ter no mínimo 20 caracteres'],
        maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
    },
    
    category: {
        type: String,
        required: [true, 'Categoria é obrigatória'],
        enum: ['food', 'clothes', 'electronics', 'books', 'furniture', 'others']
    },
    
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    }],
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório']
    },
    
    isAvailable: {
        type: Boolean,
        default: true
    },
    
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    
    address: {
        street: String,
        number: String,
        neighborhood: String,
        city: String,
        state: String,
        zipCode: String
    }
}, {
    timestamps: true
});

// Índices
productSchema.index({ 'location.coordinates': '2dsphere' });
productSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);