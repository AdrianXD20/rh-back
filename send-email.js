const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configurar CORS para permitir solicitudes desde el frontend en Vercel
app.use(cors({
    origin: ['https://rhproject.vercel.app/', 'http://localhost:3000'], // Reemplaza con la URL de tu frontend en Vercel
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
app.use(express.json());

// Configurar transporte de Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Usa STARTTLS
    auth: {
        user: 'cfecorreos25@gmail.com',
        pass: 'xbqc umdt sgfz gost' // Contraseña de aplicación
    },
    tls: {
        rejectUnauthorized: false // Ignora errores de certificado (usar con precaución)
    }
});

// Verificar conexión SMTP al iniciar el servidor
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
    console.log('Solicitud recibida en /health desde:', req.headers['user-agent'], req.ip);
    res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// Ruta para enviar el correo
app.post('/send-email', upload.single('pdf'), async (req, res) => {
    console.log('Solicitud POST /send-email recibida:', {
        headers: req.headers,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        body: req.body,
        file: req.file ? {
            originalname: req.file.originalname,
            size: req.file.size,
            path: req.file.path
        } : 'No se recibió archivo'
    });

    const { email } = req.body;
    const pdfPath = req.file?.path;

    // Validar entrada
    if (!email) {
        console.error('Error: Falta el campo email en la solicitud');
        return res.status(400).json({ message: 'El correo es requerido' });
    }
    if (!pdfPath) {
        console.error('Error: No se recibió un archivo PDF');
        return res.status(400).json({ message: 'El archivo PDF es requerido' });
    }

    console.log('Procesando correo para:', email, 'con archivo en:', pdfPath);

    const mailOptions = {
        from: '"Inspección CFE" <cfecorreos25@gmail.com>',
        to: email,
        subject: 'Reporte de Inspección de Luces de Emergencia',
        text: 'Adjunto encontrarás el reporte en PDF.',
        html: '<p>Adjunto encontrarás el <b>reporte en PDF</b> generado tras la inspección de luces de emergencia.</p>',
        attachments: [
            {
                filename: 'Reporte-Luces-Emergencia.pdf',
                path: pdfPath
            }
        ]
    };

    try {
        console.log('Enviando correo con las siguientes opciones:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            hasAttachment: !!mailOptions.attachments
        });

        await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente a:', email);
        res.json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', {
            error: error.message,
            code: error.code,
            response: error.response,
            stack: error.stack
        });
        res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
    } finally {
        if (pdfPath) {
            try {
                console.log('Eliminando archivo temporal:', pdfPath);
                fs.unlinkSync(pdfPath);
                console.log('Archivo temporal eliminado:', pdfPath);
            } catch (err) {
                console.error('Error al eliminar el archivo temporal:', {
                    path: pdfPath,
                    error: err.message
                });
            }
        }
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});