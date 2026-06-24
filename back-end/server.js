require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Conectar ao banco
connectDB();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});