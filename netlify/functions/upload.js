const parser = require('aws-lambda-multipart-parser');
const fs = require('node:fs/promises');
const path = require('node:path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verifica se o corpo da requisição está vazio
  if (!event.body) {
      return { statusCode: 400, body: 'Corpo da requisição vazio.' };
  }

  try {
    // Usa o parser para analisar o corpo da requisição multipart/form-data
    const result = parser.parse(event, true); // O 'true' indica para retornar o body como string base64

    // 'result.files' conterá um array de objetos para cada arquivo enviado
    // Se você usou name="arquivo" no seu input, o arquivo estará em result.arquivo
    const uploadedFile = result.arquivo; // Assumindo que o name do input é "arquivo"

    if (!uploadedFile) {
      return { statusCode: 400, body: 'Nenhum arquivo foi enviado ou o campo "arquivo" não foi encontrado.' };
    }

    const tmpDir = '/tmp';
    // Certifique-se de que o diretório /tmp existe e é gravável (geralmente é em Lambdas)
    try {
        await fs.mkdir(tmpDir, { recursive: true });
    } catch (dirErr) {
        console.error('Erro ao criar diretório /tmp:', dirErr);
        // Pode não ser necessário criar se já existir, mas é uma boa prática
    }

    // O conteúdo do arquivo está em uploadedFile.content (Buffer ou Base64)
    // E o nome original do arquivo está em uploadedFile.filename
    const fileName = uploadedFile.filename;
    const tmpFilePath = path.join(tmpDir, fileName);

    // Escreve o arquivo temporariamente.
    // O `uploadedFile.content` já vem como Buffer ou é convertido pelo parser.
    await fs.writeFile(tmpFilePath, uploadedFile.content);

    console.log(`Arquivo salvo temporariamente em: ${tmpFilePath}`);

    // TODO: Aqui você faria o upload para um serviço de armazenamento permanente (AWS S3, Netlify Blobs, etc.)
    // Lembre-se que arquivos em /tmp são temporários e serão apagados após a execução da função.

    // Retorna uma resposta de sucesso
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Arquivo enviado e salvo temporariamente com sucesso!', filename: fileName })
    };

  } catch (error) {
    console.error('Erro no processamento do upload:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao processar o upload do arquivo.', error: error.message })
    };
  }
};