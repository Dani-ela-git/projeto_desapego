// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Erro de validação',
            errors: messages
        });
    }
    
    // Erro de duplicidade (email único)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} já está em uso`
        });
    }
    
    // Erro genérico
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor'
    });
};

module.exports = errorHandler;