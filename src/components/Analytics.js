import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { categories } from '../data/mockData';
import useTransactions from '../hooks/useTransactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Analytics = ({ user }) => {
  const { transactions, loading, error, getCurrentBalance, getMonthlyStats, getExpensesByCategory } = useTransactions(user);

  // Build balance history for the last 6 months from real user transactions
  const buildBalanceHistory = (txns, months = 6) => {
    const now = new Date();
    const monthKeys = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) });
    }

    const monthlyNet = Object.fromEntries(monthKeys.map(m => [m.key, 0]));
    txns.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyNet[key] !== undefined) {
        monthlyNet[key] += t.amount;
      }
    });

    // Compute starting balance as the sum of all transactions BEFORE the first month in the window
    const firstMonth = monthKeys[0];
    const firstMonthDate = new Date(parseInt(firstMonth.key.split('-')[0], 10), parseInt(firstMonth.key.split('-')[1], 10) - 1, 1);
    const startingBalance = txns
      .filter(t => new Date(t.date) < firstMonthDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const labels = [];
    const balances = [];
    let cumulative = startingBalance;
    monthKeys.forEach(m => {
      cumulative += monthlyNet[m.key];
      labels.push(m.label);
      balances.push(Number(cumulative.toFixed(2)));
    });

    return { labels, balances };
  };

  const balanceHistory = buildBalanceHistory(transactions, 6);
  
  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando dados de análise...</p>
        </div>
      </div>
    );
  }
  
  // Calculate expenses by category
  const expensesByCategory = getExpensesByCategory();

  // Get top 5 expense categories
  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Balance chart data
  const balanceChartData = {
    labels: balanceHistory.labels,
    datasets: [
      {
        label: 'Saldo',
        data: balanceHistory.balances,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  // Pie chart data for expenses by category
  const pieChartData = {
    labels: Object.keys(expensesByCategory).map(key => categories[key]),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ]
      }
    ]
  };

  // Bar chart data for top expense categories
  const barChartData = {
    labels: topExpenseCategories.map(([key]) => categories[key]),
    datasets: [
      {
        label: 'Gastos por Categoria',
        data: topExpenseCategories.map(([, value]) => value),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Top 5 Categorias com Maiores Gastos',
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Gastos por Categoria',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="container">
      <h1>Analytics</h1>
      
      {/* Balance History Chart */}
      <div className="chart-container">
        <h3>Histórico de Saldo por Período</h3>
        <Line data={balanceChartData} options={chartOptions} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Pie Chart */}
        <div className="chart-container">
          <Pie data={pieChartData} options={pieOptions} />
        </div>

        {/* Bar Chart */}
        <div className="chart-container">
          <Bar data={barChartData} options={barOptions} />
        </div>
      </div>

        {/* Transactions Table */}
      <div className="card">
        <h3>Tabela de Transações</h3>
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Categoria</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={transaction.type === 'credito' ? 'positive' : 'negative'}>
                    {transaction.type === 'credito' ? 'Crédito' : 'Débito'}
                  </span>
                </td>
                <td className={transaction.amount >= 0 ? 'positive' : 'negative'}>
                  R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td>{categories[transaction.category]}</td>
                <td>{transaction.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Nenhuma transação encontrada.
          </p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
