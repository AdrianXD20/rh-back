const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cfecorreos25@gmail.com', // Replace with your email
        pass: 'xbqc umdt sgfz gost' // Replace with your app-specific password
    }
});

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

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});