// models/User.js - Usando CPF como identificador principal
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
        maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
    },
    
    cpf: {
        type: String,
        required: [true, 'CPF é obrigatório'],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Remove pontos e traços para validação
                const cleaned = v.replace(/[^\d]/g, '');
                
                // Verifica se tem 11 dígitos
                if (cleaned.length !== 11) return false;
                
                // Verifica se todos os dígitos são iguais (CPF inválido)
                if (/^(\d)\1+$/.test(cleaned)) return false;
                
                // Validação dos dígitos verificadores
                let sum = 0;
                let remainder;
                
                // Primeiro dígito verificador
                for (let i = 1; i <= 9; i++) {
                    sum += parseInt(cleaned.substring(i-1, i)) * (11 - i);
                }
                remainder = (sum * 10) % 11;
                if (remainder === 10 || remainder === 11) remainder = 0;
                if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
                
                // Segundo dígito verificador
                sum = 0;
                for (let i = 1; i <= 10; i++) {
                    sum += parseInt(cleaned.substring(i-1, i)) * (12 - i);
                }
                remainder = (sum * 10) % 11;
                if (remainder === 10 || remainder === 11) remainder = 0;
                if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
                
                return true;
            },
            message: 'CPF inválido. Use o formato: 000.000.000-00'
        }
    },
    
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
        select: false // Não retorna a senha nas consultas por padrão
    },
    
    phone: {
        type: String,
        required: [true, 'Telefone é obrigatório'],
        validate: {
            validator: function(v) {
                const cleaned = v.replace(/[^\d]/g, '');
                return cleaned.length >= 10 && cleaned.length <= 11;
            },
            message: 'Telefone inválido. Use o formato: (00) 00000-0000'
        }
    },
    
    age: {
        type: Number,
        required: [true, 'Idade é obrigatória'],
        min: [18, 'Você deve ter pelo menos 18 anos'],
        max: [120, 'Idade inválida']
    },
    
    location: {
        address: {
            street: String,
            number: String,
            neighborhood: String,
            complement: String,
            city: String,
            state: String,
            zipCode: String,
            country: {
                type: String,
                default: 'Brasil'
            }
        },
        coordinates: {
            type: [Number],
            index: '2dsphere' // Para busca geográfica
        }
    },
    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt
});

// Middleware: Antes de salvar, criptografa a senha
userSchema.pre('save', async function(next) {
    // Só criptografa se a senha foi modificada
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware: Formata CPF antes de salvar
userSchema.pre('save', function(next) {
    if (this.cpf) {
        // Remove caracteres não numéricos
        const cleaned = this.cpf.replace(/[^\d]/g, '');
        // Formata como 000.000.000-00
        this.cpf = cleaned.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            '$1.$2.$3-$4'
        );
    }
    next();
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para buscar por CPF (ignorando formatação)
userSchema.statics.findByCPF = function(cpf) {
    const cleaned = cpf.replace(/[^\d]/g, '');
    // Busca ignorando a formatação
    return this.findOne({ 
        cpf: { $regex: cleaned, $options: 'i' } 
    });
};

// Método para validar CPF estático
userSchema.statics.validateCPF = function(cpf) {
    const cleaned = cpf.replace(/[^\d]/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleaned.substring(i-1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleaned.substring(i-1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
    
    return true;
};

// Exporta o modelo
module.exports = mongoose.model('User', userSchema);