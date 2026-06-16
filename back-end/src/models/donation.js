// models/Donation.js - Corrigido
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'O título da doação é obrigatório.'],
        trim: true,
        maxlength: 100 // ← CORRIGIDO: era maxlenght
    },

    description: {
        type: String,
        required: [true, 'A descrição da doação é obrigatória.'],
        trim: true,
        maxlength: 500 // ← CORRIGIDO: era maxlenght
    },

    category: {
        type: String,
        required: [true, 'A categoria da doação é obrigatória.'],
        enum: ['food', 'clothes', 'electronics', 'books', 'furniture', 'others'],
        trim: true,
        maxlength: 50
    },

    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: { // ← CORRIGIDO: era publicid
            type: String,
            required: true
        }
    }],

    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O doador da doação é obrigatório.']
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
        },
        address: {
            street: String,
            number: String, // ← Adicionado
            neighborhood: String, // ← Adicionado
            complement: String, // ← Adicionado
            city: String,
            state: String,
            zipCode: String,
            country: {
                type: String,
                default: 'Brasil'
            }
        }
    },

    available: {
        type: Boolean,
        default: true
    },

    expiresAt: {
        type: Date,
        required: true,
        default: function() {
            // 30 dias a partir da criação
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    },

    distanceLimit: {
        type: Number, // em km
        default: 10,
        min: [1, 'Limite mínimo é 1km'],
        max: [100, 'Limite máximo é 100km']
    }
}, {
    timestamps: true
});

// Índice para busca geográfica
donationSchema.index({ 'location.coordinates': '2dsphere' });

// Índice para buscas rápidas
donationSchema.index({ category: 1, available: 1 });
donationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Donation', donationSchema);