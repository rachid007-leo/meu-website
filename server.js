const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // Importa o módulo 'fs'

const app = express();
const port = 3000;

// Configuração do armazenamento para os arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '.')));

// ROTA PARA RECEBER O ARQUIVO (POST)
app.post('/upload', upload.single('arquivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }
    res.send('Arquivo enviado com sucesso!');
});

// ROTA PARA LISTAR OS ARQUIVOS (GET)
app.get('/lista-arquivos', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Erro ao ler a pasta de uploads:', err);
            return res.status(500).send('Erro ao listar os arquivos.');
        }
        res.json(files); // Envia a lista de nomes de arquivos como JSON
    });
});

// ROTA PARA SERVIR A PÁGINA INICIAL (GET)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            console.error('Arquivo não encontrado ou sem permissão para leitura:', filePath, err);
            return res.status(404).send('Arquivo não encontrado.');
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Erro ao fazer o download do arquivo:', err);
                return res.status(500).send('Erro ao fazer o download do arquivo.');
            }
        });
    });
});


// INICIA O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});