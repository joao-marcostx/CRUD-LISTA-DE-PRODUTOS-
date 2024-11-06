const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

let produtoIndex = 1;

app.use(bodyParser.json());


let produtos = [];


const validarProduto = (produto) => {
  if (produto.quantidade <= 0 || typeof produto.quantidade !== 'number') {
    return 'Quantidade deve ser um número positivo';
  }
  if (produto.preco <= 0 || typeof produto.preco !== 'number') {
    return 'Preço deve ser um número positivo';
  }
  return null;
};


const verificarDuplicidade = (nome) => {
  return produtos.some(produto => produto.nome === nome);
};


app.post('/CriarProdutos', (req, res) => {
  const { nome, quantidade, preco } = req.body;


  if (nome == null || quantidade == null || preco == null) {
    return res.status(400).json({ mensagem: 'Nome, quantidade e preço são obrigatórios.' });
  }

  if (verificarDuplicidade(nome)) {
    return res.status(400).json({ mensagem: 'Já existe um produto com esse nome.' });
  }

  const erroValidacao = validarProduto({ nome, quantidade, preco });
  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }


  const novoProduto = { id: produtoIndex++, nome, quantidade, preco };
  produtos.push(novoProduto);

  return res.status(201).json(novoProduto);
});


app.get('/produtos', (req, res) => {
  res.json(produtos);
});

app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, quantidade, preco } = req.body;

  const produtoIndex = produtos.findIndex(prod => prod.id === parseInt(id));
  if (produtoIndex === -1) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }


  const erroValidacao = validarProduto({ nome, quantidade, preco });
  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }


  const produto = produtos[produtoIndex];
  produto.nome = nome || produto.nome;
  produto.quantidade = quantidade || produto.quantidade;
  produto.preco = preco || produto.preco;

  return res.json(produto);
});


app.get('/relatorio', (req, res) => {
  // Número total de produtos no estoque (somando as quantidades de todos os produtos)
  const numeroTotalDeProdutos = produtos.reduce((total, produto) => total + produto.quantidade, 0);

  // Valor total do estoque (soma de quantidade * preço para cada produto)
  const valorTotalEstoque = produtos.reduce((total, produto) => total + (produto.quantidade * produto.preco), 0);

  // Retorna o relatório
  return res.status(200).json({
    numeroTotalDeProdutos,
    valorTotalEstoque: valorTotalEstoque.toFixed(2)  // Formatando para 2 casas decimais
  });
});

app.get('/produtos/buscar', (req, res) => {
  const nome = req.query.nome;

  if (!nome) {
      return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório.' });
  }

  // Busca produtos que contêm o nome especificado (ignora maiúsculas/minúsculas)
  const produtosEncontrados = produtos.filter(produto => 
      produto.nome.toLowerCase().includes(nome.toLowerCase())
  );

  if (produtosEncontrados.length > 0) {
      res.json(produtosEncontrados);
  } else {
      res.status(404).json({ message: 'Nenhum produto encontrado com esse nome.' });
  }
});


app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const produtoIndex = produtos.findIndex(prod => prod.id === parseInt(id));

  if (produtoIndex === -1) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }


  produtos.splice(produtoIndex, 1);

  return res.status(204).send();
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
