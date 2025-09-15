// Mock data for demonstration purposes
export const mockTransactions = [
  {
    id: 1,
    date: '2024-09-15',
    type: 'debito',
    category: 'alimentacao',
    description: 'Supermercado',
    amount: -150.50
  },
  {
    id: 2,
    date: '2024-09-14',
    type: 'credito',
    category: 'salario',
    description: 'Salário Setembro',
    amount: 3500.00
  },
  {
    id: 3,
    date: '2024-09-13',
    type: 'debito',
    category: 'transporte',
    description: 'Uber',
    amount: -25.80
  },
  {
    id: 4,
    date: '2024-09-12',
    type: 'debito',
    category: 'saude',
    description: 'Farmácia',
    amount: -45.90
  },
  {
    id: 5,
    date: '2024-09-11',
    type: 'debito',
    category: 'contas',
    description: 'Conta de Luz',
    amount: -120.00
  },
  {
    id: 6,
    date: '2024-09-10',
    type: 'debito',
    category: 'alimentacao',
    description: 'Restaurante',
    amount: -85.00
  },
  {
    id: 7,
    date: '2024-09-09',
    type: 'debito',
    category: 'lazer',
    description: 'Cinema',
    amount: -30.00
  },
  {
    id: 8,
    date: '2024-09-08',
    type: 'credito',
    category: 'freelance',
    description: 'Projeto Freelance',
    amount: 800.00
  },
  {
    id: 9,
    date: '2024-09-07',
    type: 'debito',
    category: 'contas',
    description: 'Internet',
    amount: -89.90
  },
  {
    id: 10,
    date: '2024-09-06',
    type: 'debito',
    category: 'alimentacao',
    description: 'Padaria',
    amount: -15.50
  }
];

export const categories = {
  alimentacao: 'Alimentação',
  saude: 'Saúde',
  transporte: 'Transporte',
  contas: 'Contas Utilitárias',
  lazer: 'Lazer',
  salario: 'Salário',
  freelance: 'Freelance',
  outros: 'Outros'
};

// Generate historical balance data for the last 6 months
export const generateBalanceHistory = () => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    
    // Simulate balance progression
    const baseBalance = 2000 + (Math.random() * 1000);
    months.push({
      month: monthName,
      balance: baseBalance + (i * 200) + (Math.random() * 500)
    });
  }
  
  return months;
};

export const getCurrentBalance = () => {
  return mockTransactions.reduce((total, transaction) => total + transaction.amount, 0);
};

export const getMonthlyStats = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = mockTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });
  
  const income = monthlyTransactions
    .filter(t => t.type === 'credito')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = monthlyTransactions
    .filter(t => t.type === 'debito')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return { income, expenses };
};
