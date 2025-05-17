const { pipeline } = require('node:stream/promises');
const Busboy = require('busboy');
const fs = require('node:fs/promises');
const path = require('node:path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: event.headers });
    const tmpDir = '/tmp'; // Diretório temporário (verificar se é gravável no Netlify)
    let uploadedFile = null;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const tmpFilename = path.join(tmpDir, `${fieldname}-${uniqueSuffix}${path.extname(filename)}`);
      uploadedFile = tmpFilename;
      pipeline(file, fs.createWriteStream(tmpFilename))
        .then(() => console.log(`Arquivo salvo temporariamente em: ${tmpFilename}`))
        .catch(err => {
          console.error('Erro ao salvar o arquivo temporariamente:', err);
          reject({ statusCode: 500, body: 'Erro ao salvar o arquivo.' });
        });
    });

    busboy.on('finish', () => {
      if (uploadedFile) {
        resolve({
          statusCode: 200,
          body: 'Arquivo enviado com sucesso! (temporariamente)'
        });
        // Aqui você faria o upload para um serviço de armazenamento permanente
        fs.unlink(uploadedFile).catch(err => console.error('Erro ao deletar arquivo temporário:', err));
      } else {
        resolve({ statusCode: 400, body: 'Nenhum arquivo foi enviado.' });
      }
    });

    busboy.on('error', (err) => {
      console.error('Erro no parsing do form:', err);
      reject({ statusCode: 500, body: 'Erro ao processar o upload.' });
    });

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
  });
};