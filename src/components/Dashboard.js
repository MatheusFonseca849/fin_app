import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { generateBalanceHistory } from '../data/mockData';
import useTransactions from '../hooks/useTransactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ user }) => {
  const { transactions, loading, error, getCurrentBalance, getMonthlyStats } = useTransactions(user);
  const currentBalance = getCurrentBalance();
  const { income, expenses } = getMonthlyStats();
  const balanceHistory = generateBalanceHistory();

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  const chartData = {
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Histórico de Saldo - Últimos 6 Meses',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          }
        }
      }
    }
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.name}!</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className={`stat-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
            R$ {Math.abs(currentBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Saldo Atual</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value positive">
            R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Receitas do Mês</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value negative">
            R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Gastos do Mês</div>
        </div>
        
        <div className="stat-card">
          <div className={`stat-value ${(income - expenses) >= 0 ? 'positive' : 'negative'}`}>
            R$ {Math.abs(income - expenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Resultado do Mês</div>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
