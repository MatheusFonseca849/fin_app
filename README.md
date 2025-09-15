# FinApp - Aplicação de Controle Financeiro

Uma aplicação web moderna para rastreamento de finanças pessoais, desenvolvida com React.

## Funcionalidades

### Páginas Implementadas
- **Login/Cadastro**: Sistema de autenticação com formulários de login e registro
- **Dashboard**: Visão geral com saldo atual e gráfico de histórico dos últimos 6 meses
- **Extrato**: Lista de transações com filtros por tipo e categoria, possibilidade de adicionar novas transações
- **Analytics**: Relatórios visuais com gráficos de saldo, gastos por categoria e top 5 categorias

### Recursos
- Interface responsiva e moderna
- Gráficos interativos (Chart.js)
- Dados simulados para demonstração
- Navegação entre páginas
- Filtros e categorização de transações
- Cálculos automáticos de saldo e estatísticas

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

3. Acesse http://localhost:3000 no seu navegador

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Login.js        # Página de login
│   ├── Register.js     # Página de cadastro
│   ├── Dashboard.js    # Dashboard principal
│   ├── Transactions.js # Página de extrato
│   ├── Analytics.js    # Página de analytics
│   └── Navbar.js       # Barra de navegação
├── data/
│   └── mockData.js     # Dados simulados
├── App.js              # Componente principal
├── index.js            # Ponto de entrada
└── index.css           # Estilos globais
```

## Tecnologias Utilizadas

- React 18
- React Router DOM (navegação)
- Chart.js + React-ChartJS-2 (gráficos)
- CSS3 (estilização)
- LocalStorage (persistência de login)

## Dados de Demonstração

A aplicação utiliza dados simulados para demonstração. Você pode:
- Fazer login com qualquer email/senha
- Visualizar transações pré-cadastradas
- Adicionar novas transações
- Explorar os gráficos e relatórios

## Próximos Passos

Para uma implementação completa, considere:
- Integração com backend/API
- Banco de dados real
- Autenticação segura
- Exportação de relatórios
- Notificações e alertas
- Categorias personalizáveis
