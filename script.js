document.addEventListener('DOMContentLoaded', function() {
    // Obtém uma referência ao elemento do botão (exemplo de interatividade)
    const meuBotao = document.getElementById('meu-botao');
    if (meuBotao) {
        meuBotao.addEventListener('click', function() {
            alert('Olá! Você clicou no botão!');
        });
    }

    // Função para exibir a lista de arquivos disponíveis para download
    function exibirListaDeArquivos() {
        fetch('/lista-arquivos')
            .then(response => response.json())
            .then(files => {
                const arquivosLista = document.getElementById('arquivos-lista');
                if (arquivosLista) {
                    arquivosLista.innerHTML = ''; // Limpa qualquer item anterior na lista
                    files.forEach(file => {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = '/download/' + file; // Rota para download (vamos criar no servidor)
                        link.textContent = file;
                        listItem.appendChild(link);
                        arquivosLista.appendChild(listItem);
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao obter a lista de arquivos:', error);
                const arquivosLista = document.getElementById('arquivos-lista');
                if (arquivosLista) {
                    arquivosLista.textContent = 'Erro ao carregar a lista de arquivos.';
                }
            });
    }

    // Chama a função para exibir a lista de arquivos quando a página carregar
    exibirListaDeArquivos();
});