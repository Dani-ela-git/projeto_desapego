// models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    street: {
        type: String,
        required: [true, 'Rua é obrigatória'],
        trim: true
    },
    
    number: {
        type: String,
        required: [true, 'Número é obrigatório'],
        trim: true
    },
    
    neighborhood: {
        type: String,
        required: [true, 'Bairro é obrigatório'],
        trim: true
    },
    
    complement: {
        type: String,
        trim: true
    },
    
    city: {
        type: String,
        required: [true, 'Cidade é obrigatória'],
        trim: true
    },
    
    state: {
        type: String,
        required: [true, 'Estado é obrigatório'],
        uppercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                const states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
                               'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
                               'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
                return states.includes(v);
            },
            message: 'Estado inválido'
        }
    },
    
    zipCode: {
        type: String,
        required: [true, 'CEP é obrigatório'],
        validate: {
            validator: function(v) {
                return /^\d{5}-?\d{3}$/.test(v);
            },
            message: 'CEP inválido. Use o formato: 00000-000'
        }
    },
    
    country: {
        type: String,
        default: 'Brasil'
    },
    
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },
    
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Middleware: Formata CEP antes de salvar
addressSchema.pre('save', function(next) {
    if (this.zipCode) {
        const cleaned = this.zipCode.replace(/[^\d]/g, '');
        if (cleaned.length === 8) {
            this.zipCode = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
    }
    next();
});

module.exports = mongoose.model('Address', addressSchema);