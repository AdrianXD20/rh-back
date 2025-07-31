const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configurar CORS explícitamente
app.use(cors());

// Manejar solicitudes OPTIONS explícitamente
app.post('/send-email', upload.single('pdf'), async (req, res) => {
    const { email } = req.body;
    const pdfPath = req.file.path;

    const mailOptions = {
        from: 'cfecorreos25@gmail.com', // Replace with your email
        to: email,
        subject: 'Reporte de Inspección de Luces de Emergencia',
        text: 'Adjunto encontrarás el reporte en PDF.',
        attachments: [
            {
                filename: 'tabla-Lamparas.pdf',
                path: pdfPath
            }
        ]
    };
    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error al enviar el correo' });
    } finally {
        // Clean up uploaded file
        require('fs').unlinkSync(pdfPath);
    }
});


// Configurar transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cfecorreos25@gmail.com', // Replace with your email
        pass: 'xbqc umdt sgfz gost' // Replace with your app-specific password
    }
});

// Verificar conexión SMTP al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error('Error al verificar la conexión SMTP:', {
            error: error.message,
            code: error.code,
            response: error.response
        });
    } else {
        console.log('Conexión SMTP verificada correctamente');
    }
});

// Ruta de prueba para verificar el estado del servidor
app.get('/health', (req, res) => {
    console.log('Solicitud recibida en /health desde:', {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        origin: req.headers.origin
    });
    res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});