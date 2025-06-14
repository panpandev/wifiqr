const express = require('express');
const QRCode = require('qrcode');
const dotenv = require('dotenv');

// Configuração do ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Rota para gerar QR Code
app.post('/generate', async (req, res) => {
    try {
        const { ssid, password, encryption } = req.body;
        
        // Formato do WiFi string conforme especificação
        const wifiString = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
        
        // Gerar QR Code
        const qrCode = await QRCode.toDataURL(wifiString);
        
        res.json({ qrCode });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar QR Code' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
