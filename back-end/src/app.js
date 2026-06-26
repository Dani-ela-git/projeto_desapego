//arquivo principal do servidor, onde são configurados
//  o Express, as rotas e a conexão com o banco de dados

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"], // <- permite onclick e eventos inline
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "http://localhost:3000"] // <- permite fetch para a API
        }
    }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//config. com o front-end
app.use(express.static('../front-end'));


// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite por IP
});
app.use('/api', limiter);

// Rotas da API
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', donationRoutes);
app.use('/api/products', productRoutes);

//imagens
const pastaFront = path.join(__dirname, '../../front-end');
const pastaImgFront = path.join(__dirname, '../../front-end/img');
const pastaImgUpload = path.join(__dirname, '../img');

app.use(express.static(pastaFront));
app.use('/img', express.static(pastaImgFront));       // imagens do front-end
app.use('/uploads', express.static(pastaImgUpload));  // imagens de upload

//rotas para a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/about.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/cadastro_user.html'));
});

app.get('/doar', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/cadastro_prod.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/login.html'));
});

app.get('/pesquisa', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/pesquisa.html'));
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

module.exports = app;