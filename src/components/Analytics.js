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
import { mockTransactions, categories, generateBalanceHistory } from '../data/mockData';

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
  const balanceHistory = generateBalanceHistory();
  
  // Calculate expenses by category
  const expensesByCategory = mockTransactions
    .filter(t => t.type === 'debito')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

  // Get top 5 expense categories
  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Balance chart data
  const balanceChartData = {
    labels: balanceHistory.map(item => item.month),
    datasets: [
      {
        label: 'Saldo',
        data: balanceHistory.map(item => item.balance),
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
            {mockTransactions.slice(0, 10).map(transaction => (
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
      </div>
    </div>
  );
};

export default Analytics;
