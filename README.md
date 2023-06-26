# Aplicação Carinho - Documentação Técnica

## Introdução

Neste documento, iremos explorar em detalhes as funcionalidades da aplicação **Carinho**, desenvolvida em JavaScript. O objetivo do Carinho é tratar os dados recebidos de um ERP chamado IXC e realizar operações relacionadas a localização usando a API dos Correios. Durante todo o processo, também é fornecido feedback visual ao usuário sobre o progresso da operação.

## Arquitetura da Aplicação

O Carinho é uma aplicação construída em JavaScript, utilizando tecnologias como Node.js e MySQL2. Ele é composto por diferentes módulos que interagem entre si para realizar as funcionalidades principais. Vamos explorar cada um desses módulos em detalhes a seguir.

### Módulo de Conexão com o Banco de Dados

A aplicação utiliza uma função chamada `mysqlConn()` para estabelecer a conexão com o banco de dados. Essa função utiliza a biblioteca MySQL2 para criar uma conexão com o banco de dados IXC, permitindo a execução de consultas SQL.

### Módulo de Tratamento de Dados

Uma vez estabelecida a conexão com o banco de dados, a aplicação recupera os dados necessários do ERP IXC por meio de uma chamada SQL. Esses dados são recebidos no formato de tabelas. O **Carinho** é responsável por tratar essas tabelas para extrair a coluna de **CEP**, que está no formato **"00000-000"**. Durante esse processo de tratação dos dados, a aplicação retira CEPs repetidos para fim de obter o melhor desempenho. E, claro, não utilizar recursos de APIs desnecessários.

### Módulo de Integração com a API dos Correios

Com os CEPs extraídos dos dados do ERP IXC, a aplicação utiliza a função `correiosAPI()` para realizar uma integração com a API dos Correios. Essa função envia requisições para a API, fornecendo os CEPs e obtendo como resposta os dados de localidade e bairro relacionados a cada CEP.

### Módulo de Persistência de Dados

Uma vez obtidos os dados de localidade e bairro da API dos Correios, o Carinho insere esses dados em uma nova tabela no banco de dados chamado **Veronica** através da função `buscaBairros()`. Essa tabela possui a seguinte estrutura: CEP, Bairro e Localidade. O módulo de persistência de dados é responsável por realizar essa inserção de forma eficiente e segura.

### Módulo de Feedback Visual

Durante todo o processo de tratamento dos dados e integração com a API dos Correios, a aplicação Carinho fornece um feedback visual ao usuário. Isso é feito através de uma barra de progresso que exibe a porcentagem de conclusão da operação. O usuário pode acompanhar o progresso em tempo real e ter uma noção de quanto tempo ainda falta para a conclusão.

## Fluxo de Funcionamento

Agora que conhecemos os módulos principais do Carinho, vamos entender como eles interagem entre si para realizar a funcionalidade da aplicação passo a passo.

1\. A aplicação estabelece a conexão com o banco de dados IXC por meio da função `getAllData()` onde conecta em todos os Banco de Dados através da função filha `data()`. Essa função utiliza as credenciais de acesso ao banco de dados para criar uma conexão. Essas credenciais estão armazenadas em um arquivo de variavel de ambiente e especificadas na função `mysqlConn()`.

2\. Uma vez conectado ao banco de dados, o Carinho executa uma chamada SQL para recuperar os dados necessários do ERP IXC. Esses dados são recebidos no formato de tabela e concatenados, caso haja mais de uma base de dados com a função nativa do JS chamada `concat()`.

3\. A aplicação inicia o processo de tratamento dos dados recebidos. O Carinho extrai a coluna de CEP da tabela e os unifica através da função `uniqueCEP()`, onde espera um parâmetro em formato **"00000-000"** para fazer a tratativa.

4\. Com os CEPs extraídos, formatados corretamente e unicos, a aplicação utiliza a função `correiosAPI()` filha da função `buscaBairros()` para realizar uma chamada para a API dos Correios. Essa função envia os CEPs e recebe como resposta os dados de localidade e bairro relacionados a cada CEP. Com delay entre uma requisição e outra especificado com a função:

```js
function delay(ms) {
    return new Promise((resolve, _reject) => setTimeout(resolve, ms));
}
```

Onde espera um parâmetro `ms` em milissegundos. Com a seguinte sintaxe:

```js
await delay(180);
```

5\. Com os dados de localidade e bairro obtidos da API dos Correios, o Carinho insere esses dados em uma nova tabela no banco de dados Veronica. Essa tabela possui as colunas CEP, Bairro e Localidade.

6\. Durante todo esse processo, a aplicação atualiza a barra de progresso visual exibindo a porcentagem de conclusão da operação. O usuário pode acompanhar o progresso em tempo real e ter uma noção de quanto tempo ainda falta para a conclusão. Esse processo se dá através da função iniciada no loop:

```js
const utils = require("./utils");
...
utils.printProgress(idx, data.cep.length * 1);
```

## Conclusão

A aplicação Carinho desempenha um papel importante no tratamento de dados vindos do ERP IXC e na obtenção de informações de localidade e bairro por meio da API dos Correios. Com sua arquitetura bem definida e módulos especializados, o Carinho é capaz de executar essas funcionalidades de forma eficiente e fornecer feedback visual ao usuário. Esperamos que esta documentação tenha sido clara e informativa, fornecendo uma visão abrangente das funcionalidades da aplicação **Carinho**.
