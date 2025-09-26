
const express = require('express');
const multer = require('multer');
const Clam = require('node-clam');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = 3001;

// Inicializa el escáner de ClamAV
const clam = new Clam({
    clamdscan: {
        socket: '/var/run/clamav/clamd.ctl', // Usa el socket de Unix por defecto
        host: '127.0.0.1',
        port: 3310,
        timeout: 60000,
        local_fallback: true,
        path: '/usr/bin/clamdscan',
        config_file: '/etc/clamav/clamd.conf',
        multiscan: true,
        reload_db: false,
        active: true,
    },
    preference: 'clamdscan',
});

// Endpoint de escaneo
app.post('/scan', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    try {
        const scanner = await clam.scan(req.file.buffer);
        
        if (scanner.isInfected) {
            console.log(`Threat found in file: ${req.file.originalname}. Virus: ${scanner.viruses.join(', ')}`);
            res.json({
                success: true,
                isInfected: true,
                message: `¡Peligro! Se encontró una amenaza: ${scanner.viruses.join(', ')}.`
            });
        } else {
            console.log(`File is clean: ${req.file.originalname}`);
            res.json({
                success: true,
                isInfected: false,
                message: 'El archivo es seguro. No se encontraron amenazas.'
            });
        }
    } catch (err) {
        console.error('Error during scan:', err);
        res.status(500).json({ success: false, error: 'Error during the scan process.', details: err.message });
    }
});

// Endpoint de Health Check para Coolify
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`ClamAV API server listening on port ${port}`);
});
